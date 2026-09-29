import { NextRequest } from "next/server";
import { withUser } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { todayKey } from "@/lib/dates";

export async function GET(request: NextRequest) {
  const auth = await withUser();
  if (!auth.user) return auth.response!;

  const date = request.nextUrl.searchParams.get("date") ?? todayKey();

  const [dayPlan, dayTasks, scheduleBlocks, timeEntries, runningEntry] = await Promise.all([
    prisma.dayPlan.findUnique({
      where: {
        userId_date: {
          userId: auth.user.id,
          date,
        },
      },
    }),
    prisma.dayTask.findMany({
      where: {
        userId: auth.user.id,
        date,
      },
      orderBy: { sortOrder: "asc" },
      include: {
        task: {
          include: {
            project: {
              include: {
                area: true,
              },
            },
          },
        },
      },
    }),
    prisma.scheduleBlock.findMany({
      where: { userId: auth.user.id, date },
      orderBy: { startMin: "asc" },
    }),
    prisma.timeEntry.findMany({
      where: { userId: auth.user.id, date },
      orderBy: { startTs: "desc" },
    }),
    prisma.timeEntry.findFirst({
      where: { userId: auth.user.id, endTs: null },
      orderBy: { startTs: "desc" },
    }),
  ]);

  const actualByTask = new Map<string, number>();

  for (const entry of timeEntries) {
    if (!entry.taskId || !entry.endTs) continue;
    const min = Math.max(0, Math.round((entry.endTs.getTime() - entry.startTs.getTime()) / 60000));
    actualByTask.set(entry.taskId, (actualByTask.get(entry.taskId) ?? 0) + min);
  }

  const dayTaskItems = dayTasks.map((item) => ({
    ...item,
    task: {
      id: item.task.id,
      title: item.task.title,
      notes: item.task.notes,
      tags: Array.isArray(item.task.tags) ? item.task.tags : [],
      project: {
        id: item.task.project.id,
        name: item.task.project.name,
        area: {
          id: item.task.project.area.id,
          name: item.task.project.area.name,
        },
      },
    },
    actualMin: actualByTask.get(item.taskId) ?? 0,
  }));

  return Response.json({
    date,
    dayPlan,
    dayTasks: dayTaskItems,
    scheduleBlocks,
    timeEntries,
    runningEntry,
    totals: {
      plannedMin: dayTaskItems.reduce((sum, row) => sum + row.plannedMin, 0),
      actualMin: dayTaskItems.reduce((sum, row) => sum + row.actualMin, 0),
    },
  });
}



