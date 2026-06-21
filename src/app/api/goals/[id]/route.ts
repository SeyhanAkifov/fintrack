import { getServerSession } from "next-auth";
import { authOptions } from "@/server/auth";
import { updateGoal, deleteGoal } from "@/server/db";
import type { UpdateGoalInput } from "@/types";

type Params = { params: { id: string } };

export async function PUT(request: Request, { params }: Params) {
  const session = await getServerSession(authOptions);
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const userId = Number(session.user.id);

  try {
    const body = (await request.json()) as UpdateGoalInput;
    const goal = await updateGoal(Number(params.id), userId, body);
    return Response.json(goal);
  } catch {
    return Response.json({ error: "Failed to update goal" }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  const session = await getServerSession(authOptions);
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const userId = Number(session.user.id);

  try {
    await deleteGoal(Number(params.id), userId);
    return new Response(null, { status: 204 });
  } catch {
    return Response.json({ error: "Failed to delete goal" }, { status: 500 });
  }
}
