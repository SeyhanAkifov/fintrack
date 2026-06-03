"use client";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { formatCurrency } from "@/lib/utils";
import type { CategoryBreakdown } from "@/types";

const COLORS = [
  "#6366f1", // indigo
  "#f43f5e", // rose
  "#10b981", // emerald
  "#f59e0b", // amber
  "#3b82f6", // blue
  "#8b5cf6", // violet
  "#ec4899", // pink
  "#14b8a6", // teal
];

interface ExpensePieChartProps {
  data: CategoryBreakdown[];
}

export function ExpensePieChart({ data }: ExpensePieChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-sm text-gray-400">
        No expense data yet.
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <PieChart>
        <Pie
          data={data}
          dataKey="total"
          nameKey="category"
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={100}
          paddingAngle={3}
        >
          {data.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} stroke="white" strokeWidth={2} />
          ))}
        </Pie>
        <Tooltip
          formatter={(v) => [formatCurrency(v as number), ""]}
          contentStyle={{
            borderRadius: "12px",
            border: "1px solid #f1f5f9",
            boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
            fontSize: "13px",
          }}
        />
        <Legend
          iconType="circle"
          iconSize={8}
          formatter={(value) => (
            <span style={{ fontSize: "12px", color: "#6b7280" }}>{value}</span>
          )}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
