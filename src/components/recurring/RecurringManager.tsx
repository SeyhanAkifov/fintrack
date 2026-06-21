"use client";

/**
 * RecurringManager — lists recurring templates with pause, edit, and delete actions.
 * Created:  2026-06-21
 * Modified: 2026-06-21
 */

import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { DeleteConfirmModal } from "@/components/transactions/DeleteConfirmModal";
import { RecurringForm } from "./RecurringForm";
import { useRecurring } from "@/hooks/useRecurring";
import { useCategories } from "@/hooks/useCategories";
import { formatCurrency, cn } from "@/lib/utils";
import type { RecurringTransaction } from "@/types";

interface RecurringManagerProps {
  initialRecurring: RecurringTransaction[];
}

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(iso));
}

export function RecurringManager({ initialRecurring }: RecurringManagerProps) {
  const { recurring, isLoading, error, refetch } = useRecurring(initialRecurring);
  const { byName } = useCategories();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<RecurringTransaction | undefined>();
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const displayed = recurring.length === 0 && isLoading ? initialRecurring : recurring;

  function handleFormSuccess() {
    setFormOpen(false);
    setEditing(undefined);
    refetch();
  }

  async function toggleActive(r: RecurringTransaction) {
    await fetch(`/api/recurring/${r.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !r.active }),
    });
    refetch();
  }

  async function handleDeleteConfirm() {
    if (deleteId === null) return;
    await fetch(`/api/recurring/${deleteId}`, { method: "DELETE" });
    setDeleteId(null);
    refetch();
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white/70 dark:bg-gray-800/60 backdrop-blur rounded-2xl border border-white dark:border-gray-700 shadow-sm px-5 py-3.5">
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {displayed.length} recurring transaction{displayed.length === 1 ? "" : "s"}
        </span>
        <Button
          variant="primary"
          size="md"
          onClick={() => { setEditing(undefined); setFormOpen(true); }}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Add Recurring
        </Button>
      </div>

      <div className="bg-white/70 dark:bg-gray-800/60 backdrop-blur rounded-2xl border border-white dark:border-gray-700 shadow-sm overflow-hidden">
        {displayed.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-2 text-center px-4">
            <svg className="w-10 h-10 text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">No recurring transactions yet.</p>
            <p className="text-xs text-gray-400 dark:text-gray-500">Automate rent, salary, subscriptions and more.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50 dark:divide-gray-700/50">
            {displayed.map((r) => {
              const icon = byName.get(r.category)?.icon ?? "🔁";
              return (
                <div
                  key={r.id}
                  className={cn(
                    "flex items-center gap-3 px-5 py-4 hover:bg-gray-50/60 dark:hover:bg-gray-700/40 transition-colors group",
                    !r.active && "opacity-50"
                  )}
                >
                  <span className="text-xl w-7 text-center shrink-0">{icon}</span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">
                      {r.note?.trim() || r.category}
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500">
                      {r.category} · {r.frequency === "weekly" ? "Weekly" : "Monthly"} · next {formatDate(r.nextRunDate)}
                    </p>
                  </div>
                  <span
                    className={cn(
                      "text-sm font-semibold tabular-nums shrink-0",
                      r.type === "income" ? "text-emerald-600" : "text-gray-700 dark:text-gray-300"
                    )}
                  >
                    {r.type === "income" ? "+" : "−"}
                    {formatCurrency(r.amount)}
                  </span>

                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => toggleActive(r)}
                      className="p-1.5 rounded-lg text-gray-400 dark:text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                      aria-label={r.active ? "Pause" : "Resume"}
                      title={r.active ? "Pause" : "Resume"}
                    >
                      {r.active ? (
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      ) : (
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      )}
                    </button>
                    <button
                      onClick={() => { setEditing(r); setFormOpen(true); }}
                      className="p-1.5 rounded-lg text-gray-400 dark:text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                      aria-label="Edit"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => setDeleteId(r.id)}
                      className="p-1.5 rounded-lg text-gray-400 dark:text-gray-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                      aria-label="Delete"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        {error && <p className="text-sm text-rose-500 text-center py-4">{error}</p>}
      </div>

      <Modal
        isOpen={formOpen}
        onClose={() => { setFormOpen(false); setEditing(undefined); }}
        title={editing ? "Edit Recurring" : "New Recurring"}
      >
        <RecurringForm
          editing={editing}
          onSuccess={handleFormSuccess}
          onCancel={() => { setFormOpen(false); setEditing(undefined); }}
        />
      </Modal>

      <DeleteConfirmModal
        isOpen={deleteId !== null}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}
