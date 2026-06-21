import { getServerSession } from "next-auth";
import { authOptions } from "@/server/auth";
import { getCategories, createCategory } from "@/server/db";
import type { CreateCategoryInput } from "@/types";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const userId = Number(session.user.id);

  const categories = await getCategories(userId);
  return Response.json(categories);
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const userId = Number(session.user.id);

  try {
    const body = (await request.json()) as CreateCategoryInput;

    if (!body.name?.trim() || !body.color || !body.icon) {
      return Response.json({ error: "Missing required fields" }, { status: 400 });
    }

    const category = await createCategory(
      { name: body.name.trim(), color: body.color, icon: body.icon },
      userId
    );
    return Response.json(category, { status: 201 });
  } catch (err) {
    if (
      err &&
      typeof err === "object" &&
      "code" in err &&
      (err as { code?: string }).code === "P2002"
    ) {
      return Response.json(
        { error: "A category with that name already exists" },
        { status: 409 }
      );
    }
    return Response.json({ error: "Failed to create category" }, { status: 500 });
  }
}
