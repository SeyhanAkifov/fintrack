import {
  getTransactionById,
  updateTransaction,
  deleteTransaction,
} from "@/lib/db";
import type { UpdateTransactionInput } from "@/types";

type Params = { params: { id: string } };

export async function GET(_request: Request, { params }: Params) {
  try {
    const id = Number(params.id);
    const transaction = await getTransactionById(id);
    return Response.json({
      ...transaction,
      date: transaction.date.toISOString(),
      createdAt: transaction.createdAt.toISOString(),
    });
  } catch {
    return Response.json({ error: "Transaction not found" }, { status: 404 });
  }
}

export async function PUT(request: Request, { params }: Params) {
  try {
    const id = Number(params.id);
    const body = (await request.json()) as UpdateTransactionInput;
    const transaction = await updateTransaction(id, body);
    return Response.json({
      ...transaction,
      date: transaction.date.toISOString(),
      createdAt: transaction.createdAt.toISOString(),
    });
  } catch {
    return Response.json({ error: "Failed to update transaction" }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  try {
    const id = Number(params.id);
    await deleteTransaction(id);
    return new Response(null, { status: 204 });
  } catch {
    return Response.json({ error: "Transaction not found" }, { status: 404 });
  }
}
