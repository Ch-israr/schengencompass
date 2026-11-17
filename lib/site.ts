/**
 * Canonical site URL — the single source of truth for every absolute URL
 * the site emits (canonicals, sitemap, robots.txt sitemap line, Open Graph
 * and Twitter image URLs, JSON-LD).
 *
 * The site is deployed on Cloudflare Pages at schengencompass.pages.dev.
 * When the custom domain schengencompass.com is bought, change this ONE
 * constant and every emitted URL follows. Do not hard-code the host
 * anywhere else.
 */
export const SITE_URL = "https://schengencompass.pages.dev";

/** European Commission official Schengen short-stay calculator. */
export const EC_CALCULATOR_URL =
  "https://ec.europa.eu/assets/home/visa-calculator/calculator.htm?lang=en";

/** European Commission landing page for the short-stay calculator. */
export const EC_CALCULATOR_LANDING_URL =
  "https://home-affairs.ec.europa.eu/policies/schengen/border-crossing/short-stay-calculator_en";
