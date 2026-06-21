import { getServerSession } from "next-auth";
import { authOptions } from "@/server/auth";
import { contributeToGoal } from "@/server/db";

type Params = { params: { id: string } };

export async function POST(request: Request, { params }: Params) {
  const session = await getServerSession(authOptions);
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const userId = Number(session.user.id);

  try {
    const body = (await request.json()) as { amount?: number };
    if (typeof body.amount !== "number" || body.amount === 0) {
      return Response.json({ error: "A non-zero amount is required" }, { status: 400 });
    }
    const goal = await contributeToGoal(Number(params.id), userId, body.amount);
    return Response.json(goal);
  } catch {
    return Response.json({ error: "Failed to contribute" }, { status: 500 });
  }
}
