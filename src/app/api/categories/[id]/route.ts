import { getServerSession } from "next-auth";
import { authOptions } from "@/server/auth";
import { updateCategory, deleteCategory, CategoryInUseError } from "@/server/db";
import type { UpdateCategoryInput } from "@/types";

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const userId = Number(session.user.id);

  try {
    const body = (await request.json()) as UpdateCategoryInput;
    const data: UpdateCategoryInput = {};
    if (body.name !== undefined) data.name = body.name.trim();
    if (body.color !== undefined) data.color = body.color;
    if (body.icon !== undefined) data.icon = body.icon;

    const category = await updateCategory(Number(params.id), userId, data);
    return Response.json(category);
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
    return Response.json({ error: "Failed to update category" }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const userId = Number(session.user.id);

  try {
    await deleteCategory(Number(params.id), userId);
    return new Response(null, { status: 204 });
  } catch (err) {
    if (err instanceof CategoryInUseError) {
      return Response.json(
        {
          error: `In use by ${err.usageCount} transaction(s)/budget(s) — reassign them first.`,
        },
        { status: 409 }
      );
    }
    return Response.json({ error: "Failed to delete category" }, { status: 500 });
  }
}
