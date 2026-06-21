import type { TransactionType } from "../../generated/enums";

export type { TransactionType };

export interface Transaction {
  id: number;
  amount: number;
  type: TransactionType;
  category: string;
  date: string;
  note: string | null;
  createdAt: string;
}

export interface FilterState {
  category?: string | null;
  type?: TransactionType | null;
  from?: string | null;
  to?: string | null;
}

export interface CategoryBreakdown {
  category: string;
  total: number;
  percentage: number;
}

export interface BalancePoint {
  date: string;
  balance: number;
}

export interface Summary {
  totalIncome: number;
  totalExpenses: number;
  balance: number;
}

export interface ChartData {
  pieData: CategoryBreakdown[];
  lineData: BalancePoint[];
}

export interface CreateTransactionInput {
  amount: number;
  type: TransactionType;
  category: string;
  date: string;
  note?: string | null;
}

export type UpdateTransactionInput = Partial<CreateTransactionInput>;

export interface Budget {
  id: number;
  category: string;
  limitAmount: number;
  month: number;
  year: number;
}

export interface BudgetStatus {
  id: number;
  category: string;
  limit: number;
  spent: number;
  remaining: number;
  percentUsed: number;
  isOverBudget: boolean;
}

export interface UpsertBudgetInput {
  category: string;
  limitAmount: number;
  month: number;
  year: number;
}

export interface Category {
  id: number;
  name: string;
  color: string;
  icon: string;
}

export interface CreateCategoryInput {
  name: string;
  color: string;
  icon: string;
}

export type UpdateCategoryInput = Partial<CreateCategoryInput>;

export interface CategoryInsight {
  category: string;
  thisMonth: number;
  lastMonth: number;
  delta: number;
  deltaPercent: number | null;
  isOverpaid: boolean;
}

export interface MonthlyInsights {
  thisMonthLabel: string;
  lastMonthLabel: string;
  comparisons: CategoryInsight[];
}
