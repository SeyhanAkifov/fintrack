import { getChartData } from "@/lib/db";

export async function GET() {
  try {
    const data = await getChartData();
    return Response.json(data);
  } catch {
    return Response.json({ error: "Failed to fetch chart data" }, { status: 500 });
  }
}
