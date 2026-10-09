import { describe, it, expect } from "vitest";
import { toCentavos, fromCentavos, formatPHP, formatInput } from "@/lib/money";

describe("money", () => {
  it("converts peso strings without floats", () => {
    expect(toCentavos("100")).toBe(10000);
    expect(toCentavos("1,234.56")).toBe(123456);
    expect(toCentavos("₱1,234.50")).toBe(123450);
    expect(toCentavos("0.99")).toBe(99);
    expect(toCentavos("-50.25")).toBe(-5025);
  });
  it("converts numbers safely", () => {
    expect(toCentavos(10.55)).toBe(1055);
    expect(fromCentavos(1055)).toBeCloseTo(10.55);
  });
  it("formats PHP with thousands separators", () => {
    expect(formatPHP(123456)).toContain("1,234.56");
    expect(formatPHP(123456)).toContain("₱");
  });
  it("round-trips input format", () => {
    expect(formatInput(123456)).toBe("1234.56");
    expect(toCentavos(formatInput(123456))).toBe(123456);
  });
  it("rejects invalid input", () => {
    expect(() => toCentavos("abc")).toThrow();
    expect(() => toCentavos("")).toThrow();
  });
});
