import type { TimeEntry } from "@prisma/client";
import { roundDate } from "@/lib/dates";

export type RunningEntry = Pick<TimeEntry, "id" | "startTs" | "endTs">;

export function buildStartTimerMutations(runningEntries: RunningEntry[], now: Date, roundingMin: number) {
  const stopAt = roundDate(now, roundingMin);

  return {
    stopAt,
    entriesToStop: runningEntries
      .filter((entry) => entry.endTs === null)
      .map((entry) => entry.id),
  };
}



