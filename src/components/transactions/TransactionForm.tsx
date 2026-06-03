"use client";

import { useState } from "react";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { CATEGORIES } from "@/lib/categories";
import type { Transaction, CreateTransactionInput } from "@/types";

interface TransactionFormProps {
  transaction?: Transaction;
  onSuccess: (transaction: Transaction) => void;
  onCancel: () => void;
}

const CATEGORY_OPTIONS = CATEGORIES.map((c) => ({ value: c, label: c }));
const TYPE_OPTIONS = [
  { value: "income", label: "Income" },
  { value: "expense", label: "Expense" },
];

interface FormState {
  amount: string;
  type: "income" | "expense";
  category: string;
  date: string;
  note: string;
}

interface FormErrors {
  amount?: string;
  category?: string;
  date?: string;
}

function toDateInput(iso: string) {
  return iso.slice(0, 10);
}

export function TransactionForm({ transaction, onSuccess, onCancel }: TransactionFormProps) {
  const [form, setForm] = useState<FormState>({
    amount: transaction ? String(transaction.amount) : "",
    type: transaction?.type ?? "expense",
    category: transaction?.category ?? CATEGORIES[0],
    date: transaction ? toDateInput(transaction.date) : toDateInput(new Date().toISOString()),
    note: transaction?.note ?? "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);

  const set = (field: keyof FormState) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => setForm((prev) => ({ ...prev, [field]: e.target.value }));

  function validate(): boolean {
    const errs: FormErrors = {};
    if (!form.amount || isNaN(Number(form.amount)) || Number(form.amount) <= 0) {
      errs.amount = "Enter a valid positive amount";
    }
    if (!form.category) errs.category = "Select a category";
    if (!form.date) errs.date = "Select a date";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);

    const payload: CreateTransactionInput = {
      amount: Number(form.amount),
      type: form.type,
      category: form.category,
      date: new Date(form.date).toISOString(),
      note: form.note || null,
    };

    try {
      const url = transaction
        ? `/api/transactions/${transaction.id}`
        : "/api/transactions";
      const method = transaction ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Request failed");
      const saved: Transaction = await res.json();
      onSuccess(saved);
    } catch {
      setErrors({ amount: "Failed to save. Please try again." });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex gap-3">
        <Input
          id="amount"
          label="Amount (€)"
          type="number"
          min="0.01"
          step="0.01"
          placeholder="0.00"
          value={form.amount}
          onChange={set("amount")}
          error={errors.amount}
          className="flex-1"
        />
        <Select
          id="type"
          label="Type"
          options={TYPE_OPTIONS}
          value={form.type}
          onChange={set("type")}
          className="w-36"
        />
      </div>
      <div className="flex gap-3">
        <Select
          id="category"
          label="Category"
          options={CATEGORY_OPTIONS}
          value={form.category}
          onChange={set("category")}
          error={errors.category}
          className="flex-1"
        />
        <Input
          id="date"
          label="Date"
          type="date"
          value={form.date}
          onChange={set("date")}
          error={errors.date}
          className="w-40"
        />
      </div>
      <div className="flex flex-col gap-1">
        <label htmlFor="note" className="text-sm font-medium text-gray-700">
          Note <span className="text-gray-400 font-normal">(optional)</span>
        </label>
        <textarea
          id="note"
          rows={2}
          value={form.note}
          onChange={set("note")}
          placeholder="Add a note..."
          className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none"
        />
      </div>
      <div className="flex justify-end gap-3 pt-1">
        <Button type="button" variant="secondary" onClick={onCancel} disabled={submitting}>
          Cancel
        </Button>
        <Button type="submit" variant="primary" disabled={submitting}>
          {submitting ? "Saving…" : transaction ? "Save Changes" : "Add Transaction"}
        </Button>
      </div>
    </form>
  );
}
