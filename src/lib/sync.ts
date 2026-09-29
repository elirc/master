import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

type SyncMutation = {
  id: string;
  userId: string;
  type: string;
  payload: Record<string, unknown>;
  createdAt: string;
};

function incomingTimestamp(payload: Record<string, unknown>, fallbackIso: string) {
  const value = typeof payload.updatedAt === "string" ? payload.updatedAt : fallbackIso;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed;
}

function shouldApplyLww(existingUpdatedAt: Date, incomingAt: Date | null) {
  if (!incomingAt) return true;
  return existingUpdatedAt.getTime() <= incomingAt.getTime();
}

async function applyMutation(tx: Prisma.TransactionClient, mutation: SyncMutation) {
  const { type, payload, userId } = mutation;
  const incomingAt = incomingTimestamp(payload, mutation.createdAt);

  switch (type) {
    case "daytask.create": {
      const key = {
        userId,
        date: payload.date as string,
        taskId: payload.taskId as string,
      };

      const existing = await tx.dayTask.findUnique({
        where: {
          userId_date_taskId: key,
        },
      });

      if (!existing) {
        await tx.dayTask.create({
          data: {
            ...key,
            plannedMin: Number(payload.plannedMin ?? 0),
            sortOrder: Number(payload.sortOrder ?? 0),
            status: (payload.status as "ACTIVE" | "COMPLETED") ?? "ACTIVE",
          },
        });
        return;
      }

      if (!shouldApplyLww(existing.updatedAt, incomingAt)) {
        return;
      }

      await tx.dayTask.update({
        where: { id: existing.id },
        data: {
          plannedMin: Number(payload.plannedMin ?? 0),
          sortOrder: Number(payload.sortOrder ?? 0),
          status: (payload.status as "ACTIVE" | "COMPLETED") ?? "ACTIVE",
        },
      });
      return;
    }
    case "daytask.update": {
      const existing = await tx.dayTask.findFirst({ where: { id: payload.id as string, userId } });
      if (!existing) throw new Error("Missing daytask");
      if (!shouldApplyLww(existing.updatedAt, incomingAt)) return;

      await tx.dayTask.update({
        where: { id: existing.id },
        data: {
          plannedMin: payload.plannedMin as number | undefined,
          sortOrder: payload.sortOrder as number | undefined,
          status: payload.status as "ACTIVE" | "COMPLETED" | undefined,
        },
      });
      return;
    }
    case "daytask.delete": {
      const existing = await tx.dayTask.findFirst({ where: { id: payload.id as string, userId } });
      if (!existing) throw new Error("Missing daytask");
      if (!shouldApplyLww(existing.updatedAt, incomingAt)) return;
      await tx.dayTask.delete({ where: { id: existing.id } });
      return;
    }
    case "schedule.create": {
      await tx.scheduleBlock.create({
        data: {
          userId,
          date: payload.date as string,
          startMin: Number(payload.startMin),
          endMin: Number(payload.endMin),
          taskId: (payload.taskId as string | null | undefined) ?? null,
          label: (payload.label as string | null | undefined) ?? null,
          locked: payload.locked === undefined ? true : Boolean(payload.locked),
        },
      });
      return;
    }
    case "schedule.update": {
      const existing = await tx.scheduleBlock.findFirst({ where: { id: payload.id as string, userId } });
      if (!existing) throw new Error("Missing schedule block");
      if (!shouldApplyLww(existing.updatedAt, incomingAt)) return;

      await tx.scheduleBlock.update({
        where: { id: existing.id },
        data: {
          startMin: payload.startMin as number | undefined,
          endMin: payload.endMin as number | undefined,
          taskId: payload.taskId as string | null | undefined,
          label: payload.label as string | null | undefined,
          locked: payload.locked as boolean | undefined,
        },
      });
      return;
    }
    case "schedule.delete": {
      const existing = await tx.scheduleBlock.findFirst({ where: { id: payload.id as string, userId } });
      if (!existing) throw new Error("Missing schedule block");
      if (!shouldApplyLww(existing.updatedAt, incomingAt)) return;
      await tx.scheduleBlock.delete({ where: { id: existing.id } });
      return;
    }
    case "time.create": {
      await tx.timeEntry.create({
        data: {
          userId,
          date: payload.date as string,
          taskId: (payload.taskId as string | null | undefined) ?? null,
          source: (payload.source as "TIMER" | "MANUAL") ?? "MANUAL",
          startTs: new Date(payload.startTs as string),
          endTs: payload.endTs ? new Date(payload.endTs as string) : null,
          note: (payload.note as string | null | undefined) ?? null,
        },
      });
      return;
    }
    case "time.update": {
      const existing = await tx.timeEntry.findFirst({ where: { id: payload.id as string, userId } });
      if (!existing) throw new Error("Missing time entry");
      if (!shouldApplyLww(existing.updatedAt, incomingAt)) return;

      await tx.timeEntry.update({
        where: { id: existing.id },
        data: {
          date: payload.date as string | undefined,
          taskId: payload.taskId as string | null | undefined,
          startTs: payload.startTs ? new Date(payload.startTs as string) : undefined,
          endTs: payload.endTs ? new Date(payload.endTs as string) : null,
          note: payload.note as string | null | undefined,
        },
      });
      return;
    }
    case "time.delete": {
      const existing = await tx.timeEntry.findFirst({ where: { id: payload.id as string, userId } });
      if (!existing) throw new Error("Missing time entry");
      if (!shouldApplyLww(existing.updatedAt, incomingAt)) return;
      await tx.timeEntry.delete({ where: { id: existing.id } });
      return;
    }
    default: {
      throw new Error(`Unsupported mutation type: ${type}`);
    }
  }
}

export async function replaySyncMutations(mutations: SyncMutation[]) {
  const applied: string[] = [];
  const failed: { id: string; error: string }[] = [];

  for (const mutation of mutations) {
    try {
      await prisma.$transaction(async (tx) => {
        await applyMutation(tx, mutation);
      });
      applied.push(mutation.id);
    } catch (error) {
      failed.push({
        id: mutation.id,
        error: error instanceof Error ? error.message : "Unknown sync error",
      });
    }
  }

  return { applied, failed };
}



