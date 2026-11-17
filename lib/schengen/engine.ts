/**
 * Schengen 90/180 date engine — pure functions, no DOM, no storage, no
 * React, no `Date.now()`. Same inputs always give the same outputs.
 *
 * The rule, as implemented:
 * - A day in Schengen is any calendar date physically present, entry and
 *   exit dates included (partial days count as full days).
 * - On any date D, look back 180 days (D-179 … D inclusive) and count the
 *   days present. If the count is <= 90, the traveller is within the
 *   limit on D. The window is rolling; it never resets on a calendar date.
 * - Overlapping trips merge before counting (a day is counted once).
 * - Permit/long-stay-visa days are excluded only when passed explicitly
 *   as exemptions.
 *
 * All dates are UTC calendar dates. All arithmetic is integer day
 * arithmetic on day numbers (days since the Unix epoch, UTC).
 */
import type {
  DayStatus,
  EarliestReentryResult,
  Exemption,
  StayResult,
  Trip,
} from "./types";

export const SCHENGEN_LIMIT_DAYS = 90;
export const SCHENGEN_WINDOW_DAYS = 180;

const DAY_MS = 86_400_000;
const DATE_RE = /^(\d{4})-(\d{2})-(\d{2})$/;

/**
 * Parse a `YYYY-MM-DD` string to an integer day number (days since epoch,
 * UTC). Throws on anything that is not a real calendar date — including
 * 2027-02-29 and month 13. Never uses local-timezone Date parsing.
 */
export function toDayNumber(date: string): number {
  const match = DATE_RE.exec(date);
  if (!match) {
    throw new Error(`Invalid date (expected YYYY-MM-DD): ${date}`);
  }
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const ms = Date.UTC(year, month - 1, day);
  const check = new Date(ms);
  if (
    check.getUTCFullYear() !== year ||
    check.getUTCMonth() !== month - 1 ||
    check.getUTCDate() !== day
  ) {
    throw new Error(`Invalid calendar date: ${date}`);
  }
  return Math.floor(ms / DAY_MS);
}

/** Format an integer day number back to `YYYY-MM-DD` (UTC). */
export function fromDayNumber(dayNumber: number): string {
  return new Date(dayNumber * DAY_MS).toISOString().slice(0, 10);
}

/** Today's date as `YYYY-MM-DD` (UTC). Callers pass "today" in — the engine never reads the clock. */
export function todayIso(): string {
  return fromDayNumber(Math.floor(Date.now() / DAY_MS));
}

/**
 * Today's date as `YYYY-MM-DD` in the USER'S LOCAL timezone.
 *
 * Date arithmetic stays UTC (see `toDayNumber`), but UI date boundaries —
 * "planned entry must be today or later", "a past trip must have ended" —
 * must use the local calendar date, because native `<input type="date">`
 * shows local dates. Using the UTC date would call yesterday "today" for
 * users east of Greenwich between midnight and 04:00 local time.
 * Accepts an injectable `now` so tests can pin the date.
 */
