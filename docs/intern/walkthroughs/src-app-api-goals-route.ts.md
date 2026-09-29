# Walkthrough: `src/app/api/goals/route.ts`

## Why This File Matters
This file sits on a critical execution path for app behavior, data integrity, or user-facing workflow.

## Key Dependencies
- `import { NextRequest } from "next/server";`
- `import { addDays, format, parseISO, startOfWeek } from "date-fns";`
- `import { goalSchema } from "@/lib/schemas";`
- `import { handleError, withUser } from "@/lib/api";`
- `import { prisma } from "@/lib/prisma";`
- `import { computeGoalActual, computeGoalPlanned } from "@/lib/goals";`
- `import { todayKey } from "@/lib/dates";`

## Top 20-30% Code Walkthrough
The lines below were selected as the highest-impact section of this file.
- L3: `import { goalSchema } from "@/lib/schemas";`
- Why it matters: Validates input before business logic executes.
- L10: `if (scope === "DAILY") return [date];`
- Why it matters: Branches behavior for validation, authorization, or state guards.
- L17: `return days;`
- Why it matters: Returns computed state/value to the caller.
- L20: `export async function GET(request: NextRequest) {`
- Why it matters: Defines an async entry point that other modules or routes call.
- L21: `const auth = await withUser();`
- Why it matters: Fetches user context and enforces per-user scoping for downstream logic.
- L22: `if (!auth.user) return auth.response!;`
- Why it matters: Branches behavior for validation, authorization, or state guards.
- L26: `const [goals, widgets] = await Promise.all([`
- Why it matters: Runs independent async operations in parallel for lower latency.
- L27: `prisma.goal.findMany({`
- Why it matters: Reads persisted state from SQLite through Prisma.
- L28: `where: { userId: auth.user.id },`
- Why it matters: Contributes to control flow or state composition in this module.
- L29: `orderBy: { createdAt: "asc" },`
- Why it matters: Contributes to control flow or state composition in this module.
- L31: `prisma.dashboardWidget.findMany({`
- Why it matters: Reads persisted state from SQLite through Prisma.
- L32: `where: { userId: auth.user.id },`
- Why it matters: Contributes to control flow or state composition in this module.
- L33: `orderBy: { sortOrder: "asc" },`
- Why it matters: Contributes to control flow or state composition in this module.
- L37: `const data = await Promise.all(`
- Why it matters: Runs independent async operations in parallel for lower latency.
- L41: `const [entries, dayTasks] = await Promise.all([`
- Why it matters: Runs independent async operations in parallel for lower latency.
- L42: `prisma.timeEntry.findMany({`
- Why it matters: Reads persisted state from SQLite through Prisma.
- L43: `where: {`
- Why it matters: Contributes to control flow or state composition in this module.
- L47: `include: {`
- Why it matters: Contributes to control flow or state composition in this module.
- L56: `prisma.dayTask.findMany({`
- Why it matters: Reads persisted state from SQLite through Prisma.
- L57: `where: {`
- Why it matters: Contributes to control flow or state composition in this module.
- L61: `include: {`
- Why it matters: Contributes to control flow or state composition in this module.
- L74: `return {`
- Why it matters: Returns computed state/value to the caller.
- L83: `return Response.json({`
- Why it matters: Final API response shape returned to the client.
- L104: `export async function POST(request: NextRequest) {`
- Why it matters: Defines an async entry point that other modules or routes call.
- L105: `const auth = await withUser();`
- Why it matters: Fetches user context and enforces per-user scoping for downstream logic.
- L106: `if (!auth.user) return auth.response!;`
- Why it matters: Branches behavior for validation, authorization, or state guards.
- L109: `const body = goalSchema.parse(await request.json());`
- Why it matters: Validates input before business logic executes.
- L111: `const goal = await prisma.goal.create({`
- Why it matters: Mutates persisted state in SQLite; check payload fields carefully before edits.
- L125: `const order = await prisma.dashboardWidget.count({ where: { userId: auth.user.id } });`
- Why it matters: Touches persistent data through Prisma; this line changes or reads DB state.
- L127: `await prisma.dashboardWidget.create({`
- Why it matters: Mutates persisted state in SQLite; check payload fields carefully before edits.
- L137: `return Response.json({ goal }, { status: 201 });`
- Why it matters: Final API response shape returned to the client.
- L139: `return handleError(error);`
- Why it matters: Returns computed state/value to the caller.

## Intern Checks
- Validate any change here against at least one route-level or UI-level flow in the app.
- Keep this file aligned with its paired contracts (Prisma schema, zod schema, or API response shape).
