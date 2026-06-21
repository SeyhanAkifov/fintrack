import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/server/auth";
import { getRecurringTransactions, runDueRecurringTransactions } from "@/server/db";
import { RecurringManager } from "@/components/recurring/RecurringManager";
import type { RecurringTransaction } from "@/types";

export default async function RecurringPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/signin");

  const userId = Number(session.user.id);
  await runDueRecurringTransactions(userId);
  const raw = await getRecurringTransactions(userId);
  const recurring: RecurringTransaction[] = raw.map((r) => ({
    id: r.id,
    amount: r.amount,
    type: r.type,
    category: r.category,
    note: r.note,
    frequency: r.frequency,
    nextRunDate: r.nextRunDate.toISOString(),
    active: r.active,
  }));

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Recurring</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Automate repeating income and expenses — they post automatically when due.
        </p>
      </div>
      <RecurringManager initialRecurring={recurring} />
    </div>
  );
}
