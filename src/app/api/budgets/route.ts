import { getServerSession } from "next-auth";
import { authOptions } from "@/server/auth";
import { upsertBudget, categoryExists } from "@/server/db";
import type { UpsertBudgetInput } from "@/types";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const userId = Number(session.user.id);

  try {
    const body = await request.json() as UpsertBudgetInput;

    if (!body.category || !body.limitAmount || !body.month || !body.year) {
      return Response.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (!(await categoryExists(body.category, userId))) {
      return Response.json({ error: "Unknown category" }, { status: 400 });
    }

    const budget = await upsertBudget(body, userId);
    return Response.json(budget, { status: 201 });
  } catch {
    return Response.json({ error: "Failed to save budget" }, { status: 500 });
  }
}
