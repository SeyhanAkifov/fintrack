import { prisma } from "./prisma";
import { TransactionType } from "../../generated/enums";
import type {
  FilterState,
  Summary,
  ChartData,
  CategoryBreakdown,
  BalancePoint,
  CreateTransactionInput,
  UpdateTransactionInput,
  CategoryInsight,
  MonthlyInsights,
} from "@/types";

export async function getTransactions(filters: FilterState = {}) {
  const where: Record<string, unknown> = {};

  if (filters.category) where.category = filters.category;
  if (filters.type) where.type = filters.type;
  if (filters.from || filters.to) {
    where.date = {
      ...(filters.from ? { gte: new Date(filters.from) } : {}),
      ...(filters.to ? { lte: new Date(filters.to) } : {}),
    };
  }

  return prisma.transaction.findMany({
    where,
    orderBy: { date: "desc" },
  });
}

export async function getTransactionById(id: number) {
  return prisma.transaction.findUniqueOrThrow({ where: { id } });
}

export async function createTransaction(data: CreateTransactionInput) {
  return prisma.transaction.create({
    data: {
      ...data,
      date: new Date(data.date),
    },
  });
}

export async function updateTransaction(
  id: number,
  data: UpdateTransactionInput
) {
  return prisma.transaction.update({
    where: { id },
    data: {
      ...data,
      ...(data.date ? { date: new Date(data.date) } : {}),
    },
  });
}

export async function deleteTransaction(id: number) {
  return prisma.transaction.delete({ where: { id } });
}

export async function getSummary(): Promise<Summary> {
  const [income, expense] = await Promise.all([
    prisma.transaction.aggregate({
      where: { type: TransactionType.income },
      _sum: { amount: true },
    }),
    prisma.transaction.aggregate({
      where: { type: TransactionType.expense },
      _sum: { amount: true },
    }),
  ]);

  const totalIncome = income._sum.amount ?? 0;
  const totalExpenses = expense._sum.amount ?? 0;

  return {
    totalIncome,
    totalExpenses,
    balance: totalIncome - totalExpenses,
  };
}

export async function getChartData(): Promise<ChartData> {
  const [grouped, all] = await Promise.all([
    prisma.transaction.groupBy({
      by: ["category"],
      where: { type: TransactionType.expense },
      _sum: { amount: true },
    }),
    prisma.transaction.findMany({
      orderBy: { date: "asc" },
    }),
  ]);

  const totalExpenses = grouped.reduce(
    (sum, g) => sum + (g._sum.amount ?? 0),
    0
  );

  const pieData: CategoryBreakdown[] = grouped.map((g) => {
    const total = g._sum.amount ?? 0;
    return {
      category: g.category,
      total,
      percentage: totalExpenses > 0 ? (total / totalExpenses) * 100 : 0,
    };
  });

  let running = 0;
  const lineData: BalancePoint[] = all.map((t) => {
    running += t.type === TransactionType.income ? t.amount : -t.amount;
    return {
      date: new Intl.DateTimeFormat("en-GB", {
        day: "2-digit",
        month: "short",
      }).format(t.date),
      balance: running,
    };
  });

  return { pieData, lineData };
}

export async function getMonthlyInsights(): Promise<MonthlyInsights> {
  const now = new Date();
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

  const [thisMonthData, lastMonthData] = await Promise.all([
    prisma.transaction.groupBy({
      by: ["category"],
      where: { type: TransactionType.expense, date: { gte: thisMonthStart } },
      _sum: { amount: true },
    }),
    prisma.transaction.groupBy({
      by: ["category"],
      where: { type: TransactionType.expense, date: { gte: lastMonthStart, lte: lastMonthEnd } },
      _sum: { amount: true },
    }),
  ]);

  const thisMap = new Map(thisMonthData.map((r) => [r.category, r._sum.amount ?? 0]));
  const lastMap = new Map(lastMonthData.map((r) => [r.category, r._sum.amount ?? 0]));

  const allCategories = new Set([...thisMap.keys(), ...lastMap.keys()]);

  const comparisons: CategoryInsight[] = Array.from(allCategories)
    .map((category) => {
      const thisMonth = thisMap.get(category) ?? 0;
      const lastMonth = lastMap.get(category) ?? 0;
      const delta = thisMonth - lastMonth;
      const deltaPercent = lastMonth > 0 ? (delta / lastMonth) * 100 : null;
      const isOverpaid = delta > 0 && (deltaPercent === null || deltaPercent > 20) && delta > 10;

      return { category, thisMonth, lastMonth, delta, deltaPercent, isOverpaid };
    })
    .sort((a, b) => b.delta - a.delta);

  const monthName = (d: Date) =>
    d.toLocaleString("en-GB", { month: "long", year: "numeric" });

  return {
    thisMonthLabel: monthName(now),
    lastMonthLabel: monthName(lastMonthStart),
    comparisons,
  };
}
