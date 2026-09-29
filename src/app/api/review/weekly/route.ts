import { NextRequest } from "next/server";
import { addDays, format, parseISO, startOfWeek } from "date-fns";
import { withUser } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { computeGoalActual } from "@/lib/goals";
import { todayKey } from "@/lib/dates";

function weekDates(startInput?: string) {
  const seed = startInput ? parseISO(`${startInput}T00:00:00.000Z`) : new Date();
  const start = startOfWeek(seed, { weekStartsOn: 1 });
  return Array.from({ length: 7 }, (_, i) => format(addDays(start, i), "yyyy-MM-dd"));
}

export async function GET(request: NextRequest) {
  const auth = await withUser();
  if (!auth.user) return auth.response!;

  const start = request.nextUrl.searchParams.get("start") ?? todayKey();
  const days = weekDates(start);

  const [entries, goals] = await Promise.all([
    prisma.timeEntry.findMany({
      where: {
        userId: auth.user.id,
        date: { in: days },
        endTs: { not: null },
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
    prisma.goal.findMany({ where: { userId: auth.user.id } }),
  ]);

  const totalsByDay = days.map((date) => {
    const dayEntries = entries.filter((entry) => entry.date === date);
    const min = dayEntries.reduce((sum, entry) => {
      if (!entry.endTs) return sum;
      return sum + Math.max(0, Math.round((entry.endTs.getTime() - entry.startTs.getTime()) / 60000));
    }, 0);

    return { date, min };
  });

  const goalsMet = goals.map((goal) => {
    const actual = computeGoalActual(goal, entries);
    return {
      goalId: goal.id,
      name: goal.name,
      targetMin: goal.targetMin,
      actualMin: actual,
      met: actual >= goal.targetMin,
    };
  });

  const tags = new Map<string, number>();
  const projects = new Map<string, number>();

  for (const entry of entries) {
    if (!entry.endTs) continue;
    const min = Math.max(0, Math.round((entry.endTs.getTime() - entry.startTs.getTime()) / 60000));
    const entryTags = Array.isArray(entry.task?.tags) ? (entry.task?.tags as string[]) : [];

    for (const tag of entryTags) {
      tags.set(tag, (tags.get(tag) ?? 0) + min);
    }

    if (entry.task?.projectId) {
      projects.set(entry.task.projectId, (projects.get(entry.task.projectId) ?? 0) + min);
    }
  }

  return Response.json({
    start: days[0],
    end: days[6],
    totalsByDay,
    goalsMet,
    tags: [...tags.entries()].map(([tag, min]) => ({ tag, min })).sort((a, b) => b.min - a.min),
    projects: [...projects.entries()]
      .map(([projectId, min]) => ({ projectId, min }))
      .sort((a, b) => b.min - a.min),
  });
}



