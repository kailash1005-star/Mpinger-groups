"use client";

import React, { useState, useEffect } from "react";
import {
  ScrollVideoSection,
  type BrandLink,
  type SectionTheme,
} from "@/components/ScrollVideoSection";

interface SectionData {
  id: string;
  navLabel: string;
  videoSrc: string;
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
    backgroundColor: "#050505",
    theme: {
      text: "#f4f4f5",
      muted: "#c7c9ce",
      accent: "#8ab4ff",
      scrim: "dark",
    },
    title: "One group. Engineering, nature, and intelligence.",
    description:
      "From machinery roots in India to a global, multi-vertical group headquartered in Germany.",
    keywords: ["India", "Germany", "Peru", "Mexico"],
    align: "center",
  },
  {
    id: "kokosflora",
    navLabel: "Kokosflora",
    videoSrc: "/videos/section-2.mp4",
    backgroundColor: "#d6c0a3",
    theme: {
      text: "#2b2014",
      muted: "#54432d",
      accent: "#2e7d4f",
      scrim: "light",
    },
    title: "Growing the future on renewable coco substrates.",
    description:
      "Sustainable coir growing media — produced in India and Germany, nurturing horticulture across the globe.",
    keywords: ["100% renewable", "Grown in India", "Warehoused in Germany"],
    brands: [
      {
        name: "Kokosflora",
        logo: "/logos/kokosflora.png",
        href: "https://kokosflora.com",
        accent: "#2e7d4f",
      },
    ],
    align: "right",
  },
  {
    id: "engineering",
    navLabel: "Engineering",
    videoSrc: "/videos/section-3.mp4",
    backgroundColor: "#e5e5e5",
    theme: {
      text: "#141414",
      muted: "#44474d",
      accent: "#e2551c",
      scrim: "light",
    },
    title: "Precision engineering. Built to move industries.",
    description:
      "The group's founding business — precision machine components from India, and compact construction machines for Europe.",
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
    align: "left",
  },
  {
    id: "technology",
    navLabel: "Technology",
    videoSrc: "/videos/section-4.mp4",
    backgroundColor: "#080808",
    theme: {
      text: "#ffffff",
      muted: "#c3c6d1",
      accent: "#9d7bff",
      scrim: "dark",
      strongScrim: true,
    },
    title: "AI-native. Enterprise-ready.",
    description:
      "The newest chapter — enterprise AI solutions and consulting, engineered for real-world adoption.",
    keywords: ["AI adoption", "Enterprise platforms", "Consulting"],
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
        <div className="max-w-7xl mx-auto h-full px-6 md:px-12 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span
              className="text-lg md:text-xl font-bold tracking-[0.25em] font-mono select-none transition-colors duration-700"
              style={{ color: activeTheme.text }}
            >
              MP
            </span>
            <span
              className="text-xs px-2 py-0.5 border rounded-md font-medium font-mono tracking-wider transition-colors duration-700"
              style={{
                color: activeTheme.text,
                borderColor: `${activeTheme.accent}66`,
                opacity: 0.8,
              }}
            >
              GROUP
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-8">
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
            <button
              onClick={() => scrollToSection("contact")}
              className={`px-5 py-2 border rounded-full text-xs uppercase tracking-wider font-semibold transition-all duration-300 ${
                isThemeDark
                  ? "bg-white text-black border-white hover:bg-transparent hover:text-white"
                  : "bg-neutral-900 text-white border-neutral-900 hover:bg-transparent hover:text-neutral-900"
              }`}
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
            backgroundColor={section.backgroundColor}
            theme={section.theme}
            title={section.title}
            description={section.description}
            keywords={section.keywords}
            brands={section.brands}
            align={section.align}
            sectionHeight="400vh"
          />
        ))}
      </main>

      {/* Premium minimal footer / group contact point */}
      <footer
        id="contact"
        className={`w-full py-12 border-t text-center transition-colors duration-1000 ${borderTheme}`}
        style={{ backgroundColor: lastSection.backgroundColor }}
      >
        <div className="max-w-7xl mx-auto px-6 md:px-12 flex flex-col sm:flex-row items-center justify-between gap-6">
          <p
            className="text-xs tracking-wider opacity-50 font-light"
            style={{ color: footerTextColor }}
          >
            © {new Date().getFullYear()} MP GROUP. All rights reserved.
          </p>
          <a
            href="mailto:info@mpinger.de"
            className="text-xs tracking-widest uppercase font-medium opacity-70 hover:opacity-100 transition-opacity duration-300"
            style={{ color: lastSection.theme.accent }}
          >
            info@mpinger.de
          </a>
          <div className="flex gap-6">
            {["Privacy Policy", "Impressum", "Legal Notice"].map((item) => (
              <a
                key={item}
                href="#"
                className="text-xs tracking-wider opacity-50 hover:opacity-100 transition-opacity duration-300 font-light"
                style={{ color: footerTextColor }}
              >
                {item}
              </a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
