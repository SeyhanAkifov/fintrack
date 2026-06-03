"use client";

import { useCallback, useRef } from "react";
import { Select } from "@/components/ui/Select";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { CATEGORIES } from "@/lib/categories";
import type { FilterState } from "@/types";

interface TransactionFiltersProps {
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
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

  const handleChange = useCallback(
    (patch: Partial<FilterState>) => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        onFilterChange({ ...filters, ...patch });
      }, 300);
    },
    [filters, onFilterChange]
  );

  const handleReset = () => {
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
        type="date"
        value={filters.from ?? ""}
        onChange={(e) => handleChange({ from: e.target.value || null })}
        className="w-36"
        placeholder="From"
      />
      <Input
        type="date"
        value={filters.to ?? ""}
        onChange={(e) => handleChange({ to: e.target.value || null })}
        className="w-36"
        placeholder="To"
      />
      <Button variant="secondary" size="sm" onClick={handleReset}>
        Reset
      </Button>
    </div>
  );
}
