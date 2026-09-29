import { NextRequest } from "next/server";
import { timeEntryCreateSchema } from "@/lib/schemas";
import { handleError, withUser } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { startTimerForUser, stopTimerForUser } from "@/lib/timer";
import { todayKey } from "@/lib/dates";

export async function POST(request: NextRequest) {
  const auth = await withUser();
  if (!auth.user) return auth.response!;

  try {
    const body = timeEntryCreateSchema.parse(await request.json());

    if (body.action === "start") {
      const entry = await startTimerForUser({
        userId: auth.user.id,
        taskId: body.taskId ?? null,
        note: body.note ?? null,
      });

      return Response.json({ entry }, { status: 201 });
    }

    if (body.action === "stop") {
      const entry = await stopTimerForUser({
        userId: auth.user.id,
        entryId: body.entryId,
      });

      if (!entry) {
        return Response.json({ error: "No running timer" }, { status: 404 });
      }

      return Response.json({ entry });
    }

    if (!body.startTs || !body.endTs) {
      return Response.json({ error: "startTs and endTs are required" }, { status: 400 });
    }

    const start = new Date(body.startTs);
    const end = new Date(body.endTs);

    if (end.getTime() <= start.getTime()) {
      return Response.json({ error: "End must be after start" }, { status: 400 });
    }

    const entry = await prisma.timeEntry.create({
      data: {
        userId: auth.user.id,
        date: body.date ?? todayKey(start),
        taskId: body.taskId ?? null,
        source: "MANUAL",
        startTs: start,
        endTs: end,
        note: body.note ?? null,
      },
    });

    return Response.json({ entry }, { status: 201 });
  } catch (error) {
    return handleError(error);
  }
}