export function todayLocalIso(now: Date = new Date()): string {
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

interface Range {
  start: number;
  end: number; // inclusive
}

/** Sort ranges and merge overlapping or directly adjacent ones. */
function mergeRanges(ranges: Range[]): Range[] {
  const sorted = [...ranges].sort((a, b) => a.start - b.start);
  const merged: Range[] = [];
  for (const range of sorted) {
    const last = merged[merged.length - 1];
    if (last && range.start <= last.end + 1) {
      last.end = Math.max(last.end, range.end);
    } else {
      merged.push({ ...range });
    }
  }
  return merged;
}

function tripToRange(trip: Trip): Range {
  const start = toDayNumber(trip.entry);
  const end = toDayNumber(trip.exit);
  if (end < start) {
    throw new Error(
      `Trip exit (${trip.exit}) is before entry (${trip.entry})`,
    );
  }
  return { start, end };
}

/**
 * Days present in the 180-day window ending on `windowEnd` (`YYYY-MM-DD`),
 * after merging overlapping trips and excluding exemption days.
 */
export function countDaysInWindow(
  trips: Trip[],
  windowEnd: string,
  exemptions: Exemption[] = [],
): number {
  const end = toDayNumber(windowEnd);
  const start = end - (SCHENGEN_WINDOW_DAYS - 1);
  const present = mergeRanges(trips.map(tripToRange));
  const exempt = mergeRanges(exemptions.map(tripToRange));

  let count = 0;
  for (const range of present) {
    const lo = Math.max(range.start, start);
    const hi = Math.min(range.end, end);
    if (lo > hi) continue;
    // Count days in [lo, hi] not covered by any exemption range.
    let day = lo;
    for (const ex of exempt) {
      if (ex.end < day) continue;
      if (ex.start > hi) break;
      if (ex.start > day) count += ex.start - day;
      day = Math.max(day, ex.end + 1);
      if (day > hi) break;
    }
    if (day <= hi) count += hi - day + 1;
  }
  return count;
}

/**
 * Evaluate a planned stay. `trips` are past trips; `entryDate` is the
 * planned entry date; `plannedDays` is the planned length in days (0 means
 * "no stay planned" — daysUsed is still reported, overstay is false).
 */
export function evaluateStay(
  trips: Trip[],
  entryDate: string,
  plannedDays: number,
  exemptions: Exemption[] = [],
): StayResult {
  const entryDay = toDayNumber(entryDate);
  const daysUsed = countDaysInWindow(trips, entryDate, exemptions);
  const daysRemaining = Math.max(0, SCHENGEN_LIMIT_DAYS - daysUsed);

  // Longest legal consecutive stay from the entry date. On day k of the
  // stay (k = 1, 2, ...), the window ending on that day contains the
  // planned days so far plus whatever past-trip days are still in the
  // window. Stop at the first illegal day. A legal stay can never exceed
  // 90 days, so scanning 91 days is enough — but scan up to 180 so a
  // pathological input cannot loop forever.
  //
  // NOTE: the stay used for this scan is a HYPOTHETICAL 180-day stay, not
  // the planned stay. Using the planned stay would cap the count at
  // plannedDays and report a stay of 90 days as legal even when the real
  // limit is lower (e.g. 30 days already used + a 30-day plan must report
  // maxStay 60, not 90). The window ending on day k only ever sees
  // hypothetical days up to k, so the longer range changes nothing except
  // removing the cap.
  const hypotheticalStay: Trip[] = [
    { entry: entryDate, exit: fromDayNumber(entryDay + 179) },
  ];
  const allTrips = [...trips, ...hypotheticalStay];
  let maxStayFromEntry = 0;
  for (let k = 1; k <= SCHENGEN_WINDOW_DAYS; k++) {
    const day = fromDayNumber(entryDay + k - 1);
    if (countDaysInWindow(allTrips, day, exemptions) > SCHENGEN_LIMIT_DAYS) {
      break;
    }
    maxStayFromEntry = k;
    if (maxStayFromEntry >= SCHENGEN_LIMIT_DAYS) break;
  }

  const overstay = plannedDays > 0 && plannedDays > maxStayFromEntry;
  const lastLegalDay =
    plannedDays > 0 && maxStayFromEntry > 0
      ? fromDayNumber(
          entryDay + Math.min(plannedDays, maxStayFromEntry) - 1,
        )
      : null;

  const earliestReentry = earliestReentryFrom(
    trips,
    entryDate,
    exemptions,
  );

  return {
    daysUsed,
    daysRemaining,
    maxStayFromEntry,
    overstay,
    lastLegalDay,
    earliestReentry,
  };
}

/**
 * First date on/after `fromDate` on which at least one day is available.
 *
 * Returns `{ status: "available" }` when a day is already free on
 * `fromDate` (no re-entry wait needed), `{ status: "found", ... }` with
 * the date, or `{ status: "not-found" }` when no free day exists within
 * the scan horizon (only possible with trips extending years into the
 * future). The three outcomes are distinct — callers must not treat
 * "not-found" as "available".
 *
 * The scan covers 5 years (1,825 days): long enough that a trip spanning
 * a year or two still resolves to a real date, while keeping the scan
 * bounded. A trip covering more than ~5 years of continuous presence
 * reports "not-found" instead of silently returning nothing.
 */
export const REENTRY_SCAN_DAYS = 1825;

export function earliestReentryFrom(
  trips: Trip[],
  fromDate: string,
  exemptions: Exemption[] = [],
): EarliestReentryResult {
  const fromDay = toDayNumber(fromDate);
  if (countDaysInWindow(trips, fromDate, exemptions) < SCHENGEN_LIMIT_DAYS) {
    return { status: "available" };
  }
  for (let offset = 1; offset <= REENTRY_SCAN_DAYS; offset++) {
    const candidate = fromDayNumber(fromDay + offset);
    const used = countDaysInWindow(trips, candidate, exemptions);
    if (used < SCHENGEN_LIMIT_DAYS) {
      return {
        status: "found",
        date: candidate,
        daysAvailable: SCHENGEN_LIMIT_DAYS - used,
      };
    }
  }
  return { status: "not-found" };
}

/**
 * Day-by-day timeline for the 180-day window ending on the planned exit
 * date (or on the entry date when no stay is planned). Each date is marked
 * `used` (covered by a past trip), `planned` (inside the planned stay),
 * or `free`. A date covered by both a past trip and the planned stay is
 * `used` — it is already spent.
 */
export function dayTimeline(
  trips: Trip[],
  entryDate: string,
  plannedDays: number,
  exemptions: Exemption[] = [],
): DayStatus[] {
  const entryDay = toDayNumber(entryDate);
  const exitDay =
    plannedDays > 0 ? entryDay + plannedDays - 1 : entryDay;
  const windowStart = exitDay - (SCHENGEN_WINDOW_DAYS - 1);

  const present = mergeRanges(trips.map(tripToRange));
  const exempt = mergeRanges(exemptions.map(tripToRange));
  const isCovered = (day: number, ranges: Range[]): boolean =>
    ranges.some((r) => day >= r.start && day <= r.end);

  const timeline: DayStatus[] = [];
  for (let day = windowStart; day <= exitDay; day++) {
    const covered = isCovered(day, present) && !isCovered(day, exempt);
    const status: DayStatus["status"] = covered
      ? "used"
      : plannedDays > 0 && day >= entryDay && day <= exitDay
        ? "planned"
        : "free";
    timeline.push({ date: fromDayNumber(day), status });
  }
  return timeline;
}
