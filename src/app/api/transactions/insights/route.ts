import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getMonthlyInsights } from "@/lib/db";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const insights = await getMonthlyInsights(Number(session.user.id));
    return Response.json(insights);
  } catch {
    return Response.json({ error: "Failed to fetch insights" }, { status: 500 });
  }
}
