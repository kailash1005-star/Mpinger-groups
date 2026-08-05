"use client";

import React, { useRef, useEffect, useState } from "react";
import {
  motion,
  useScroll,
  useSpring,
  useTransform,
  useInView,
  MotionValue,
} from "framer-motion";
import { ArrowDown, ArrowUpRight } from "lucide-react";

export interface BrandLink {
  name: string;
  /** Path to the brand's logo image (light-surface variant) */
  logo: string;
  href: string;
  accent: string;
}

export interface SectionTheme {
  /** Primary text color over the video */
  text: string;
  /** Secondary / muted text color */
  muted: string;
  /** Vibrant accent — eyebrow, rules, progress line, glow */
  accent: string;
  /** Which scrim keeps text legible over the footage */
  scrim: "dark" | "light";
  /**
   * How heavily the footage is muted behind the text. Defaults to "normal".
   * - "soft"   — let the footage carry the frame; the copy leans on its own
   *              halo (see textShadow below) instead of a full-frame wash.
   * - "strong" — for bright/busy footage that would otherwise swallow the text.
   */
  scrimStrength?: "soft" | "normal" | "strong";
}

interface ScrollVideoSectionProps {
  id?: string;
  isHero?: boolean;
  videoSrc: string;
  /** Smaller/lower-resolution encode served to phones — less to download and, just as importantly, less to decode while scrubbing. */
  mobileVideoSrc?: string;
  /** First-frame still, shown instantly so there's never a black flash while the video buffers */
  posterSrc?: string;
  backgroundColor: string;
  theme: SectionTheme;
  title: string;
  description?: string;
  keywords?: string[];
  brands?: BrandLink[];
  align: "left" | "right" | "center";
  sectionHeight?: string; // e.g., "400vh"
  /**
   * Deterministic paint order for the sticky handoff between sections.
   * Must strictly increase down the page (e.g. section index) — this is what
   * guarantees the incoming section's video always paints over the outgoing
   * one during the sticky transition, instead of leaving it to each browser's
   * own (inconsistent) tie-breaking when two sticky layers share a z-index.
   */
  stackOrder?: number;
}

/** Scroll-linked reveal wrapper — fades/slides in at [start, end] and out near the section's tail */
const Reveal = ({
  progress,
  start,
  end,
  immediate = false,
  className,
  children,
}: {
  progress: MotionValue<number>;
  start: number;
  end: number;
  /**
   * Render already-revealed at progress 0 instead of waiting to be scrolled in.
   * Used for the hero, which is on screen the instant the page loads — a
   * scroll-triggered reveal there just means the visitor lands on empty space.
   */
  immediate?: boolean;
  className?: string;
  children: React.ReactNode;
}) => {
  const opacity = useTransform(
    progress,
    immediate ? [0, 0.9, 0.96] : [start, end, 0.9, 0.96],
    immediate ? [1, 1, 0] : [0, 1, 1, 0]
  );
  const y = useTransform(
    progress,
    immediate ? [0, 0.9, 0.96] : [start, end, 0.9, 0.96],
    immediate ? [0, 0, -26] : [26, 0, 0, -26]
  );
  return (
    <motion.div style={{ opacity, y }} className={className}>
      {children}
    </motion.div>
  );
};

/** Premium brand gateway — the official logo in a raised pill with a persistent
    accent-tinted glow (not just on hover) and a solid accent "go" button, so it
    reads unmistakably as the section's call to action rather than a flat logo chip. */
