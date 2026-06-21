"use client";

import { useState } from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import type { Goal, CreateGoalInput } from "@/types";

interface GoalFormProps {
  editing?: Goal;
  onSuccess: () => void;
  onCancel: () => void;
}

export function GoalForm({ editing, onSuccess, onCancel }: GoalFormProps) {
  const [name, setName] = useState(editing?.name ?? "");
  const [target, setTarget] = useState(editing ? String(editing.targetAmount) : "");
  const [current, setCurrent] = useState(editing ? String(editing.currentAmount) : "");
  const [deadline, setDeadline] = useState(editing?.deadline ? editing.deadline.slice(0, 10) : "");
  const [color, setColor] = useState(editing?.color ?? "#6366f1");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const targetNum = parseFloat(target);
    const currentNum = current ? parseFloat(current) : 0;
    if (!name.trim()) return setError("Enter a name.");
    if (isNaN(targetNum) || targetNum <= 0) return setError("Enter a positive target amount.");
    if (isNaN(currentNum) || currentNum < 0) return setError("Saved amount must be 0 or more.");

    setSubmitting(true);
    setError(null);
    const payload: CreateGoalInput = {
      name: name.trim(),
      targetAmount: targetNum,
      currentAmount: currentNum,
      deadline: deadline ? new Date(deadline).toISOString() : null,
      color,
    };
    try {
      const url = editing ? `/api/goals/${editing.id}` : "/api/goals";
      const method = editing ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const b = await res.json();
        setError(b.error ?? "Failed to save.");
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
      <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Vacation" />

      <div className="flex gap-3">
        <Input
          label="Target (€)"
          type="number"
          min="0.01"
          step="0.01"
          placeholder="0.00"
          value={target}
          onChange={(e) => setTarget(e.target.value)}
          className="flex-1"
        />
        <Input
          label="Saved so far (€)"
          type="number"
          min="0"
          step="0.01"
          placeholder="0.00"
          value={current}
          onChange={(e) => setCurrent(e.target.value)}
          className="flex-1"
        />
      </div>

      <div className="flex gap-3 items-end">
        <Input
          label="Deadline (optional)"
          type="date"
          value={deadline}
          onChange={(e) => setDeadline(e.target.value)}
          className="flex-1"
        />
        <div className="flex flex-col gap-1">
          <label htmlFor="goal-color" className="text-sm font-medium text-gray-700 dark:text-gray-300">Color</label>
          <input
            id="goal-color"
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="h-10 w-16 rounded-lg border border-gray-300 dark:border-gray-600 cursor-pointer bg-white dark:bg-gray-800 p-1"
          />
        </div>
      </div>

      {error && <p className="text-xs text-rose-600 dark:text-rose-400">{error}</p>}

      <div className="flex justify-end gap-3 pt-1">
        <Button variant="secondary" type="button" onClick={onCancel} disabled={submitting}>Cancel</Button>
        <Button variant="primary" type="submit" disabled={submitting}>
          {submitting ? "Saving…" : editing ? "Update" : "Add Goal"}
        </Button>
      </div>
    </form>
  );
}
