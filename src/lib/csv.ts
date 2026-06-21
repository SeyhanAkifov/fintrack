// Lightweight CSV utilities for the bank-statement import flow. No dependencies.

/** Guess the delimiter from a sample line (comma, semicolon, or tab). */
export function detectDelimiter(line: string): string {
  const candidates: [string, number][] = [",", ";", "\t"].map((d) => [
    d,
    line.split(d).length - 1,
  ]);
  candidates.sort((a, b) => b[1] - a[1]);
  return candidates[0][1] > 0 ? candidates[0][0] : ",";
}

/**
 * Parse CSV text into a matrix of rows/fields. Handles quoted fields, escaped
 * quotes (`""`), and CRLF/CR line endings. Blank lines are dropped.
 */
export function parseCsv(text: string, delimiter?: string): string[][] {
  const t = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  const delim = delimiter ?? detectDelimiter(t.split("\n")[0] ?? "");

  const rows: string[][] = [];
  let field = "";
  let row: string[] = [];
  let inQuotes = false;

  for (let i = 0; i < t.length; i++) {
    const c = t[i];
    if (inQuotes) {
      if (c === '"') {
        if (t[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += c;
      }
    } else if (c === '"') {
      inQuotes = true;
    } else if (c === delim) {
      row.push(field);
      field = "";
    } else if (c === "\n") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else {
      field += c;
    }
  }
  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }

  return rows.filter((r) => r.some((cell) => cell.trim() !== ""));
}

export type DateFormat = "auto" | "iso" | "dmy" | "mdy";

/** Parse a date string in a known/auto-detected format. Returns null if invalid. */
export function parseImportDate(s: string, format: DateFormat = "auto"): Date | null {
  const str = s.trim();
  if (!str) return null;

  const m = str.match(/^(\d{1,4})[.\-/](\d{1,2})[.\-/](\d{1,4})$/);
  if (!m) {
    const d = new Date(str);
    return isNaN(d.getTime()) ? null : d;
  }

  const [, p1, p2, p3] = m;
  let y: number, mo: number, da: number;
  if (format === "iso" || (format === "auto" && p1.length === 4)) {
    y = +p1; mo = +p2; da = +p3;
  } else if (format === "mdy") {
    mo = +p1; da = +p2; y = +p3;
  } else {
    da = +p1; mo = +p2; y = +p3;
  }
  if (y < 100) y += 2000;

  // Use UTC midnight so the stored date matches the calendar day regardless of
  // the server's timezone (consistent with how the transaction form stores dates).
  const d = new Date(Date.UTC(y, mo - 1, da));
  return isNaN(d.getTime()) ? null : d;
}

/**
 * Parse a money string, tolerating thousands separators and both `1,234.56`
 * (US) and `1.234,56` (DE) conventions. Returns null if not a number.
 */
export function parseAmount(s: string): number | null {
  let str = s.trim().replace(/\s/g, "").replace(/[^\d.,-]/g, "");
  if (!str || str === "-") return null;

  const lastComma = str.lastIndexOf(",");
  const lastDot = str.lastIndexOf(".");

  if (lastComma > -1 && lastDot > -1) {
    // Whichever separator comes last is the decimal separator.
    if (lastComma > lastDot) str = str.replace(/\./g, "").replace(",", ".");
    else str = str.replace(/,/g, "");
  } else if (lastComma > -1) {
    // Only commas: treat as decimal sep unless it looks like a thousands group.
    const after = str.length - lastComma - 1;
    str = after === 3 && str.indexOf(",") !== lastComma
      ? str.replace(/,/g, "")
      : str.replace(",", ".");
  }

  const n = parseFloat(str);
  return isNaN(n) ? null : n;
}

const KEYWORD_MAP: Record<string, string[]> = {
  Food: ["rewe", "edeka", "aldi", "lidl", "restaurant", "grocery", "supermarkt", "kaufland", "penny"],
  Transport: ["uber", "bahn", "fuel", "shell", "aral", "tankstelle", "parking", "bvg", "taxi"],
  Subscriptions: ["netflix", "spotify", "adobe", "amazon prime", "disney"],
  Utilities: ["strom", "electric", "water", "wasser", "internet", "vodafone", "telekom"],
  Rent: ["rent", "miete"],
  Health: ["gym", "pharmacy", "apotheke", "arzt", "fitness"],
  Salary: ["salary", "gehalt", "lohn", "payroll"],
};

/** Suggest a category for a description, given the user's available categories. */
export function suggestCategory(description: string, categories: string[]): string {
  const d = description.toLowerCase();
  for (const c of categories) {
    if (c.toLowerCase() !== "other" && d.includes(c.toLowerCase())) return c;
  }
  for (const [cat, keywords] of Object.entries(KEYWORD_MAP)) {
    if (categories.includes(cat) && keywords.some((k) => d.includes(k))) return cat;
  }
  return categories.includes("Other") ? "Other" : categories[0] ?? "Other";
}
