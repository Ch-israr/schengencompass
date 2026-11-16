/**
 * The free/pro boundary — a single predicate (architecture §8, Phase-2 seam).
 *
 * In the MVP there are no accounts, so this always returns the free tier:
 * up to FREE_TRIP_LIMIT saved trips. Phase 2 replaces the data source
 * behind this predicate with the account's plan; the call sites do not
 * change. Nothing here talks to a server.
 */
export const FREE_TRIP_LIMIT = 3;

/** True when the account has Pro. MVP: always false — no accounts exist yet. */
export function isPro(): boolean {
  return false;
}

/** True when another trip may be saved under the current plan. */
export function canAddTrip(savedTripCount: number): boolean {
  if (isPro()) return true;
  return savedTripCount < FREE_TRIP_LIMIT;
}
