"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { canAddTrip, FREE_TRIP_LIMIT } from "@/lib/pro";
import { toDayNumber, todayIso } from "@/lib/schengen/engine";
import type { Trip } from "@/lib/schengen/types";
import { validateTrip, type TripValidation } from "@/lib/trips/validate";

interface TripFormProps {
  tripCount: number;
  onAdd: (trip: Trip) => void;
}

const EMPTY_VALIDATION: TripValidation = {
  errors: [],
  warnings: [],
  fields: { entry: [], exit: [] },
};

/**
 * Full form validation: trip rules plus "exit must be today or earlier".
 * Pure — safe to call from render, change handlers, and submit alike.
 */
function validateForm(entryValue: string, exitValue: string): TripValidation {
  const result = validateTrip(entryValue, exitValue);
  const errors = [...result.errors];
  const fields = {
    entry: [...result.fields.entry],
    exit: [...result.fields.exit],
  };
  if (errors.length === 0) {
    try {
      if (toDayNumber(exitValue) > toDayNumber(todayIso())) {
        const message =
          "Exit date must be today or earlier — a stay that has not ended yet belongs in the planned stay fields.";
        errors.push(message);
        fields.exit.push(message);
      }
    } catch {
      // Invalid date is already reported by validateTrip.
    }
  }
  return { errors, warnings: [], fields };
}

/**
 * Add a past trip. A trip must have ended (exit on/before today) — a stay
 * that has not ended yet belongs in the planned stay fields, not here.
 * Overlapping trips are allowed; they merge and overlapping days are
 * counted once (the list shows a warning for them).
 *
 * Validation errors are shown LIVE, as soon as both dates are entered,
 * and on submit when a field is empty — never hidden behind a disabled
 * button. Each message is attached to its field (id + aria-describedby)
 * and announced (role="alert").
 */
export function TripForm({ tripCount, onAdd }: TripFormProps) {
  const [entry, setEntry] = useState("");
  const [exit, setExit] = useState("");
  const [label, setLabel] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const atLimit = !canAddTrip(tripCount);

  // Live validation: once both dates are typed the form reports problems
  // immediately and clears them as soon as they are fixed. Before that
  // (one field still empty) nothing is shown — the user is still typing.
  // After a submit attempt, validation always runs, so empty fields are
  // reported too.
  const validation = useMemo(() => {
    if (!submitted && (entry === "" || exit === "")) {
      return EMPTY_VALIDATION;
    }
    return validateForm(entry, exit);
  }, [entry, exit, submitted]);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (atLimit) return;
    setSubmitted(true);
    if (validateForm(entry, exit).errors.length > 0) return;
    onAdd({
      entry,
      exit,
      label: label.trim() || undefined,
    });
    setEntry("");
    setExit("");
    setLabel("");
    setSubmitted(false);
  };

  const entryErrors = validation.fields.entry;
  const exitErrors = validation.fields.exit;

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="form-row">
        <div className="field">
          <label htmlFor="trip-entry">Entry date</label>
          <input
            id="trip-entry"
            type="date"
            value={entry}
            onChange={(event) => setEntry(event.target.value)}
            aria-invalid={entryErrors.length > 0}
            aria-describedby={
              entryErrors.length > 0
                ? "trip-entry-hint trip-entry-errors"
                : "trip-entry-hint"
            }
          />
          <span className="hint" id="trip-entry-hint">
            First day you were in Schengen.
          </span>
          {entryErrors.length > 0 ? (
            <p className="field-error" id="trip-entry-errors" role="alert">
              {entryErrors.join(" ")}
            </p>
          ) : null}
        </div>
        <div className="field">
          <label htmlFor="trip-exit">Exit date</label>
          <input
            id="trip-exit"
            type="date"
            value={exit}
            onChange={(event) => setExit(event.target.value)}
            aria-invalid={exitErrors.length > 0}
            aria-describedby={
              exitErrors.length > 0
                ? "trip-exit-hint trip-exit-errors"
                : "trip-exit-hint"
            }
          />
          <span className="hint" id="trip-exit-hint">
            Last day you were in Schengen.
          </span>
          {exitErrors.length > 0 ? (
            <p className="field-error" id="trip-exit-errors" role="alert">
              {exitErrors.join(" ")}
            </p>
          ) : null}
        </div>
      </div>
      <div className="field">
        <label htmlFor="trip-label">
          Label <span className="hint">(optional)</span>
        </label>
        <input
          id="trip-label"
          type="text"
          value={label}
          onChange={(event) => setLabel(event.target.value)}
          placeholder="e.g. Lisbon"
          maxLength={60}
          autoComplete="off"
        />
      </div>
      {atLimit ? (
        <p className="field-error" role="status">
          The free plan saves up to {FREE_TRIP_LIMIT} trips. Remove a trip to
          add another, or see <a href="/pro/">Pro</a> for unlimited trips.
        </p>
      ) : null}
      <Button type="submit" disabled={atLimit}>
        Add trip
      </Button>
    </form>
  );
}
