import { describe, expect, it } from "vitest";
import type { Trip } from "../../schengen/types";
import { createTripStore, STORAGE_KEY, type StorageLike } from "../local-trips";

class FakeStorage implements StorageLike {
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
  raw(key: string): string | null {
    return this.data.get(key) ?? null;
  }
}

const t = (entry: string, exit: string, label?: string): Trip =>
  label ? { entry, exit, label } : { entry, exit };

describe("createTripStore", () => {
  it("saves and loads trips, versioned under the storage key", () => {
    const storage = new FakeStorage();
    const store = createTripStore(storage);
    store.save([t("2026-01-01", "2026-01-30", "Lisbon")]);
    expect(JSON.parse(storage.raw(STORAGE_KEY) ?? "{}").version).toBe(1);
    expect(store.load()).toEqual([t("2026-01-01", "2026-01-30", "Lisbon")]);
  });

  it("loads an empty list when nothing was saved", () => {
    expect(createTripStore(new FakeStorage()).load()).toEqual([]);
  });

  it("loads an empty list for corrupt JSON, wrong version, or invalid trips", () => {
    const storage = new FakeStorage();
    const store = createTripStore(storage);
    storage.setItem(STORAGE_KEY, "not json at all");
    expect(store.load()).toEqual([]);
    storage.setItem(STORAGE_KEY, JSON.stringify({ version: 99, trips: [] }));
    expect(store.load()).toEqual([]);
    storage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        version: 1,
        trips: [
          { entry: "2026-01-01", exit: "2026-01-30" },
          { entry: "2027-02-29", exit: "2027-03-01" },
          { entry: 42, exit: "2026-01-30" },
        ],
      }),
    );
    expect(store.load()).toEqual([t("2026-01-01", "2026-01-30")]);
  });

  it("clear removes the saved trips", () => {
    const storage = new FakeStorage();
    const store = createTripStore(storage);
    store.save([t("2026-01-01", "2026-01-30")]);
    store.clear();
    expect(store.load()).toEqual([]);
    expect(storage.raw(STORAGE_KEY)).toBeNull();
  });

  it("works without localStorage (falls back to in-memory storage)", () => {
    const store = createTripStore();
    store.save([t("2026-01-01", "2026-01-30")]);
    expect(store.load()).toEqual([t("2026-01-01", "2026-01-30")]);
  });
});
