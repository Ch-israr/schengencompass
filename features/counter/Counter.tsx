"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { dayTimeline, evaluateStay, fromDayNumber, toDayNumber, todayIso } from "@/lib/schengen/engine";
import type { Trip } from "@/lib/schengen/types";
import { buildShareUrl, copyToClipboard } from "@/lib/share/share-url";
import { createTripStore } from "@/lib/storage/local-trips";
import { decodePlan, encodePlan } from "@/lib/trips/serialise";
import { validateTripList } from "@/lib/trips/validate";
import { ResultsPanel } from "./components/ResultsPanel";
import { Timeline } from "./components/Timeline";
import { TripForm } from "./components/TripForm";
import { TripList } from "./components/TripList";

const PLAN_STORAGE_KEY = "schengencompass.plan.v1";

// Module-level store: createTripStore() is cheap and stateless, and the
// browser binding (localStorage) is resolved once at import time.
const tripStore = createTripStore();
const CANONICAL_PATH = "/schengen-calculator/";

/** Worked example (brief §6 empty state): three past trips, always in the past relative to today. */
function exampleTrips(today: string): Trip[] {
  const base = toDayNumber(today);
  const at = (offset: number) => fromDayNumber(base + offset);
  return [
    { entry: at(-150), exit: at(-136), label: "Lisbon" },
    { entry: at(-90), exit: at(-76), label: "Paris" },
    { entry: at(-30), exit: at(-24), label: "Rome" },
  ];
}

function sortTrips(trips: Trip[]): Trip[] {
  return [...trips].sort((a, b) => (a.entry < b.entry ? -1 : a.entry > b.entry ? 1 : 0));
}

interface StoredPlan {
  entry?: unknown;
  stay?: unknown;
}

function readStoredPlan(): { entry: string | null; stay: number | null } {
  try {
    const raw = globalThis.localStorage?.getItem(PLAN_STORAGE_KEY);
    if (!raw) return { entry: null, stay: null };
    const parsed = JSON.parse(raw) as StoredPlan;
    let entry: string | null = null;
    if (typeof parsed.entry === "string") {
      try {
        toDayNumber(parsed.entry);
        entry = parsed.entry;
      } catch {
        entry = null;
      }
    }
    const stay =
      typeof parsed.stay === "number" &&
      Number.isInteger(parsed.stay) &&
      parsed.stay >= 1 &&
      parsed.stay <= 365
        ? parsed.stay
        : null;
    return { entry, stay };
  } catch {
    return { entry: null, stay: null };
  }
}

/**
 * The counter. Owns all counter state: trips, planned entry, planned stay.
 * - State starts empty and hydrates once on the client (URL params win over
 *   localStorage, per plan §6) — this avoids SSR/client mismatches.
 * - Trips persist to localStorage (versioned key); the plan persists to a
 *   second localStorage key; the URL is kept in sync so the address bar is
 *   always shareable.
 * - Derived results are computed on render, never stored.
 */
