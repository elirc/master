import { NextRequest } from "next/server";
import { withUser } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { todayKey } from "@/lib/dates";

export async function GET(request: NextRequest) {
  const auth = await withUser();
  if (!auth.user) return auth.response!;

  const date = request.nextUrl.searchParams.get("date") ?? todayKey();

  const entries = await prisma.timeEntry.findMany({
    where: {
      userId: auth.user.id,
      date,
      endTs: { not: null },
    },
    include: {
      task: {
        include: {
          project: true,
        },
      },
    },
  });

  const byTag = new Map<string, number>();
  const byProject = new Map<string, number>();
  const byTask = new Map<string, { title: string; min: number }>();

  for (const entry of entries) {
    if (!entry.endTs) continue;
    const min = Math.max(0, Math.round((entry.endTs.getTime() - entry.startTs.getTime()) / 60000));
    const tags = Array.isArray(entry.task?.tags) ? (entry.task?.tags as string[]) : [];

    for (const tag of tags) {
      byTag.set(tag, (byTag.get(tag) ?? 0) + min);
    }

    if (entry.task?.project) {
      byProject.set(entry.task.project.name, (byProject.get(entry.task.project.name) ?? 0) + min);
    }

    if (entry.task) {
      const current = byTask.get(entry.task.id) ?? { title: entry.task.title, min: 0 };
      current.min += min;
      byTask.set(entry.task.id, current);
    }
  }

  return Response.json({
    date,
    totalsByTag: [...byTag.entries()].map(([tag, min]) => ({ tag, min })).sort((a, b) => b.min - a.min),
    totalsByProject: [...byProject.entries()]
      .map(([project, min]) => ({ project, min }))
      .sort((a, b) => b.min - a.min),
    topTasks: [...byTask.values()].sort((a, b) => b.min - a.min).slice(0, 10),
  });
}



