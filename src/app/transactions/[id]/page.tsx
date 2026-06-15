import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/server/auth";
import { getTransactionById } from "@/server/db";
import { EditTransactionClient } from "./EditTransactionClient";
import type { Transaction } from "@/types";

interface Props {
  params: { id: string };
}

export default async function EditTransactionPage({ params }: Props) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/signin");

  const id = Number(params.id);
  if (isNaN(id)) notFound();

  const userId = Number(session.user.id);

  let transaction: Transaction;
  try {
    const raw = await getTransactionById(id, userId);
    transaction = {
      ...raw,
      date: raw.date.toISOString(),
      createdAt: raw.createdAt.toISOString(),
    };
  } catch {
    notFound();
  }

  return (
    <div className="max-w-lg mx-auto flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Edit Transaction</h1>
        <p className="text-sm text-gray-500 mt-1">Update the transaction details below</p>
      </div>
      <EditTransactionClient transaction={transaction} />
    </div>
  );
}
