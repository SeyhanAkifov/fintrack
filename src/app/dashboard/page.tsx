import { getSummary, getChartData, getMonthlyInsights } from "@/lib/db";
import { SummaryCards } from "@/components/dashboard/SummaryCards";
import { ExpensePieChart } from "@/components/dashboard/ExpensePieChart";
import { BalanceLineChart } from "@/components/dashboard/BalanceLineChart";
import { InsightsCard } from "@/components/dashboard/InsightsCard";
import { Card } from "@/components/ui/Card";

export default async function DashboardPage() {
  const [summary, chartData, insights] = await Promise.all([
    getSummary(),
    getChartData(),
    getMonthlyInsights(),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
          Dashboard
        </h1>
        <p className="text-sm text-gray-400 mt-1">Your financial overview</p>
      </div>

      <SummaryCards {...summary} />
      <InsightsCard insights={insights} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card title="Expenses by Category">
          <ExpensePieChart data={chartData.pieData} />
        </Card>
        <Card title="Balance Over Time">
          <BalanceLineChart data={chartData.lineData} />
        </Card>
      </div>
    </div>
  );
}
