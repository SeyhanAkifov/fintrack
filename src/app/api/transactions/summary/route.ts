import { getSummary } from "@/lib/db";

export async function GET() {
  try {
    const summary = await getSummary();
    return Response.json(summary);
  } catch {
    return Response.json({ error: "Failed to fetch summary" }, { status: 500 });
  }
}
