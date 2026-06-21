"use client";

import { useState } from "react";
import { Select } from "@/components/ui/Select";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useCategories } from "@/hooks/useCategories";
import type { BudgetStatus } from "@/types";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

interface BudgetFormProps {
  editing?: BudgetStatus;
  budgetedCategories: string[];
  month: number;
  year: number;
  onSuccess: () => void;
  onCancel: () => void;
}

export function BudgetForm({
  editing,
  budgetedCategories,
  month,
  year,
  onSuccess,
  onCancel,
}: BudgetFormProps) {
  const { categories } = useCategories();
  const categoryNames = categories.map((c) => c.name);
  const availableCategories = editing
    ? categoryNames.filter((c) => c === editing.category)
    : categoryNames.filter((c) => !budgetedCategories.includes(c));

  const [category, setCategory] = useState(editing?.category ?? "");
  const [limitAmount, setLimitAmount] = useState(editing ? String(editing.limit) : "");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const categoryOptions = availableCategories.map((c) => ({ value: c, label: c }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const amount = parseFloat(limitAmount);
    if (!category || isNaN(amount) || amount <= 0) {
      setError("Choose a category and enter a positive amount.");
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/budgets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category, limitAmount: amount, month, year }),
      });
      if (!res.ok) {
        const body = await res.json();
        setError(body.error ?? "Failed to save budget.");
        return;
      }
      onSuccess();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <p className="text-sm text-gray-500 dark:text-gray-400">
        {MONTH_NAMES[month - 1]} {year}
      </p>

      <Select
        label="Category"
        options={categoryOptions}
        placeholder="Select a category"
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        disabled={!!editing}
      />

      <Input
        label="Monthly limit (€)"
        type="number"
        min="0.01"
        step="0.01"
        value={limitAmount}
        onChange={(e) => setLimitAmount(e.target.value)}
        placeholder="0.00"
        error={error ?? undefined}
      />

      <div className="flex justify-end gap-3 pt-1">
        <Button variant="secondary" type="button" onClick={onCancel}>
          Cancel
        </Button>
        <Button variant="primary" type="submit" disabled={submitting}>
          {submitting ? "Saving…" : editing ? "Update" : "Add Budget"}
        </Button>
      </div>
    </form>
  );
}
