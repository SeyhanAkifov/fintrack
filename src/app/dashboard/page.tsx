import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/server/auth";
import { getSummary, getChartData, getMonthlyInsights, getBudgetStatus, getCategories, runDueRecurringTransactions, getUpcomingRecurring, getGoals } from "@/server/db";
import { SummaryCards } from "@/components/dashboard/SummaryCards";
import { ExpensePieChart } from "@/components/dashboard/ExpensePieChart";
import { BalanceLineChart } from "@/components/dashboard/BalanceLineChart";
import { InsightsCard } from "@/components/dashboard/InsightsCard";
import { BudgetHealthCard } from "@/components/dashboard/BudgetHealthCard";
import { UpcomingRecurringCard } from "@/components/dashboard/UpcomingRecurringCard";
import { GoalsCard } from "@/components/dashboard/GoalsCard";
import { Card } from "@/components/ui/Card";
import type { RecurringTransaction, Goal } from "@/types";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/signin");

  const userId = Number(session.user.id);
  const now = new Date();

  await runDueRecurringTransactions(userId);

  const [summary, chartData, insights, budgetStatuses, categories, upcomingRaw, goalsRaw] = await Promise.all([
    getSummary(userId),
    getChartData(userId),
    getMonthlyInsights(userId),
    getBudgetStatus(userId, now.getFullYear(), now.getMonth() + 1),
    getCategories(userId),
    getUpcomingRecurring(userId),
    getGoals(userId),
  ]);

  const categoryColors = Object.fromEntries(categories.map((c) => [c.name, c.color]));
  const categoryIcons = Object.fromEntries(categories.map((c) => [c.name, c.icon]));
  const upcoming: RecurringTransaction[] = upcomingRaw.map((r) => ({
    id: r.id,
    amount: r.amount,
    type: r.type,
    category: r.category,
    note: r.note,
    frequency: r.frequency,
    nextRunDate: r.nextRunDate.toISOString(),
    active: r.active,
  }));
  const goals: Goal[] = goalsRaw.map((g) => ({
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
        <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 bg-clip-text text-transparent">
          Dashboard
        </h1>
        <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Your financial overview</p>
      </div>

      <SummaryCards {...summary} />
      <BudgetHealthCard statuses={budgetStatuses} month={now.getMonth() + 1} year={now.getFullYear()} />
      <UpcomingRecurringCard upcoming={upcoming} icons={categoryIcons} />
      <GoalsCard goals={goals} />
      <InsightsCard insights={insights} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card title="Expenses by Category">
          <ExpensePieChart data={chartData.pieData} colorMap={categoryColors} />
        </Card>
        <Card title="Balance Over Time">
          <BalanceLineChart data={chartData.lineData} />
        </Card>
      </div>
    </div>
  );
}
