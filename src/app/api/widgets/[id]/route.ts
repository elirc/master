import { NextRequest } from "next/server";
import { z } from "zod";
import { handleError, withUser } from "@/lib/api";
import { prisma } from "@/lib/prisma";

const patchSchema = z.object({
  sortOrder: z.number().int().min(0).optional(),
  visible: z.boolean().optional(),
  displayMode: z.enum(["ACTUAL", "PLANNED"]).optional(),
});

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await withUser();
  if (!auth.user) return auth.response!;

  try {
    const body = patchSchema.parse(await request.json());
    const { id } = await params;

    const updated = await prisma.dashboardWidget.updateMany({
      where: { id, userId: auth.user.id },
      data: body,
    });

    if (!updated.count) {
      return Response.json({ error: "Widget not found" }, { status: 404 });
    }

    const widget = await prisma.dashboardWidget.findUnique({ where: { id } });
    return Response.json({ widget });
  } catch (error) {
    return handleError(error);
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await withUser();
  if (!auth.user) return auth.response!;

  const { id } = await params;
  const deleted = await prisma.dashboardWidget.deleteMany({ where: { id, userId: auth.user.id } });
  if (!deleted.count) {
    return Response.json({ error: "Widget not found" }, { status: 404 });
  }

  return Response.json({ ok: true });
}



