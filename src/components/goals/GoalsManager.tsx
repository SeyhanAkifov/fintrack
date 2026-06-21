"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { DeleteConfirmModal } from "@/components/transactions/DeleteConfirmModal";
import { GoalForm } from "./GoalForm";
import { useGoals } from "@/hooks/useGoals";
import { formatCurrency } from "@/lib/utils";
import type { Goal } from "@/types";

interface GoalsManagerProps {
  initialGoals: Goal[];
}

function monthsUntil(deadline: string): number {
  const now = new Date();
  const d = new Date(deadline);
  const months =
    (d.getFullYear() - now.getFullYear()) * 12 + (d.getMonth() - now.getMonth());
  return months;
}

function projection(goal: Goal): string | null {
  const remaining = goal.targetAmount - goal.currentAmount;
  if (remaining <= 0) return "🎉 Goal reached!";
  if (!goal.deadline) return null;
  const months = monthsUntil(goal.deadline);
  if (months < 0) return "Deadline passed";
  if (months === 0) return `${formatCurrency(remaining)} left this month`;
  return `${formatCurrency(remaining / months)} / month to reach it`;
}

export function GoalsManager({ initialGoals }: GoalsManagerProps) {
  const { goals, isLoading, error, refetch } = useGoals(initialGoals);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Goal | undefined>();
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [contributeGoal, setContributeGoal] = useState<Goal | null>(null);
  const [contributeAmount, setContributeAmount] = useState("");
  const [contributing, setContributing] = useState(false);

  const displayed = goals.length === 0 && isLoading ? initialGoals : goals;

  function handleFormSuccess() {
    setFormOpen(false);
    setEditing(undefined);
    refetch();
  }

  async function handleDeleteConfirm() {
    if (deleteId === null) return;
    await fetch(`/api/goals/${deleteId}`, { method: "DELETE" });
    setDeleteId(null);
    refetch();
  }

  async function submitContribution(e: React.FormEvent) {
    e.preventDefault();
    if (!contributeGoal) return;
    const amount = parseFloat(contributeAmount);
    if (isNaN(amount) || amount === 0) return;
    setContributing(true);
    await fetch(`/api/goals/${contributeGoal.id}/contribute`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount }),
    });
    setContributing(false);
    setContributeGoal(null);
    setContributeAmount("");
    refetch();
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white/70 dark:bg-gray-800/60 backdrop-blur rounded-2xl border border-white dark:border-gray-700 shadow-sm px-5 py-3.5">
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {displayed.length} goal{displayed.length === 1 ? "" : "s"}
        </span>
        <Button variant="primary" size="md" onClick={() => { setEditing(undefined); setFormOpen(true); }}>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Add Goal
        </Button>
      </div>

      {displayed.length === 0 ? (
        <div className="bg-white/70 dark:bg-gray-800/60 backdrop-blur rounded-2xl border border-white dark:border-gray-700 shadow-sm flex flex-col items-center justify-center py-16 gap-2 text-center px-4">
          <span className="text-3xl">🎯</span>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">No savings goals yet.</p>
          <p className="text-xs text-gray-400 dark:text-gray-500">Set a target and track your progress.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {displayed.map((g) => {
            const pct = g.targetAmount > 0 ? Math.min(100, (g.currentAmount / g.targetAmount) * 100) : 0;
            const proj = projection(g);
            const reached = g.currentAmount >= g.targetAmount;
            return (
              <div key={g.id} className="bg-white/70 dark:bg-gray-800/60 backdrop-blur rounded-2xl border border-white dark:border-gray-700 shadow-sm p-5 flex flex-col gap-3 group">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: g.color }} />
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100 truncate">{g.name}</h3>
                    </div>
                    {g.deadline && (
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                        by {new Date(g.deadline).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => { setEditing(g); setFormOpen(true); }} className="p-1.5 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-gray-700 transition-colors" aria-label="Edit">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button onClick={() => setDeleteId(g.id)} className="p-1.5 rounded-lg text-gray-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-gray-700 transition-colors" aria-label="Delete">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>

                <div>
                  <div className="flex items-baseline justify-between mb-1.5">
                    <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">{formatCurrency(g.currentAmount)}</span>
                    <span className="text-xs text-gray-400 dark:text-gray-500">of {formatCurrency(g.targetAmount)}</span>
                  </div>
                  <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2.5">
                    <div className="h-2.5 rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: g.color }} />
                  </div>
                  <div className="flex items-center justify-between mt-1.5">
                    <span className={"text-xs " + (reached ? "text-emerald-600 dark:text-emerald-400 font-medium" : "text-gray-400 dark:text-gray-500")}>
                      {proj ?? `${Math.round(pct)}% saved`}
                    </span>
                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400">{Math.round(pct)}%</span>
                  </div>
                </div>

                {!reached && (
                  <Button variant="secondary" size="sm" onClick={() => { setContributeGoal(g); setContributeAmount(""); }}>
                    + Contribute
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {error && <p className="text-sm text-rose-500 text-center py-2">{error}</p>}

      <Modal isOpen={formOpen} onClose={() => { setFormOpen(false); setEditing(undefined); }} title={editing ? "Edit Goal" : "New Goal"}>
        <GoalForm editing={editing} onSuccess={handleFormSuccess} onCancel={() => { setFormOpen(false); setEditing(undefined); }} />
      </Modal>

      <Modal isOpen={contributeGoal !== null} onClose={() => setContributeGoal(null)} title={`Contribute to ${contributeGoal?.name ?? ""}`}>
        <form onSubmit={submitContribution} className="flex flex-col gap-4">
          <Input
            label="Amount (€)"
            type="number"
            step="0.01"
            placeholder="0.00"
            value={contributeAmount}
            onChange={(e) => setContributeAmount(e.target.value)}
            autoFocus
          />
          <p className="text-xs text-gray-400 dark:text-gray-500">Use a negative amount to withdraw.</p>
          <div className="flex justify-end gap-3">
            <Button variant="secondary" type="button" onClick={() => setContributeGoal(null)}>Cancel</Button>
            <Button variant="primary" type="submit" disabled={contributing}>{contributing ? "Saving…" : "Add"}</Button>
          </div>
        </form>
      </Modal>

      <DeleteConfirmModal isOpen={deleteId !== null} onConfirm={handleDeleteConfirm} onCancel={() => setDeleteId(null)} />
    </div>
  );
}
