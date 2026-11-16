import type { MetadataRoute } from "next";

// Required for static export: metadata routes must be explicitly static.
export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/" }],
    sitemap: "https://schengencompass.com/sitemap.xml",
  };
}
