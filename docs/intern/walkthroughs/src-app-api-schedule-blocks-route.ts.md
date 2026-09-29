# Walkthrough: `src/app/api/schedule-blocks/route.ts`

## Why This File Matters
This file sits on a critical execution path for app behavior, data integrity, or user-facing workflow.

## Key Dependencies
- `import { NextRequest } from "next/server";`
- `import { scheduleBlockCreateSchema } from "@/lib/schemas";`
- `import { handleError, withUser } from "@/lib/api";`
- `import { prisma } from "@/lib/prisma";`

## Top 20-30% Code Walkthrough
The lines below were selected as the highest-impact section of this file.
- L2: `import { scheduleBlockCreateSchema } from "@/lib/schemas";`
- Why it matters: Validates input before business logic executes.
- L7: `const overlapping = await prisma.scheduleBlock.findFirst({`
- Why it matters: Reads persisted state from SQLite through Prisma.
- L17: `return Boolean(overlapping);`
- Why it matters: Returns computed state/value to the caller.
- L20: `export async function POST(request: NextRequest) {`
- Why it matters: Defines an async entry point that other modules or routes call.
- L21: `const auth = await withUser();`
- Why it matters: Fetches user context and enforces per-user scoping for downstream logic.
- L22: `if (!auth.user) return auth.response!;`
- Why it matters: Branches behavior for validation, authorization, or state guards.
- L25: `const body = scheduleBlockCreateSchema.parse(await request.json());`
- Why it matters: Validates input before business logic executes.
- L26: `if (body.endMin <= body.startMin) {`
- Why it matters: Branches behavior for validation, authorization, or state guards.
- L27: `return Response.json({ error: "End time must be after start time" }, { status: 400 });`
- Why it matters: Final API response shape returned to the client.
- L29: `if (body.startMin % 30 !== 0 || body.endMin % 30 !== 0) {`
- Why it matters: Branches behavior for validation, authorization, or state guards.
- L30: `return Response.json({ error: "Schedule blocks must be in 30-minute increments" }, { status: 400 });`
- Why it matters: Final API response shape returned to the client.
- L33: `const overlap = await hasOverlap(auth.user.id, body.date, body.startMin, body.endMin);`
- Why it matters: Contributes to control flow or state composition in this module.
- L34: `if (overlap) {`
- Why it matters: Branches behavior for validation, authorization, or state guards.
- L35: `return Response.json({ error: "Schedule block overlaps with another block" }, { status: 409 });`
- Why it matters: Final API response shape returned to the client.
- L38: `const block = await prisma.scheduleBlock.create({`
- Why it matters: Mutates persisted state in SQLite; check payload fields carefully before edits.

## Intern Checks
- Validate any change here against at least one route-level or UI-level flow in the app.
- Keep this file aligned with its paired contracts (Prisma schema, zod schema, or API response shape).
