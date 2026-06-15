import "server-only";
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
  BudgetStatus,
  UpsertBudgetInput,
} from "@/types";

export async function getTransactions(filters: FilterState = {}, userId: number) {
  const where: Record<string, unknown> = { userId };

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

export async function getTransactionById(id: number, userId: number) {
  return prisma.transaction.findFirstOrThrow({ where: { id, userId } });
}

export async function createTransaction(data: CreateTransactionInput, userId: number) {
  return prisma.transaction.create({
    data: {
      ...data,
      date: new Date(data.date),
      userId,
    },
  });
}

export async function updateTransaction(
  id: number,
  userId: number,
  data: UpdateTransactionInput
) {
  return prisma.transaction.update({
    where: { id, userId },
    data: {
      ...data,
      ...(data.date ? { date: new Date(data.date) } : {}),
    },
  });
}

export async function deleteTransaction(id: number, userId: number) {
  return prisma.transaction.deleteMany({ where: { id, userId } });
}

export async function getSummary(userId: number): Promise<Summary> {
  const [income, expense] = await Promise.all([
    prisma.transaction.aggregate({
      where: { userId, type: TransactionType.income },
      _sum: { amount: true },
    }),
    prisma.transaction.aggregate({
      where: { userId, type: TransactionType.expense },
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

export async function getChartData(userId: number): Promise<ChartData> {
  const [grouped, all] = await Promise.all([
    prisma.transaction.groupBy({
      by: ["category"],
      where: { userId, type: TransactionType.expense },
      _sum: { amount: true },
    }),
    prisma.transaction.findMany({
      where: { userId },
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

export async function getBudgetStatus(
  userId: number,
  year: number,
  month: number
): Promise<BudgetStatus[]> {
  const budgets = await prisma.budget.findMany({
    where: { userId, month, year },
    orderBy: { category: "asc" },
  });

  if (budgets.length === 0) return [];

  const from = new Date(year, month - 1, 1);
  const to = new Date(year, month, 0, 23, 59, 59);

  const spendingRaw = await prisma.transaction.groupBy({
    by: ["category"],
    where: { userId, type: TransactionType.expense, date: { gte: from, lte: to } },
    _sum: { amount: true },
  });

  const spendingMap = new Map(spendingRaw.map((r) => [r.category, r._sum.amount ?? 0]));

  return budgets.map((b) => {
    const spent = spendingMap.get(b.category) ?? 0;
    const remaining = b.limitAmount - spent;
    const percentUsed = b.limitAmount > 0 ? (spent / b.limitAmount) * 100 : 0;
    return {
      id: b.id,
      category: b.category,
      limit: b.limitAmount,
      spent,
      remaining,
      percentUsed,
      isOverBudget: spent > b.limitAmount,
    };
  });
}

export async function upsertBudget(data: UpsertBudgetInput, userId: number) {
  return prisma.budget.upsert({
    where: {
      userId_category_month_year: {
        userId,
        category: data.category,
        month: data.month,
        year: data.year,
      },
    },
    create: { ...data, userId },
    update: { limitAmount: data.limitAmount },
  });
}

export async function deleteBudget(id: number, userId: number) {
  return prisma.budget.deleteMany({ where: { id, userId } });
}

export async function getMonthlyInsights(userId: number): Promise<MonthlyInsights> {
  const now = new Date();
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

  const [thisMonthData, lastMonthData] = await Promise.all([
    prisma.transaction.groupBy({
      by: ["category"],
      where: { userId, type: TransactionType.expense, date: { gte: thisMonthStart } },
      _sum: { amount: true },
    }),
    prisma.transaction.groupBy({
      by: ["category"],
      where: { userId, type: TransactionType.expense, date: { gte: lastMonthStart, lte: lastMonthEnd } },
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
