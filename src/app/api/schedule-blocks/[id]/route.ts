import { NextRequest } from "next/server";
import { scheduleBlockPatchSchema } from "@/lib/schemas";
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

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await withUser();
  if (!auth.user) return auth.response!;

  try {
    const body = scheduleBlockPatchSchema.parse(await request.json());
    const { id } = await params;

    const block = await prisma.scheduleBlock.findFirst({ where: { id, userId: auth.user.id } });
    if (!block) {
      return Response.json({ error: "Schedule block not found" }, { status: 404 });
    }

    const startMin = body.startMin ?? block.startMin;
    let endMin = body.endMin ?? block.endMin;

    if (body.extendByMin) {
      endMin = block.endMin + body.extendByMin;
    }

    if (endMin <= startMin) {
      return Response.json({ error: "End time must be after start time" }, { status: 400 });
    }

    if (startMin % 30 !== 0 || endMin % 30 !== 0) {
      return Response.json({ error: "Schedule blocks must be in 30-minute increments" }, { status: 400 });
    }

    const overlap = await hasOverlap(auth.user.id, block.date, startMin, endMin, block.id);
    if (overlap) {
      return Response.json({ error: "Cannot extend due to overlap" }, { status: 409 });
    }

    const updated = await prisma.scheduleBlock.update({
      where: { id: block.id },
      data: {
        startMin,
        endMin,
        taskId: body.taskId === undefined ? block.taskId : body.taskId,
        label: body.label === undefined ? block.label : body.label,
        locked: body.locked ?? block.locked,
      },
    });

    return Response.json({ block: updated });
  } catch (error) {
    return handleError(error);
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await withUser();
  if (!auth.user) return auth.response!;

  const { id } = await params;
  const deleted = await prisma.scheduleBlock.deleteMany({ where: { id, userId: auth.user.id } });
  if (!deleted.count) {
    return Response.json({ error: "Schedule block not found" }, { status: 404 });
  }

  return Response.json({ ok: true });
}



