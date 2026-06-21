import { getServerSession } from "next-auth";
import { authOptions } from "@/server/auth";
import { bulkCreateTransactions } from "@/server/db";
import type { ImportRow } from "@/types";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const userId = Number(session.user.id);

  try {
    const body = (await request.json()) as { rows?: ImportRow[] };
    if (!Array.isArray(body.rows)) {
      return Response.json({ error: "Expected a rows array" }, { status: 400 });
    }
    if (body.rows.length > 5000) {
      return Response.json({ error: "Too many rows (max 5000)" }, { status: 400 });
    }

    const result = await bulkCreateTransactions(body.rows, userId);
    return Response.json(result, { status: 201 });
  } catch {
    return Response.json({ error: "Import failed" }, { status: 500 });
  }
}
