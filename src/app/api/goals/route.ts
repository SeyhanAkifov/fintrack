import { getServerSession } from "next-auth";
import { authOptions } from "@/server/auth";
import { getGoals, createGoal } from "@/server/db";
import type { CreateGoalInput } from "@/types";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const userId = Number(session.user.id);

  const goals = await getGoals(userId);
  return Response.json(goals);
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const userId = Number(session.user.id);

  try {
    const body = (await request.json()) as CreateGoalInput;
    if (!body.name?.trim() || !body.targetAmount || body.targetAmount <= 0) {
      return Response.json({ error: "Name and a positive target are required" }, { status: 400 });
    }
    const goal = await createGoal(body, userId);
    return Response.json(goal, { status: 201 });
  } catch {
    return Response.json({ error: "Failed to create goal" }, { status: 500 });
  }
}
