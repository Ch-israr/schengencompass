/**
 * Types for the Schengen 90/180 date engine.
 *
 * A "day" is always a UTC calendar date written `YYYY-MM-DD`. There are no
 * times anywhere in the engine — the classic off-by-one source is local
 * timezone parsing, so dates are handled as integer day numbers (days since
 * the Unix epoch, UTC) internally.
 */

/** One stay in the Schengen Area. Both dates are counted (inclusive range). */
export interface Trip {
  /** First day physically present, `YYYY-MM-DD`. */
  entry: string;
  /** Last day physically present, `YYYY-MM-DD`. Must be on/after `entry`. */
  exit: string;
  /** Optional human label, e.g. "Lisbon". Never affects the calculation. */
  label?: string;
}

/**
 * Days covered by a residence permit / long-stay visa. These days are
 * excluded from the 90/180 count. Passed explicitly — never inferred.
 */
export type Exemption = Trip;

export type DayStatusKind = "used" | "planned" | "free";

export interface DayStatus {
  /** `YYYY-MM-DD`. */
  date: string;
  status: DayStatusKind;
}

export interface EarliestReentry {
  /** First date on which at least one day is available, `YYYY-MM-DD`. */
  date: string;
  /** Days available on that date (90 minus days used in its window). */
  daysAvailable: number;
}

export interface StayResult {
  /** Days present in the 180-day window ending on the entry date. */
  daysUsed: number;
  /** 90 minus daysUsed, floored at 0. */
  daysRemaining: number;
  /**
   * Longest consecutive stay starting on the entry date during which every
   * day is legal. 0 when even the entry day itself is over the limit.
   * Never more than 90.
   */
  maxStayFromEntry: number;
  /** True when the planned stay would become illegal at some point. */
  overstay: boolean;
  /**
   * Last date of the planned stay that is legal, `YYYY-MM-DD`.
   * Null when no stay was planned (plannedDays <= 0) or when even the
   * entry day is illegal.
   */
  lastLegalDay: string | null;
  /**
   * First date on/after the entry date with at least one day available.
   * Null when a day is already available on the entry date.
   */
  earliestReentry: EarliestReentry | null;
}
