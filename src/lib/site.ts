/**
 * Single source of truth for site-wide constants.
 *
 * Metadata, structured data, the sitemap and robots.txt all read from here so
 * they cannot drift apart — a mismatch between the canonical URL in metadata
 * and the one in the sitemap is a classic, silent SEO defect.
 */

/**
 * Canonical origin, no trailing slash.
 *
 * Vercel exposes the deployment host but not the production domain, so the
 * production value is set explicitly and can still be overridden per
 * environment (preview deploys, staging) via NEXT_PUBLIC_SITE_URL.
 */
export const siteUrl = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.mpinger.de"
).replace(/\/$/, "");

export const siteName = "Mpinger Groups";

export const siteDescription =
  "An Indo-German group of companies — precision engineering (mpinger), sustainable coco substrates (Kokosflora), compact construction machines (Hanox), and enterprise AI consulting (mpasys).";

/**
 * Postal address, contact and registration details — reused by the footer,
 * the structured data and the Impressum so they cannot drift apart.
 *
 * Source of truth: the Impressum published at mpinger-engineering.com, which
 * names the same legal entity (mpinger GmbH, Gustav-Schenk-Weg 53, Hannover).
 *
 * NOTE: that Impressum lists +49 511 10554580, whereas the previous mpinger.de
 * site listed +49 511 79090096. The Impressum is the legally-operative
 * document, so its number is used here — worth confirming which is current.
 */
export const organisation = {
  legalName: "mpinger GmbH",
  managingDirector: "Ramkumar Palanisamy",
  streetAddress: "Gustav-Schenk-Weg 53",
  postalCode: "30455",
  addressLocality: "Hannover",
  addressCountry: "DE",
  telephone: "+49 511 10554580",
  email: "info@mpinger.de",
  registerCourt: "Amtsgericht Hannover",
  /** TODO(legal): HRB number was not present in the source Impressum — required by § 5 DDG. */
  registerNumber: "",
  vatId: "DE290407187",
  /** Competent supervisory authority for data protection complaints. */
  dataProtectionAuthority: {
    name: "Die Landesbeauftragte für den Datenschutz Niedersachsen",
    address: "Prinzenstraße 5, 30159 Hannover",
  },
} as const;

/** The group's operating companies, surfaced to search engines as subOrganizations. */
export const brands = [
  { name: "mpinger Engineering", url: "https://mpinger.de" },
  { name: "Kokosflora", url: "https://kokosflora.com" },
  { name: "Hanox Baumaschinen", url: "https://hanox-baumaschinen.de" },
  { name: "mpasys", url: "https://mpasys.ai" },
] as const;
