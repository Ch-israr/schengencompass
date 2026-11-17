import { Alert } from "@/components/ui/Alert";
import { Badge } from "@/components/ui/Badge";
import type { StayResult } from "@/lib/schengen/types";

interface ResultsPanelProps {
  /** Null when no entry date / stay has been entered yet. */
  result: StayResult | null;
  entryDate: string;
  plannedDays: number;
  plannedExit: string | null;
}

/**
 * The answer. The big number is days remaining; every figure is labelled
 * in words, and the overstay / no-days-left states are persistent panels,
 * not dismissible toasts.
 */
export function ResultsPanel({
  result,
  entryDate,
  plannedDays,
  plannedExit,
}: ResultsPanelProps) {
  if (!result) {
    return (
      <section
        className="results-panel counter-results"
        aria-label="Calculation result"
      >
        <h2>Your result</h2>
        <p>Choose a planned entry date and a stay length to see your result.</p>
      </section>
    );
  }

  const overstayDays =
    result.overstay && plannedDays > 0
      ? plannedDays - result.maxStayFromEntry
      : 0;
  const noDaysLeft = result.daysRemaining === 0 && result.maxStayFromEntry === 0;
  // The re-entry date is shown whenever no days remain and one was found —
  // not only when maxStay is 0. When the entry day itself is already
  // counted (maxStay 1), the user still has 0 days left and still needs
  // to know when they can re-enter.
  const reentryFound =
    result.earliestReentry.status === "found"
      ? result.earliestReentry
      : null;
  const showReentry = result.daysRemaining === 0 && reentryFound !== null;
  const reentryNotFound =
    result.daysRemaining === 0 &&
    result.earliestReentry.status === "not-found";

  return (
    <section
      className="results-panel counter-results"
      aria-label="Calculation result"
    >
      <h2>Your result</h2>
      <p className="results-big tnum">
        {result.daysRemaining}{" "}
        <span className="unit">
          {result.daysRemaining === 1 ? "day" : "days"} left
        </span>{" "}
        {noDaysLeft ? (
          <Badge tone="red">No days left</Badge>
        ) : result.overstay ? (
          <Badge tone="amber">Overstay risk</Badge>
        ) : (
          <Badge tone="green">Within the limit</Badge>
        )}
      </p>
      <dl className="results-grid tnum">
        <div>
          <dt>Days used in the last 180 days</dt>
          <dd>{result.daysUsed} of 90</dd>
        </div>
        <div>
          <dt>Longest stay from {entryDate}</dt>
          <dd>
            {result.maxStayFromEntry}{" "}
            {result.maxStayFromEntry === 1 ? "day" : "days"}
          </dd>
        </div>
        <div>
          <dt>Planned stay</dt>
          <dd>
            {plannedDays} {plannedDays === 1 ? "day" : "days"}
            {plannedExit ? ` · until ${plannedExit}` : ""}
          </dd>
        </div>
        <div>
          <dt>Window ends</dt>
          <dd>{entryDate}</dd>
        </div>
      </dl>

      {result.overstay && result.lastLegalDay ? (
        <Alert tone="danger" title="Overstay risk">
          <p>
            This stay would overstay by {overstayDays}{" "}
            {overstayDays === 1 ? "day" : "days"}. The last legal day is{" "}
            <strong className="tnum">{result.lastLegalDay}</strong> — you
            would need to leave by then.
          </p>
        </Alert>
      ) : null}

      {showReentry && reentryFound ? (
        <Alert tone="warning" title="No days left right now">
          <p>
            You have used all 90 days in the current 180-day window. The
            earliest you could re-enter is{" "}
            <strong className="tnum">{reentryFound.date}</strong>, when{" "}
            {reentryFound.daysAvailable}{" "}
            {reentryFound.daysAvailable === 1 ? "day" : "days"} will be
            available.
          </p>
        </Alert>
      ) : null}

      {reentryNotFound ? (
        <Alert tone="warning" title="No re-entry date found">
          <p>
            You have used all 90 days in the current 180-day window, and
            your trips cover such a long period that no re-entry date could
            be found in the next 5 years. Check the trips you entered, or
            plan a longer break outside the Schengen Area.
          </p>
        </Alert>
      ) : null}

      {!result.overstay && plannedDays > 0 && result.lastLegalDay ? (
        <Alert tone="success" title="Within the limit">
          <p>
            You can stay until{" "}
            <strong className="tnum">{result.lastLegalDay}</strong> without
            breaking the 90/180 rule.
          </p>
        </Alert>
      ) : null}

      <p className="disclaimer">
        Planning aid, not legal advice. Border officers make the final
        decision.
      </p>
    </section>
  );
}
