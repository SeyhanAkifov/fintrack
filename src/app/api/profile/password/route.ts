import { getServerSession } from "next-auth";
import { authOptions } from "@/server/auth";
import { changeUserPassword, InvalidPasswordError } from "@/server/db";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const userId = Number(session.user.id);

  try {
    const body = (await request.json()) as {
      currentPassword?: string;
      newPassword?: string;
    };

    if (!body.currentPassword || !body.newPassword) {
      return Response.json({ error: "Both passwords are required" }, { status: 400 });
    }
    if (body.newPassword.length < 8) {
      return Response.json(
        { error: "New password must be at least 8 characters" },
        { status: 400 }
      );
    }

    await changeUserPassword(userId, body.currentPassword, body.newPassword);
    return new Response(null, { status: 204 });
  } catch (err) {
    if (err instanceof InvalidPasswordError) {
      return Response.json({ error: "Current password is incorrect" }, { status: 400 });
    }
    return Response.json({ error: "Failed to change password" }, { status: 500 });
  }
}
