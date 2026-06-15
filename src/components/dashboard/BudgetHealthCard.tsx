import Link from "next/link";
import type { BudgetStatus } from "@/types";

interface BudgetHealthCardProps {
  statuses: BudgetStatus[];
  month: number;
  year: number;
}

export function BudgetHealthCard({ statuses, month, year }: BudgetHealthCardProps) {
  const monthName = new Date(year, month - 1, 1).toLocaleString("en-GB", { month: "long" });

  if (statuses.length === 0) {
    return (
      <div className="rounded-2xl bg-white/70 backdrop-blur border border-white shadow-sm px-6 py-4 flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-gray-900">Budget Health</h3>
          <p className="text-xs text-gray-400 mt-0.5">No budgets set for {monthName}.</p>
        </div>
        <Link
          href="/budgets"
          className="text-sm font-medium text-indigo-600 hover:text-indigo-700 flex items-center gap-1 shrink-0"
        >
          Set up budgets
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </Link>
      </div>
    );
  }

  const overBudget = statuses.filter((s) => s.isOverBudget);
  const atRisk = statuses.filter((s) => !s.isOverBudget && s.percentUsed >= 70);
  const onTrack = statuses.filter((s) => !s.isOverBudget && s.percentUsed < 70);
  const allGood = overBudget.length === 0 && atRisk.length === 0;

  return (
    <div className="rounded-2xl bg-white/70 backdrop-blur border border-white shadow-sm px-6 py-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h3 className="font-semibold text-gray-900">Budget Health</h3>
          <p className="text-xs text-gray-400 mt-0.5">{monthName} {year}</p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {allGood ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              All {statuses.length} budgets on track
            </span>
          ) : (
            <>
              {onTrack.length > 0 && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  {onTrack.length} on track
                </span>
              )}
              {atRisk.length > 0 && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                  {atRisk.length} at risk
                </span>
              )}
              {overBudget.length > 0 && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-100 px-3 py-1 text-xs font-semibold text-rose-600">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                  {overBudget.length} over budget
                </span>
              )}
            </>
          )}

          <Link
            href="/budgets"
            className="text-sm font-medium text-indigo-600 hover:text-indigo-700 flex items-center gap-1 ml-1"
          >
            View budgets
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
}
