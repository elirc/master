import { NextRequest } from "next/server";
import { z } from "zod";
import { handleError, withUser } from "@/lib/api";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  notes: z.string().max(4000).nullable().optional(),
});

export async function POST(request: NextRequest) {
  const auth = await withUser();
  if (!auth.user) return auth.response!;

  try {
    const body = schema.parse(await request.json());

    const dayPlan = await prisma.dayPlan.upsert({
      where: {
        userId_date: {
          userId: auth.user.id,
          date: body.date,
        },
      },
      create: {
        userId: auth.user.id,
        date: body.date,
        notes: body.notes ?? null,
      },
      update: {
        notes: body.notes ?? null,
      },
    });

    return Response.json({ dayPlan });
  } catch (error) {
    return handleError(error);
  }
}



