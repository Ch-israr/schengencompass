/**
 * Trip serialisation for share URLs and localStorage.
 *
 * URL format (one `trips` search param, comma-separated):
 *   trips=2026-01-01_2026-01-30,2026-03-01_2026-03-05_Lisbon
 * i.e. `entry_exit` per trip, with an optional URL-encoded label as a
 * third `_`-separated segment. Parsing never throws: malformed segments
 * are dropped, so a hand-edited or truncated URL degrades to fewer trips
 * instead of a broken page.
 *
 * Labels: `encodeURIComponent` does NOT escape `_`, and `_` is the segment
 * separator — so a label containing `_` (e.g. "A_B") would split into
 * extra segments on parse and the trip would be silently dropped. Labels
 * are therefore encoded with `_` percent-encoded as `%5F` on serialise
 * (`decodeURIComponent` reverses it on parse). Old URLs without labels,
 * and old labels without `_`, parse exactly as before.
 */
import { toDayNumber } from "../schengen/engine";
import type { Trip } from "../schengen/types";
import { normaliseTrip, validateTrip } from "./validate";

export interface PlanParams {
  trips: Trip[];
  /** Planned entry date, `YYYY-MM-DD`, or null when absent/invalid. */
  entry: string | null;
  /** Planned stay in days, or null when absent/invalid. */
  stay: number | null;
}

/** Encode a trip label for a share URL. `_` is escaped explicitly (see header). */
function encodeLabel(label: string): string {
  return encodeURIComponent(label).replace(/_/g, "%5F");
}

export function serialiseTrips(trips: Trip[]): string {
  return trips
    .map(normaliseTrip)
    .map((trip) =>
      trip.label
        ? `${trip.entry}_${trip.exit}_${encodeLabel(trip.label)}`
        : `${trip.entry}_${trip.exit}`,
    )
    .join(",");
}

export function parseTrips(param: string | null | undefined): Trip[] {
  if (!param) return [];
  const trips: Trip[] = [];
  for (const segment of param.split(",")) {
    if (!segment) continue;
    const parts = segment.split("_");
    if (parts.length < 2 || parts.length > 3) continue;
    const [entry, exit, rawLabel] = parts;
    if (!entry || !exit) continue;
    const { errors } = validateTrip(entry, exit);
    if (errors.length > 0) continue;
    let label: string | undefined;
    if (rawLabel !== undefined) {
      try {
        label = decodeURIComponent(rawLabel).trim() || undefined;
      } catch {
        continue;
      }
    }
    trips.push(label ? { entry, exit, label } : { entry, exit });
  }
  return trips;
}

/** Encode a full plan (trips + planned entry + stay) as URL search params. */
export function encodePlan(
  trips: Trip[],
  entry: string | null,
  stay: number | null,
): URLSearchParams {
  const params = new URLSearchParams();
  if (trips.length > 0) params.set("trips", serialiseTrips(trips));
  if (entry) {
    try {
      toDayNumber(entry);
      params.set("entry", entry);
    } catch {
      // Invalid entry date: omit it rather than sharing a broken link.
    }
  }
  if (stay !== null && Number.isInteger(stay) && stay > 0) {
    params.set("stay", String(stay));
  }
  return params;
}

/** Decode a full plan from URL search params. Never throws. */
export function decodePlan(params: URLSearchParams): PlanParams {
  const trips = parseTrips(params.get("trips"));
  let entry: string | null = null;
  const rawEntry = params.get("entry");
  if (rawEntry) {
    try {
      toDayNumber(rawEntry);
      entry = rawEntry;
    } catch {
      entry = null;
    }
  }
  let stay: number | null = null;
  const rawStay = params.get("stay");
  if (rawStay !== null) {
    const parsed = Number(rawStay);
    if (Number.isInteger(parsed) && parsed > 0 && parsed <= 365) {
      stay = parsed;
    }
  }
  return { trips, entry, stay };
}
