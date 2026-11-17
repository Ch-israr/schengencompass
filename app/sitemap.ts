import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

// Required for static export: metadata routes must be explicitly static.
export const dynamic = "force-static";

// Single source of truth for the site host — see lib/site.ts. When the
// custom domain is bought, change SITE_URL there and the sitemap follows.
const BASE_URL = SITE_URL;

const ROUTES = [
  "/",
  "/schengen-calculator/",
  "/pro/",
  "/about/",
  "/privacy/",
  "/terms/",
  "/contact/",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return ROUTES.map((route) => ({
    url: `${BASE_URL}${route}`,
    lastModified: now,
    changeFrequency: route === "/" || route === "/schengen-calculator/" ? "weekly" : "monthly",
    // /schengen-calculator/ is the canonical primary URL for the counter
    // (home canonicalizes to it), so it carries the top priority.
    priority:
      route === "/schengen-calculator/"
        ? 1
        : route === "/"
          ? 0.9
          : 0.5,
  }));
}
