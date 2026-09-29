import { NextRequest } from "next/server";
import { scheduleBlockCreateSchema } from "@/lib/schemas";
import { handleError, withUser } from "@/lib/api";
import { prisma } from "@/lib/prisma";

async function hasOverlap(userId: string, date: string, startMin: number, endMin: number, ignoreId?: string) {
  const overlapping = await prisma.scheduleBlock.findFirst({
    where: {
      userId,
      date,
      id: ignoreId ? { not: ignoreId } : undefined,
      startMin: { lt: endMin },
      endMin: { gt: startMin },
    },
  });

  return Boolean(overlapping);
}

export async function POST(request: NextRequest) {
  const auth = await withUser();
  if (!auth.user) return auth.response!;

  try {
    const body = scheduleBlockCreateSchema.parse(await request.json());
    if (body.endMin <= body.startMin) {
      return Response.json({ error: "End time must be after start time" }, { status: 400 });
    }
    if (body.startMin % 30 !== 0 || body.endMin % 30 !== 0) {
      return Response.json({ error: "Schedule blocks must be in 30-minute increments" }, { status: 400 });
    }

    const overlap = await hasOverlap(auth.user.id, body.date, body.startMin, body.endMin);
    if (overlap) {
      return Response.json({ error: "Schedule block overlaps with another block" }, { status: 409 });
    }

    const block = await prisma.scheduleBlock.create({
      data: {
        userId: auth.user.id,
        date: body.date,
        startMin: body.startMin,
        endMin: body.endMin,
        taskId: body.taskId ?? null,
        label: body.label ?? null,
        locked: body.locked ?? true,
      },
    });

    return Response.json({ block }, { status: 201 });
  } catch (error) {
    return handleError(error);
  }
}



