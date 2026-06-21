import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/server/auth";
import { getBudgetStatus } from "@/server/db";
import { BudgetPlanner } from "@/components/budgets/BudgetPlanner";

export default async function BudgetsPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/signin");

  const userId = Number(session.user.id);
  const now = new Date();
  const initialStatuses = await getBudgetStatus(userId, now.getFullYear(), now.getMonth() + 1);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Budget Planner</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Set monthly spending limits per category.</p>
      </div>
      <BudgetPlanner
        initialStatuses={initialStatuses}
        initialYear={now.getFullYear()}
        initialMonth={now.getMonth() + 1}
      />
    </div>
  );
}
