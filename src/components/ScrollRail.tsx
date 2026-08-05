"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  motion,
  useMotionValueEvent,
  useScroll,
  useTransform,
} from "framer-motion";

export interface RailSection {
  id: string;
  navLabel: string;
}

interface ScrollRailProps {
  /**
   * Must be a stable reference (module-level constant or memoised). The tick
   * measurement effect depends on it and writes state, so a fresh array on
   * every render would loop.
   */
  sections: RailSection[];
  /** Index of the section that currently owns the viewport. */
  activeIndex: number;
  /** Text colour of the active section — drives the idle rail and ticks. */
  color: string;
  /** Accent of the active section — drives the handle and the progress fill. */
  accent: string;
}

/** Height of the drag handle in px. The travel area is inset by half of it so
 *  the handle's centre can reach both ends without overhanging the rail. */
const THUMB_HEIGHT = 34;

const clamp01 = (n: number) => (n < 0 ? 0 : n > 1 ? 1 : n);

const reducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const maxScroll = () =>
  document.documentElement.scrollHeight - window.innerHeight;

/**
 * A draggable vertical scrub rail pinned to the right edge.
 *
 * The page hides its native scrollbars (see globals.css), which leaves a very
 * tall scroll-driven site with no way to travel it other than repeated wheel
 * or swipe gestures. This restores a direct control: drag the handle — or press
 * anywhere on the rail — and the page jumps straight to that position, with the
 * four sections marked as ticks for one-click navigation.
 */
