# Walkthrough: `src/lib/timer.ts`

## Why This File Matters
This file sits on a critical execution path for app behavior, data integrity, or user-facing workflow.

## Key Dependencies
- `import type { Prisma } from "@prisma/client";`
- `import { roundDate, todayKey } from "@/lib/dates";`
- `import { prisma } from "@/lib/prisma";`
- `import { buildStartTimerMutations } from "@/lib/timer-logic";`

## Top 20-30% Code Walkthrough
The lines below were selected as the highest-impact section of this file.
- L6: `export async function startTimerForUser(params: {`
- Why it matters: Defines an async entry point that other modules or routes call.
- L14: `(await prisma.userSettings.findUnique({ where: { userId: params.userId } })) ??`
- Why it matters: Reads persisted state from SQLite through Prisma.
- L17: `return prisma.$transaction(async (tx) => {`
- Why it matters: Starts an atomic DB unit-of-work so partial writes cannot escape.
- L18: `const runningEntries = await tx.timeEntry.findMany({`
- Why it matters: Contributes to control flow or state composition in this module.
- L19: `where: { userId: params.userId, endTs: null },`
- Why it matters: Contributes to control flow or state composition in this module.
- L25: `if (mutations.entriesToStop.length > 0) {`
- Why it matters: Branches behavior for validation, authorization, or state guards.
- L26: `await tx.timeEntry.updateMany({`
- Why it matters: Contributes to control flow or state composition in this module.
- L27: `where: { id: { in: mutations.entriesToStop } },`
- Why it matters: Contributes to control flow or state composition in this module.
- L32: `const entry = await tx.timeEntry.create({`
- Why it matters: Contributes to control flow or state composition in this module.
- L44: `return entry;`
- Why it matters: Returns computed state/value to the caller.
- L48: `export async function stopTimerForUser(params: {`
- Why it matters: Defines an async entry point that other modules or routes call.
- L54: `const settings = await prisma.userSettings.findUnique({ where: { userId: params.userId } });`
- Why it matters: Reads persisted state from SQLite through Prisma.
- L58: `? await prisma.timeEntry.findFirst({`
- Why it matters: Reads persisted state from SQLite through Prisma.
- L59: `where: {`
- Why it matters: Contributes to control flow or state composition in this module.
- L65: `: await prisma.timeEntry.findFirst({`
- Why it matters: Reads persisted state from SQLite through Prisma.
- L66: `where: {`
- Why it matters: Contributes to control flow or state composition in this module.
- L70: `orderBy: { startTs: "desc" },`
- Why it matters: Contributes to control flow or state composition in this module.
- L73: `if (!running) return null;`
- Why it matters: Branches behavior for validation, authorization, or state guards.
- L75: `return prisma.timeEntry.update({`
- Why it matters: Mutates persisted state in SQLite; check payload fields carefully before edits.
- L76: `where: { id: running.id },`
- Why it matters: Contributes to control flow or state composition in this module.

## Intern Checks
- Validate any change here against at least one route-level or UI-level flow in the app.
- Keep this file aligned with its paired contracts (Prisma schema, zod schema, or API response shape).
