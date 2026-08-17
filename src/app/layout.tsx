import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { siteUrl, siteName, siteDescription, organisation, brands } from "@/lib/site";
import GoogleTranslate from "@/components/GoogleTranslate";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  // Show fallback text immediately rather than blocking paint on the webfont.
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

// Front-loads the terms a buyer actually searches. "AI-Native Technology" was
// a label the company applies to itself, not a phrase anyone types into Google.
const title = `${siteName} — Precision Manufacturing, Peat-Free Substrates & Enterprise AI`;

export const metadata: Metadata = {
  // Required for OG/Twitter image paths to resolve to absolute URLs. Without
  // it, social crawlers get a relative path and silently render no preview.
  metadataBase: new URL(siteUrl),
  title: {
    default: title,
    template: `%s — ${siteName}`,
  },
  description: siteDescription,
  applicationName: siteName,
  keywords: [
    "Mpinger Groups",
    "precision machined components",
    "CNC machining India",
    "5-axis CNC supplier",
    "contract manufacturing Germany",
    "peat-free growing media",
    "coir substrate supplier",
    "coco peat Europe",
    "compact construction machinery",
    "mini excavator dealer Germany",
    "enterprise AI consulting",
    "AI implementation partner",
    "Indo-German manufacturing",
    "Hannover",
  ],
  authors: [{ name: siteName, url: siteUrl }],
  creator: siteName,
  publisher: siteName,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    siteName,
    title,
    description: siteDescription,
    url: siteUrl,
    locale: "en_US",
    images: [
      {
        url: "/og.jpg",
        width: 1200,
        height: 630,
        alt: `${siteName} — an Indo-German group spanning engineering, sustainability and AI`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description: siteDescription,
    images: ["/og.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  category: "business",
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#d6c0a3" },
    { media: "(prefers-color-scheme: dark)", color: "#050505" },
  ],
};

/**
 * Organization structured data. This is what lets search engines connect the
 * parent group to its operating companies and surface the knowledge panel —
 * without it the four brands read as unrelated outbound links.
 */
const organisationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": `${siteUrl}/#organization`,
  name: siteName,
  legalName: organisation.legalName,
  url: siteUrl,
  logo: `${siteUrl}/icons/icon-512.png`,
  image: `${siteUrl}/og.jpg`,
  description: siteDescription,
  address: {
    "@type": "PostalAddress",
    streetAddress: organisation.streetAddress,
    postalCode: organisation.postalCode,
    addressLocality: organisation.addressLocality,
    addressCountry: organisation.addressCountry,
  },
  contactPoint: [
    {
      "@type": "ContactPoint",
      telephone: organisation.telephone,
      email: organisation.email,
      contactType: "sales",
      areaServed: ["DE", "EU", "IN"],
      availableLanguage: ["en", "de"],
    },
  ],
  subOrganization: brands.map((brand) => ({
    "@type": "Organization",
    name: brand.name,
    url: brand.url,
  })),
};

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": `${siteUrl}/#website`,
  url: siteUrl,
  name: siteName,
  description: siteDescription,
  publisher: { "@id": `${siteUrl}/#organization` },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        {/* The hero poster is the Largest Contentful Paint element. Preloading
            it at high priority starts the fetch from the HTML rather than
            waiting for the video element to be constructed by React. */}
        <link
          rel="preload"
          as="image"
          href="/videos/posters/section-1.webp"
          type="image/webp"
          fetchPriority="high"
        />
        {/* Warm up the font origins before the CSS that needs them is parsed. */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <script
          type="application/ld+json"
          // Server-rendered constants only — no user input reaches this string.
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organisationJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
      </head>
      <body className="min-h-full flex flex-col">
        {/* Keyboard and screen-reader users can jump the fixed header and the
            four full-screen video sections instead of tabbing through them. */}
        <a
          href="#group"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:rounded-full focus:bg-white focus:px-5 focus:py-2.5 focus:text-sm focus:font-semibold focus:text-black focus:shadow-lg"
        >
          Skip to content
        </a>
        {children}
        <GoogleTranslate />
      </body>
    </html>
  );
}
