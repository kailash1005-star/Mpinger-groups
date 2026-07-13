"use client";

import React, { useRef, useState, useEffect } from "react";
import {
  motion,
  useScroll,
  useSpring,
  useTransform,
  useInView,
  AnimatePresence,
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
  /** Heavier scrim for videos with bright/washed-out frames that swallow the text */
  strongScrim?: boolean;
}

interface ScrollVideoSectionProps {
  id?: string;
  isHero?: boolean;
  videoSrc: string;
  backgroundColor: string;
  theme: SectionTheme;
  title: string;
  description?: string;
  keywords?: string[];
  brands?: BrandLink[];
  align: "left" | "right" | "center";
  sectionHeight?: string; // e.g., "400vh"
}

/** Scroll-linked reveal wrapper — fades/slides in at [start, end] and out near the section's tail */
const Reveal = ({
  progress,
  start,
  end,
  className,
  children,
}: {
  progress: MotionValue<number>;
  start: number;
  end: number;
  className?: string;
  children: React.ReactNode;
}) => {
  const opacity = useTransform(progress, [start, end, 0.9, 0.96], [0, 1, 1, 0]);
  const y = useTransform(progress, [start, end, 0.9, 0.96], [26, 0, 0, -26]);
  return (
    <motion.div style={{ opacity, y }} className={className}>
      {children}
    </motion.div>
  );
};

