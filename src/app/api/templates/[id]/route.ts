import { NextRequest } from "next/server";
import { templateSchema } from "@/lib/schemas";
import { handleError, withUser } from "@/lib/api";
import { prisma } from "@/lib/prisma";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await withUser();
  if (!auth.user) return auth.response!;

  try {
    const body = templateSchema.partial().parse(await request.json());
    const { id } = await params;

    const updated = await prisma.template.updateMany({
      where: { id, userId: auth.user.id },
      data: {
        name: body.name,
        weekdayMask: body.weekdayMask,
        dayTaskTemplate: body.dayTaskTemplate,
        scheduleTemplate: body.scheduleTemplate,
      },
    });

    if (!updated.count) {
      return Response.json({ error: "Template not found" }, { status: 404 });
    }

    const template = await prisma.template.findUnique({ where: { id } });
    return Response.json({ template });
  } catch (error) {
    return handleError(error);
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await withUser();
  if (!auth.user) return auth.response!;

  const { id } = await params;
  const deleted = await prisma.template.deleteMany({ where: { id, userId: auth.user.id } });
  if (!deleted.count) {
    return Response.json({ error: "Template not found" }, { status: 404 });
  }

  return Response.json({ ok: true });
}



