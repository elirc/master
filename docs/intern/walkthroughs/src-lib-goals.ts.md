# Walkthrough: `src/lib/goals.ts`

## Why This File Matters
This file sits on a critical execution path for app behavior, data integrity, or user-facing workflow.

## Key Dependencies
- `import type { Goal, TimeEntry, DayTask } from "@prisma/client";`

## Top 20-30% Code Walkthrough
The lines below were selected as the highest-impact section of this file.
- L4: `if (!targets.length) return false;`
- Why it matters: Branches behavior for validation, authorization, or state guards.
- L6: `return list.some((item) => set.has(item));`
- Why it matters: Returns computed state/value to the caller.
- L9: `export function matchGoal(goal: Goal, data: { taskId: string | null; projectId: string | null; tags: string[] }) {`
- Why it matters: Defines a reusable sync helper that encapsulates one behavior boundary.
- L14: `if (goal.matchType === "TAG") return includesAny(data.tags, goalTags);`
- Why it matters: Branches behavior for validation, authorization, or state guards.
- L15: `if (goal.matchType === "PROJECT") return data.projectId ? goalProjects.includes(data.projectId) : false;`
- Why it matters: Branches behavior for validation, authorization, or state guards.
- L16: `if (goal.matchType === "TASK") return data.taskId ? goalTasks.includes(data.taskId) : false;`
- Why it matters: Branches behavior for validation, authorization, or state guards.
- L18: `return (`
- Why it matters: Returns computed state/value to the caller.
- L25: `export function computeGoalActual(goal: Goal, entries: (TimeEntry & { task: { projectId: string; tags: unknown } | null })[]) {`
- Why it matters: Defines a reusable sync helper that encapsulates one behavior boundary.
- L26: `return entries.reduce((sum, entry) => {`
- Why it matters: Returns computed state/value to the caller.
- L33: `if (!matches || !entry.endTs) return sum;`
- Why it matters: Branches behavior for validation, authorization, or state guards.
- L34: `return sum + Math.max(0, Math.round((entry.endTs.getTime() - entry.startTs.getTime()) / 60000));`
- Why it matters: Returns computed state/value to the caller.
- L38: `export function computeGoalPlanned(goal: Goal, dayTasks: (DayTask & { task: { projectId: string; tags: unknown } })[]) {`
- Why it matters: Defines a reusable sync helper that encapsulates one behavior boundary.
- L39: `return dayTasks.reduce((sum, item) => {`
- Why it matters: Returns computed state/value to the caller.

## Intern Checks
- Validate any change here against at least one route-level or UI-level flow in the app.
- Keep this file aligned with its paired contracts (Prisma schema, zod schema, or API response shape).
