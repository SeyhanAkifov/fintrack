"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { useCategories } from "@/hooks/useCategories";
import type { RecurringTransaction, CreateRecurringInput } from "@/types";

interface RecurringFormProps {
  editing?: RecurringTransaction;
  onSuccess: () => void;
  onCancel: () => void;
}

const TYPE_OPTIONS = [
  { value: "expense", label: "Expense" },
  { value: "income", label: "Income" },
];

const FREQUENCY_OPTIONS = [
  { value: "monthly", label: "Monthly" },
  { value: "weekly", label: "Weekly" },
];

function toDateInput(iso: string) {
  return iso.slice(0, 10);
}

export function RecurringForm({ editing, onSuccess, onCancel }: RecurringFormProps) {
  const { categories } = useCategories();
  const categoryOptions = categories.map((c) => ({ value: c.name, label: c.name }));

  const [amount, setAmount] = useState(editing ? String(editing.amount) : "");
  const [type, setType] = useState<"income" | "expense">(editing?.type ?? "expense");
  const [category, setCategory] = useState(editing?.category ?? "");
  const [frequency, setFrequency] = useState<"monthly" | "weekly">(
    editing?.frequency ?? "monthly"
  );
  const [nextRunDate, setNextRunDate] = useState(
    editing ? toDateInput(editing.nextRunDate) : toDateInput(new Date().toISOString())
  );
  const [note, setNote] = useState(editing?.note ?? "");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Default to first category once loaded (create mode only).
  useEffect(() => {
    if (!editing && !category && categories.length > 0) {
      setCategory(categories[0].name);
    }
  }, [categories, editing, category]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const amt = parseFloat(amount);
    if (isNaN(amt) || amt <= 0) {
      setError("Enter a positive amount.");
      return;
    }
    if (!category) {
      setError("Select a category.");
      return;
    }
    if (!nextRunDate) {
      setError("Pick a start date.");
      return;
    }

    setSubmitting(true);
    setError(null);
    const payload: CreateRecurringInput = {
      amount: amt,
      type,
      category,
      frequency,
      nextRunDate: new Date(nextRunDate).toISOString(),
      note: note || null,
    };

    try {
      const url = editing ? `/api/recurring/${editing.id}` : "/api/recurring";
      const method = editing ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const body = await res.json();
        setError(body.error ?? "Failed to save.");
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
      <div className="flex gap-3">
        <Input
          label="Amount (€)"
          type="number"
          min="0.01"
          step="0.01"
          placeholder="0.00"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="flex-1"
        />
        <Select
          label="Type"
          options={TYPE_OPTIONS}
          value={type}
          onChange={(e) => setType(e.target.value as "income" | "expense")}
          className="w-36"
        />
      </div>

      <div className="flex gap-3">
        <Select
          label="Category"
          options={categoryOptions}
          placeholder="Select a category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="flex-1"
        />
        <Select
          label="Frequency"
          options={FREQUENCY_OPTIONS}
          value={frequency}
          onChange={(e) => setFrequency(e.target.value as "monthly" | "weekly")}
          className="w-36"
        />
      </div>

      <Input
        label={editing ? "Next run date" : "Start date"}
        type="date"
        value={nextRunDate}
        onChange={(e) => setNextRunDate(e.target.value)}
      />

      <div className="flex flex-col gap-1">
        <label htmlFor="rec-note" className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Note <span className="text-gray-400 dark:text-gray-500 font-normal">(optional)</span>
        </label>
        <textarea
          id="rec-note"
          rows={2}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="e.g. Netflix subscription"
          className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100 dark:placeholder:text-gray-500"
        />
      </div>

      {error && <p className="text-xs text-rose-600">{error}</p>}

      <div className="flex justify-end gap-3 pt-1">
        <Button variant="secondary" type="button" onClick={onCancel} disabled={submitting}>
          Cancel
        </Button>
        <Button variant="primary" type="submit" disabled={submitting}>
          {submitting ? "Saving…" : editing ? "Update" : "Add Recurring"}
        </Button>
      </div>
    </form>
  );
}
