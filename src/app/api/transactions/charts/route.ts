import { getServerSession } from "next-auth";
import { authOptions } from "@/server/auth";
import { getChartData } from "@/server/db";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const data = await getChartData(Number(session.user.id));
    return Response.json(data);
  } catch {
    return Response.json({ error: "Failed to fetch chart data" }, { status: 500 });
  }
}
