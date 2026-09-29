import type { Prisma } from "@prisma/client";
import { roundDate, todayKey } from "@/lib/dates";
import { prisma } from "@/lib/prisma";
import { buildStartTimerMutations } from "@/lib/timer-logic";

export async function startTimerForUser(params: {
  userId: string;
  taskId?: string | null;
  note?: string | null;
  now?: Date;
}) {
  const now = params.now ?? new Date();
  const settings =
    (await prisma.userSettings.findUnique({ where: { userId: params.userId } })) ??
    ({ timerRoundingMin: 0 } satisfies Pick<Prisma.UserSettingsCreateInput, "timerRoundingMin">);

  return prisma.$transaction(async (tx) => {
    const runningEntries = await tx.timeEntry.findMany({
      where: { userId: params.userId, endTs: null },
      select: { id: true, startTs: true, endTs: true },
    });

    const mutations = buildStartTimerMutations(runningEntries, now, settings.timerRoundingMin);

    if (mutations.entriesToStop.length > 0) {
      await tx.timeEntry.updateMany({
        where: { id: { in: mutations.entriesToStop } },
        data: { endTs: mutations.stopAt },
      });
    }

    const entry = await tx.timeEntry.create({
      data: {
        userId: params.userId,
        taskId: params.taskId ?? null,
        note: params.note ?? null,
        source: "TIMER",
        date: todayKey(now),
        startTs: now,
        endTs: null,
      },
    });

    return entry;
  });
}

export async function stopTimerForUser(params: {
  userId: string;
  entryId?: string;
  now?: Date;
}) {
  const now = params.now ?? new Date();
  const settings = await prisma.userSettings.findUnique({ where: { userId: params.userId } });
  const rounded = roundDate(now, settings?.timerRoundingMin ?? 0);

  const running = params.entryId
    ? await prisma.timeEntry.findFirst({
        where: {
          id: params.entryId,
          userId: params.userId,
          endTs: null,
        },
      })
    : await prisma.timeEntry.findFirst({
        where: {
          userId: params.userId,
          endTs: null,
        },
        orderBy: { startTs: "desc" },
      });

  if (!running) return null;

  return prisma.timeEntry.update({
    where: { id: running.id },
    data: { endTs: rounded },
  });
}



