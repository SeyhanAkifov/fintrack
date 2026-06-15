"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { DeleteConfirmModal } from "@/components/transactions/DeleteConfirmModal";
import { BudgetForm } from "./BudgetForm";
import { useBudgets } from "@/hooks/useBudgets";
import { formatCurrency, cn } from "@/lib/utils";
import { CATEGORIES } from "@/lib/categories";
import type { BudgetStatus } from "@/types";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const CATEGORY_COLORS: Record<string, string> = {
  Food:          "#6366f1",
  Rent:          "#8b5cf6",
  Salary:        "#10b981",
  Transport:     "#f59e0b",
  Entertainment: "#ec4899",
  Subscriptions: "#3b82f6",
  Utilities:     "#f97316",
  Freelance:     "#14b8a6",
  Health:        "#e11d48",
  Other:         "#84cc16",
};

function barColor(pct: number): string {
  if (pct >= 100) return "bg-rose-500";
  if (pct >= 90) return "bg-orange-500";
  if (pct >= 70) return "bg-amber-500";
  return "bg-emerald-500";
}

interface BudgetPlannerProps {
  initialStatuses: BudgetStatus[];
  initialYear: number;
  initialMonth: number;
}

export function BudgetPlanner({ initialStatuses, initialYear, initialMonth }: BudgetPlannerProps) {
  const [year, setYear] = useState(initialYear);
  const [month, setMonth] = useState(initialMonth);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<BudgetStatus | undefined>();
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const { statuses, isLoading, error, refetch } = useBudgets(year, month);
  const displayed = isLoading && statuses.length === 0 ? initialStatuses : statuses;

  const budgetedCategories = displayed.map((s) => s.category);
  const allCategoriesBudgeted = CATEGORIES.every((c) => budgetedCategories.includes(c));

  function prevMonth() {
    if (month === 1) { setMonth(12); setYear((y) => y - 1); }
    else setMonth((m) => m - 1);
  }
  function nextMonth() {
    if (month === 12) { setMonth(1); setYear((y) => y + 1); }
    else setMonth((m) => m + 1);
  }

  function handleEdit(status: BudgetStatus) {
    setEditing(status);
    setFormOpen(true);
  }

  async function handleDeleteConfirm() {
    if (deleteId === null) return;
    await fetch(`/api/budgets/${deleteId}`, { method: "DELETE" });
    setDeleteId(null);
    refetch();
  }

  function handleFormSuccess() {
    setFormOpen(false);
    setEditing(undefined);
    refetch();
  }

  const overBudgetCount = displayed.filter((s) => s.isOverBudget).length;

  return (
    <div className="flex flex-col gap-4">
      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white/70 backdrop-blur rounded-2xl border border-white shadow-sm px-5 py-3.5">
        {/* Month navigator */}
        <div className="flex items-center gap-2">
          <button
            onClick={prevMonth}
            className="p-1.5 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
            aria-label="Previous month"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <span className="text-sm font-semibold text-gray-800 min-w-[120px] text-center">
            {MONTH_NAMES[month - 1]} {year}
          </span>
          <button
            onClick={nextMonth}
            className="p-1.5 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
            aria-label="Next month"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        <div className="flex items-center gap-2">
          {overBudgetCount > 0 && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-100 px-3 py-1 text-xs font-semibold text-rose-600">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
              {overBudgetCount} over budget
            </span>
          )}
          {!allCategoriesBudgeted && (
            <Button
              variant="primary"
              size="md"
              onClick={() => { setEditing(undefined); setFormOpen(true); }}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              Add Budget
            </Button>
          )}
        </div>
      </div>

      {/* Budget list */}
      <div className="bg-white/70 backdrop-blur rounded-2xl border border-white shadow-sm overflow-hidden">
        {isLoading && displayed.length === 0 ? (
          <div className="flex items-center justify-center py-16 text-sm text-gray-400">
            Loading…
          </div>
        ) : displayed.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <svg className="w-10 h-10 text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 11h.01M12 11h.01M15 11h.01M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0 1.1.9 2-2 2z" />
            </svg>
            <div className="text-center">
              <p className="text-sm font-medium text-gray-500">No budgets for this month.</p>
              <p className="text-xs text-gray-400 mt-1">Click &ldquo;Add Budget&rdquo; to set a spending limit.</p>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {displayed.map((status) => (
              <BudgetRow
                key={status.id}
                status={status}
                onEdit={handleEdit}
                onDelete={setDeleteId}
              />
            ))}
          </div>
        )}
        {error && (
          <p className="text-sm text-rose-500 text-center py-4">{error}</p>
        )}
      </div>

      {/* Form modal */}
      <Modal
        isOpen={formOpen}
        onClose={() => { setFormOpen(false); setEditing(undefined); }}
        title={editing ? "Edit Budget" : "New Budget"}
      >
        <BudgetForm
          editing={editing}
          budgetedCategories={budgetedCategories}
          month={month}
          year={year}
          onSuccess={handleFormSuccess}
          onCancel={() => { setFormOpen(false); setEditing(undefined); }}
        />
      </Modal>

      {/* Delete modal */}
      <DeleteConfirmModal
        isOpen={deleteId !== null}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}

interface BudgetRowProps {
  status: BudgetStatus;
  onEdit: (status: BudgetStatus) => void;
  onDelete: (id: number) => void;
}

function BudgetRow({ status, onEdit, onDelete }: BudgetRowProps) {
  const pct = Math.min(status.percentUsed, 100);
  const color = barColor(status.percentUsed);
  const dotColor = CATEGORY_COLORS[status.category] ?? "#6366f1";

  return (
    <div className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50/60 transition-colors group">
      {/* Category dot + name */}
      <div className="flex items-center gap-2.5 w-32 shrink-0">
        <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: dotColor }} />
        <span className="text-sm font-medium text-gray-800 truncate">{status.category}</span>
      </div>

      {/* Progress bar + amounts */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1.5 gap-2">
          <span className="text-xs text-gray-500">
            {formatCurrency(status.spent)} spent
          </span>
          <div className="flex items-center gap-1.5">
            {status.isOverBudget && (
              <span className="text-xs font-semibold text-rose-600 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full">
                Over budget
              </span>
            )}
            <span className="text-xs text-gray-400">
              of {formatCurrency(status.limit)}
            </span>
          </div>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-2">
          <div
            className={cn("h-2 rounded-full transition-all", color)}
            style={{ width: `${pct}%` }}
          />
        </div>
        <p className={cn(
          "text-xs mt-1",
          status.isOverBudget ? "text-rose-500 font-medium" : "text-gray-400"
        )}>
          {status.isOverBudget
            ? `${formatCurrency(Math.abs(status.remaining))} over limit`
            : `${formatCurrency(status.remaining)} remaining`}
        </p>
      </div>

      {/* Percent */}
      <span className={cn(
        "text-sm font-bold tabular-nums w-12 text-right shrink-0",
        status.isOverBudget ? "text-rose-500" : "text-gray-600"
      )}>
        {Math.round(status.percentUsed)}%
      </span>

      {/* Actions */}
      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={() => onEdit(status)}
          className="p-1.5 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
          aria-label="Edit budget"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </button>
        <button
          onClick={() => onDelete(status.id)}
          className="p-1.5 rounded-lg text-gray-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
          aria-label="Delete budget"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    </div>
  );
}
