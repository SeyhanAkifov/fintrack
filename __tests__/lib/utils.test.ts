import { formatCurrency, formatDate, cn } from "@/lib/utils";

describe("formatCurrency", () => {
  it("formats a positive number as EUR", () => {
    const result = formatCurrency(1234.5);
    expect(result).toContain("1.234");
    expect(result).toContain("50");
    expect(result).toMatch(/€|EUR/);
  });

  it("formats zero", () => {
    expect(formatCurrency(0)).toContain("0");
  });

  it("formats a small decimal", () => {
    const result = formatCurrency(9.99);
    expect(result).toContain("9");
    expect(result).toContain("99");
  });
});

describe("formatDate", () => {
  it("formats a Date object to readable string", () => {
    const result = formatDate(new Date("2026-05-15"));
    expect(result).toContain("May");
    expect(result).toContain("2026");
  });

  it("accepts an ISO string", () => {
    const result = formatDate("2026-01-01T00:00:00.000Z");
    expect(result).toContain("2026");
  });
});

describe("cn", () => {
  it("joins class strings", () => {
    expect(cn("foo", "bar")).toBe("foo bar");
  });

  it("filters out falsy values", () => {
    expect(cn("foo", undefined, null, false, "bar")).toBe("foo bar");
  });

  it("returns empty string when all falsy", () => {
    expect(cn(undefined, null, false)).toBe("");
  });
});
