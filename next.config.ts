import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

/**
 * Long-lived immutable caching for the media in /public.
 *
 * These files are versioned by hand (a new cut of a clip gets a new filename),
 * so they can safely be cached for a year. Without this they are revalidated on
 * every visit, which for multi-megabyte video means a wasted round trip per
 * section per visit.
 */
const immutableAsset = {
  key: "Cache-Control",
  value: "public, max-age=31536000, immutable",
};

const nextConfig: NextConfig = {
  // Don't advertise the framework to anyone scanning for known CVEs.
  poweredByHeader: false,

  reactStrictMode: true,

  async headers() {
    return [
      {
        // Baseline security headers. This site takes no user input and sets no
        // cookies, so the risk surface is small — but these cost nothing, and
        // their absence is flagged by every audit tool a partner might run.
        source: "/:path*",
        headers: [
          // Stop MIME sniffing turning a served asset into executable content.
          { key: "X-Content-Type-Options", value: "nosniff" },
          // No legitimate reason for this site to be framed.
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          // Explicitly switch off hardware APIs the site never uses.
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          // Force HTTPS. Note: `preload` is a commitment — only submit the
          // domain to the HSTS preload list once every subdomain serves HTTPS.
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains",
          },
        ],
      },
      { source: "/videos/:path*", headers: [immutableAsset] },
      { source: "/logos/:path*", headers: [immutableAsset] },
      { source: "/icons/:path*", headers: [immutableAsset] },
    ];
  },
};

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

export default withNextIntl(nextConfig);
