"use client";

import React, { useState, useEffect } from "react";
import { Link } from "@/i18n/navigation";
import {
  ScrollVideoSection,
  type BrandLink,
  type SectionTheme,
} from "@/components/ScrollVideoSection";
import { ScrollRail } from "@/components/ScrollRail";
import { useTranslations } from "next-intl";

interface SectionData {
  id: string;
  translationKey: "group" | "kokosflora" | "engineering" | "technology";
  videoSrc: string;
  mobileVideoSrc: string;
  posterSrc: string;
  videoFit?: "cover" | "contain";
  backgroundColor: string;
  theme: SectionTheme;
  title?: string;
  description?: string;
  keywords?: string[];
  brands?: BrandLink[];
  align: "left" | "right" | "center";
}

const sectionsData: SectionData[] = [
  {
    id: "group",
    translationKey: "group",
    videoSrc: "/videos/section-1.mp4",
    mobileVideoSrc: "/videos/mobile/section-1.mp4",
    posterSrc: "/videos/posters/section-1.webp",
    backgroundColor: "#050505",
    theme: {
      text: "#f4f4f5",
      muted: "#c7c9ce",
      accent: "#8ab4ff",
      scrim: "dark",
    },
    align: "center",
  },
  {
    id: "kokosflora",
    translationKey: "kokosflora",
    videoSrc: "/videos/kokosflora-coir-lifecycle.mp4",
    mobileVideoSrc: "/videos/mobile/kokosflora-coir-lifecycle.mp4",
    posterSrc: "/videos/posters/kokosflora-coir-lifecycle.webp",
    backgroundColor: "#d6c0a3",
    theme: {
      text: "#2b2014",
      muted: "#54432d",
      accent: "#2e7d4f",
      scrim: "light",
      // The coir lifecycle footage is the story here — keep the wash light so
      // the produce/plants stay vivid behind the copy.
      scrimStrength: "soft",
    },
    brands: [
      {
        name: "Kokosflora",
        logo: "/logos/kokosflora.png",
        href: "https://kokosflora.com",
        accent: "#2e7d4f",
      },
    ],
    align: "center",
  },
  {
    id: "engineering",
    translationKey: "engineering",
    videoSrc: "/videos/section-3.mp4",
    mobileVideoSrc: "/videos/mobile/section-3.mp4",
    posterSrc: "/videos/posters/section-3.webp",
    backgroundColor: "#e5e5e5",
    theme: {
      text: "#141414",
      muted: "#44474d",
      accent: "#e2551c",
      scrim: "light",
    },
    brands: [
      {
        name: "mpinger",
        logo: "/logos/mpinger.png",
        href: "https://www.mpinger-engineering.com/",
        accent: "#1e5aa8",
      },
      {
        name: "Hanox",
        logo: "/logos/hanox.png",
        href: "https://hanox-baumaschinen.de",
        accent: "#e8a200",
      },
    ],
    align: "center",
  },
  {
    id: "technology",
    translationKey: "technology",
    videoSrc: "/videos/section-4.mp4",
    mobileVideoSrc: "/videos/mobile/section-4.mp4",
    posterSrc: "/videos/posters/section-4.webp",
    backgroundColor: "#080808",
    theme: {
      text: "#ffffff",
      muted: "#c3c6d1",
      accent: "#9d7bff",
      scrim: "dark",
      scrimStrength: "strong",
    },
    brands: [
      {
        name: "mpasys",
        logo: "/logos/mpasys.png",
        href: "https://mpasys.ai",
        accent: "#7c3aed",
      },
    ],
    align: "center",
  },
];

// Stable reference for the rail — it measures section offsets in an effect
// keyed on this array, so a new one per render would re-measure in a loop.
// Check if a hex background color is dark (for glassy header/nav surfaces)
const isDarkColor = (hex: string) => {
  const color = hex.replace("#", "");
  if (color.length !== 6) return true;
  const r = parseInt(color.substring(0, 2), 16);
  const g = parseInt(color.substring(2, 4), 16);
  const b = parseInt(color.substring(4, 6), 16);
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness < 128;
};

