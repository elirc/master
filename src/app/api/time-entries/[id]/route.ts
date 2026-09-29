import { NextRequest } from "next/server";
import { timeEntryPatchSchema } from "@/lib/schemas";
import { handleError, withUser } from "@/lib/api";
import { prisma } from "@/lib/prisma";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await withUser();
  if (!auth.user) return auth.response!;

  try {
    const body = timeEntryPatchSchema.parse(await request.json());
    const { id } = await params;

    const updated = await prisma.timeEntry.updateMany({
      where: { id, userId: auth.user.id },
      data: {
        date: body.date,
        taskId: body.taskId,
        startTs: body.startTs ? new Date(body.startTs) : undefined,
        endTs: body.endTs ? new Date(body.endTs) : body.endTs === null ? null : undefined,
        source: body.source,
        note: body.note,
      },
    });

    if (!updated.count) {
      return Response.json({ error: "Time entry not found" }, { status: 404 });
    }

    const entry = await prisma.timeEntry.findUnique({ where: { id } });
    return Response.json({ entry });
  } catch (error) {
    return handleError(error);
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await withUser();
  if (!auth.user) return auth.response!;

  const { id } = await params;
  const deleted = await prisma.timeEntry.deleteMany({ where: { id, userId: auth.user.id } });
  if (!deleted.count) {
    return Response.json({ error: "Time entry not found" }, { status: 404 });
  }

  return Response.json({ ok: true });
}



