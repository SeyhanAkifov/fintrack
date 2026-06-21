"use client";

/**
 * CategoryForm — form to create or edit a category (name, icon, color).
 * Created:  2026-06-21
 * Modified: 2026-06-21
 */


import { useState } from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { IconPicker, CATEGORY_ICONS } from "./IconPicker";
import { DEFAULT_CATEGORY_COLOR } from "@/lib/categories";
import type { Category } from "@/types";

interface CategoryFormProps {
  editing?: Category;
  onSuccess: () => void;
  onCancel: () => void;
}

// Form to create or edit a category (name, icon, color) with a live preview.
export function CategoryForm({ editing, onSuccess, onCancel }: CategoryFormProps) {
  const [name, setName] = useState(editing?.name ?? "");
  const [color, setColor] = useState(editing?.color ?? DEFAULT_CATEGORY_COLOR);
  const [icon, setIcon] = useState(editing?.icon ?? CATEGORY_ICONS[0]);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      setError("Enter a category name.");
      return;
    }
    if (!icon.trim()) {
      setError("Pick an icon.");
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      const url = editing ? `/api/categories/${editing.id}` : "/api/categories";
      const method = editing ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), color, icon: icon.trim() }),
      });
      if (!res.ok) {
        const body = await res.json();
        setError(body.error ?? "Failed to save category.");
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
      {/* Live preview */}
      <div className="flex items-center gap-3 rounded-lg bg-gray-50 px-4 py-3">
        <span
          className="flex items-center justify-center w-10 h-10 rounded-full text-xl shrink-0"
          style={{ backgroundColor: `${color}22` }}
        >
          {icon}
        </span>
        <span className="flex items-center gap-2 text-sm font-medium text-gray-800 dark:text-gray-200">
          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
          {name.trim() || "New category"}
        </span>
      </div>

      <Input
        label="Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="e.g. Groceries"
      />

      <IconPicker value={icon} onChange={setIcon} />

      <div className="flex flex-col gap-1">
        <label htmlFor="cat-color" className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Color
        </label>
        <div className="flex items-center gap-3">
          <input
            id="cat-color"
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="h-10 w-16 rounded-lg border border-gray-300 cursor-pointer bg-white p-1"
          />
          <span className="text-sm text-gray-500 dark:text-gray-400 tabular-nums">{color}</span>
        </div>
      </div>

      {error && <p className="text-xs text-rose-600">{error}</p>}

      <div className="flex justify-end gap-3 pt-1">
        <Button variant="secondary" type="button" onClick={onCancel} disabled={submitting}>
          Cancel
        </Button>
        <Button variant="primary" type="submit" disabled={submitting}>
          {submitting ? "Saving…" : editing ? "Update" : "Add Category"}
        </Button>
      </div>
    </form>
  );
}
