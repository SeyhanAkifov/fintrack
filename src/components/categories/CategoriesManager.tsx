"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { CategoryForm } from "./CategoryForm";
import { DEFAULT_CATEGORY_COLOR } from "@/lib/categories";
import type { Category } from "@/types";

interface CategoriesManagerProps {
  initialCategories: Category[];
}

export function CategoriesManager({ initialCategories }: CategoriesManagerProps) {
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Category | undefined>();
  const [error, setError] = useState<string | null>(null);

  async function refetch() {
    const res = await fetch("/api/categories");
    if (res.ok) setCategories(await res.json());
  }

  function handleFormSuccess() {
    setFormOpen(false);
    setEditing(undefined);
    refetch();
  }

  async function handleDelete(cat: Category) {
    setError(null);
    const res = await fetch(`/api/categories/${cat.id}`, { method: "DELETE" });
    if (res.status === 409) {
      const body = await res.json();
      setError(`Can't delete "${cat.name}": ${body.error}`);
      return;
    }
    if (!res.ok) {
      setError(`Failed to delete "${cat.name}".`);
      return;
    }
    refetch();
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white/70 dark:bg-gray-800/60 backdrop-blur rounded-2xl border border-white dark:border-gray-700 shadow-sm px-5 py-3.5">
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {categories.length} categor{categories.length === 1 ? "y" : "ies"}
        </span>
        <Button
          variant="primary"
          size="md"
          onClick={() => { setEditing(undefined); setFormOpen(true); }}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Add Category
        </Button>
      </div>

      {error && (
        <p className="text-sm text-rose-600 bg-rose-50 border border-rose-200 rounded-xl px-4 py-2.5">
          {error}
        </p>
      )}

      {/* Category list */}
      <div className="bg-white/70 dark:bg-gray-800/60 backdrop-blur rounded-2xl border border-white dark:border-gray-700 shadow-sm overflow-hidden">
        {categories.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-2">
            <p className="text-sm text-gray-400 dark:text-gray-500">No categories yet.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50 dark:divide-gray-700/50">
            {categories.map((cat) => (
              <div
                key={cat.id}
                className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50/60 dark:hover:bg-gray-700/40 transition-colors group"
              >
                <span className="text-xl w-7 text-center shrink-0">{cat.icon}</span>
                <span
                  className="w-3.5 h-3.5 rounded-full shrink-0"
                  style={{ backgroundColor: cat.color || DEFAULT_CATEGORY_COLOR }}
                />
                <span className="flex-1 text-sm font-medium text-gray-800 dark:text-gray-200 truncate">
                  {cat.name}
                </span>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => { setEditing(cat); setFormOpen(true); }}
                    className="p-1.5 rounded-lg text-gray-400 dark:text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                    aria-label={`Edit ${cat.name}`}
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleDelete(cat)}
                    className="p-1.5 rounded-lg text-gray-400 dark:text-gray-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                    aria-label={`Delete ${cat.name}`}
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal
        isOpen={formOpen}
        onClose={() => { setFormOpen(false); setEditing(undefined); }}
        title={editing ? "Edit Category" : "New Category"}
      >
        <CategoryForm
          editing={editing}
          onSuccess={handleFormSuccess}
          onCancel={() => { setFormOpen(false); setEditing(undefined); }}
        />
      </Modal>
    </div>
  );
}
