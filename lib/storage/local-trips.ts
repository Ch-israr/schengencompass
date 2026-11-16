/**
 * Trip persistence — the ONLY module that knows about localStorage, and the
 * Phase 2 seam: a server-synced implementation can replace this one behind
 * the same interface without the counter feature ever learning about it.
 *
 * Stored shape (versioned so a future schema change can migrate):
 *   { "version": 1, "trips": [{ "entry": "2026-01-01", "exit": "2026-01-30", "label": "Lisbon" }] }
 *
 * Anything unreadable (bad JSON, wrong shape, invalid dates) loads as an
 * empty list — a corrupt store must never break the page. In environments
 * without localStorage (Node, SSR) an in-memory store is used instead.
 */
import type { Trip } from "../schengen/types";
import { normaliseTrip, validateTrip } from "../trips/validate";

export const STORAGE_KEY = "schengencompass.trips.v1";
const STORAGE_VERSION = 1;

export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

export interface TripStore {
  load(): Trip[];
  save(trips: Trip[]): void;
  clear(): void;
}

class MemoryStorage implements StorageLike {
  private data = new Map<string, string>();
  getItem(key: string): string | null {
    return this.data.get(key) ?? null;
  }
  setItem(key: string, value: string): void {
    this.data.set(key, value);
  }
  removeItem(key: string): void {
    this.data.delete(key);
  }
}

function defaultStorage(): StorageLike {
  try {
    if (typeof globalThis.localStorage !== "undefined") {
      return globalThis.localStorage;
    }
  } catch {
    // Accessing localStorage can throw (e.g. blocked cookies) — fall through.
  }
  return new MemoryStorage();
}

function parseStored(raw: string | null): Trip[] {
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    if (
      typeof parsed !== "object" ||
      parsed === null ||
      (parsed as { version?: unknown }).version !== STORAGE_VERSION ||
      !Array.isArray((parsed as { trips?: unknown }).trips)
    ) {
      return [];
    }
    const trips: Trip[] = [];
    for (const item of (parsed as { trips: unknown[] }).trips) {
      if (typeof item !== "object" || item === null) continue;
      const { entry, exit, label } = item as {
        entry?: unknown;
        exit?: unknown;
        label?: unknown;
      };
      if (typeof entry !== "string" || typeof exit !== "string") continue;
      if (validateTrip(entry, exit).errors.length > 0) continue;
      trips.push(
        normaliseTrip({
          entry,
          exit,
          label: typeof label === "string" ? label : undefined,
        }),
      );
    }
    return trips;
  } catch {
    return [];
  }
}

export function createTripStore(
  storage: StorageLike = defaultStorage(),
): TripStore {
  return {
    load(): Trip[] {
      return parseStored(storage.getItem(STORAGE_KEY));
    },
    save(trips: Trip[]): void {
      try {
        storage.setItem(
          STORAGE_KEY,
          JSON.stringify({ version: STORAGE_VERSION, trips: trips.map(normaliseTrip) }),
        );
      } catch {
        // Storage full / unavailable: trips still work for this session.
      }
    },
    clear(): void {
      try {
        storage.removeItem(STORAGE_KEY);
      } catch {
        // Nothing to do — the key is already effectively gone.
      }
    },
  };
}