export function ScrollRail({
  sections,
  activeIndex,
  color,
  accent,
}: ScrollRailProps) {
  const { scrollYProgress } = useScroll();

  const travelRef = useRef<HTMLDivElement>(null);
  const thumbRef = useRef<HTMLDivElement>(null);

  const [dragging, setDragging] = useState(false);
  const [dragProgress, setDragProgress] = useState(0);
  const [ticks, setTicks] = useState<{ id: string; label: string; pct: number }[]>(
    []
  );

  const thumbTop = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);
  const fillHeight = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  // aria-valuenow is written straight to the DOM rather than held in state.
  // Scroll position changes on every frame while the videos are being scrubbed,
  // and a setState per frame would put a React render on the scroll path — the
  // exact cost this site has already been tuned to avoid.
  useMotionValueEvent(scrollYProgress, "change", (value) => {
    thumbRef.current?.setAttribute(
      "aria-valuenow",
      String(Math.round(clamp01(value) * 100))
    );
  });

  // Where each section starts, as a fraction of total scrollable distance.
  // Section heights are viewport-relative, so this has to be measured after
  // layout and re-measured whenever the viewport changes.
  useEffect(() => {
    let frame = 0;

    const measure = () => {
      const max = maxScroll();
      if (max <= 0) return;
      setTicks(
        sections.map((section) => {
          const el = document.getElementById(section.id);
          const top = el
            ? el.getBoundingClientRect().top + window.scrollY
            : 0;
          return { id: section.id, label: section.navLabel, pct: clamp01(top / max) };
        })
      );
    };

    measure();
    // Fonts, posters and the mobile/desktop video swap all settle after first
    // paint and can change document height.
    const settle = window.setTimeout(measure, 800);
    const onResize = () => {
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(measure);
    };
    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("resize", onResize);
      window.clearTimeout(settle);
      window.cancelAnimationFrame(frame);
    };
  }, [sections]);

  const scrollToProgress = useCallback((progress: number, smooth: boolean) => {
    const max = maxScroll();
    if (max <= 0) return;
    window.scrollTo({
      top: clamp01(progress) * max,
      // `html` sets scroll-behavior: smooth, and "auto" would inherit it —
      // which makes a drag feel like it is chasing the pointer. "instant"
      // explicitly overrides the CSS for the 1:1 gestures.
      behavior: smooth && !reducedMotion() ? "smooth" : "instant",
    });
  }, []);

  // Coalesce pointer movement to one scroll per frame. Pointer events can fire
  // well above display rate, and each scroll write drives four video seeks.
  const queuedRef = useRef<number | null>(null);
  const rafRef = useRef(0);

  const queueScroll = useCallback(
    (progress: number) => {
      queuedRef.current = progress;
      if (rafRef.current) return;
      rafRef.current = window.requestAnimationFrame(() => {
        rafRef.current = 0;
        const next = queuedRef.current;
        queuedRef.current = null;
        if (next !== null) scrollToProgress(next, false);
      });
    },
    [scrollToProgress]
  );

  useEffect(
    () => () => {
      if (rafRef.current) window.cancelAnimationFrame(rafRef.current);
    },
    []
  );

  const progressFromPointer = (clientY: number) => {
    const el = travelRef.current;
    if (!el) return 0;
    const rect = el.getBoundingClientRect();
    if (rect.height <= 0) return 0;
    return clamp01((clientY - rect.top) / rect.height);
  };

  /** Distance from the pointer to the handle's centre when a drag began. */
  const grabOffsetRef = useRef(0);

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0 && event.pointerType === "mouse") return;
    const onHandle = !!thumbRef.current?.contains(event.target as Node);
    // On touch, only the handle starts a drag. The rail sits against the right
    // edge, where a lot of ordinary thumb-scrolling happens — if the whole
    // column swallowed vertical swipes, normal scrolling near that edge would
    // turn into accidental jumps. A mouse has no such ambiguity, so pressing
    // anywhere on the rail works as expected there.
    if (event.pointerType !== "mouse" && !onHandle) return;

    // Grabbing the handle preserves where on it you took hold, so an off-centre
    // grip doesn't lurch the page before you've moved. Pressing the bare rail
    // means "go here", so that one snaps.
    if (onHandle && thumbRef.current) {
      const rect = thumbRef.current.getBoundingClientRect();
      grabOffsetRef.current = event.clientY - (rect.top + rect.height / 2);
    } else {
      grabOffsetRef.current = 0;
    }

    event.currentTarget.setPointerCapture(event.pointerId);
    const progress = progressFromPointer(event.clientY - grabOffsetRef.current);
    setDragging(true);
    setDragProgress(progress);
    scrollToProgress(progress, false);
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!dragging) return;
    const progress = progressFromPointer(event.clientY - grabOffsetRef.current);
    setDragProgress(progress);
    queueScroll(progress);
  };

  const endDrag = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!dragging) return;
    setDragging(false);
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  const nudge = (delta: number) => {
    const max = maxScroll();
    if (max <= 0) return;
    scrollToProgress(window.scrollY / max + delta, true);
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    const step: Record<string, number | "home" | "end"> = {
      ArrowDown: 0.04,
      ArrowRight: 0.04,
      ArrowUp: -0.04,
      ArrowLeft: -0.04,
      PageDown: 0.2,
      PageUp: -0.2,
      Home: "home",
      End: "end",
    };
    const action = step[event.key];
    if (action === undefined) return;
    event.preventDefault();
    if (action === "home") scrollToProgress(0, true);
    else if (action === "end") scrollToProgress(1, true);
    else nudge(action);
  };

  const jumpTo = (id: string) => {
    document
      .getElementById(id)
      ?.scrollIntoView({ behavior: reducedMotion() ? "auto" : "smooth" });
  };

  // While dragging, name the section the handle is currently over.
  const dragLabel = useMemo(() => {
    if (!ticks.length) return null;
    let label = ticks[0].label;
    for (const tick of ticks) {
      if (dragProgress >= tick.pct - 0.001) label = tick.label;
    }
    return label;
  }, [dragProgress, ticks]);

  return (
    // Offsets are chosen so the visible rail line lands inside the section
    // content's horizontal gutter (px-6 / sm:px-10 / md:px-16) rather than over
    // the copy — the rail column is 36px wide and centres its line.
    <div
      className="fixed right-1 sm:right-4 md:right-8 top-1/2 -translate-y-1/2 z-40 select-none"
      style={{ color }}
    >
      <div
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        className="group/rail relative flex h-[min(46vh,380px)] w-9 cursor-pointer justify-center"
        style={{
          // Deliberately NOT touch-action: none — the track must stay
          // transparent to page scrolling on touch (see handlePointerDown).
          // Only the handle opts out, so a drag started there is ours.
          // Keeps the handle's centre reachable at both extremes.
          paddingTop: THUMB_HEIGHT / 2,
          paddingBottom: THUMB_HEIGHT / 2,
        }}
      >
        {/* Travel area — every position below is a percentage of this box, so
            0% is the top of the document and 100% is the bottom. Pointer
            positions are measured against this box, not the padded hit area. */}
        <div ref={travelRef} className="relative h-full w-full">
          {/* Idle rail */}
          <div className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 rounded-full bg-current opacity-20 transition-opacity duration-300 group-hover/rail:opacity-35" />

          {/* Distance travelled */}
          <motion.div
            className="absolute top-0 left-1/2 w-px -translate-x-1/2 rounded-full"
            style={{ height: fillHeight, backgroundColor: accent, opacity: 0.65 }}
          />

          {/* Section ticks */}
          {ticks.map((tick, idx) => {
            const isActive = idx === activeIndex;
            return (
              <button
                key={tick.id}
                type="button"
                // Stop the rail from reading this as the start of a drag, so a
                // tick press snaps to the section instead of to the raw pixel.
                onPointerDown={(event) => event.stopPropagation()}
                onClick={() => jumpTo(tick.id)}
                aria-label={`Go to ${tick.label}`}
                aria-current={isActive ? "true" : undefined}
                className="group/tick absolute left-1/2 flex h-5 w-5 -translate-x-1/2 -translate-y-1/2 items-center justify-center"
                style={{ top: `${tick.pct * 100}%` }}
              >
                <span
                  className="pointer-events-none absolute right-full mr-3 whitespace-nowrap text-[10px] font-semibold uppercase tracking-widest opacity-0 transition-opacity duration-300 group-hover/rail:opacity-50 group-hover/tick:opacity-100"
                  style={{ color: isActive ? accent : undefined }}
                >
                  {tick.label}
                </span>
                <span
                  className={`block rounded-full transition-all duration-300 ${
                    isActive
                      ? "h-2 w-2"
                      : "h-1.5 w-1.5 bg-current opacity-40 group-hover/tick:opacity-90"
                  }`}
                  style={isActive ? { backgroundColor: accent } : undefined}
                />
              </button>
            );
          })}

          {/* Drag handle */}
          <motion.div
            ref={thumbRef}
            role="slider"
            tabIndex={0}
            aria-label="Scroll position"
            aria-orientation="vertical"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={0}
            // Announce a place, not just a percentage: the section under the
            // handle while dragging, otherwise the one currently on screen.
            aria-valuetext={
              (dragging ? dragLabel : sections[activeIndex]?.navLabel) ?? undefined
            }
            onKeyDown={handleKeyDown}
            className="absolute left-1/2 flex -translate-x-1/2 -translate-y-1/2 cursor-grab items-center justify-center active:cursor-grabbing"
            style={{
              top: thumbTop,
              // Padding turns the 5px bar into a ~29x58 target — usable with a
              // thumb — and touch-action claims the gesture for the drag.
              padding: 12,
              touchAction: "none",
            }}
          >
            <div
              className={`rounded-full transition-transform duration-300 ${
                dragging ? "scale-x-[1.7]" : "group-hover/rail:scale-x-[1.4]"
              }`}
              style={{
                width: 5,
                height: THUMB_HEIGHT,
                backgroundColor: accent,
                boxShadow: `0 0 0 3px ${accent}1f, 0 6px 18px -6px ${accent}cc`,
              }}
            />
            {/* Position readout — only while the handle is being moved. */}
            <span
              className={`pointer-events-none absolute top-1/2 right-full mr-4 -translate-y-1/2 whitespace-nowrap rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-white transition-opacity duration-200 ${
                dragging ? "opacity-100" : "opacity-0"
              }`}
              style={{ backgroundColor: accent }}
            >
              {dragLabel}
            </span>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
