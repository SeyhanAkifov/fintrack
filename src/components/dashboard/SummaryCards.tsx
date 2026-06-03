"use client";

import { Card } from "@/components/ui/Card";
import { formatCurrency } from "@/lib/utils";
import type { Summary } from "@/types";

export function SummaryCards({ totalIncome, totalExpenses, balance }: Summary) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <Card title="Total Income">
        <p className="text-2xl font-bold text-green-600">{formatCurrency(totalIncome)}</p>
      </Card>
      <Card title="Total Expenses">
        <p className="text-2xl font-bold text-red-600">{formatCurrency(totalExpenses)}</p>
      </Card>
      <Card title="Balance">
        <p className={`text-2xl font-bold ${balance >= 0 ? "text-indigo-600" : "text-red-600"}`}>
          {formatCurrency(balance)}
        </p>
      </Card>
    </div>
  );
}
