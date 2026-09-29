import { NextRequest } from "next/server";
import { z } from "zod";
import { handleError, withUser } from "@/lib/api";
import { prisma } from "@/lib/prisma";

const patchSchema = z.object({
  name: z.string().trim().min(1).max(120).optional(),
  scope: z.enum(["DAILY", "WEEKLY"]).optional(),
  targetMin: z.number().int().min(1).max(7 * 24 * 60).optional(),
  matchType: z.enum(["TAG", "PROJECT", "TASK", "CUSTOM"]).optional(),
  matchTagNames: z.array(z.string()).optional(),
  matchProjectIds: z.array(z.string()).optional(),
  matchTaskIds: z.array(z.string()).optional(),
  showOnDashboard: z.boolean().optional(),
});

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await withUser();
  if (!auth.user) return auth.response!;

  try {
    const body = patchSchema.parse(await request.json());
    const { id } = await params;

    const updated = await prisma.goal.updateMany({
      where: { id, userId: auth.user.id },
      data: body,
    });

    if (!updated.count) {
      return Response.json({ error: "Goal not found" }, { status: 404 });
    }

    const goal = await prisma.goal.findUnique({ where: { id } });
    return Response.json({ goal });
  } catch (error) {
    return handleError(error);
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await withUser();
  if (!auth.user) return auth.response!;

  const { id } = await params;

  const deleted = await prisma.goal.deleteMany({ where: { id, userId: auth.user.id } });
  if (!deleted.count) {
    return Response.json({ error: "Goal not found" }, { status: 404 });
  }

  await prisma.dashboardWidget.deleteMany({ where: { userId: auth.user.id, goalId: id } });

  return Response.json({ ok: true });
}



