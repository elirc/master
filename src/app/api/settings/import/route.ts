import { NextRequest } from "next/server";
import { withUser } from "@/lib/api";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  const auth = await withUser();
  if (!auth.user) return auth.response!;

  const userId = auth.user.id;
  const body = (await request.json()) as Record<string, unknown>;

  await prisma.$transaction(async (tx) => {
    await tx.timeEntry.deleteMany({ where: { userId } });
    await tx.scheduleBlock.deleteMany({ where: { userId } });
    await tx.dayTask.deleteMany({ where: { userId } });
    await tx.dayPlan.deleteMany({ where: { userId } });
    await tx.dashboardWidget.deleteMany({ where: { userId } });
    await tx.goal.deleteMany({ where: { userId } });
    await tx.template.deleteMany({ where: { userId } });
    await tx.task.deleteMany({ where: { userId } });
    await tx.project.deleteMany({ where: { userId } });
    await tx.area.deleteMany({ where: { userId } });

    const areas = (body.areas as Record<string, unknown>[]) ?? [];
    if (areas.length) {
      await tx.area.createMany({ data: areas.map((item) => ({ ...item, userId })) as never[] });
    }

    const projects = (body.projects as Record<string, unknown>[]) ?? [];
    if (projects.length) {
      await tx.project.createMany({ data: projects.map((item) => ({ ...item, userId })) as never[] });
    }

    const tasks = (body.tasks as Record<string, unknown>[]) ?? [];
    if (tasks.length) {
      await tx.task.createMany({ data: tasks.map((item) => ({ ...item, userId })) as never[] });
    }

    const goals = (body.goals as Record<string, unknown>[]) ?? [];
    if (goals.length) {
      await tx.goal.createMany({ data: goals.map((item) => ({ ...item, userId })) as never[] });
    }

    const widgets = (body.widgets as Record<string, unknown>[]) ?? [];
    if (widgets.length) {
      await tx.dashboardWidget.createMany({ data: widgets.map((item) => ({ ...item, userId })) as never[] });
    }

    const dayPlans = (body.dayPlans as Record<string, unknown>[]) ?? [];
    if (dayPlans.length) {
      await tx.dayPlan.createMany({ data: dayPlans.map((item) => ({ ...item, userId })) as never[] });
    }

    const dayTasks = (body.dayTasks as Record<string, unknown>[]) ?? [];
    if (dayTasks.length) {
      await tx.dayTask.createMany({ data: dayTasks.map((item) => ({ ...item, userId })) as never[] });
    }

    const scheduleBlocks = (body.scheduleBlocks as Record<string, unknown>[]) ?? [];
    if (scheduleBlocks.length) {
      await tx.scheduleBlock.createMany({ data: scheduleBlocks.map((item) => ({ ...item, userId })) as never[] });
    }

    const timeEntries = (body.timeEntries as Record<string, unknown>[]) ?? [];
    if (timeEntries.length) {
      await tx.timeEntry.createMany({ data: timeEntries.map((item) => ({ ...item, userId })) as never[] });
    }

    const templates = (body.templates as Record<string, unknown>[]) ?? [];
    if (templates.length) {
      await tx.template.createMany({ data: templates.map((item) => ({ ...item, userId })) as never[] });
    }

    const settings = body.settings as Record<string, unknown> | null;
    if (settings) {
      await tx.userSettings.upsert({
        where: { userId },
        create: {
          userId,
          dayStartMin: Number(settings.dayStartMin ?? 360),
          dayEndMin: Number(settings.dayEndMin ?? 1380),
          timerRoundingMin: Number(settings.timerRoundingMin ?? 0),
        },
        update: {
          dayStartMin: Number(settings.dayStartMin ?? 360),
          dayEndMin: Number(settings.dayEndMin ?? 1380),
          timerRoundingMin: Number(settings.timerRoundingMin ?? 0),
        },
      });
    }
  });

  return Response.json({ ok: true });
}