export function Counter() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [entry, setEntry] = useState("");
  const [stay, setStay] = useState<number | "">(30);
  const [hydrated, setHydrated] = useState(false);
  const [copied, setCopied] = useState(false);
  const [copyFailed, setCopyFailed] = useState(false);
  const [resetArmed, setResetArmed] = useState(false);
  const resetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Hydrate once from the browser: URL params win over localStorage
  // (plan §6). This is the sanctioned "adjust state during render"
  // pattern, not an effect: on the server `window` is undefined so the
  // prerender uses defaults (matching the static HTML); on the client the
  // first render adjusts to the stored/URL state before commit, so there
  // is no hydration mismatch and no cascading-renders effect.
  if (!hydrated && typeof window !== "undefined") {
    const params = new URLSearchParams(window.location.search);
    const fromUrl = decodePlan(params);
    const hasUrlPlan =
      fromUrl.trips.length > 0 || fromUrl.entry !== null || fromUrl.stay !== null;
    if (hasUrlPlan) {
      setTrips(sortTrips(fromUrl.trips));
      setEntry(fromUrl.entry ?? todayIso());
      setStay(fromUrl.stay ?? 30);
    } else {
      setTrips(sortTrips(tripStore.load()));
      const storedPlan = readStoredPlan();
      setEntry(storedPlan.entry ?? todayIso());
      setStay(storedPlan.stay ?? 30);
    }
    setHydrated(true);
  }

  // Persist + keep the address bar in sync (after hydration only).
  useEffect(() => {
    if (!hydrated) return;
    tripStore.save(trips);
    try {
      globalThis.localStorage?.setItem(
        PLAN_STORAGE_KEY,
        JSON.stringify({ entry, stay }),
      );
    } catch {
      // Storage unavailable: the plan still works for this session.
    }
    const params = encodePlan(trips, entry || null, stay === "" ? null : stay);
    const query = params.toString();
    const url = query
      ? `${window.location.pathname}?${query}`
      : window.location.pathname;
    window.history.replaceState(null, "", url);
  }, [trips, entry, stay, hydrated]);

  useEffect(
    () => () => {
      if (resetTimer.current) clearTimeout(resetTimer.current);
    },
    [],
  );

  const entryValid = useMemo(() => {
    if (!entry) return false;
    try {
      toDayNumber(entry);
      return true;
    } catch {
      return false;
    }
  }, [entry]);

  const stayValid = typeof stay === "number" && stay >= 1 && stay <= 365;

  const result = useMemo(() => {
    if (!entryValid || !stayValid || typeof stay !== "number") return null;
    try {
      return evaluateStay(trips, entry, stay);
    } catch {
      return null;
    }
  }, [trips, entry, entryValid, stay, stayValid]);

  const timeline = useMemo(() => {
    if (!entryValid || !stayValid || typeof stay !== "number") return [];
    try {
      return dayTimeline(trips, entry, stay);
    } catch {
      return [];
    }
  }, [trips, entry, entryValid, stay, stayValid]);

  const plannedExit =
    entryValid && stayValid && typeof stay === "number"
      ? fromDayNumber(toDayNumber(entry) + stay - 1)
      : null;

  const overlapWarnings = useMemo(
    () => validateTripList(trips).warnings,
    [trips],
  );

  const shareUrl =
    typeof window !== "undefined" && entryValid && stayValid
      ? buildShareUrl(
          `${window.location.origin}${CANONICAL_PATH}`,
          trips,
          entry,
          typeof stay === "number" ? stay : null,
        )
      : "";

  const handleShare = async () => {
    if (!shareUrl) return;
    const ok = await copyToClipboard(shareUrl);
    setCopied(ok);
    setCopyFailed(!ok);
    if (ok) {
      window.setTimeout(() => setCopied(false), 3000);
    }
  };

  const handleReset = () => {
    if (!resetArmed) {
      setResetArmed(true);
      resetTimer.current = setTimeout(() => setResetArmed(false), 4000);
      return;
    }
    if (resetTimer.current) clearTimeout(resetTimer.current);
    setResetArmed(false);
    setTrips([]);
    tripStore.clear();
  };

  const loadExample = () => {
    const today = todayIso();
    setTrips(exampleTrips(today));
    setEntry(today);
    setStay(21);
  };

  return (
    <div className="counter-grid">
      <section className="card counter-form" aria-label="Your plan">
        <h2>Your plan</h2>
        <div className="form-row">
          <div className="field">
            <label htmlFor="planned-entry">Planned entry date</label>
            <input
              id="planned-entry"
              type="date"
              value={entry}
              onChange={(event) => setEntry(event.target.value)}
              aria-invalid={entry !== "" && !entryValid}
              aria-describedby="planned-entry-hint"
            />
            <span className="hint" id="planned-entry-hint">
              Entry date must be today or later.
            </span>
            {entry !== "" && !entryValid ? (
              <p className="field-error" role="alert">
                Planned entry date is not a valid date.
              </p>
            ) : null}
          </div>
          <div className="field">
            <label htmlFor="planned-stay">Planned stay in days</label>
            <input
              id="planned-stay"
              type="number"
              inputMode="numeric"
              min={1}
              max={365}
              value={stay}
              onChange={(event) => {
                const value = event.target.value;
                if (value === "") {
                  setStay("");
                  return;
                }
                const parsed = Number(value);
                setStay(Number.isInteger(parsed) ? parsed : "");
              }}
              aria-invalid={stay !== "" && !stayValid}
              aria-describedby="planned-stay-hint"
            />
            <span className="hint" id="planned-stay-hint">
              How many days do you plan to stay?
            </span>
            {stay !== "" && !stayValid ? (
              <p className="field-error" role="alert">
                Stay must be between 1 and 365 days.
              </p>
            ) : null}
          </div>
        </div>
        <p>
          Everything runs in your browser. Your trip dates are saved to local
          storage on your own device for convenience and are never sent to a
          server. You can clear them any time with Reset all.
        </p>
      </section>

      <ResultsPanel
        result={result}
        entryDate={entry}
        plannedDays={typeof stay === "number" ? stay : 0}
        plannedExit={plannedExit}
      />

      <section className="card counter-trips" aria-label="Past trips">
        <h2>Past trips</h2>
        <p>
          Add every trip in the last 180 days. Entry and exit days count —
          even a one-day trip uses a day.
        </p>
        <TripForm
          tripCount={trips.length}
          onAdd={(trip) => setTrips((current) => sortTrips([...current, trip]))}
        />
        <TripList
          trips={trips}
          overlapWarnings={overlapWarnings}
          onDelete={(index) =>
            setTrips((current) => current.filter((_, i) => i !== index))
          }
          onEdit={(index, trip) =>
            setTrips((current) =>
              sortTrips(current.map((item, i) => (i === index ? trip : item))),
            )
          }
        />
        {trips.length === 0 ? (
          <div className="button-row">
            <Button variant="secondary" onClick={loadExample}>
              Try an example trip
            </Button>
          </div>
        ) : null}
        <div className="button-row">
          <Button
            variant="secondary"
            onClick={handleShare}
            disabled={!entryValid || !stayValid || !shareUrl}
          >
            {copied ? "Copied!" : "Share result"}
          </Button>
          <Button variant="danger" onClick={handleReset}>
            {resetArmed ? "Click again to confirm reset" : "Reset all"}
          </Button>
        </div>
        {copyFailed ? (
          <p className="field-error" role="status">
            Copying did not work in this browser — copy the link from the
            address bar instead.
          </p>
        ) : null}
      </section>

      <Timeline timeline={timeline} />
    </div>
  );
}
