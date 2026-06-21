import { getServerSession } from "next-auth";
import { authOptions } from "@/server/auth";
import {
  updateRecurringTransaction,
  deleteRecurringTransaction,
  categoryExists,
} from "@/server/db";
import type { UpdateRecurringInput } from "@/types";

type Params = { params: { id: string } };

export async function PUT(request: Request, { params }: Params) {
  const session = await getServerSession(authOptions);
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const userId = Number(session.user.id);

  try {
    const body = (await request.json()) as UpdateRecurringInput;

    if (body.category && !(await categoryExists(body.category, userId))) {
      return Response.json({ error: "Unknown category" }, { status: 400 });
    }

    const recurring = await updateRecurringTransaction(
      Number(params.id),
      userId,
      body
    );
    return Response.json(recurring);
  } catch {
    return Response.json(
      { error: "Failed to update recurring transaction" },
      { status: 500 }
    );
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  const session = await getServerSession(authOptions);
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const userId = Number(session.user.id);

  try {
    await deleteRecurringTransaction(Number(params.id), userId);
    return new Response(null, { status: 204 });
  } catch {
    return Response.json(
      { error: "Failed to delete recurring transaction" },
      { status: 500 }
    );
  }
}
