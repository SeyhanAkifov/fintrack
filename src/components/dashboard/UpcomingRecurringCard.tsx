import Link from "next/link";
import { formatCurrency } from "@/lib/utils";
import type { RecurringTransaction } from "@/types";

interface UpcomingRecurringCardProps {
  upcoming: RecurringTransaction[];
  icons: Record<string, string>;
}

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
  }).format(new Date(iso));
}

export function UpcomingRecurringCard({ upcoming, icons }: UpcomingRecurringCardProps) {
  return (
    <div className="rounded-2xl bg-white/70 backdrop-blur border border-white shadow-sm px-6 py-4">
      <div className="flex items-center justify-between flex-wrap gap-3 mb-3">
        <div>
          <h3 className="font-semibold text-gray-900">Upcoming Payments</h3>
          <p className="text-xs text-gray-400 mt-0.5">
            Next scheduled recurring entries
          </p>
        </div>
        <Link
          href="/recurring"
          className="text-sm font-medium text-indigo-600 hover:text-indigo-700 flex items-center gap-1 shrink-0"
        >
          {upcoming.length === 0 ? "Set up recurring" : "Manage"}
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </Link>
      </div>

      {upcoming.length === 0 ? (
        <p className="text-sm text-gray-400 py-2">
          No recurring transactions yet. Automate rent, salary, subscriptions…
        </p>
      ) : (
        <div className="flex flex-col divide-y divide-gray-50">
          {upcoming.map((r) => (
            <div key={r.id} className="flex items-center gap-3 py-2.5">
              <span className="text-lg w-7 text-center shrink-0">
                {icons[r.category] ?? "🔁"}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-800 truncate">
                  {r.note?.trim() || r.category}
                </p>
                <p className="text-xs text-gray-400">
                  {formatDate(r.nextRunDate)} ·{" "}
                  {r.frequency === "weekly" ? "Weekly" : "Monthly"}
                </p>
              </div>
              <span
                className={
                  "text-sm font-semibold tabular-nums shrink-0 " +
                  (r.type === "income" ? "text-emerald-600" : "text-gray-700")
                }
              >
                {r.type === "income" ? "+" : "−"}
                {formatCurrency(r.amount)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
