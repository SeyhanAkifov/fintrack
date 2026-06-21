import { prisma } from "@/server/prisma";
import bcrypt from "bcryptjs";
import { DEFAULT_CATEGORIES } from "@/lib/categories";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      email: string;
      password: string;
      name?: string;
    };

    if (!body.email || !body.password) {
      return Response.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    if (body.password.length < 8) {
      return Response.json(
        { error: "Password must be at least 8 characters" },
        { status: 400 }
      );
    }

    const existing = await prisma.user.findUnique({
      where: { email: body.email.toLowerCase() },
    });

    if (existing) {
      return Response.json({ error: "Email already in use" }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(body.password, 12);

    const user = await prisma.user.create({
      data: {
        email: body.email.toLowerCase(),
        passwordHash,
        name: body.name ?? null,
      },
    });

    await prisma.category.createMany({
      data: DEFAULT_CATEGORIES.map((c) => ({ ...c, userId: user.id })),
    });

    return Response.json({ id: user.id, email: user.email }, { status: 201 });
  } catch {
    return Response.json({ error: "Registration failed" }, { status: 500 });
  }
}
