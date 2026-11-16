"use client";

import { useState } from "react";
import { toDayNumber, todayIso } from "@/lib/schengen/engine";
import type { Trip } from "@/lib/schengen/types";
import { validateTrip } from "@/lib/trips/validate";

/** Inclusive day count for one trip (entry and exit both counted). */
export function tripDayCount(trip: Trip): number {
  try {
    return toDayNumber(trip.exit) - toDayNumber(trip.entry) + 1;
  } catch {
    return 0;
  }
}

interface TripListProps {
  trips: Trip[];
  overlapWarnings: string[];
  onDelete: (index: number) => void;
  onEdit: (index: number, trip: Trip) => void;
}

function formatRange(trip: Trip): string {
  return `${trip.entry} → ${trip.exit}`;
}

/**
 * Past-trips list. Each row shows the date range, day count and label, and
 * offers inline edit (date inputs + save/cancel) and delete. Deleting is
 * immediate — a deleted trip can be re-added from the form.
 */
export function TripList({
  trips,
  overlapWarnings,
  onDelete,
  onEdit,
}: TripListProps) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [draftEntry, setDraftEntry] = useState("");
  const [draftExit, setDraftExit] = useState("");
  const [draftLabel, setDraftLabel] = useState("");
  const [draftError, setDraftError] = useState<string | null>(null);

  if (trips.length === 0) {
    return (
      <p className="empty-state">
        No trips yet — add your first trip above.
      </p>
    );
  }

  const startEdit = (index: number) => {
    const trip = trips[index];
    if (!trip) return;
    setEditingIndex(index);
    setDraftEntry(trip.entry);
    setDraftExit(trip.exit);
    setDraftLabel(trip.label ?? "");
    setDraftError(null);
  };

  const saveEdit = (index: number) => {
    const { errors } = validateTrip(draftEntry, draftExit);
    if (errors.length > 0) {
      setDraftError(errors[0] ?? "Invalid dates.");
      return;
    }
    try {
      if (toDayNumber(draftExit) > toDayNumber(todayIso())) {
        setDraftError("Exit date must be today or earlier.");
        return;
      }
    } catch {
      setDraftError("Invalid dates.");
      return;
    }
    onEdit(index, {
      entry: draftEntry,
      exit: draftExit,
      label: draftLabel.trim() || undefined,
    });
    setEditingIndex(null);
    setDraftError(null);
  };

  return (
    <>
      {overlapWarnings.map((warning) => (
        <p key={warning} className="field-error" role="status">
          {warning}
        </p>
      ))}
      <ul className="trip-list">
        {trips.map((trip, index) => (
          <li key={`${trip.entry}-${trip.exit}-${index}`}>
            {editingIndex === index ? (
              <div style={{ flex: "1 1 100%" }}>
                <div className="form-row">
                  <div className="field">
                    <label htmlFor={`edit-entry-${index}`}>Entry date</label>
                    <input
                      id={`edit-entry-${index}`}
                      type="date"
                      value={draftEntry}
                      onChange={(event) => setDraftEntry(event.target.value)}
                    />
                  </div>
                  <div className="field">
                    <label htmlFor={`edit-exit-${index}`}>Exit date</label>
                    <input
                      id={`edit-exit-${index}`}
                      type="date"
                      value={draftExit}
                      onChange={(event) => setDraftExit(event.target.value)}
                    />
                  </div>
                </div>
                <div className="field">
                  <label htmlFor={`edit-label-${index}`}>Label</label>
                  <input
                    id={`edit-label-${index}`}
                    type="text"
                    value={draftLabel}
                    onChange={(event) => setDraftLabel(event.target.value)}
                    maxLength={60}
                  />
                </div>
                {draftError ? (
                  <p className="field-error" role="alert">
                    {draftError}
                  </p>
                ) : null}
                <div className="button-row">
                  <button
                    type="button"
                    className="button"
                    onClick={() => saveEdit(index)}
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    className="button button-secondary"
                    onClick={() => setEditingIndex(null)}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <>
                <span className="trip-dates tnum">{formatRange(trip)}</span>
                <span className="trip-meta tnum">
                  {tripDayCount(trip)} {tripDayCount(trip) === 1 ? "day" : "days"}
                  {trip.label ? ` · ${trip.label}` : ""}
                </span>
                <span className="trip-actions">
                  <button
                    type="button"
                    className="icon-button"
                    onClick={() => startEdit(index)}
                    aria-label={`Edit trip ${formatRange(trip)}`}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    className="icon-button icon-button-danger"
                    onClick={() => onDelete(index)}
                    aria-label={`Delete trip ${formatRange(trip)}`}
                  >
                    Delete
                  </button>
                </span>
              </>
            )}
          </li>
        ))}
      </ul>
    </>
  );
}
