"use client";

import { useRouter } from "next/navigation";
import { TransactionForm } from "@/components/transactions/TransactionForm";
import { Card } from "@/components/ui/Card";
import type { Transaction } from "@/types";

export function EditTransactionClient({ transaction }: { transaction: Transaction }) {
  const router = useRouter();

  return (
    <Card>
      <TransactionForm
        transaction={transaction}
        onSuccess={() => router.push("/transactions")}
        onCancel={() => router.push("/transactions")}
      />
    </Card>
  );
}
