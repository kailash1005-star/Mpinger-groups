"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ScrollVideoSection,
  type BrandLink,
  type SectionTheme,
} from "@/components/ScrollVideoSection";

interface SectionData {
  id: string;
  navLabel: string;
  videoSrc: string;
  mobileVideoSrc: string;
  posterSrc: string;
  backgroundColor: string;
  theme: SectionTheme;
  title: string;
  description?: string;
  keywords?: string[];
  brands?: BrandLink[];
  align: "left" | "right" | "center";
}

const sectionsData: SectionData[] = [
  {
    id: "group",
    navLabel: "Group",
    videoSrc: "/videos/section-1.mp4",
    mobileVideoSrc: "/videos/mobile/section-1.mp4",
    posterSrc: "/videos/posters/section-1.jpg",
    backgroundColor: "#050505",
    theme: {
      text: "#f4f4f5",
      muted: "#c7c9ce",
      accent: "#8ab4ff",
      scrim: "dark",
    },
    title: "German standards. Indian scale.",
    description:
      "Four specialist companies under one group: precision machined components, peat-free growing media, compact construction machinery and enterprise AI — manufactured at Indian scale, specified and quality-assured from Hannover.",
    keywords: ["Hannover HQ", "India", "Peru", "Mexico"],
    align: "center",
  },
  {
    id: "kokosflora",
    navLabel: "Kokosflora",
    videoSrc: "/videos/kokosflora-coir-lifecycle.mp4",
    mobileVideoSrc: "/videos/mobile/kokosflora-coir-lifecycle.mp4",
    posterSrc: "/videos/posters/kokosflora-coir-lifecycle.jpg",
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
    title: "Peat-free growing media, made from coconut husk.",
    description:
      "Kokosflora turns coconut husk — a by-product of food agriculture — into renewable coir substrate for professional horticulture. Produced in India, warehoused in Germany for short EU lead times.",
    keywords: ["Peat-free", "100% renewable", "EU stock in Germany"],
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
    navLabel: "Engineering",
    videoSrc: "/videos/section-3.mp4",
    mobileVideoSrc: "/videos/mobile/section-3.mp4",
    posterSrc: "/videos/posters/section-3.jpg",
    backgroundColor: "#e5e5e5",
    theme: {
      text: "#141414",
      muted: "#44474d",
      accent: "#e2551c",
      scrim: "light",
    },
    title: "Precision components, machined to European tolerance.",
    description:
      "The group's founding business. mpinger delivers CNC-turned and milled parts, castings, sheet metal and surface finishing from Indian production to European industry — with Hanox supplying compact construction machinery to the same standard.",
    keywords: ["5-axis CNC", "Casting & sheet metal", "Surface treatment"],
    brands: [
      {
        name: "mpinger",
        logo: "/logos/mpinger.png",
        href: "https://mpinger.de",
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
    navLabel: "AI",
    videoSrc: "/videos/section-4.mp4",
    mobileVideoSrc: "/videos/mobile/section-4.mp4",
    posterSrc: "/videos/posters/section-4.jpg",
    backgroundColor: "#080808",
    theme: {
      text: "#ffffff",
      muted: "#c3c6d1",
      accent: "#9d7bff",
      scrim: "dark",
      scrimStrength: "strong",
    },
    title: "Enterprise AI, past the pilot stage.",
    description:
      "mpasys takes AI from proof-of-concept to systems people actually use — data foundations, honest evaluation, and integration into the workflows a business already runs on.",
    keywords: ["Production deployment", "Data & evaluation", "Workflow integration"],
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
  const [activeSection, setActiveSection] = useState(0);

  // Monitor which section is in view to update navigation indicators
  useEffect(() => {
    const handleScroll = () => {
      const scrollPos = window.scrollY + window.innerHeight / 2;
      let currentSection = 0;

      for (let i = 0; i < sectionsData.length; i++) {
        const el = document.getElementById(sectionsData[i].id);
        if (el) {
          const rect = el.getBoundingClientRect();
          const top = rect.top + window.scrollY;
          const bottom = top + rect.height;
          if (scrollPos >= top && scrollPos < bottom) {
            currentSection = i;
            break;
          }
        }
      }
      setActiveSection(currentSection);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    // Initial check
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  const active = sectionsData[activeSection];
  const activeTheme = active.theme;
  const isThemeDark = isDarkColor(active.backgroundColor);
  const borderTheme = isThemeDark ? "border-white/10" : "border-neutral-900/10";
  const navbarBgTheme = isThemeDark
    ? "bg-black/10 backdrop-blur-md"
    : "bg-white/10 backdrop-blur-md";

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
              style={{ color: activeTheme.text }}
            >
              Mpinger
            </span>
            <span
              className="text-[10px] md:text-xs px-2 py-0.5 border rounded-md font-medium font-mono uppercase tracking-wider transition-colors duration-700"
              style={{
                color: activeTheme.text,
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
                    activeSection === idx ? activeTheme.accent : activeTheme.text,
                }}
              >
                {section.navLabel}
              </button>
            ))}
          </nav>

          <div>
            {/* Premium CTA — filled with the active section's own accent
                color (rather than a flat black/white invert), with a
                persistent accent-tinted shadow and a confident hover lift,
                so it reads as a considered call to action, not a stock
                bordered pill. */}
            <button
              onClick={() => scrollToSection("contact")}
              className="px-6 py-2.5 rounded-full text-xs uppercase tracking-[0.15em] font-semibold text-white transition-all duration-300 hover:scale-[1.05] hover:brightness-110 active:scale-[0.97]"
              style={{
                backgroundColor: activeTheme.accent,
                boxShadow: `0 10px 28px -10px ${activeTheme.accent}99`,
              }}
            >
              Contact
            </button>
          </div>
        </div>
      </header>

      {/* Floating Side Dot Navigation Indicator */}
      <div className="fixed right-6 md:right-10 top-1/2 -translate-y-1/2 z-40 flex flex-col gap-4">
        {sectionsData.map((section, idx) => (
          <button
            key={section.id}
            onClick={() => scrollToSection(section.id)}
            className="group relative flex items-center justify-end"
            style={{
              color: activeSection === idx ? activeTheme.accent : activeTheme.text,
            }}
          >
            {/* Tooltip text label */}
            <span className="absolute right-8 text-[10px] uppercase tracking-widest font-semibold opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
              {section.navLabel}
            </span>

            {/* Indicator Dot */}
            <div
              className={`w-3 h-3 rounded-full border transition-all duration-500 flex items-center justify-center ${
                activeSection === idx
                  ? "border-current scale-125"
                  : "border-transparent group-hover:scale-110"
              }`}
            >
              <div
                className={`w-1.5 h-1.5 rounded-full bg-current transition-all duration-500 ${
                  activeSection === idx
                    ? "opacity-100"
                    : "opacity-40 group-hover:opacity-80"
                }`}
              />
            </div>
          </button>
        ))}
      </div>

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
            backgroundColor={section.backgroundColor}
            theme={section.theme}
            title={section.title}
            description={section.description}
            keywords={section.keywords}
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
            © {new Date().getFullYear()} Mpinger Groups. All rights reserved.
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
            {[
              { label: "Impressum", href: "/impressum" },
              { label: "Datenschutz", href: "/datenschutz" },
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
