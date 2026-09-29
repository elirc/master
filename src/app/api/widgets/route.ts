import { NextRequest } from "next/server";
import { widgetSchema } from "@/lib/schemas";
import { handleError, withUser } from "@/lib/api";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const auth = await withUser();
  if (!auth.user) return auth.response!;

  const widgets = await prisma.dashboardWidget.findMany({
    where: { userId: auth.user.id },
    orderBy: { sortOrder: "asc" },
    include: { goal: true },
  });

  return Response.json({ widgets });
}

export async function POST(request: NextRequest) {
  const auth = await withUser();
  if (!auth.user) return auth.response!;

  try {
    const body = widgetSchema.parse(await request.json());

    const widget = await prisma.dashboardWidget.upsert({
      where: {
        userId_goalId: {
          userId: auth.user.id,
          goalId: body.goalId,
        },
      },
      create: {
        userId: auth.user.id,
        goalId: body.goalId,
        sortOrder: body.sortOrder,
        visible: body.visible ?? true,
        displayMode: body.displayMode ?? "ACTUAL",
      },
      update: {
        sortOrder: body.sortOrder,
        visible: body.visible ?? true,
        displayMode: body.displayMode ?? "ACTUAL",
      },
    });

    return Response.json({ widget });
  } catch (error) {
    return handleError(error);
  }
}



