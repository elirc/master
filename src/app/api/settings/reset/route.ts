import { withUser } from "@/lib/api";
import { prisma } from "@/lib/prisma";

export async function POST() {
  const auth = await withUser();
  if (!auth.user) return auth.response!;

  const userId = auth.user.id;

  await prisma.$transaction([
    prisma.timeEntry.deleteMany({ where: { userId } }),
    prisma.scheduleBlock.deleteMany({ where: { userId } }),
    prisma.dayTask.deleteMany({ where: { userId } }),
    prisma.dayPlan.deleteMany({ where: { userId } }),
    prisma.dashboardWidget.deleteMany({ where: { userId } }),
    prisma.goal.deleteMany({ where: { userId } }),
    prisma.template.deleteMany({ where: { userId } }),
    prisma.task.deleteMany({ where: { userId } }),
    prisma.project.deleteMany({ where: { userId } }),
    prisma.area.deleteMany({ where: { userId } }),
  ]);

  return Response.json({ ok: true });
}



