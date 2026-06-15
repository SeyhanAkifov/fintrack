import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getTransactions, createTransaction } from "@/lib/db";
import type { FilterState, CreateTransactionInput, TransactionType } from "@/types";

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const userId = Number(session.user.id);

  try {
    const { searchParams } = new URL(request.url);

    const filters: FilterState = {
      category: searchParams.get("category"),
      type: searchParams.get("type") as TransactionType | null,
      from: searchParams.get("from"),
      to: searchParams.get("to"),
    };

    const transactions = await getTransactions(filters, userId);
    return Response.json(
      transactions.map((t) => ({ ...t, date: t.date.toISOString(), createdAt: t.createdAt.toISOString() }))
    );
  } catch {
    return Response.json({ error: "Failed to fetch transactions" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const userId = Number(session.user.id);

  try {
    const body = await request.json() as CreateTransactionInput;

    if (!body.amount || !body.type || !body.category || !body.date) {
      return Response.json({ error: "Missing required fields" }, { status: 400 });
    }

    const transaction = await createTransaction(body, userId);
    return Response.json(
      { ...transaction, date: transaction.date.toISOString(), createdAt: transaction.createdAt.toISOString() },
      { status: 201 }
    );
  } catch {
    return Response.json({ error: "Failed to create transaction" }, { status: 500 });
  }
}
