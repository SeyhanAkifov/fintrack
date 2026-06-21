import {
  parseCsv,
  detectDelimiter,
  parseImportDate,
  parseAmount,
  suggestCategory,
} from "@/lib/csv";

describe("detectDelimiter", () => {
  it("detects semicolons (German banks)", () => {
    expect(detectDelimiter("a;b;c")).toBe(";");
  });
  it("detects commas", () => {
    expect(detectDelimiter("a,b,c")).toBe(",");
  });
});

describe("parseCsv", () => {
  it("parses simple comma rows", () => {
    expect(parseCsv("a,b\n1,2")).toEqual([
      ["a", "b"],
      ["1", "2"],
    ]);
  });
  it("handles quoted fields with embedded delimiter and quotes", () => {
    expect(parseCsv('name,note\n"Doe, John","say ""hi"""')).toEqual([
      ["name", "note"],
      ["Doe, John", 'say "hi"'],
    ]);
  });
  it("drops blank lines and handles CRLF", () => {
    expect(parseCsv("a,b\r\n\r\n1,2\r\n")).toEqual([
      ["a", "b"],
      ["1", "2"],
    ]);
  });
});

describe("parseImportDate", () => {
  it("parses ISO to UTC midnight", () => {
    expect(parseImportDate("2026-05-15", "iso")?.toISOString()).toBe(
      "2026-05-15T00:00:00.000Z"
    );
  });
  it("parses DD.MM.YYYY", () => {
    const d = parseImportDate("15.05.2026", "dmy")!;
    expect(d.getUTCMonth()).toBe(4); // May = 4
    expect(d.getUTCDate()).toBe(15);
  });
  it("parses MM/DD/YYYY", () => {
    const d = parseImportDate("05/15/2026", "mdy")!;
    expect(d.getUTCMonth()).toBe(4);
    expect(d.getUTCDate()).toBe(15);
  });
  it("auto-detects 4-digit-year-first as ISO", () => {
    expect(parseImportDate("2026-01-02", "auto")?.getUTCMonth()).toBe(0);
  });
  it("does not drift across timezones (no off-by-one)", () => {
    expect(parseImportDate("12.07.2026", "dmy")?.toISOString().slice(0, 10)).toBe(
      "2026-07-12"
    );
  });
  it("returns null for garbage", () => {
    expect(parseImportDate("not-a-date", "iso")).toBeNull();
  });
});

describe("parseAmount", () => {
  it("parses US format", () => {
    expect(parseAmount("1,234.56")).toBe(1234.56);
  });
  it("parses German format", () => {
    expect(parseAmount("1.234,56")).toBe(1234.56);
  });
  it("parses negative with currency symbol", () => {
    expect(parseAmount("-€50,00")).toBe(-50);
  });
  it("returns null for non-numbers", () => {
    expect(parseAmount("abc")).toBeNull();
  });
});

describe("suggestCategory", () => {
  const cats = ["Food", "Transport", "Subscriptions", "Other"];
  it("matches by keyword", () => {
    expect(suggestCategory("REWE SAGT DANKE", cats)).toBe("Food");
    expect(suggestCategory("Uber trip", cats)).toBe("Transport");
    expect(suggestCategory("NETFLIX.COM", cats)).toBe("Subscriptions");
  });
  it("falls back to Other", () => {
    expect(suggestCategory("mystery vendor", cats)).toBe("Other");
  });
});
