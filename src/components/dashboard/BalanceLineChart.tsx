"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";
import { formatCurrency } from "@/lib/utils";
import type { BalancePoint } from "@/types";

interface BalanceLineChartProps {
  data: BalancePoint[];
}

export function BalanceLineChart({ data }: BalanceLineChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-sm text-gray-400 dark:text-gray-500">
        No data yet.
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <AreaChart data={data} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
        <defs>
          <linearGradient id="balanceGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.15} />
            <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 11, fill: "#9ca3af" }}
          tickLine={false}
          axisLine={false}
          interval="preserveStartEnd"
        />
        <YAxis
          tick={{ fontSize: 11, fill: "#9ca3af" }}
          tickLine={false}
          axisLine={false}
          tickFormatter={(v) => `€${(v / 1000).toFixed(0)}k`}
          width={44}
        />
        <Tooltip
          formatter={(v) => [formatCurrency(v as number), "Balance"]}
          contentStyle={{
            borderRadius: "12px",
            border: "1px solid #f1f5f9",
            boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
            fontSize: "13px",
          }}
          labelStyle={{ color: "#6b7280", marginBottom: "4px" }}
        />
        <Area
          type="monotone"
          dataKey="balance"
          stroke="#6366f1"
          strokeWidth={2.5}
          fill="url(#balanceGradient)"
          dot={false}
          activeDot={{ r: 5, fill: "#6366f1", stroke: "white", strokeWidth: 2 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
