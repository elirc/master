import { NextRequest } from "next/server";
import { createSession, hashPassword } from "@/lib/auth";
import { handleError } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { signupSchema } from "@/lib/schemas";

export async function POST(request: NextRequest) {
  try {
    const body = signupSchema.parse(await request.json());
    const normalized = body.username.toLowerCase();

    const existing = await prisma.user.findUnique({ where: { username: normalized } });
    if (existing) {
      return Response.json({ error: "Username already exists" }, { status: 409 });
    }

    const user = await prisma.user.create({
      data: {
        username: normalized,
        passwordHash: await hashPassword(body.password),
        settings: {
          create: {
            dayStartMin: 6 * 60,
            dayEndMin: 23 * 60,
            timerRoundingMin: 0,
          },
        },
      },
    });

    await createSession(user.id);
    return Response.json({ ok: true, user: { id: user.id, username: user.username } }, { status: 201 });
  } catch (error) {
    return handleError(error);
  }
}



