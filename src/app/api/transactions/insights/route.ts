import { getMonthlyInsights } from "@/lib/db";

export async function GET() {
  try {
    const insights = await getMonthlyInsights();
    return Response.json(insights);
  } catch {
    return Response.json({ error: "Failed to fetch insights" }, { status: 500 });
  }
}
