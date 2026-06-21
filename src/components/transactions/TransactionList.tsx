"use client";

import { useState } from "react";
import Link from "next/link";
import { TransactionRow } from "./TransactionRow";
import { TransactionForm } from "./TransactionForm";
import { TransactionFilters } from "./TransactionFilters";
import { DeleteConfirmModal } from "./DeleteConfirmModal";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { useTransactions } from "@/hooks/useTransactions";
import type { FilterState, Transaction } from "@/types";

interface TransactionListProps {
  initialTransactions: Transaction[];
}

export function TransactionList({ initialTransactions }: TransactionListProps) {
  const [filters, setFilters] = useState<FilterState>({});
  const { transactions, isLoading, error, refetch } = useTransactions(filters);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Transaction | undefined>();
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const displayed = isLoading && transactions.length === 0 ? initialTransactions : transactions;

  function handleFormSuccess() {
    setFormOpen(false);
    setEditing(undefined);
    refetch();
  }

  function handleEdit(t: Transaction) {
    setEditing(t);
    setFormOpen(true);
  }

  async function handleDeleteConfirm() {
    if (deleteId === null) return;
    await fetch(`/api/transactions/${deleteId}`, { method: "DELETE" });
    setDeleteId(null);
    refetch();
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Filter bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white/70 backdrop-blur rounded-2xl border border-white shadow-sm px-5 py-3.5">
        <TransactionFilters filters={filters} onFilterChange={setFilters} />
        <div className="flex items-center gap-2">
          <Link href="/transactions/import">
            <Button variant="secondary" size="md">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              Import CSV
            </Button>
          </Link>
          <Button
            variant="primary"
            size="md"
            onClick={() => { setEditing(undefined); setFormOpen(true); }}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Add Transaction
          </Button>
        </div>
      </div>

      {/* List */}
      <div className="bg-white/70 backdrop-blur rounded-2xl border border-white shadow-sm overflow-hidden">
        {isLoading && displayed.length === 0 ? (
          <div className="flex items-center justify-center py-16 text-sm text-gray-400">
            Loading…
          </div>
        ) : displayed.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-2">
            <svg className="w-10 h-10 text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <p className="text-sm text-gray-400">No transactions found.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {displayed.map((t) => (
              <TransactionRow
                key={t.id}
                transaction={t}
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

      <Modal
        isOpen={formOpen}
        onClose={() => { setFormOpen(false); setEditing(undefined); }}
        title={editing ? "Edit Transaction" : "New Transaction"}
      >
        <TransactionForm
          transaction={editing}
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
