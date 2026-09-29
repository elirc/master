import { NextRequest } from "next/server";
import { createSession, verifyPassword } from "@/lib/auth";
import { handleError } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { loginSchema } from "@/lib/schemas";

export async function POST(request: NextRequest) {
  try {
    const body = loginSchema.parse(await request.json());
    const normalized = body.username.toLowerCase();

    const user = await prisma.user.findUnique({ where: { username: normalized } });
    if (!user) {
      return Response.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const valid = await verifyPassword(body.password, user.passwordHash);
    if (!valid) {
      return Response.json({ error: "Invalid credentials" }, { status: 401 });
    }

    await createSession(user.id);
    return Response.json({ ok: true, user: { id: user.id, username: user.username } });
  } catch (error) {
    return handleError(error);
  }
}



