import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  // The four verticals are in-page anchors, not routes, so they are
  // intentionally not listed here. Sitemaps index documents, and fragment URLs
  // are not separately indexable — listing them would create duplicate entries
  // that resolve to the same page. Real routes do belong here.
  return [
    {
      url: siteUrl,
      lastModified,
      changeFrequency: "monthly",
      priority: 1,
    },
    {
      url: `${siteUrl}/contact`,
      lastModified,
      changeFrequency: "yearly",
      priority: 0.8,
    },
  ];
}
