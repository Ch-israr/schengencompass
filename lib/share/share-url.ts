/**
 * Shareable result URLs. A shared link restores the exact plan: past trips,
 * planned entry date, and planned stay. Encoding lives in
 * `lib/trips/serialise.ts`; this module only builds/parses full URLs and
 * copies them to the clipboard.
 */
import type { Trip } from "../schengen/types";
import { decodePlan, encodePlan, type PlanParams } from "../trips/serialise";

/** Build a shareable URL for a plan. `baseUrl` is the page URL without a query string. */
export function buildShareUrl(
  baseUrl: string,
  trips: Trip[],
  entry: string | null,
  stay: number | null,
): string {
  const params = encodePlan(trips, entry, stay);
  const query = params.toString();
  return query ? `${baseUrl}?${query}` : baseUrl;
}

/** Parse a plan back out of a full URL (or just its query string). Never throws. */
export function parseShareUrl(url: string): PlanParams {
  try {
    const query = url.includes("?") ? url.split("?")[1] ?? "" : url;
    return decodePlan(new URLSearchParams(query));
  } catch {
    return { trips: [], entry: null, stay: null };
  }
}

/**
 * Copy text to the clipboard. Returns false when the Clipboard API is
 * unavailable (non-secure context, Node, old browsers) — the caller then
 * falls back to showing the URL for manual copying.
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (
      typeof navigator !== "undefined" &&
      navigator.clipboard &&
      typeof navigator.clipboard.writeText === "function"
    ) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    return false;
  }
  return false;
}
