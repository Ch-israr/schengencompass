import { describe, expect, it } from "vitest";
import type { Trip } from "../../schengen/types";
import { buildShareUrl, copyToClipboard, parseShareUrl } from "../share-url";

const t = (entry: string, exit: string, label?: string): Trip =>
  label ? { entry, exit, label } : { entry, exit };

describe("buildShareUrl / parseShareUrl", () => {
  it("round-trips a full plan through a URL", () => {
    const trips = [t("2026-01-01", "2026-01-30", "Lisbon")];
    const url = buildShareUrl(
      "https://schengencompass.com/schengen-calculator/",
      trips,
      "2026-11-16",
      30,
    );
    expect(url).toContain("trips=2026-01-01_2026-01-30_Lisbon");
    expect(url).toContain("entry=2026-11-16");
    expect(url).toContain("stay=30");
    expect(parseShareUrl(url)).toEqual({
      trips,
      entry: "2026-11-16",
      stay: 30,
    });
  });

  it("returns the bare URL when the plan is empty", () => {
    expect(
      buildShareUrl("https://schengencompass.com/", [], null, null),
    ).toBe("https://schengencompass.com/");
  });

  it("parsing a bare URL or garbage never throws", () => {
    expect(parseShareUrl("https://schengencompass.com/")).toEqual({
      trips: [],
      entry: null,
      stay: null,
    });
    expect(parseShareUrl("not a url at all")).toEqual({
      trips: [],
      entry: null,
      stay: null,
    });
    expect(parseShareUrl("")).toEqual({ trips: [], entry: null, stay: null });
  });
});

describe("copyToClipboard", () => {
  it("returns false when the Clipboard API is unavailable (Node)", async () => {
    await expect(copyToClipboard("https://example.com/")).resolves.toBe(false);
  });
});
