"use client";

import { Button } from "@/components/ui/Button";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { Transaction } from "@/types";

interface TransactionRowProps {
  transaction: Transaction;
  onEdit: (transaction: Transaction) => void;
  onDelete: (id: number) => void;
}

export function TransactionRow({ transaction, onEdit, onDelete }: TransactionRowProps) {
  const isIncome = transaction.type === "income";

  return (
    <div className="flex items-center gap-4 px-5 py-3.5 hover:bg-gray-50/60 dark:hover:bg-gray-700/40 transition-colors group">
      {/* Icon */}
      <div className={`flex items-center justify-center w-9 h-9 rounded-xl shrink-0 ${
        isIncome
          ? "bg-emerald-100 text-emerald-600"
          : "bg-rose-100 text-rose-500"
      }`}>
        {isIncome ? (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
        ) : (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M20 12H4" />
          </svg>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium text-sm text-gray-900 dark:text-gray-100">{transaction.category}</span>
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
            isIncome ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-500"
          }`}>
            {isIncome ? "Income" : "Expense"}
          </span>
        </div>
        {transaction.note && (
          <p className="text-xs text-gray-400 dark:text-gray-500 truncate mt-0.5">{transaction.note}</p>
        )}
      </div>

      {/* Date */}
      <span className="hidden sm:block text-xs text-gray-400 dark:text-gray-500 shrink-0">
        {formatDate(transaction.date)}
      </span>

      {/* Amount */}
      <span className={`text-sm font-bold tabular-nums shrink-0 ${
        isIncome ? "text-emerald-600" : "text-rose-500"
      }`}>
        {isIncome ? "+" : "−"}{formatCurrency(transaction.amount)}
      </span>

      {/* Actions */}
      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={() => onEdit(transaction)}
          className="p-1.5 rounded-lg text-gray-400 dark:text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
          aria-label="Edit"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </button>
        <button
          onClick={() => onDelete(transaction.id)}
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
}
