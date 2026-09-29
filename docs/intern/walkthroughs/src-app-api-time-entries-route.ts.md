# Walkthrough: `src/app/api/time-entries/route.ts`

## Why This File Matters
This file sits on a critical execution path for app behavior, data integrity, or user-facing workflow.

## Key Dependencies
- `import { NextRequest } from "next/server";`
- `import { timeEntryCreateSchema } from "@/lib/schemas";`
- `import { handleError, withUser } from "@/lib/api";`
- `import { prisma } from "@/lib/prisma";`
- `import { startTimerForUser, stopTimerForUser } from "@/lib/timer";`
- `import { todayKey } from "@/lib/dates";`

## Top 20-30% Code Walkthrough
The lines below were selected as the highest-impact section of this file.
- L2: `import { timeEntryCreateSchema } from "@/lib/schemas";`
- Why it matters: Validates input before business logic executes.
- L8: `export async function POST(request: NextRequest) {`
- Why it matters: Defines an async entry point that other modules or routes call.
- L9: `const auth = await withUser();`
- Why it matters: Fetches user context and enforces per-user scoping for downstream logic.
- L10: `if (!auth.user) return auth.response!;`
- Why it matters: Branches behavior for validation, authorization, or state guards.
- L13: `const body = timeEntryCreateSchema.parse(await request.json());`
- Why it matters: Validates input before business logic executes.
- L15: `if (body.action === "start") {`
- Why it matters: Branches behavior for validation, authorization, or state guards.
- L16: `const entry = await startTimerForUser({`
- Why it matters: Contributes to control flow or state composition in this module.
- L22: `return Response.json({ entry }, { status: 201 });`
- Why it matters: Final API response shape returned to the client.
- L25: `if (body.action === "stop") {`
- Why it matters: Branches behavior for validation, authorization, or state guards.
- L26: `const entry = await stopTimerForUser({`
- Why it matters: Contributes to control flow or state composition in this module.
- L31: `if (!entry) {`
- Why it matters: Branches behavior for validation, authorization, or state guards.
- L32: `return Response.json({ error: "No running timer" }, { status: 404 });`
- Why it matters: Final API response shape returned to the client.
- L35: `return Response.json({ entry });`
- Why it matters: Final API response shape returned to the client.
- L38: `if (!body.startTs || !body.endTs) {`
- Why it matters: Branches behavior for validation, authorization, or state guards.
- L39: `return Response.json({ error: "startTs and endTs are required" }, { status: 400 });`
- Why it matters: Final API response shape returned to the client.
- L45: `if (end.getTime() <= start.getTime()) {`
- Why it matters: Branches behavior for validation, authorization, or state guards.
- L46: `return Response.json({ error: "End must be after start" }, { status: 400 });`
- Why it matters: Final API response shape returned to the client.
- L49: `const entry = await prisma.timeEntry.create({`
- Why it matters: Mutates persisted state in SQLite; check payload fields carefully before edits.

## Intern Checks
- Validate any change here against at least one route-level or UI-level flow in the app.
- Keep this file aligned with its paired contracts (Prisma schema, zod schema, or API response shape).
