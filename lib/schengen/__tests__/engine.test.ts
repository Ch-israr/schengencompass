/**
 * Verification contract — architecture §3.3.
 *
 * These 12 cases are the correctness gate: before launch a human verifies
 * the engine against the EU Commission's official Schengen calculator on
 * these same itineraries. Every expected value below was computed by hand
 * from the rule (not copied from the implementation), so a passing suite
 * means the engine agrees with the rule — and the human check then confirms
 * the rule agrees with the official calculator.
 *
 * The rule: on any date D, count days present in the 180 days ending on D
 * (D-179 … D). Count <= 90 means legal on D. Trips are inclusive ranges;
 * overlapping trips merge (a day is counted once).
 */
import { describe, expect, it } from "vitest";
import {
  countDaysInWindow,
  dayTimeline,
  earliestReentryFrom,
  evaluateStay,
  fromDayNumber,
  toDayNumber,
} from "../engine";
import type { Trip } from "../types";

const t = (entry: string, exit: string): Trip => ({ entry, exit });

describe("toDayNumber / fromDayNumber", () => {
  it("round-trips real dates, including 29 February in a leap year", () => {
    expect(fromDayNumber(toDayNumber("2028-02-29"))).toBe("2028-02-29");
    expect(fromDayNumber(toDayNumber("2026-12-31"))).toBe("2026-12-31");
    expect(fromDayNumber(toDayNumber("2027-01-01"))).toBe("2027-01-01");
  });

  it("rejects impossible and malformed dates", () => {
    expect(() => toDayNumber("2027-02-29")).toThrow();
    expect(() => toDayNumber("2026-13-01")).toThrow();
    expect(() => toDayNumber("2026-00-10")).toThrow();
    expect(() => toDayNumber("2026-04-31")).toThrow();
    expect(() => toDayNumber("not-a-date")).toThrow();
    expect(() => toDayNumber("16-11-2026")).toThrow();
  });

  it("rejects a trip whose exit is before its entry", () => {
    expect(() =>
      countDaysInWindow([t("2026-03-10", "2026-03-01")], "2026-03-21"),
    ).toThrow();
  });
});