const BrandButton = ({ brand }: { brand: BrandLink }) => (
  <a
    href={brand.href}
    target="_blank"
    rel="noopener noreferrer"
    aria-label={`Visit ${brand.name}`}
    title={brand.href.replace(/^https?:\/\//, "")}
    // Shorter and tighter on phones: two of these stack vertically on a narrow
    // screen, so the desktop height was costing ~30px of vertical budget that
    // the frame does not have.
    className="brand-btn group pointer-events-auto relative overflow-hidden inline-flex items-center justify-between gap-3 sm:gap-4 rounded-full bg-white h-14 sm:h-[4.5rem] pl-5 pr-2 sm:pl-7 sm:pr-3 ring-1 transition-all duration-300 hover:-translate-y-1.5 hover:scale-[1.03]"
    style={
      {
        "--brand": brand.accent,
        "--brand-glow": `${brand.accent}80`,
        "--brand-sheen": `${brand.accent}1f`,
        "--tw-ring-color": `${brand.accent}33`,
      } as React.CSSProperties
    }
  >
    {/* Fixed-size logo well so every brand pill shares the exact same footprint */}
    <span className="relative z-10 flex items-center justify-center w-[112px] sm:w-[160px] h-full shrink-0">
      <img
        src={brand.logo}
        alt={brand.name}
        // Intrinsic size lets the browser reserve the box before the PNG
        // decodes, so the CTA row doesn't shift as logos load.
        width={160}
        height={40}
        loading="lazy"
        decoding="async"
        className="max-h-7 sm:max-h-10 max-w-full w-auto object-contain"
      />
    </span>
    <span
      className="relative z-10 flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 rounded-full shrink-0 text-white transition-transform duration-300 group-hover:scale-110"
      style={{ backgroundColor: brand.accent }}
    >
      <ArrowUpRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
    </span>
    {/* Periodic sheen sweep across the pill */}
    <span aria-hidden className="brand-sheen absolute inset-0 rounded-full pointer-events-none" />
  </a>
);

export const ScrollVideoSection: React.FC<ScrollVideoSectionProps> = ({
  id,
  isHero = false,
  videoSrc,
  mobileVideoSrc,
  posterSrc,
  backgroundColor,
  theme,
  title,
  description,
  keywords = [],
  brands = [],
  align,
  sectionHeight = "400vh",
  stackOrder = 0,
}) => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const durationRef = useRef(0);

  // Seek throttling refs
  const targetTimeRef = useRef(0);
  const isSeekingRef = useRef(false);
  const pendingSeekRef = useRef<number | null>(null);
  /** Releases the seek lock if a `seeked` event never arrives — see beginSeek. */
  const seekWatchdogRef = useRef<number | null>(null);

  // Check if section is in viewport to save CPU/GPU processing
  const isInView = useInView(sectionRef, { margin: "0px 0px 0px 0px" });

  // Separate, much earlier trigger purely for fetching the footage. The <video>
  // carries no src until this fires, so a visitor downloads the hero clip only
  // — not every section's clip — on first paint. `once` keeps it loaded after.
  const isNearViewport = useInView(sectionRef, {
    margin: "150% 0px 150% 0px",
    once: true,
  });
  const shouldLoadVideo = isHero || isNearViewport;

  // Resolved on the client so we can pick a source per device and honour
  // reduced-motion. Left undefined on the server: with no src the browser
  // paints the poster and fetches nothing, which is exactly what we want
  // before a section is anywhere near the viewport.
  const [resolvedVideoSrc, setResolvedVideoSrc] = useState<string | undefined>();
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => setPrefersReducedMotion(motionQuery.matches);
    apply();
    motionQuery.addEventListener("change", apply);
    return () => motionQuery.removeEventListener("change", apply);
  }, []);

  useEffect(() => {
    if (!shouldLoadVideo) return;
    // Reduced motion: never fetch the clip at all — the poster still tells the
    // story, and we skip both the download and the scrub work entirely.
    if (prefersReducedMotion) {
      setResolvedVideoSrc(undefined);
      return;
    }
    const isSmallScreen = window.matchMedia("(max-width: 768px)").matches;
    setResolvedVideoSrc(isSmallScreen && mobileVideoSrc ? mobileVideoSrc : videoSrc);
  }, [shouldLoadVideo, prefersReducedMotion, videoSrc, mobileVideoSrc]);

  // Framer Motion Scroll tracking
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  // Smooth out the scroll progress using useSpring
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 50,
    damping: 20,
    mass: 0.2,
  });

  /**
   * Issue a seek and arm a watchdog.
   *
   * `isSeekingRef` is a lock that only the `seeked` event released. If that
   * event never arrived the lock stayed set forever, and from then on every
   * scroll update merely overwrote `pendingSeekRef` while the frame never
   * advanced — the section appeared frozen until some later event happened to
   * release it, which is exactly the "smooth once, stuck the next time"
   * behaviour. A `seeked` can legitimately go missing: the browser may drop or
   * supersede a seek under load, or satisfy one without firing an event when
   * the requested time resolves to the frame already displayed.
   *
   * The watchdog makes the lock self-healing, so a single lost event can no
   * longer wedge scrubbing permanently.
   */
  const beginSeek = (time: number) => {
    const video = videoRef.current;
    if (!video) return;

    isSeekingRef.current = true;
    video.currentTime = time;

    if (seekWatchdogRef.current !== null) window.clearTimeout(seekWatchdogRef.current);
    seekWatchdogRef.current = window.setTimeout(() => {
      seekWatchdogRef.current = null;
      isSeekingRef.current = false;

      // Resume at wherever the scroll has since reached, not the stale target.
      const resumeAt = pendingSeekRef.current ?? targetTimeRef.current;
      pendingSeekRef.current = null;
      const current = videoRef.current;
      if (current && Math.abs(current.currentTime - resumeAt) >= 0.01) {
        beginSeek(resumeAt);
      }
    }, 220);
  };

  // seekTo function with seek throttling logic
  const seekTo = (targetTime: number) => {
    const video = videoRef.current;
    if (!video || !durationRef.current) return;

    // Boundary check
    const boundedTime = Math.max(0, Math.min(durationRef.current, targetTime));
    targetTimeRef.current = boundedTime;

    // Avoid redundant seeking within a 0.01-second threshold
    if (Math.abs(video.currentTime - boundedTime) < 0.01) {
      return;
    }

    if (isSeekingRef.current) {
      // Store the latest seek time to process once the current seek completes
      pendingSeekRef.current = boundedTime;
    } else {
      beginSeek(boundedTime);
    }
  };

  const handleSeeked = () => {
    if (seekWatchdogRef.current !== null) {
      window.clearTimeout(seekWatchdogRef.current);
      seekWatchdogRef.current = null;
    }
    isSeekingRef.current = false;
    const video = videoRef.current;
    if (!video) return;

    if (pendingSeekRef.current !== null) {
      const nextSeekTime = pendingSeekRef.current;
      pendingSeekRef.current = null;

      // Check threshold again before performing pending seek
      if (Math.abs(video.currentTime - nextSeekTime) >= 0.01) {
        beginSeek(nextSeekTime);
      }
    }
  };

  // Map the smoothProgress to video seeks
  useEffect(() => {
    const unsubscribe = smoothProgress.on("change", (latestValue) => {
      // Skip the per-frame seek work entirely when the section is offscreen or
      // the visitor has asked for reduced motion.
      if (!isInView || prefersReducedMotion || !durationRef.current) return;
      const targetTime = latestValue * durationRef.current;
      seekTo(targetTime);
    });

    return () => unsubscribe();
  }, [smoothProgress, isInView, prefersReducedMotion]);

  // Handle video events and fallback ready state checks
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleLoadedMetadata = () => {
      durationRef.current = video.duration;
      // Seek initially to the start frame of the scroll progress
      const initialTime = smoothProgress.get() * video.duration;
      video.currentTime = initialTime;
    };

    video.addEventListener("loadedmetadata", handleLoadedMetadata);
    video.addEventListener("seeked", handleSeeked);

    // Fallback: If metadata is already loaded (due to preloading or browser caching)
    if (video.readyState >= 1) {
      handleLoadedMetadata();
    }

    return () => {
      video.removeEventListener("loadedmetadata", handleLoadedMetadata);
      video.removeEventListener("seeked", handleSeeked);
      if (seekWatchdogRef.current !== null) {
        window.clearTimeout(seekWatchdogRef.current);
        seekWatchdogRef.current = null;
      }
    };
  }, []);

  // NOTE: the footage is deliberately opaque for the WHOLE of a section — no
  // fade in, no fade out. Both directions were bugs you could see: fading in
  // left the hero black on landing, and fading out left the flat
  // backgroundColor showing as a blank panel at the tail of every section.
  // Nothing is gained by either, because the handoff is already handled
  // structurally: each section's sticky pane covers the viewport while the
  // previous one scrolls away behind it, ordered by stackOrder.

  // Accent glow breathes in with the content
  const glowOpacity = useTransform(smoothProgress, [0.05, 0.2, 0.88, 0.96], [0, 1, 1, 0]);

  // Scroll Down Indicator animation (Only visible in early scroll stages)
  const indicatorOpacity = useTransform(smoothProgress, [0.0, 0.08], [1, 0]);

  const scrimStrength = theme.scrimStrength ?? "normal";
  const isDarkScrim = theme.scrim === "dark";

  // Full-frame wash. "soft" keeps only a light vignette at the top/bottom edges
  // so the middle of the shot stays essentially untouched.
  const baseScrimClass = isDarkScrim
    ? {
        soft: "bg-gradient-to-t from-black/30 via-transparent to-black/15",
        normal: "bg-gradient-to-t from-black/45 via-black/5 to-black/25",
        strong: "bg-gradient-to-t from-black/75 via-black/45 to-black/50",
      }[scrimStrength]
    : {
        soft: "bg-gradient-to-t from-white/25 via-transparent to-white/10",
        normal: "bg-gradient-to-t from-white/50 via-white/5 to-white/25",
        strong: "bg-gradient-to-t from-white/75 via-white/45 to-white/50",
      }[scrimStrength];

  // Localised pool of calm directly behind the copy.
  const focusAlpha = { soft: 0.26, normal: 0.55, strong: 0.7 }[scrimStrength];
  const focusColor = isDarkScrim
    ? `rgba(0,0,0,${focusAlpha})`
    : `rgba(255,255,255,${focusAlpha})`;
  const focusEdgeColor = isDarkScrim
    ? `rgba(0,0,0,${focusAlpha * 0.55})`
    : `rgba(255,255,255,${focusAlpha * 0.55})`;

  // With a soft scrim the copy loses the full-frame wash it used to sit on, so
  // it carries its own tight halo instead — legibility without hiding footage.
  const textShadow = isDarkScrim
    ? scrimStrength === "soft"
      ? "0 1px 2px rgba(0,0,0,0.9), 0 2px 18px rgba(0,0,0,0.75)"
      : "0 2px 28px rgba(0,0,0,0.55)"
    : scrimStrength === "soft"
    ? "0 1px 2px rgba(255,255,255,0.95), 0 2px 18px rgba(255,255,255,0.8)"
    : "0 2px 28px rgba(255,255,255,0.45)";

  const alignItems =
    align === "center" ? "items-center text-center" : "items-start text-left";
  const justify =
    align === "center"
      ? "justify-center"
      : align === "right"
      ? "justify-end"
      : "justify-start";

  return (
    <section
      id={id}
      ref={sectionRef}
      // Point the section's accessible name at its own heading, so screen
      // reader landmark navigation announces "Kokosflora" rather than four
      // indistinguishable unnamed regions.
      aria-labelledby={id ? `${id}-heading` : undefined}
      style={{ height: sectionHeight, backgroundColor, zIndex: stackOrder, isolation: "isolate" }}
      className="relative w-full overflow-visible"
    >
      {/* Sticky video wrapper — own compositing layer + strictly increasing
          z-index down the page, so the incoming section always paints over
          the outgoing one during the sticky handoff instead of leaving paint
          order to the browser's tie-breaking when two sticky layers share a
          z-index (the cause of the flash-back-to-previous-section glitch). */}
      <div
        className="sticky top-0 h-screen w-full overflow-hidden flex items-center justify-center"
        style={{ zIndex: 10 + stackOrder, backgroundColor, willChange: "transform", transform: "translateZ(0)" }}
      >
        <div className="absolute inset-0 w-full h-full">
          <video
            ref={videoRef}
            src={resolvedVideoSrc}
            poster={posterSrc}
            muted
            // "auto" here fetched every section's clip on first paint (~20MB).
            // The src is now withheld until the section is near the viewport,
            // and metadata is all we need to know the duration for scrubbing.
            preload="metadata"
            playsInline
            webkit-playsinline="true"
            aria-hidden="true"
            tabIndex={-1}
            className="absolute inset-0 w-full h-full object-cover"
            style={{
              pointerEvents: "none",
              backgroundColor,
              // NOTE: deliberately no CSS `filter` here. A filter on a <video>
              // takes it off the browser's fast video-compositing path: instead
              // of handing decoded frames straight to the compositor, every
              // frame has to be decoded, uploaded, filtered and re-composited.
              // On a scroll-scrubbed video that cost is paid on every seek, and
              // it was heavy enough to make seeks queue up and the section
              // visibly stall. The soft-scrim grade this replaced is now baked
              // into the encoded file, so the look is identical and the runtime
              // cost is zero.
            }}
          />
          {/* Scrim tuned per section so text stays legible without hiding the footage */}
          <div className={`absolute inset-0 pointer-events-none ${baseScrimClass}`} />
          {/* Directional scrim — calms the video only where the text sits */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                align === "center"
                  ? `radial-gradient(ellipse 70% 60% at 50% 50%, ${focusColor} 0%, transparent 75%)`
                  : `linear-gradient(${
                      align === "left" ? "90deg" : "270deg"
                    }, ${focusColor} 0%, ${focusEdgeColor} 38%, transparent 68%)`,
            }}
          />
        </div>

        {/* Vibrant accent glow behind the content */}
        <motion.div
          style={{ opacity: glowOpacity }}
          className={`absolute inset-0 z-10 pointer-events-none flex items-center ${justify} p-0`}
          aria-hidden
        >
          <div
            className="w-[55vw] h-[55vw] max-w-[720px] max-h-[720px] rounded-full blur-3xl"
            style={{
              background: `radial-gradient(closest-side, ${theme.accent}2e, transparent)`,
            }}
          />
        </motion.div>

        {/* Content overlay — open typography over the video, no card.
            From `sm` up the hero is anchored toward the lower third instead of
            dead-center: a large, open expanse of the shot reads above the
            headline, so the frame feels used rather than reduced to one small
            centered cluster. Other sections stay vertically centered.

            On phones that anchoring backfires. The copy is nearly as tall as
            the frame, so bottom-aligning banks every pixel of slack — around
            215px on a 390x844 viewport — into one dead gap under the header
            while the text crowds the lower edge. Centering there splits the
            slack and lifts the block by roughly half of it.

            Rendered unconditionally — this used to be gated on `isInView`,
            which meant the served HTML contained no headings and no body copy
            at all. Crawlers, link previews and assistive tech that read the
            document rather than the painted frame saw an empty page. Framer
            drives visibility through opacity instead, so the markup is always
            present while the reveal still animates on scroll. */}
        <div
            className={`absolute inset-0 z-20 pointer-events-none flex ${
              isHero ? "items-center sm:items-end" : "items-center"
            } ${justify} px-6 sm:px-10 md:px-16 lg:px-24 xl:px-28 ${
              // Top padding must always clear the fixed 80px header, otherwise
              // tall copy slides underneath it. Bottom padding is trimmed to
              // buy that headroom back rather than squeezing the type or the
              // spacing between blocks.
              // pt-24 (96px) is the floor: it must clear the 80px fixed header.
              // Bottom padding is trimmed hard on phones — on an 844px viewport
              // every 8px matters, and the frame is what the copy has to fit in.
              isHero
                ? "pt-24 md:pt-28 pb-20 sm:pb-28 md:pb-36"
                : "pt-24 md:pt-28 pb-8 sm:pb-12 md:pb-16"
            }`}
          >
            <div
              className={`w-full flex flex-col ${alignItems} ${
                isHero ? "max-w-4xl" : brands.length > 1 ? "max-w-3xl" : "max-w-2xl"
              }`}
            >
              {/* Title */}
              <Reveal
                progress={smoothProgress}
                start={0.08}
                end={0.2}
                immediate={isHero}
                className="mb-[clamp(1rem,min(5.7vh,8vw),3.5rem)]"
              >
                {isHero ? (
                  <h1
                    id={id ? `${id}-heading` : undefined}
                    className="font-medium tracking-tight leading-[1.06] text-balance"
                    style={{
                      color: theme.text,
                      textShadow,
                      // Fluid on BOTH axes. The vh term is what matters: these
                      // sections are locked to the viewport height, so on a
                      // short viewport (or at browser zoom, which shrinks the
                      // CSS viewport) a fixed rem size overflows and gets
                      // clipped by the sticky wrapper. min() lets whichever
                      // axis is tighter win.
                      fontSize: "clamp(2.25rem, min(6vw, 9vh), 5.5rem)",
                    }}
                  >
                    {title}
                  </h1>
                ) : (
                  <h2
                    id={id ? `${id}-heading` : undefined}
                    className="font-medium tracking-tight leading-[1.12] text-balance max-w-[18ch]"
                    style={{
                      color: theme.text,
                      textShadow,
                      // Upper bound (3.75rem = 60px) is the enlarged size asked
                      // for; it holds on a roomy viewport and eases down only
                      // when the height would otherwise force a clip.
                      fontSize: "clamp(1.75rem, min(4.5vw, 6.8vh), 3.75rem)",
                    }}
                  >
                    {title}
                  </h2>
                )}
              </Reveal>

              {/* Description */}
              {description && (
                <Reveal
                  progress={smoothProgress}
                  start={0.26}
                  end={0.38}
                  immediate={isHero}
                  className="mb-[clamp(1rem,min(8.2vh,11vw),5rem)]"
                >
                  <p
                    className="font-normal leading-relaxed max-w-xl text-pretty"
                    style={{
                      color: theme.muted,
                      textShadow,
                      fontSize: "clamp(1rem, min(1.6vw, 2.6vh), 1.375rem)",
                    }}
                  >
                    {description}
                  </p>
                </Reveal>
              )}

              {/* Keyword tags — read as open, spaced-out facts rather than
                  boxed-in chips: no border/fill "enclosure", just a small
                  accent dot and generous air between each one. */}
              {keywords.length > 0 && (
                <div
                  className={`flex flex-wrap gap-x-5 gap-y-2 sm:gap-x-8 sm:gap-y-3 mb-[clamp(1rem,min(6.5vh,9vw),4rem)] ${
                    align === "center" ? "justify-center" : "justify-start"
                  }`}
                >
                  {keywords.map((keyword, i) => (
                    <Reveal
                      key={keyword}
                      progress={smoothProgress}
                      start={0.4 + i * 0.06}
                      end={0.46 + i * 0.06}
                      immediate={isHero}
                    >
                      <span
                        className="inline-flex items-center gap-2.5 text-sm sm:text-base font-medium uppercase tracking-[0.1em]"
                        style={{ color: theme.text, textShadow }}
                      >
                        <span
                          className="w-1.5 h-1.5 rounded-full shrink-0"
                          style={{ backgroundColor: theme.accent }}
                        />
                        {keyword}
                      </span>
                    </Reveal>
                  ))}
                </div>
              )}

              {/* Brand gateways — minimal logo buttons out to the dedicated
                  sites, introduced by their own "Explore" eyebrow so the CTA
                  reads as a deliberate, separate block (own top margin, not
                  reliant on whatever text happens to precede it) rather than
                  butting up against the copy above it. */}
              {brands.length > 0 && (
                <div className="mt-[clamp(0.75rem,min(4.9vh,7vw),3rem)]">
                  <Reveal
                    progress={smoothProgress}
                    start={0.46}
                    end={0.52}
                    className={`mb-4 md:mb-5 flex items-center gap-2 ${
                      align === "center" ? "justify-center" : "justify-start"
                    }`}
                  >
                    <span
                      className="text-xs uppercase tracking-[0.2em] font-semibold"
                      style={{ color: theme.accent, textShadow }}
                    >
                      Explore {brands.map((b) => b.name).join(" & ")}
                    </span>
                    <ArrowDown className="w-3 h-3" style={{ color: theme.accent }} />
                  </Reveal>
                  <div
                    className={`flex flex-wrap items-center gap-5 md:gap-6 ${
                      align === "center" ? "justify-center" : "justify-start"
                    }`}
                  >
                    {brands.map((brand, i) => (
                      <Reveal
                        key={brand.name}
                        progress={smoothProgress}
                        start={0.52 + i * 0.08}
                        end={0.6 + i * 0.08}
                      >
                        <BrandButton brand={brand} />
                      </Reveal>
                    ))}
                  </div>
                </div>
              )}
            </div>
        </div>

        {/* Section scroll progress line in the section accent */}
        <motion.div
          className="absolute bottom-0 left-0 right-0 h-[2px] origin-left z-30 pointer-events-none"
          style={{ scaleX: smoothProgress, backgroundColor: theme.accent }}
        />

        {/* Scroll Down Hint (hero only) — text breathes gently and the arrow
            bounces, so it reads as a live invitation to scroll rather than
            static caption text */}
        {isHero && (
          <motion.div
            style={{ opacity: indicatorOpacity }}
            className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2.5 pointer-events-none"
          >
            <motion.span
              className="text-xs uppercase tracking-[0.25em] font-medium"
              style={{ color: theme.text }}
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ repeat: Infinity, duration: 2.2, ease: "easeInOut" }}
            >
              Scroll to explore
            </motion.span>
            <motion.div
              animate={{ y: [0, 7, 0] }}
              transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
            >
              <ArrowDown className="w-4 h-4 opacity-75" style={{ color: theme.text }} />
            </motion.div>
          </motion.div>
        )}
      </div>
    </section>
  );
};
