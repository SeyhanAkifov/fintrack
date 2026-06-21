/**
 * GoalsCard — dashboard widget showing progress toward savings goals.
 * Created:  2026-06-21
 * Modified: 2026-06-21
 */

import Link from "next/link";
import { formatCurrency } from "@/lib/utils";
import type { Goal } from "@/types";

interface GoalsCardProps {
  goals: Goal[];
}

// Compact dashboard widget showing progress bars for the user's savings goals.
export function GoalsCard({ goals }: GoalsCardProps) {
  return (
    <div className="rounded-2xl bg-white/70 dark:bg-gray-800/60 backdrop-blur border border-white dark:border-gray-700 shadow-sm px-6 py-4">
      <div className="flex items-center justify-between flex-wrap gap-3 mb-3">
        <div>
          <h3 className="font-semibold text-gray-900 dark:text-gray-100">Savings Goals</h3>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">Progress toward your targets</p>
        </div>
        <Link href="/goals" className="text-sm font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 flex items-center gap-1 shrink-0">
          {goals.length === 0 ? "Set up goals" : "Manage"}
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </Link>
      </div>

      {goals.length === 0 ? (
        <p className="text-sm text-gray-400 dark:text-gray-500 py-2">
          No goals yet. Set a target like “Vacation €2000”.
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {goals.slice(0, 4).map((g) => {
            const pct = g.targetAmount > 0 ? Math.min(100, (g.currentAmount / g.targetAmount) * 100) : 0;
            return (
              <div key={g.id}>
                <div className="flex items-center justify-between mb-1 text-sm">
                  <span className="font-medium text-gray-700 dark:text-gray-300 truncate">{g.name}</span>
                  <span className="text-xs text-gray-400 dark:text-gray-500 tabular-nums shrink-0 ml-2">
                    {formatCurrency(g.currentAmount)} / {formatCurrency(g.targetAmount)}
                  </span>
                </div>
                <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2">
                  <div className="h-2 rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: g.color }} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
