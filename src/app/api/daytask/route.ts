import { NextRequest } from "next/server";
import { dayTaskCreateSchema } from "@/lib/schemas";
import { handleError, withUser } from "@/lib/api";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  const auth = await withUser();
  if (!auth.user) return auth.response!;

  try {
    const body = dayTaskCreateSchema.parse(await request.json());

    const existing = await prisma.dayTask.findUnique({
      where: {
        userId_date_taskId: {
          userId: auth.user.id,
          date: body.date,
          taskId: body.taskId,
        },
      },
    });

    if (existing) {
      return Response.json({ dayTask: existing });
    }

    const last = await prisma.dayTask.findFirst({
      where: { userId: auth.user.id, date: body.date },
      orderBy: { sortOrder: "desc" },
      select: { sortOrder: true },
    });

    const dayTask = await prisma.dayTask.create({
      data: {
        userId: auth.user.id,
        date: body.date,
        taskId: body.taskId,
        plannedMin: body.plannedMin ?? 30,
        sortOrder: body.sortOrder ?? (last?.sortOrder ?? -1) + 1,
        status: body.status ?? "ACTIVE",
      },
    });

    return Response.json({ dayTask }, { status: 201 });
  } catch (error) {
    return handleError(error);
  }
}



