import type { MetadataRoute } from "next";

// Required for static export: metadata routes must be explicitly static.
export const dynamic = "force-static";

const BASE_URL = "https://schengencompass.com";

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
    priority: route === "/" ? 1 : route === "/schengen-calculator/" ? 0.9 : 0.5,
  }));
}
