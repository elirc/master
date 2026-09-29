import { NextRequest } from "next/server";
import { dayTaskPatchSchema } from "@/lib/schemas";
import { handleError, withUser } from "@/lib/api";
import { prisma } from "@/lib/prisma";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await withUser();
  if (!auth.user) return auth.response!;

  try {
    const body = dayTaskPatchSchema.parse(await request.json());
    const { id } = await params;

    const updated = await prisma.dayTask.updateMany({
      where: { id, userId: auth.user.id },
      data: body,
    });

    if (!updated.count) {
      return Response.json({ error: "Day task not found" }, { status: 404 });
    }

    const dayTask = await prisma.dayTask.findUnique({ where: { id } });
    return Response.json({ dayTask });
  } catch (error) {
    return handleError(error);
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await withUser();
  if (!auth.user) return auth.response!;

  const { id } = await params;
  const deleted = await prisma.dayTask.deleteMany({ where: { id, userId: auth.user.id } });
  if (!deleted.count) {
    return Response.json({ error: "Day task not found" }, { status: 404 });
  }

  return Response.json({ ok: true });
}



