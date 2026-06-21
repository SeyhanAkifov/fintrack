"use client";

/**
 * ImportWizard — CSV import flow: upload, map columns, preview, and import.
 * Created:  2026-06-21
 * Modified: 2026-06-21
 */

import { useMemo, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { useCategories } from "@/hooks/useCategories";
import { formatCurrency } from "@/lib/utils";
import {
  parseCsv,
  parseImportDate,
  parseAmount,
  suggestCategory,
  type DateFormat,
} from "@/lib/csv";
import type { ImportRow, ImportResult } from "@/types";

const DATE_FORMATS: { value: DateFormat; label: string }[] = [
  { value: "auto", label: "Auto-detect" },
  { value: "iso", label: "YYYY-MM-DD" },
  { value: "dmy", label: "DD.MM.YYYY" },
  { value: "mdy", label: "MM/DD/YYYY" },
];

// Finds the first header index matching the given pattern (-1 if none).
function guessColumn(headers: string[], patterns: RegExp): number {
  const i = headers.findIndex((h) => patterns.test(h.toLowerCase()));
  return i;
}

// Multi-step CSV importer: upload, map columns, preview rows, and bulk-import.
export function ImportWizard() {
  const { categories } = useCategories();
  const categoryNames = categories.map((c) => c.name);

  const [fileName, setFileName] = useState("");
  const [rawRows, setRawRows] = useState<string[][]>([]);
  const [hasHeader, setHasHeader] = useState(true);
  const [dateFormat, setDateFormat] = useState<DateFormat>("auto");
  const [negativeIsExpense, setNegativeIsExpense] = useState(true);
  const [dateCol, setDateCol] = useState(0);
  const [amountCol, setAmountCol] = useState(1);
  const [descCol, setDescCol] = useState(2);

  const [overrides, setOverrides] = useState<Record<number, string>>({});
  const [excluded, setExcluded] = useState<Set<number>>(new Set());
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    setResult(null);
    setError(null);
    setOverrides({});
    setExcluded(new Set());

    const text = await file.text();
    const rows = parseCsv(text);
    setRawRows(rows);

    // Guess columns from the header row.
    const headers = rows[0] ?? [];
    const di = guessColumn(headers, /date|datum|buchung/);
    const ai = guessColumn(headers, /amount|betrag|value|umsatz/);
    const ti = guessColumn(headers, /desc|verwendung|text|payee|name|empf|zweck/);
    setDateCol(di >= 0 ? di : 0);
    setAmountCol(ai >= 0 ? ai : Math.min(1, headers.length - 1));
    setDescCol(ti >= 0 ? ti : Math.min(2, headers.length - 1));
  }

  const headers = useMemo(() => {
    if (rawRows.length === 0) return [];
    return hasHeader
      ? rawRows[0]
      : rawRows[0].map((_, i) => `Column ${i + 1}`);
  }, [rawRows, hasHeader]);

  const dataRows = useMemo(
    () => (hasHeader ? rawRows.slice(1) : rawRows),
    [rawRows, hasHeader]
  );

  const preview = useMemo(() => {
    return dataRows.map((cells, idx) => {
      const date = parseImportDate(cells[dateCol] ?? "", dateFormat);
      const rawAmount = parseAmount(cells[amountCol] ?? "");
      const note = (cells[descCol] ?? "").trim();
      const valid = date !== null && rawAmount !== null && Math.abs(rawAmount) > 0;
      const isExpense = rawAmount !== null
        ? negativeIsExpense ? rawAmount < 0 : rawAmount > 0
        : true;
      const category =
        overrides[idx] ?? suggestCategory(note, categoryNames);
      return {
        idx,
        date,
        amount: rawAmount !== null ? Math.abs(rawAmount) : null,
        type: (isExpense ? "expense" : "income") as "expense" | "income",
        note,
        category,
        valid,
        included: valid && !excluded.has(idx),
      };
    });
  }, [dataRows, dateCol, amountCol, descCol, dateFormat, negativeIsExpense, overrides, excluded, categoryNames]);

  const validCount = preview.filter((p) => p.valid).length;
  const includeCount = preview.filter((p) => p.included).length;

  const columnOptions = headers.map((h, i) => ({
    value: String(i),
    label: h?.trim() ? h : `Column ${i + 1}`,
  }));

  function setRowCategory(idx: number, category: string) {
    setOverrides((o) => ({ ...o, [idx]: category }));
  }
  function toggleRow(idx: number) {
    setExcluded((s) => {
      const next = new Set(s);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  }

  async function handleImport() {
    const rows: ImportRow[] = preview
      .filter((p) => p.included && p.date && p.amount !== null)
      .map((p) => ({
        amount: p.amount as number,
        type: p.type,
        category: p.category,
        date: (p.date as Date).toISOString(),
        note: p.note || null,
      }));

    if (rows.length === 0) {
      setError("No valid rows to import.");
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/transactions/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rows }),
      });
      if (!res.ok) {
        const body = await res.json();
        setError(body.error ?? "Import failed.");
        return;
      }
      setResult(await res.json());
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  // ── Result screen ──────────────────────────────────────────────────────────
  if (result) {
    return (
      <div className="bg-white/70 dark:bg-gray-800/60 backdrop-blur rounded-2xl border border-white dark:border-gray-700 shadow-sm p-8 flex flex-col items-center gap-4 text-center">
        <span className="flex items-center justify-center w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 text-2xl">
          ✓
        </span>
        <div>
          <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">Import complete</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {result.created} imported
            {result.skipped > 0 && ` · ${result.skipped} duplicates skipped`}
            {result.invalid > 0 && ` · ${result.invalid} invalid skipped`}
          </p>
        </div>
        <div className="flex gap-3">
          <Link href="/transactions">
            <Button variant="primary">Back to transactions</Button>
          </Link>
          <Button
            variant="secondary"
            onClick={() => {
              setResult(null);
              setRawRows([]);
              setFileName("");
            }}
          >
            Import another
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Upload */}
      <div className="bg-white/70 dark:bg-gray-800/60 backdrop-blur rounded-2xl border border-white dark:border-gray-700 shadow-sm px-5 py-4">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">CSV file</label>
        <div className="flex items-center gap-3 mt-2">
          <input
            type="file"
            accept=".csv,text/csv"
            onChange={handleFile}
            className="block text-sm text-gray-600 dark:text-gray-300 file:mr-3 file:rounded-lg file:border-0 file:bg-indigo-50 file:px-4 file:py-2 file:text-sm file:font-medium file:text-indigo-700 hover:file:bg-indigo-100"
          />
          {fileName && <span className="text-xs text-gray-400 dark:text-gray-500 truncate">{fileName}</span>}
        </div>
      </div>

      {rawRows.length > 0 && (
        <>
          {/* Mapping controls */}
          <div className="bg-white/70 dark:bg-gray-800/60 backdrop-blur rounded-2xl border border-white dark:border-gray-700 shadow-sm px-5 py-4 flex flex-col gap-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Select label="Date column" options={columnOptions} value={String(dateCol)} onChange={(e) => setDateCol(Number(e.target.value))} />
              <Select label="Amount column" options={columnOptions} value={String(amountCol)} onChange={(e) => setAmountCol(Number(e.target.value))} />
              <Select label="Description column" options={columnOptions} value={String(descCol)} onChange={(e) => setDescCol(Number(e.target.value))} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Select label="Date format" options={DATE_FORMATS} value={dateFormat} onChange={(e) => setDateFormat(e.target.value as DateFormat)} />
              <Select
                label="Amount sign"
                options={[
                  { value: "neg", label: "Negative = expense" },
                  { value: "pos", label: "Positive = expense" },
                ]}
                value={negativeIsExpense ? "neg" : "pos"}
                onChange={(e) => setNegativeIsExpense(e.target.value === "neg")}
              />
            </div>
            <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
              <input type="checkbox" checked={hasHeader} onChange={(e) => setHasHeader(e.target.checked)} className="rounded border-gray-300" />
              First row is a header
            </label>
          </div>

          {/* Summary + import */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white/70 dark:bg-gray-800/60 backdrop-blur rounded-2xl border border-white dark:border-gray-700 shadow-sm px-5 py-3.5">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {dataRows.length} rows · {validCount} valid · <span className="font-semibold text-gray-800 dark:text-gray-200">{includeCount} to import</span>
            </span>
            <Button variant="primary" onClick={handleImport} disabled={submitting || includeCount === 0}>
              {submitting ? "Importing…" : `Import ${includeCount}`}
            </Button>
          </div>

          {error && (
            <p className="text-sm text-rose-600 bg-rose-50 border border-rose-200 rounded-xl px-4 py-2.5">{error}</p>
          )}

          {/* Preview table */}
          <div className="bg-white/70 dark:bg-gray-800/60 backdrop-blur rounded-2xl border border-white dark:border-gray-700 shadow-sm overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-gray-400 dark:text-gray-500 border-b border-gray-100 dark:border-gray-700">
                  <th className="px-3 py-2 w-10"></th>
                  <th className="px-3 py-2">Date</th>
                  <th className="px-3 py-2">Description</th>
                  <th className="px-3 py-2">Category</th>
                  <th className="px-3 py-2 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-700/50">
                {preview.slice(0, 200).map((p) => (
                  <tr key={p.idx} className={!p.valid ? "opacity-40" : !p.included ? "opacity-50" : ""}>
                    <td className="px-3 py-2">
                      <input
                        type="checkbox"
                        checked={p.included}
                        disabled={!p.valid}
                        onChange={() => toggleRow(p.idx)}
                        className="rounded border-gray-300"
                      />
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-gray-700 dark:text-gray-300">
                      {p.date ? p.date.toLocaleDateString("en-GB") : <span className="text-rose-500">invalid</span>}
                    </td>
                    <td className="px-3 py-2 max-w-[200px] truncate text-gray-700 dark:text-gray-300" title={p.note}>{p.note || "—"}</td>
                    <td className="px-3 py-2">
                      <Select
                        options={categoryNames.map((c) => ({ value: c, label: c }))}
                        value={p.category}
                        onChange={(e) => setRowCategory(p.idx, e.target.value)}
                        className="!py-1 text-xs min-w-[120px]"
                      />
                    </td>
                    <td className={"px-3 py-2 text-right whitespace-nowrap font-medium " + (p.type === "income" ? "text-emerald-600" : "text-gray-700 dark:text-gray-300")}>
                      {p.amount !== null ? (p.type === "income" ? "+" : "−") + formatCurrency(p.amount) : <span className="text-rose-500">—</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {preview.length > 200 && (
              <p className="text-xs text-gray-400 dark:text-gray-500 text-center py-3">
                Showing first 200 of {preview.length} rows — all valid rows will be imported.
              </p>
            )}
          </div>
        </>
      )}
    </div>
  );
}
