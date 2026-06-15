"use client";

import { useCallback, useRef, useState } from "react";
import { Select } from "@/components/ui/Select";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { CATEGORIES } from "@/lib/categories";
import type { FilterState } from "@/types";

interface TransactionFiltersProps {
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
}

function buildExportUrl(filters: FilterState): string {
  const params = new URLSearchParams();
  if (filters.category) params.set("category", filters.category);
  if (filters.type) params.set("type", filters.type);
  if (filters.from) params.set("from", filters.from);
  if (filters.to) params.set("to", filters.to);
  const qs = params.toString();
  return `/api/transactions/export${qs ? `?${qs}` : ""}`;
}

const CATEGORY_OPTIONS = [
  { value: "", label: "All Categories" },
  ...CATEGORIES.map((c) => ({ value: c, label: c })),
];

const TYPE_OPTIONS = [
  { value: "", label: "All Types" },
  { value: "income", label: "Income" },
  { value: "expense", label: "Expense" },
];

export function TransactionFilters({ filters, onFilterChange }: TransactionFiltersProps) {
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [selectedMonth, setSelectedMonth] = useState("");

  const handleChange = useCallback(
    (patch: Partial<FilterState>) => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        onFilterChange({ ...filters, ...patch });
      }, 300);
    },
    [filters, onFilterChange]
  );

  const handleMonthChange = (month: string) => {
    setSelectedMonth(month);
    if (!month) {
      onFilterChange({ ...filters, from: null, to: null });
      return;
    }
    const [year, mon] = month.split("-").map(Number);
    const mm = String(mon).padStart(2, "0");
    const lastDay = new Date(year, mon, 0).getDate();
    const from = `${year}-${mm}-01`;
    const to = `${year}-${mm}-${String(lastDay).padStart(2, "0")}`;
    onFilterChange({ ...filters, from, to });
  };

  const handleReset = () => {
    setSelectedMonth("");
    onFilterChange({ category: null, type: null, from: null, to: null });
  };

  return (
    <div className="flex flex-wrap gap-3 items-end">
      <Select
        options={CATEGORY_OPTIONS}
        value={filters.category ?? ""}
        onChange={(e) => handleChange({ category: e.target.value || null })}
        className="w-40"
      />
      <Select
        options={TYPE_OPTIONS}
        value={filters.type ?? ""}
        onChange={(e) =>
          handleChange({ type: (e.target.value as FilterState["type"]) || null })
        }
        className="w-36"
      />
      <Input
        type="month"
        value={selectedMonth}
        onChange={(e) => handleMonthChange(e.target.value)}
        className="w-36"
        placeholder="Month"
        aria-label="Month"
      />
      <Input
        type="date"
        value={filters.from ?? ""}
        onChange={(e) => { setSelectedMonth(""); handleChange({ from: e.target.value || null }); }}
        className="w-36"
        placeholder="From"
      />
      <Input
        type="date"
        value={filters.to ?? ""}
        onChange={(e) => { setSelectedMonth(""); handleChange({ to: e.target.value || null }); }}
        className="w-36"
        placeholder="To"
      />
      <Button variant="secondary" size="sm" onClick={handleReset}>
        Reset
      </Button>
      <Button
        variant="secondary"
        size="sm"
        onClick={() => { window.location.href = buildExportUrl(filters); }}
      >
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
        Export CSV
      </Button>
    </div>
  );
}
