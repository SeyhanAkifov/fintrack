"use client";

import { formatCurrency } from "@/lib/utils";
import type { MonthlyInsights } from "@/types";

interface InsightsCardProps {
  insights: MonthlyInsights;
}

export function InsightsCard({ insights }: InsightsCardProps) {
  const { thisMonthLabel, lastMonthLabel, comparisons } = insights;
  const overpaid = comparisons.filter((c) => c.isOverpaid);
  const increased = comparisons.filter((c) => c.delta > 0 && !c.isOverpaid);
  const decreased = comparisons.filter((c) => c.delta < 0);
  const unchanged = comparisons.filter((c) => c.delta === 0);

  if (comparisons.length === 0) {
    return (
      <div className="rounded-2xl bg-white/70 backdrop-blur border border-white shadow-sm p-6">
        <p className="text-sm text-gray-400 text-center py-4">
          No data to compare yet — add transactions for at least two months.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-white/70 backdrop-blur border border-white shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
        <div>
          <h3 className="font-semibold text-gray-900">Spending Insights</h3>
          <p className="text-xs text-gray-400 mt-0.5">{thisMonthLabel} vs {lastMonthLabel}</p>
        </div>
        <div className="flex items-center gap-2">
          {overpaid.length > 0 && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-100 px-3 py-1 text-xs font-semibold text-rose-600">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
              {overpaid.length} overpaid
            </span>
          )}
          {decreased.length > 0 && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-600">
              {decreased.length} reduced
            </span>
          )}
        </div>
      </div>

      {/* Rows */}
      <div className="divide-y divide-gray-50">
        {[...overpaid, ...increased, ...unchanged, ...decreased].map((c) => {
          const isUp = c.delta > 0;
          const isDown = c.delta < 0;
          const isOver = c.isOverpaid;

          return (
            <div key={c.category} className="flex items-center gap-4 px-6 py-3.5 hover:bg-gray-50/50 transition-colors">
              {/* Dot + category */}
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                  isOver ? "bg-rose-500" : isUp ? "bg-amber-400" : isDown ? "bg-emerald-500" : "bg-gray-300"
                }`} />
                <span className="text-sm font-medium text-gray-800">{c.category}</span>
                {isOver && (
                  <span className="text-xs font-semibold text-rose-600 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full">
                    Overpaid
                  </span>
                )}
              </div>

              {/* Arrow line */}
              <div className="hidden sm:flex items-center gap-2 text-xs text-gray-400">
                <span>{formatCurrency(c.lastMonth)}</span>
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
                <span className="text-gray-600 font-medium">{formatCurrency(c.thisMonth)}</span>
              </div>

              {/* Delta */}
              <div className={`flex items-center gap-1 text-sm font-bold tabular-nums min-w-[90px] justify-end ${
                isDown ? "text-emerald-600" : isUp ? "text-rose-500" : "text-gray-400"
              }`}>
                {isDown ? (
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                ) : isUp ? (
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
                  </svg>
                ) : null}
                <span>{formatCurrency(Math.abs(c.delta))}</span>
                {c.deltaPercent !== null && c.deltaPercent !== 0 && (
                  <span className="text-xs font-normal opacity-60">
                    ({Math.abs(c.deltaPercent).toFixed(0)}%)
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
