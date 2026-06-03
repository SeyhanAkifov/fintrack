"use client";

import { useState } from "react";
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
  const { transactions, setTransactions, isLoading, error, refetch } =
    useTransactions(filters);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Transaction | undefined>();
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const displayedTransactions =
    isLoading && transactions.length === 0 ? initialTransactions : transactions;

  function handleFormSuccess(saved: Transaction) {
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
      <div className="flex items-center justify-between">
        <TransactionFilters filters={filters} onFilterChange={setFilters} />
        <Button
          variant="primary"
          size="md"
          onClick={() => { setEditing(undefined); setFormOpen(true); }}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Transaction
        </Button>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm divide-y divide-gray-50">
        {isLoading && displayedTransactions.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-12">Loading…</p>
        ) : displayedTransactions.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-12">No transactions found.</p>
        ) : (
          displayedTransactions.map((t) => (
            <TransactionRow
              key={t.id}
              transaction={t}
              onEdit={handleEdit}
              onDelete={setDeleteId}
            />
          ))
        )}
        {error && (
          <p className="text-sm text-red-500 text-center py-4">{error}</p>
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
