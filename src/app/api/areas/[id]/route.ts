import { NextRequest } from "next/server";
import { z } from "zod";
import { handleError, withUser } from "@/lib/api";
import { prisma } from "@/lib/prisma";

const patchSchema = z.object({
  name: z.string().trim().min(1).max(120).optional(),
  order: z.number().int().min(0).optional(),
});

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await withUser();
  if (!auth.user) return auth.response!;

  try {
    const body = patchSchema.parse(await request.json());
    const { id } = await params;

    const updated = await prisma.area.updateMany({
      where: { id, userId: auth.user.id },
      data: {
        name: body.name,
        order: body.order,
      },
    });

    if (!updated.count) {
      return Response.json({ error: "Area not found" }, { status: 404 });
    }

    const area = await prisma.area.findUnique({ where: { id } });
    return Response.json({ area });
  } catch (error) {
    return handleError(error);
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await withUser();
  if (!auth.user) return auth.response!;

  const { id } = await params;

  const deleted = await prisma.area.deleteMany({ where: { id, userId: auth.user.id } });
  if (!deleted.count) {
    return Response.json({ error: "Area not found" }, { status: 404 });
  }

  return Response.json({ ok: true });
}