export default function Home() {
  const t = useTranslations("home");
  const nav = useTranslations("nav");
  const railSections = sectionsData.map(({ id, translationKey }) => ({
    id,
    navLabel: nav(translationKey === "technology" ? "ai" : translationKey),
  }));
  const [activeSection, setActiveSection] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);

  // Track which section owns the viewport, to drive the nav highlight.
  //
  // This previously ran on every scroll event and called getBoundingClientRect()
  // on all four sections each time. Reading layout geometry inside a scroll
  // handler forces a synchronous reflow on every frame — the textbook cause of
  // scroll jank, and expensive enough on a phone to be felt while the video is
  // also being scrubbed. IntersectionObserver computes the same answer without
  // touching layout on the main thread.
  //
  // The -50%/-50% rootMargin collapses the root box to a 1px band across the
  // middle of the viewport, which reproduces the old "midpoint of the screen"
  // test exactly.
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const idx = sectionsData.findIndex((s) => s.id === entry.target.id);
          if (idx !== -1) setActiveSection(idx);
        }
      },
      { rootMargin: "-50% 0px -50% 0px", threshold: 0 }
    );

    for (const section of sectionsData) {
      const el = document.getElementById(section.id);
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, []);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
    setMenuOpen(false);
  };

  const active = sectionsData[activeSection];
  const activeCopy = t.raw(`sections.${active.translationKey}`) as { title: string; description: string; keyword1: string; keyword2: string; keyword3: string; keyword4?: string };
  const activeTheme = active.theme;
  const isThemeDark = isDarkColor(active.backgroundColor);
  // Solid, legible nav surface: an opaque white bar with dark text, replacing
  // the previous 10%-opacity glass that let the hero video show through.
  const borderTheme = "border-neutral-200";
  const navbarBgTheme = "bg-white shadow-sm";
  const navText = "#141414";

  const lastSection = sectionsData[sectionsData.length - 1];
  const footerTextColor = isDarkColor(lastSection.backgroundColor)
    ? "#fafafa"
    : "#141414";

  return (
    <div
      className="w-full min-h-screen transition-colors duration-1000"
      style={{ backgroundColor: active.backgroundColor }}
    >
      {/* Premium Floating Header */}
      <header
        className={`fixed top-0 left-0 right-0 z-40 h-20 border-b transition-all duration-700 ${borderTheme} ${navbarBgTheme}`}
      >
        <div className="max-w-7xl mx-auto h-full px-6 md:px-12 lg:px-16 xl:px-20 flex items-center justify-between">
          <div className="flex items-center gap-2.5 md:gap-3">
            <span
              className="text-lg md:text-xl font-semibold tracking-tight font-mono select-none transition-colors duration-700"
              style={{ color: navText }}
            >
              Mpinger
            </span>
            <span
              className="text-[10px] md:text-xs px-2 py-0.5 border rounded-md font-medium font-mono uppercase tracking-wider transition-colors duration-700"
              style={{
                color: navText,
                borderColor: `${activeTheme.accent}66`,
                opacity: 0.8,
              }}
            >
              Groups
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-9 lg:gap-10">
            {sectionsData.map((section, idx) => (
              <button
                key={section.id}
                onClick={() => scrollToSection(section.id)}
                className={`text-xs uppercase tracking-widest font-medium transition-all duration-300 hover:opacity-100 ${
                  activeSection === idx
                    ? "opacity-100 font-semibold scale-105"
                    : "opacity-50"
                }`}
                style={{
                  color:
                    activeSection === idx ? activeTheme.accent : navText,
                }}
              >
                {nav(section.translationKey === "technology" ? "ai" : section.translationKey)}
              </button>
            ))}
          </nav>

          <div>
            {/* Premium CTA — filled with the active section's own accent
                color (rather than a flat black/white invert), with a
                persistent accent-tinted shadow and a confident hover lift,
                so it reads as a considered call to action, not a stock
                bordered pill. Hidden below md because the mobile menu panel
                (see below) carries its own Contact button. */}
            <Link
              href="/contact"
              className="px-6 py-2.5 rounded-full text-xs uppercase tracking-[0.15em] font-semibold text-white transition-all duration-300 hover:scale-[1.05] hover:brightness-110 active:scale-[0.97] hidden md:inline-block"
              style={{
                backgroundColor: activeTheme.accent,
                boxShadow: `0 10px 28px -10px ${activeTheme.accent}99`,
              }}
            >
              Contact
            </Link>
          </div>

          {/* Mobile menu toggle — only shown below md, where the inline <nav>
              is hidden. Keeps the same section shortcuts reachable on phones
              instead of dropping them entirely. */}
          <button
            type="button"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((v) => !v)}
            className="md:hidden ml-3 inline-flex h-10 w-10 items-center justify-center rounded-md border transition-colors duration-300"
            style={{ color: navText, borderColor: `${activeTheme.accent}66` }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              {menuOpen ? (
                <path d="M6 6l12 12M18 6L6 18" />
              ) : (
                <path d="M4 7h16M4 12h16M4 17h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile dropdown — mirrors the desktop nav links. Closes on
            selection (see scrollToSection). */}
        {menuOpen && (
          <nav className="md:hidden bg-white shadow-xl border-t px-6 py-3 flex flex-col gap-1" style={{ borderColor: `${activeTheme.accent}33` }}>
              {sectionsData.map((section, idx) => (
              <button
                key={section.id}
                onClick={() => scrollToSection(section.id)}
                className="text-left text-sm uppercase tracking-widest font-medium py-2.5 transition-colors duration-300"
                style={{
                  color: activeSection === idx ? activeTheme.accent : navText,
                  opacity: activeSection === idx ? 1 : 0.7,
                }}
              >
                  {nav(section.translationKey === "technology" ? "ai" : section.translationKey)}
              </button>
            ))}
            <Link
              href="/contact"
              className="mt-2 text-center px-6 py-3 rounded-full text-xs uppercase tracking-[0.15em] font-semibold text-white"
              style={{ backgroundColor: activeTheme.accent }}
            >
              Contact
            </Link>
          </nav>
        )}
      </header>

      {/* Draggable scroll rail. Replaces the previous dot indicator: it keeps
          the same section markers, but the handle can be dragged (or pressed
          anywhere along the rail) to travel the page directly — the native
          scrollbar is hidden site-wide, so this is the only direct control. */}
      <ScrollRail
        sections={railSections}
        activeIndex={activeSection}
        color={activeTheme.text}
        accent={activeTheme.accent}
      />

      {/* Landing Page Content Sections */}
      <main className="w-full flex flex-col">
        {sectionsData.map((section, idx) => (
          <ScrollVideoSection
            key={section.id}
            id={section.id}
            isHero={idx === 0}
            videoSrc={section.videoSrc}
            mobileVideoSrc={section.mobileVideoSrc}
            posterSrc={section.posterSrc}
            videoFit={section.videoFit}
            backgroundColor={section.backgroundColor}
            theme={section.theme}
            title={(t.raw(`sections.${section.translationKey}`) as typeof activeCopy).title}
            description={(t.raw(`sections.${section.translationKey}`) as typeof activeCopy).description}
            keywords={Object.values(t.raw(`sections.${section.translationKey}`) as typeof activeCopy).filter((value) => typeof value === "string").slice(1)}
            brands={section.brands}
            align={section.align}
            sectionHeight={idx === 0 ? "260vh" : "400vh"}
            stackOrder={idx}
          />
        ))}
      </main>

      {/* Premium minimal footer / group contact point */}
      <footer
        id="contact"
        className={`w-full py-14 border-t text-center transition-colors duration-1000 ${borderTheme}`}
        style={{ backgroundColor: lastSection.backgroundColor }}
      >
        <div className="max-w-7xl mx-auto px-6 md:px-12 flex flex-col sm:flex-row items-center justify-between gap-8">
          <p
            className="text-xs tracking-wider opacity-50 font-light"
            style={{ color: footerTextColor }}
          >
            © {new Date().getFullYear()} Mpinger Groups. {t("footer")}
          </p>
          <a
            href="mailto:info@mpinger.de"
            className="text-xs tracking-widest uppercase font-medium opacity-70 hover:opacity-100 transition-opacity duration-300"
            style={{ color: lastSection.theme.accent }}
          >
            info@mpinger.de
          </a>
          {/* "Impressum" and "Legal Notice" were two labels for the same legal
              instrument, and all three pointed at href="#" — dead links that a
              German commercial site is legally required to actually provide. */}
          <div className="flex gap-6">
            <Link
              href="/contact"
              className="text-xs tracking-wider opacity-50 hover:opacity-100 transition-opacity duration-300 font-light"
              style={{ color: footerTextColor }}
            >
              {nav("contact")}
            </Link>
            {[
                { label: nav("imprint"), href: "/impressum" },
                { label: nav("privacy"), href: "/datenschutz" },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-xs tracking-wider opacity-50 hover:opacity-100 transition-opacity duration-300 font-light"
                style={{ color: footerTextColor }}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
