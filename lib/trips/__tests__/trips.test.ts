import { describe, expect, it } from "vitest";
import type { Trip } from "../../schengen/types";
import {
  decodePlan,
  encodePlan,
  parseTrips,
  serialiseTrips,
} from "../serialise";
import {
  findOverlaps,
  normaliseTrip,
  validateTrip,
  validateTripList,
} from "../validate";

const t = (entry: string, exit: string, label?: string): Trip =>
  label ? { entry, exit, label } : { entry, exit };

describe("validateTrip", () => {
  it("accepts a valid trip", () => {
    expect(validateTrip("2026-01-01", "2026-01-30").errors).toEqual([]);
  });

  it("accepts a single-day trip (entry equals exit)", () => {
    expect(validateTrip("2026-01-01", "2026-01-01").errors).toEqual([]);
  });

  it("rejects an exit before the entry", () => {
    const { errors } = validateTrip("2026-03-10", "2026-03-01");
    expect(errors).toHaveLength(1);
    expect(errors[0]).toMatch(/on or after/);
  });

  it("rejects invalid dates, naming the field", () => {
    expect(validateTrip("2027-02-29", "2027-03-01").errors).toHaveLength(1);
    expect(validateTrip("2026-01-01", "banana").errors).toHaveLength(1);
    expect(validateTrip("banana", "also-bad").errors).toHaveLength(2);
  });
});

describe("findOverlaps", () => {
  it("finds overlapping pairs and ignores adjacent trips", () => {
    const trips = [
      t("2026-01-01", "2026-01-20"),
      t("2026-01-15", "2026-02-01"),
      t("2026-02-02", "2026-02-10"),
    ];
    expect(findOverlaps(trips)).toEqual([[0, 1]]);
  });

  it("finds nothing for disjoint trips", () => {
    expect(
      findOverlaps([
        t("2026-01-01", "2026-01-10"),
        t("2026-03-01", "2026-03-10"),
      ]),
    ).toEqual([]);
  });
});

describe("validateTripList", () => {
  it("reports overlap as a warning, not an error", () => {
    const result = validateTripList([
      t("2026-01-01", "2026-01-20"),
      t("2026-01-15", "2026-02-01"),
    ]);
    expect(result.errors).toEqual([]);
    expect(result.warnings).toHaveLength(1);
    expect(result.warnings[0]).toMatch(/counted once/);
  });
});

describe("normaliseTrip", () => {
  it("trims labels and drops empty ones", () => {
    expect(normaliseTrip(t("2026-01-01", "2026-01-02", "  Lisbon  "))).toEqual(
      t("2026-01-01", "2026-01-02", "Lisbon"),
    );
    expect(normaliseTrip(t("2026-01-01", "2026-01-02", "   "))).toEqual(
      t("2026-01-01", "2026-01-02"),
    );
  });
});

describe("serialiseTrips / parseTrips round-trip", () => {
  it("round-trips trips with and without labels", () => {
    const trips = [
      t("2026-01-01", "2026-01-30", "Lisbon"),
      t("2026-03-01", "2026-03-05"),
    ];
    expect(parseTrips(serialiseTrips(trips))).toEqual(trips);
  });

  it("round-trips a label containing spaces and special characters", () => {
    const trips = [t("2026-01-01", "2026-01-05", "New York & Paris")];
    expect(parseTrips(serialiseTrips(trips))).toEqual(trips);
  });

  it("drops malformed segments instead of throwing", () => {
    const parsed = parseTrips(
      "2026-01-01_2026-01-30,garbage,2026-03-10_2026-03-01,2027-02-29_2027-03-01,2026-05-01_2026-05-05",
    );
    expect(parsed).toEqual([t("2026-01-01", "2026-01-30"), t("2026-05-01", "2026-05-05")]);
  });

  it("parses an empty or missing param as no trips", () => {
    expect(parseTrips(null)).toEqual([]);
    expect(parseTrips("")).toEqual([]);
    expect(parseTrips(undefined)).toEqual([]);
  });
});

describe("encodePlan / decodePlan round-trip", () => {
  it("round-trips a full plan", () => {
    const trips = [t("2026-01-01", "2026-01-30", "Lisbon")];
    const params = encodePlan(trips, "2026-11-16", 30);
    expect(decodePlan(params)).toEqual({
      trips,
      entry: "2026-11-16",
      stay: 30,
    });
  });

  it("omits empty parts and rejects an invalid stay", () => {
    const params = encodePlan([], null, 0);
    expect(params.toString()).toBe("");
    expect(decodePlan(new URLSearchParams("stay=abc"))).toEqual({
      trips: [],
      entry: null,
      stay: null,
    });
    expect(decodePlan(new URLSearchParams("stay=400"))).toEqual({
      trips: [],
      entry: null,
      stay: null,
    });
    expect(decodePlan(new URLSearchParams("entry=2027-02-29"))).toEqual({
      trips: [],
      entry: null,
      stay: null,
    });
  });
});
