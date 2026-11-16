"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { canAddTrip, FREE_TRIP_LIMIT } from "@/lib/pro";
import { toDayNumber, todayIso } from "@/lib/schengen/engine";
import type { Trip } from "@/lib/schengen/types";
import { validateTrip } from "@/lib/trips/validate";

interface TripFormProps {
  tripCount: number;
  onAdd: (trip: Trip) => void;
}

/**
 * Add a past trip. A trip must have ended (exit on/before today) — a stay
 * that has not ended yet belongs in the planned stay fields, not here.
 * Overlapping trips are allowed; they merge and overlapping days are
 * counted once (the list shows a warning for them).
 */
export function TripForm({ tripCount, onAdd }: TripFormProps) {
  const [entry, setEntry] = useState("");
  const [exit, setExit] = useState("");
  const [label, setLabel] = useState("");
  const [errors, setErrors] = useState<string[]>([]);

  const atLimit = !canAddTrip(tripCount);

  const validate = (entryValue: string, exitValue: string): string[] => {
    const result = validateTrip(entryValue, exitValue);
    const found = [...result.errors];
    if (found.length === 0) {
      try {
        const exitDay = toDayNumber(exitValue);
        if (exitDay > toDayNumber(todayIso())) {
          found.push(
            "Exit date must be today or earlier — a stay that has not ended yet belongs in the planned stay fields.",
          );
        }
      } catch {
        // Invalid date is already reported by validateTrip.
      }
    }
    return found;
  };

  const isValid = entry !== "" && exit !== "" && validate(entry, exit).length === 0;

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (atLimit) return;
    const found = validate(entry, exit);
    setErrors(found);
    if (found.length > 0) return;
    onAdd({
      entry,
      exit,
      label: label.trim() || undefined,
    });
    setEntry("");
    setExit("");
    setLabel("");
    setErrors([]);
  };

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
            aria-invalid={errors.length > 0}
            aria-describedby="trip-entry-hint"
          />
          <span className="hint" id="trip-entry-hint">
            First day you were in Schengen.
          </span>
        </div>
        <div className="field">
          <label htmlFor="trip-exit">Exit date</label>
          <input
            id="trip-exit"
            type="date"
            value={exit}
            onChange={(event) => setExit(event.target.value)}
            aria-invalid={errors.length > 0}
            aria-describedby="trip-exit-hint"
          />
          <span className="hint" id="trip-exit-hint">
            Last day you were in Schengen.
          </span>
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
      {errors.map((error) => (
        <p key={error} className="field-error" role="alert">
          {error}
        </p>
      ))}
      {atLimit ? (
        <p className="field-error" role="status">
          The free plan saves up to {FREE_TRIP_LIMIT} trips. Remove a trip to
          add another, or see <a href="/pro/">Pro</a> for unlimited trips.
        </p>
      ) : null}
      <Button type="submit" disabled={!isValid || atLimit}>
        Add trip
      </Button>
    </form>
  );
}