/** Minimal brand gateway — the official logo in a clean pill with an animated accent highlight */
const BrandButton = ({ brand }: { brand: BrandLink }) => (
  <a
    href={brand.href}
    target="_blank"
    rel="noopener noreferrer"
    aria-label={`Visit ${brand.name}`}
    title={brand.href.replace(/^https?:\/\//, "")}
    className="brand-btn group pointer-events-auto relative overflow-hidden inline-flex items-center justify-between gap-4 rounded-full bg-white h-16 sm:h-[4.5rem] pl-6 pr-2.5 sm:pl-7 sm:pr-3 transition-transform duration-300 hover:-translate-y-1 hover:scale-[1.02]"
    style={
      {
        "--brand": brand.accent,
        "--brand-glow": `${brand.accent}59`,
        "--brand-sheen": `${brand.accent}1f`,
      } as React.CSSProperties
    }
  >
    {/* Fixed-size logo well so every brand pill shares the exact same footprint */}
    <span className="relative z-10 flex items-center justify-center w-[140px] sm:w-[160px] h-full shrink-0">
      <img
        src={brand.logo}
        alt={brand.name}
        className="max-h-9 sm:max-h-10 max-w-full w-auto object-contain"
      />
    </span>
    <span
      className="relative z-10 flex items-center justify-center w-11 h-11 rounded-full shrink-0 transition-transform duration-300 group-hover:scale-110"
      style={{ backgroundColor: `${brand.accent}1f`, color: brand.accent }}
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
  backgroundColor,
  theme,
  title,
  description,
  keywords = [],
  brands = [],
  align,
  sectionHeight = "400vh",
}) => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // States for video loading and metadata
  const [isLoading, setIsLoading] = useState(true);
  const durationRef = useRef(0);

  // Seek throttling refs
  const targetTimeRef = useRef(0);
  const isSeekingRef = useRef(false);
  const pendingSeekRef = useRef<number | null>(null);

  // Check if section is in viewport to save CPU/GPU processing
  const isInView = useInView(sectionRef, { margin: "0px 0px 0px 0px" });

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
      isSeekingRef.current = true;
      video.currentTime = boundedTime;
    }
  };

  const handleSeeked = () => {
    isSeekingRef.current = false;
    const video = videoRef.current;
    if (!video) return;

    if (pendingSeekRef.current !== null) {
      const nextSeekTime = pendingSeekRef.current;
      pendingSeekRef.current = null;

      // Check threshold again before performing pending seek
      if (Math.abs(video.currentTime - nextSeekTime) >= 0.01) {
        isSeekingRef.current = true;
        video.currentTime = nextSeekTime;
      }
    }
  };

  // Map the smoothProgress to video seeks
  useEffect(() => {
    const unsubscribe = smoothProgress.on("change", (latestValue) => {
      if (!isInView || !durationRef.current) return;
      const targetTime = latestValue * durationRef.current;
      seekTo(targetTime);
    });

    return () => unsubscribe();
  }, [smoothProgress, isInView]);

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

    const handleCanPlayThrough = () => {
      setIsLoading(false);
    };

    video.addEventListener("loadedmetadata", handleLoadedMetadata);
    video.addEventListener("canplaythrough", handleCanPlayThrough);
    video.addEventListener("seeked", handleSeeked);

    // Fallback: If metadata is already loaded (due to preloading or browser caching)
    if (video.readyState >= 1) {
      handleLoadedMetadata();
    }
    if (video.readyState >= 4) {
      handleCanPlayThrough();
    }

    return () => {
      video.removeEventListener("loadedmetadata", handleLoadedMetadata);
      video.removeEventListener("canplaythrough", handleCanPlayThrough);
      video.removeEventListener("seeked", handleSeeked);
    };
  }, []);

  // Video visual fade overlay (fade video as the section transitions)
  const videoOpacity = useTransform(smoothProgress, [0.0, 0.06, 0.9, 0.98], [0, 1, 1, 0]);

  // Accent glow breathes in with the content
  const glowOpacity = useTransform(smoothProgress, [0.05, 0.2, 0.88, 0.96], [0, 1, 1, 0]);

  // Scroll Down Indicator animation (Only visible in early scroll stages)
  const indicatorOpacity = useTransform(smoothProgress, [0.0, 0.08], [1, 0]);

  const textShadow =
    theme.scrim === "dark"
      ? "0 2px 28px rgba(0,0,0,0.55)"
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
      style={{ height: sectionHeight, backgroundColor }}
      className="relative w-full overflow-visible"
    >
      {/* Sticky video wrapper */}
      <div className="sticky top-0 h-screen w-full overflow-hidden flex items-center justify-center z-10">
        <motion.div style={{ opacity: videoOpacity }} className="absolute inset-0 w-full h-full">
          <video
            ref={videoRef}
            src={videoSrc}
            muted
            preload="auto"
            playsInline
            webkit-playsinline="true"
            className="absolute inset-0 w-full h-full object-cover"
            style={{ pointerEvents: "none" }}
          />
          {/* Scrim tuned per section so text stays legible without hiding the footage */}
          <div
            className={`absolute inset-0 pointer-events-none ${
              theme.scrim === "dark"
                ? theme.strongScrim
                  ? "bg-gradient-to-t from-black/75 via-black/45 to-black/50"
                  : "bg-gradient-to-t from-black/45 via-black/5 to-black/25"
                : theme.strongScrim
                ? "bg-gradient-to-t from-white/75 via-white/45 to-white/50"
                : "bg-gradient-to-t from-white/50 via-white/5 to-white/25"
            }`}
          />
          {/* Directional scrim — calms the video only where the text sits */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                align === "center"
                  ? `radial-gradient(ellipse 70% 60% at 50% 50%, ${
                      theme.scrim === "dark" ? "rgba(0,0,0,0.5)" : "rgba(255,255,255,0.55)"
                    } 0%, transparent 75%)`
                  : `linear-gradient(${align === "left" ? "90deg" : "270deg"}, ${
                      theme.scrim === "dark" ? "rgba(0,0,0,0.6)" : "rgba(255,255,255,0.7)"
                    } 0%, ${
                      theme.scrim === "dark" ? "rgba(0,0,0,0.3)" : "rgba(255,255,255,0.35)"
                    } 38%, transparent 68%)`,
            }}
          />
        </motion.div>

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

        {/* Content overlay — open typography over the video, no card */}
        {isInView && (
          <div
            className={`absolute inset-0 z-20 pointer-events-none flex items-center ${justify} px-6 sm:px-10 md:px-16 lg:px-24 py-24`}
          >
            <div
              className={`w-full flex flex-col ${alignItems} ${
                brands.length > 1 ? "max-w-3xl" : "max-w-2xl"
              }`}
            >
              {/* Title */}
              <Reveal progress={smoothProgress} start={0.08} end={0.2} className="mb-5 md:mb-7">
                {isHero ? (
                  <h1
                    className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-medium tracking-tight leading-[1.06] text-balance"
                    style={{ color: theme.text, textShadow }}
                  >
                    {title}
                  </h1>
                ) : (
                  <h2
                    className="text-3xl sm:text-4xl md:text-[2.75rem] lg:text-5xl font-medium tracking-tight leading-[1.12] text-balance max-w-[18ch]"
                    style={{ color: theme.text, textShadow }}
                  >
                    {title}
                  </h2>
                )}
              </Reveal>

              {/* Description */}
              {description && (
                <Reveal progress={smoothProgress} start={0.26} end={0.38} className="mb-8 md:mb-10">
                  <p
                    className="text-base sm:text-lg font-normal leading-relaxed max-w-lg text-pretty"
                    style={{ color: theme.muted, textShadow }}
                  >
                    {description}
                  </p>
                </Reveal>
              )}

              {/* Keyword tags — footprint / facts at a glance instead of bullet text */}
              {keywords.length > 0 && (
                <div
                  className={`flex flex-wrap gap-2.5 mb-8 md:mb-10 ${
                    align === "center" ? "justify-center" : "justify-start"
                  }`}
                >
                  {keywords.map((keyword, i) => (
                    <Reveal
                      key={keyword}
                      progress={smoothProgress}
                      start={0.4 + i * 0.06}
                      end={0.46 + i * 0.06}
                    >
                      <span
                        className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full border backdrop-blur-xl text-sm sm:text-base font-normal tracking-wide shadow-md shadow-black/10"
                        style={{
                          color: theme.text,
                          borderColor: `${theme.accent}59`,
                          backgroundColor:
                            theme.scrim === "dark"
                              ? "rgba(10,10,10,0.45)"
                              : "rgba(255,255,255,0.65)",
                        }}
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

              {/* Brand gateways — minimal logo buttons out to the dedicated sites */}
              {brands.length > 0 && (
                <div
                  className={`flex flex-wrap items-center gap-3 ${
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
              )}
            </div>
          </div>
        )}

        {/* Section scroll progress line in the section accent */}
        <motion.div
          className="absolute bottom-0 left-0 right-0 h-[2px] origin-left z-30 pointer-events-none"
          style={{ scaleX: smoothProgress, backgroundColor: theme.accent, opacity: videoOpacity }}
        />

        {/* Scroll Down Hint (hero only) */}
        {isHero && (
          <motion.div
            style={{ opacity: indicatorOpacity }}
            className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2 pointer-events-none"
          >
            <span
              className="text-xs uppercase tracking-[0.2em] font-medium opacity-70"
              style={{ color: theme.text }}
            >
              Scroll to explore
            </span>
            <motion.div
              animate={{ y: [0, 6, 0] }}
              transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
            >
              <ArrowDown className="w-4 h-4 opacity-75" style={{ color: theme.text }} />
            </motion.div>
          </motion.div>
        )}
      </div>

      {/* Loading Overlay */}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
            className="absolute inset-0 z-50 flex flex-col items-center justify-center"
            style={{ backgroundColor }}
          >
            <div className="flex flex-col items-center space-y-4 max-w-xs w-full px-6">
              <span
                className="text-xs uppercase tracking-[0.25em] font-medium opacity-60"
                style={{ color: theme.text }}
              >
                Loading Cinematic
              </span>
              <div
                className="h-[1px] w-48 overflow-hidden rounded-full"
                style={{
                  backgroundColor:
                    theme.scrim === "dark" ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)",
                }}
              >
                <motion.div
                  className="h-full"
                  style={{ backgroundColor: theme.accent }}
                  initial={{ x: "-100%" }}
                  animate={{ x: "100%" }}
                  transition={{
                    repeat: Infinity,
                    duration: 1.5,
                    ease: "easeInOut",
                  }}
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};
