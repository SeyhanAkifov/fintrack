import { getServerSession } from "next-auth";
import { authOptions } from "@/server/auth";
import { getBudgetStatus } from "@/server/db";

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const userId = Number(session.user.id);

  const { searchParams } = new URL(request.url);
  const now = new Date();
  const month = Number(searchParams.get("month") ?? now.getMonth() + 1);
  const year = Number(searchParams.get("year") ?? now.getFullYear());

  try {
    const statuses = await getBudgetStatus(userId, year, month);
    return Response.json(statuses);
  } catch {
    return Response.json({ error: "Failed to fetch budget status" }, { status: 500 });
  }
}
