import { withUser } from "@/lib/api";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const auth = await withUser();
  if (!auth.user) return auth.response!;

  const userId = auth.user.id;

  const data = {
    exportedAt: new Date().toISOString(),
    userId,
    areas: await prisma.area.findMany({ where: { userId } }),
    projects: await prisma.project.findMany({ where: { userId } }),
    tasks: await prisma.task.findMany({ where: { userId } }),
    goals: await prisma.goal.findMany({ where: { userId } }),
    widgets: await prisma.dashboardWidget.findMany({ where: { userId } }),
    dayPlans: await prisma.dayPlan.findMany({ where: { userId } }),
    dayTasks: await prisma.dayTask.findMany({ where: { userId } }),
    scheduleBlocks: await prisma.scheduleBlock.findMany({ where: { userId } }),
    timeEntries: await prisma.timeEntry.findMany({ where: { userId } }),
    templates: await prisma.template.findMany({ where: { userId } }),
    settings: await prisma.userSettings.findUnique({ where: { userId } }),
  };

  return Response.json(data);
}