describe("verification contract — the 12 cases", () => {
  it("1. No trips at all → 90 days available from any entry date", () => {
    const r = evaluateStay([], "2026-11-16", 30);
    expect(r.daysUsed).toBe(0);
    expect(r.daysRemaining).toBe(90);
    expect(r.maxStayFromEntry).toBe(90);
    expect(r.overstay).toBe(false);
    expect(r.lastLegalDay).toBe("2026-12-15");
    expect(r.earliestReentry).toBeNull();
  });

  it("2. One 30-day trip, entry 60 days later → 60 days remaining", () => {
    const r = evaluateStay([t("2026-01-01", "2026-01-30")], "2026-03-31", 30);
    expect(r.daysUsed).toBe(30);
    expect(r.daysRemaining).toBe(60);
    expect(r.maxStayFromEntry).toBe(60);
    expect(r.overstay).toBe(false);
    expect(r.lastLegalDay).toBe("2026-04-29");
  });

  it("3. Exactly 90 days used → 0 remaining, earliest re-entry computed", () => {
    const r = evaluateStay(
      [t("2026-08-18", "2026-11-15")],
      "2026-11-16",
      10,
    );
    expect(r.daysUsed).toBe(90);
    expect(r.daysRemaining).toBe(0);
    expect(r.maxStayFromEntry).toBe(0);
    expect(r.overstay).toBe(true);
    expect(r.lastLegalDay).toBeNull();
    // Oldest trip day (2026-08-18) drops out of the window on 2027-02-14,
    // leaving 89 days used → 1 day available.
    expect(r.earliestReentry).toEqual({ date: "2027-02-14", daysAvailable: 1 });
  });

  it("4. 91 days attempted → overstay flagged, last legal day shown", () => {
    const r = evaluateStay([], "2026-11-16", 91);
    expect(r.daysUsed).toBe(0);
    expect(r.daysRemaining).toBe(90);
    expect(r.maxStayFromEntry).toBe(90);
    expect(r.overstay).toBe(true);
    expect(r.lastLegalDay).toBe("2027-02-13");
  });

  it("5. Trip straddling the window edge — remaining days grow as old days fall out", () => {
    const trips = [t("2026-05-20", "2026-06-18")];
    // Entry 2026-11-16: the window is [2026-05-21, 2026-11-16] (179 days
    // back from 16 Nov is 21 May, not 20 May), so 29 of the 30 trip days
    // count — the 20 May day has already fallen out.
    const atEntry = evaluateStay(trips, "2026-11-16", 60);
    expect(atEntry.daysUsed).toBe(29);
    expect(atEntry.daysRemaining).toBe(61);
    // The old days drop out one per day during the stay, so a 90-day stay
    // from this entry is still legal even though 29 days are already used.
    expect(atEntry.maxStayFromEntry).toBe(90);
    // Four days later, 4 more trip days have fallen out of the window.
    const later = evaluateStay(trips, "2026-11-20", 10);
    expect(later.daysUsed).toBe(25);
    expect(later.daysRemaining).toBe(65);
  });

  it("6. Two trips with a gap — second trip's window includes part of the first", () => {
    const r = evaluateStay(
      [t("2026-01-01", "2026-01-20"), t("2026-06-01", "2026-06-20")],
      "2026-06-21",
      30,
    );
    expect(r.daysUsed).toBe(40);
    expect(r.daysRemaining).toBe(50);
    // The January days drop out during the stay (19/day…0), holding the
    // running count at 49 until they are gone, then it climbs 20 + k:
    // legal while 20 + k <= 90, i.e. k <= 70.
    expect(r.maxStayFromEntry).toBe(70);
    expect(r.overstay).toBe(false);
  });

  it("7. Back-to-back trips — no double-counting of the boundary", () => {
    const r = evaluateStay(
      [t("2026-03-01", "2026-03-10"), t("2026-03-11", "2026-03-20")],
      "2026-03-21",
      10,
    );
    expect(r.daysUsed).toBe(20);
  });

  it("8. Overlapping trips entered twice — each day counted once", () => {
    const r = evaluateStay(
      [t("2026-04-01", "2026-04-30"), t("2026-04-15", "2026-05-15")],
      "2026-05-16",
      10,
    );
    // Union is 2026-04-01 … 2026-05-15 = 45 days, not 30 + 31 = 61.
    expect(r.daysUsed).toBe(45);
  });

  it("9. A trip 200 days ago contributes 0 to today's count", () => {
    const r = evaluateStay([t("2026-04-01", "2026-04-30")], "2026-11-16", 30);
    expect(r.daysUsed).toBe(0);
    expect(r.daysRemaining).toBe(90);
  });

  it("10. Leap-year and year-boundary trips", () => {
    // 2028 is a leap year: 28 Feb, 29 Feb, 1 Mar = 3 days.
    const leap = evaluateStay(
      [t("2028-02-28", "2028-03-01")],
      "2028-03-02",
      10,
    );
    expect(leap.daysUsed).toBe(3);
    // 30 Dec, 31 Dec, 1 Jan, 2 Jan = 4 days across the year boundary.
    const yearEnd = evaluateStay(
      [t("2026-12-30", "2027-01-02")],
      "2027-01-03",
      10,
    );
    expect(yearEnd.daysUsed).toBe(4);
  });

  it("11. Long trip (120 days) — overstay detected, earliest re-entry correct", () => {
    const r = evaluateStay(
      [t("2026-07-19", "2026-11-15")],
      "2026-11-16",
      30,
    );
    expect(r.daysUsed).toBe(120);
    expect(r.daysRemaining).toBe(0);
    expect(r.maxStayFromEntry).toBe(0);
    expect(r.overstay).toBe(true);
    expect(r.lastLegalDay).toBeNull();
    // 31 trip days must drop out before the count falls below 90:
    // window starting 2026-08-19 leaves 89 days used.
    expect(r.earliestReentry).toEqual({ date: "2027-02-14", daysAvailable: 1 });
  });

  it("12. Stay legal on entry but illegal mid-stay — last legal day shown", () => {
    const r = evaluateStay(
      [t("2026-08-23", "2026-11-15")],
      "2026-11-16",
      30,
    );
    expect(r.daysUsed).toBe(85);
    expect(r.daysRemaining).toBe(5);
    // Day 1 of the stay: 86. Day 5: 90. Day 6: 91 — illegal.
    expect(r.maxStayFromEntry).toBe(5);
    expect(r.overstay).toBe(true);
    expect(r.lastLegalDay).toBe("2026-11-20");
  });
});

