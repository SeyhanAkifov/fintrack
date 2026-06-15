import { getServerSession } from "next-auth";
import { authOptions } from "@/server/auth";
import { deleteBudget } from "@/server/db";

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const userId = Number(session.user.id);

  try {
    await deleteBudget(Number(params.id), userId);
    return new Response(null, { status: 204 });
  } catch {
    return Response.json({ error: "Failed to delete budget" }, { status: 500 });
  }
}
