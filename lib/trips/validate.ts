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
}

/** Validate one trip (entry/exit strings as typed by the user). */
export function validateTrip(entry: string, exit: string): TripValidation {
  const errors: string[] = [];
  let entryDay: number | null = null;
  let exitDay: number | null = null;
  try {
    entryDay = toDayNumber(entry);
  } catch {
    errors.push("Entry date is not a valid date.");
  }
  try {
    exitDay = toDayNumber(exit);
  } catch {
    errors.push("Exit date is not a valid date.");
  }
  if (entryDay !== null && exitDay !== null && exitDay < entryDay) {
    errors.push("Exit date must be on or after the entry date.");
  }
  return { errors, warnings: [] };
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
  return { errors, warnings };
}

/** Normalise a trip for storage: trim the label, drop an empty label. */
export function normaliseTrip(trip: Trip): Trip {
  const label = trip.label?.trim();
  return label ? { ...trip, label } : { entry: trip.entry, exit: trip.exit };
}
