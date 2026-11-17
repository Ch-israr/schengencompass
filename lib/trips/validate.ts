/**
 * Trip validation. Rules (plan §6, architecture §3):
 * - entry and exit must be real `YYYY-MM-DD` dates;
 * - exit must be on/after entry;
 * - overlapping trips are NOT an error — they merge before counting (a day
 *   is counted once). They are a warning, so the UI can tell the user.
 */
import { toDayNumber } from "../schengen/engine";
import type { Trip } from "../schengen/types";

export interface TripValidation {
  /** Blocking problems — the trip cannot be added. */
  errors: string[];
  /** Non-blocking notes, e.g. overlaps. */
  warnings: string[];
  /**
   * The same errors attributed to the field they belong to, so the UI can
   * mark exactly the offending input (aria-invalid) and associate each
   * message with its field (aria-describedby). Kept in sync with `errors`.
   */
  fields: { entry: string[]; exit: string[] };
}

/** Validate one trip (entry/exit strings as typed by the user). */
export function validateTrip(entry: string, exit: string): TripValidation {
  const errors: string[] = [];
  const fields: { entry: string[]; exit: string[] } = { entry: [], exit: [] };
  let entryDay: number | null = null;
  let exitDay: number | null = null;
  try {
    entryDay = toDayNumber(entry);
  } catch {
    const message = "Entry date is not a valid date.";
    errors.push(message);
    fields.entry.push(message);
  }
  try {
    exitDay = toDayNumber(exit);
  } catch {
    const message = "Exit date is not a valid date.";
    errors.push(message);
    fields.exit.push(message);
  }
  if (entryDay !== null && exitDay !== null && exitDay < entryDay) {
    const message = "Exit date must be on or after the entry date.";
    errors.push(message);
    fields.exit.push(message);
  }
  return { errors, warnings: [], fields };
}

/**
 * Validate a planned entry date against `today` (a local `YYYY-MM-DD`).
 * Returns the error message, or null when the entry is acceptable.
 * The planned entry must be a real date on or after today.
 */
export function validatePlannedEntry(
  entry: string,
  today: string,
): string | null {
  try {
    if (toDayNumber(entry) < toDayNumber(today)) {
      return "Planned entry date must be today or later.";
    }
    return null;
  } catch {
    return "Planned entry date is not a valid date.";
  }
}

/** Pairs of trip indexes (i < j) whose date ranges overlap. Adjacent trips (exit one day, entry the next) do not overlap. */
export function findOverlaps(trips: Trip[]): Array<[number, number]> {
  const pairs: Array<[number, number]> = [];
  const ranges = trips.map((trip) => {
    try {
      return { start: toDayNumber(trip.entry), end: toDayNumber(trip.exit) };
    } catch {
      return null;
    }
  });
  for (let i = 0; i < ranges.length; i++) {
    for (let j = i + 1; j < ranges.length; j++) {
      const a = ranges[i];
      const b = ranges[j];
      if (!a || !b) continue;
      if (a.start <= b.end && b.start <= a.end) pairs.push([i, j]);
    }
  }
  return pairs;
}

/** Validate a whole trip list: per-trip errors plus overlap warnings. */
export function validateTripList(trips: Trip[]): TripValidation {
  const errors: string[] = [];
  const warnings: string[] = [];
  trips.forEach((trip, index) => {
    const result = validateTrip(trip.entry, trip.exit);
    for (const error of result.errors) {
      errors.push(`Trip ${index + 1}: ${error}`);
    }
  });
  for (const [i, j] of findOverlaps(trips)) {
    warnings.push(
      `Trips ${i + 1} and ${j + 1} overlap — overlapping days are counted once.`,
    );
  }
  // List-level validation has no field attribution (the list has no inputs).
  return { errors, warnings, fields: { entry: [], exit: [] } };
}

/** Normalise a trip for storage: trim the label, drop an empty label. */
export function normaliseTrip(trip: Trip): Trip {
  const label = trip.label?.trim();
  return label ? { ...trip, label } : { entry: trip.entry, exit: trip.exit };
}
