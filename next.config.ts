import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Static export: prerendered HTML for Cloudflare Pages (free tier).
  // No server, no database, no API routes in the MVP.
  output: "export",
  // Trailing slashes: every route is emitted as <route>/index.html, which
  // is the form plain static hosts (and our canonical URLs) expect.
  trailingSlash: true,
  // No next/image optimisation in a static export; images are plain <img>/SVG.
  images: { unoptimized: true },
};

export default nextConfig;
