import { getSummary, getChartData } from "@/lib/db";
import { SummaryCards } from "@/components/dashboard/SummaryCards";
import { ExpensePieChart } from "@/components/dashboard/ExpensePieChart";
import { BalanceLineChart } from "@/components/dashboard/BalanceLineChart";
import { Card } from "@/components/ui/Card";

export default async function DashboardPage() {
  const [summary, chartData] = await Promise.all([
    getSummary(),
    getChartData(),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">Your financial overview</p>
      </div>

      <SummaryCards {...summary} />

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
