import { getServerSession } from "next-auth";
import { authOptions } from "@/server/auth";
import {
  getRecurringTransactions,
  createRecurringTransaction,
  categoryExists,
} from "@/server/db";
import type { CreateRecurringInput } from "@/types";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const userId = Number(session.user.id);

  const recurring = await getRecurringTransactions(userId);
  return Response.json(recurring);
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const userId = Number(session.user.id);

  try {
    const body = (await request.json()) as CreateRecurringInput;

    if (
      !body.amount ||
      !body.type ||
      !body.category ||
      !body.frequency ||
      !body.nextRunDate
    ) {
      return Response.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (!(await categoryExists(body.category, userId))) {
      return Response.json({ error: "Unknown category" }, { status: 400 });
    }

    const recurring = await createRecurringTransaction(body, userId);
    return Response.json(recurring, { status: 201 });
  } catch {
    return Response.json(
      { error: "Failed to create recurring transaction" },
      { status: 500 }
    );
  }
}
