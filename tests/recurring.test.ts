import { describe, it, expect } from "vitest";
import { daysInMonth, nextMonth, clampDay, MAX_CATCHUP_MONTHS } from "@/lib/recurring";

describe("recurring helpers", () => {
  it("knows month lengths incl. leap Feb", () => {
    expect(daysInMonth("2026-02")).toBe(28);
    expect(daysInMonth("2024-02")).toBe(29);
    expect(daysInMonth("2026-10")).toBe(31);
    expect(daysInMonth("2026-09")).toBe(30);
  });
  it("advances months across year boundary", () => {
    expect(nextMonth("2026-10")).toBe("2026-11");
    expect(nextMonth("2026-12")).toBe("2027-01");
  });
  it("clamps 29-31 to short months", () => {
    expect(clampDay("2026-02", 31)).toBe(28);
    expect(clampDay("2024-02", 30)).toBe(29);
    expect(clampDay("2026-04", 31)).toBe(30);
    expect(clampDay("2026-10", 15)).toBe(15);
    expect(clampDay("2026-10", 0)).toBe(1);
  });
  it("caps catch-up so returning users don't flood history", () => {
    expect(MAX_CATCHUP_MONTHS).toBe(12);
  });
});
