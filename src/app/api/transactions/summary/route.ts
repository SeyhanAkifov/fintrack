import { getServerSession } from "next-auth";
import { authOptions } from "@/server/auth";
import { getSummary } from "@/server/db";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const summary = await getSummary(Number(session.user.id));
    return Response.json(summary);
  } catch {
    return Response.json({ error: "Failed to fetch summary" }, { status: 500 });
  }
}
