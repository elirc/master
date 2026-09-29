import type { Goal, TimeEntry, DayTask } from "@prisma/client";

function includesAny<T>(list: T[], targets: T[]) {
  if (!targets.length) return false;
  const set = new Set(targets);
  return list.some((item) => set.has(item));
}

export function matchGoal(goal: Goal, data: { taskId: string | null; projectId: string | null; tags: string[] }) {
  const goalTags = (goal.matchTagNames as string[]) ?? [];
  const goalProjects = (goal.matchProjectIds as string[]) ?? [];
  const goalTasks = (goal.matchTaskIds as string[]) ?? [];

  if (goal.matchType === "TAG") return includesAny(data.tags, goalTags);
  if (goal.matchType === "PROJECT") return data.projectId ? goalProjects.includes(data.projectId) : false;
  if (goal.matchType === "TASK") return data.taskId ? goalTasks.includes(data.taskId) : false;

  return (
    includesAny(data.tags, goalTags) ||
    (data.projectId ? goalProjects.includes(data.projectId) : false) ||
    (data.taskId ? goalTasks.includes(data.taskId) : false)
  );
}

export function computeGoalActual(goal: Goal, entries: (TimeEntry & { task: { projectId: string; tags: unknown } | null })[]) {
  return entries.reduce((sum, entry) => {
    const tags = Array.isArray(entry.task?.tags) ? (entry.task?.tags as string[]) : [];
    const matches = matchGoal(goal, {
      taskId: entry.taskId,
      projectId: entry.task?.projectId ?? null,
      tags,
    });
    if (!matches || !entry.endTs) return sum;
    return sum + Math.max(0, Math.round((entry.endTs.getTime() - entry.startTs.getTime()) / 60000));
  }, 0);
}

export function computeGoalPlanned(goal: Goal, dayTasks: (DayTask & { task: { projectId: string; tags: unknown } })[]) {
  return dayTasks.reduce((sum, item) => {
    const tags = Array.isArray(item.task.tags) ? (item.task.tags as string[]) : [];
    const matches = matchGoal(goal, {
      taskId: item.taskId,
      projectId: item.task.projectId,
      tags,
    });
    return matches ? sum + item.plannedMin : sum;
  }, 0);
}



