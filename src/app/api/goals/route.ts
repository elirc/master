import { NextRequest } from "next/server";
import { addDays, format, parseISO, startOfWeek } from "date-fns";
import { goalSchema } from "@/lib/schemas";
import { handleError, withUser } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { computeGoalActual, computeGoalPlanned } from "@/lib/goals";
import { todayKey } from "@/lib/dates";

function dateRangeForScope(date: string, scope: "DAILY" | "WEEKLY") {
  if (scope === "DAILY") return [date];

  const start = startOfWeek(parseISO(`${date}T00:00:00.000Z`), { weekStartsOn: 1 });
  const days: string[] = [];
  for (let i = 0; i < 7; i += 1) {
    days.push(format(addDays(start, i), "yyyy-MM-dd"));
  }
  return days;
}

export async function GET(request: NextRequest) {
  const auth = await withUser();
  if (!auth.user) return auth.response!;

  const date = request.nextUrl.searchParams.get("date") ?? todayKey();

  const [goals, widgets] = await Promise.all([
    prisma.goal.findMany({
      where: { userId: auth.user.id },
      orderBy: { createdAt: "asc" },
    }),
    prisma.dashboardWidget.findMany({
      where: { userId: auth.user.id },
      orderBy: { sortOrder: "asc" },
    }),
  ]);

  const data = await Promise.all(
    goals.map(async (goal) => {
      const dates = dateRangeForScope(date, goal.scope);

      const [entries, dayTasks] = await Promise.all([
        prisma.timeEntry.findMany({
          where: {
            userId: auth.user.id,
            date: { in: dates },
          },
          include: {
            task: {
              select: {
                projectId: true,
                tags: true,
              },
            },
          },
        }),
        prisma.dayTask.findMany({
          where: {
            userId: auth.user.id,
            date: { in: dates },
          },
          include: {
            task: {
              select: {
                projectId: true,
                tags: true,
              },
            },
          },
        }),
      ]);

      const widget = widgets.find((item) => item.goalId === goal.id);

      return {
        goal,
        widget: widget ?? null,
        actualMin: computeGoalActual(goal, entries),
        plannedMin: computeGoalPlanned(goal, dayTasks),
      };
    }),
  );

  return Response.json({
    goals,
    widgets,
    dashboard: data
      .filter((item) => item.goal.showOnDashboard)
      .map((item) => ({
        goalId: item.goal.id,
        widgetId: item.widget?.id ?? null,
        name: item.goal.name,
        targetMin: item.goal.targetMin,
        scope: item.goal.scope,
        actualMin: item.actualMin,
        plannedMin: item.plannedMin,
        visible: item.widget?.visible ?? true,
        sortOrder: item.widget?.sortOrder ?? 0,
        displayMode: item.widget?.displayMode ?? "ACTUAL",
      }))
      .sort((a, b) => a.sortOrder - b.sortOrder),
  });
}

export async function POST(request: NextRequest) {
  const auth = await withUser();
  if (!auth.user) return auth.response!;

  try {
    const body = goalSchema.parse(await request.json());

    const goal = await prisma.goal.create({
      data: {
        userId: auth.user.id,
        name: body.name,
        scope: body.scope,
        targetMin: body.targetMin,
        matchType: body.matchType,
        matchTagNames: body.matchTagNames ?? [],
        matchProjectIds: body.matchProjectIds ?? [],
        matchTaskIds: body.matchTaskIds ?? [],
        showOnDashboard: body.showOnDashboard ?? true,
      },
    });

    const order = await prisma.dashboardWidget.count({ where: { userId: auth.user.id } });

    await prisma.dashboardWidget.create({
      data: {
        userId: auth.user.id,
        goalId: goal.id,
        sortOrder: order,
        visible: true,
        displayMode: "ACTUAL",
      },
    });

    return Response.json({ goal }, { status: 201 });
  } catch (error) {
    return handleError(error);
  }
}



