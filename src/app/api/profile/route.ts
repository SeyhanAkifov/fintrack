import { getServerSession } from "next-auth";
import { authOptions } from "@/server/auth";
import { updateUserName } from "@/server/db";

export async function PUT(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const userId = Number(session.user.id);

  try {
    const body = (await request.json()) as { name?: string };
    if (typeof body.name !== "string") {
      return Response.json({ error: "Name is required" }, { status: 400 });
    }
    const user = await updateUserName(userId, body.name);
    return Response.json(user);
  } catch {
    return Response.json({ error: "Failed to update profile" }, { status: 500 });
  }
}
