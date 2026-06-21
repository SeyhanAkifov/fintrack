import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/server/auth";
import { getGoals } from "@/server/db";
import { GoalsManager } from "@/components/goals/GoalsManager";
import type { Goal } from "@/types";

export default async function GoalsPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/signin");

  const userId = Number(session.user.id);
  const raw = await getGoals(userId);
  const goals: Goal[] = raw.map((g) => ({
    id: g.id,
    name: g.name,
    targetAmount: g.targetAmount,
    currentAmount: g.currentAmount,
    deadline: g.deadline ? g.deadline.toISOString() : null,
    color: g.color,
  }));

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Savings Goals</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Set targets, track progress, and see what you need to save each month.
        </p>
      </div>
      <GoalsManager initialGoals={goals} />
    </div>
  );
}
