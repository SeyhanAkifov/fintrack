"use client";

import { formatCurrency } from "@/lib/utils";
import type { Summary } from "@/types";

export function SummaryCards({ totalIncome, totalExpenses, balance }: Summary) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 p-5 shadow-lg shadow-emerald-200">
        <div className="absolute -top-4 -right-4 w-24 h-24 rounded-full bg-white/10" />
        <div className="absolute -bottom-6 -right-2 w-16 h-16 rounded-full bg-white/10" />
        <div className="relative">
          <div className="flex items-center gap-2 mb-3">
            <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-white/20">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
            </span>
            <p className="text-sm font-medium text-white/80">Total Income</p>
          </div>
          <p className="text-2xl font-bold text-white">{formatCurrency(totalIncome)}</p>
        </div>
      </div>

      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-rose-400 to-pink-500 p-5 shadow-lg shadow-rose-200">
        <div className="absolute -top-4 -right-4 w-24 h-24 rounded-full bg-white/10" />
        <div className="absolute -bottom-6 -right-2 w-16 h-16 rounded-full bg-white/10" />
        <div className="relative">
          <div className="flex items-center gap-2 mb-3">
            <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-white/20">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M20 12H4" />
              </svg>
            </span>
            <p className="text-sm font-medium text-white/80">Total Expenses</p>
          </div>
          <p className="text-2xl font-bold text-white">{formatCurrency(totalExpenses)}</p>
        </div>
      </div>

      <div className={`relative overflow-hidden rounded-2xl p-5 shadow-lg ${
        balance >= 0
          ? "bg-gradient-to-br from-indigo-500 to-violet-600 shadow-indigo-200"
          : "bg-gradient-to-br from-orange-400 to-red-500 shadow-orange-200"
      }`}>
        <div className="absolute -top-4 -right-4 w-24 h-24 rounded-full bg-white/10" />
        <div className="absolute -bottom-6 -right-2 w-16 h-16 rounded-full bg-white/10" />
        <div className="relative">
          <div className="flex items-center gap-2 mb-3">
            <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-white/20">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
              </svg>
            </span>
            <p className="text-sm font-medium text-white/80">Balance</p>
          </div>
          <p className="text-2xl font-bold text-white">{formatCurrency(balance)}</p>
        </div>
      </div>
    </div>
  );
}