describe("exemptions (permit / long-stay-visa days)", () => {
  it("exempt days are excluded from the count", () => {
    const r = evaluateStay(
      [t("2026-01-01", "2026-01-30")],
      "2026-03-31",
      10,
      [t("2026-01-11", "2026-01-20")],
    );
    expect(r.daysUsed).toBe(20);
    expect(r.daysRemaining).toBe(70);
  });

  it("an exemption covering the whole trip leaves 0 days used", () => {
    expect(
      countDaysInWindow(
        [t("2026-01-01", "2026-01-30")],
        "2026-03-31",
        [t("2026-01-01", "2026-01-30")],
      ),
    ).toBe(0);
  });
});

describe("edge cases", () => {
  it("a window ending before any trip counts 0", () => {
    expect(
      countDaysInWindow([t("2026-06-01", "2026-06-10")], "2026-01-01"),
    ).toBe(0);
  });

  it("plannedDays 0 reports usage but no overstay and no last legal day", () => {
    const r = evaluateStay([t("2026-01-01", "2026-01-30")], "2026-03-31", 0);
    expect(r.daysUsed).toBe(30);
    expect(r.overstay).toBe(false);
    expect(r.lastLegalDay).toBeNull();
    expect(r.maxStayFromEntry).toBe(60);
  });

  it("earliestReentryFrom returns null when a day is already available", () => {
    expect(earliestReentryFrom([], "2026-11-16")).toBeNull();
    expect(
      earliestReentryFrom([t("2026-01-01", "2026-01-30")], "2026-03-31"),
    ).toBeNull();
  });

  it("evaluateStay is deterministic — same inputs, same outputs", () => {
    const trips = [t("2026-01-01", "2026-01-30"), t("2026-06-01", "2026-06-20")];
    expect(evaluateStay(trips, "2026-06-21", 30)).toEqual(
      evaluateStay(trips, "2026-06-21", 30),
    );
  });
});

describe("dayTimeline", () => {
  it("covers the 180-day window ending on the planned exit, with correct statuses", () => {
    const timeline = dayTimeline(
      [t("2026-11-01", "2026-11-02")],
      "2026-11-16",
      3,
    );
    expect(timeline).toHaveLength(180);
    expect(timeline[0]?.date).toBe("2026-05-23");
    expect(timeline[179]?.date).toBe("2026-11-18");
    const byDate = new Map(timeline.map((d) => [d.date, d.status]));
    expect(byDate.get("2026-11-01")).toBe("used");
    expect(byDate.get("2026-11-02")).toBe("used");
    expect(byDate.get("2026-11-03")).toBe("free");
    expect(byDate.get("2026-11-16")).toBe("planned");
    expect(byDate.get("2026-11-17")).toBe("planned");
    expect(byDate.get("2026-11-18")).toBe("planned");
    expect(byDate.has("2026-11-19")).toBe(false);
  });

  it("a past trip overlapping the planned stay is shown as used, not planned", () => {
    const timeline = dayTimeline(
      [t("2026-11-15", "2026-11-17")],
      "2026-11-16",
      3,
    );
    const byDate = new Map(timeline.map((d) => [d.date, d.status]));
    expect(byDate.get("2026-11-16")).toBe("used");
    expect(byDate.get("2026-11-17")).toBe("used");
    expect(byDate.get("2026-11-18")).toBe("planned");
  });
});
