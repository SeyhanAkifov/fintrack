import { getTransactions } from "@/lib/db";
import { TransactionList } from "@/components/transactions/TransactionList";
import type { Transaction } from "@/types";

export default async function TransactionsPage() {
  const raw = await getTransactions();
  const transactions: Transaction[] = raw.map((t) => ({
    ...t,
    date: t.date.toISOString(),
    createdAt: t.createdAt.toISOString(),
  }));

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Transactions</h1>
        <p className="text-sm text-gray-500 mt-1">
          {transactions.length} transaction{transactions.length !== 1 ? "s" : ""}
        </p>
      </div>
      <TransactionList initialTransactions={transactions} />
    </div>
  );
}
