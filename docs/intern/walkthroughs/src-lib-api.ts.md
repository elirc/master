# Walkthrough: `src/lib/api.ts`

## Why This File Matters
This file sits on a critical execution path for app behavior, data integrity, or user-facing workflow.

## Key Dependencies
- `import { ZodError } from "zod";`
- `import { requireUser } from "@/lib/auth";`
- `import { json } from "@/lib/utils";`

## Top 20-30% Code Walkthrough
The lines below were selected as the highest-impact section of this file.
- L5: `export async function withUser() {`
- Why it matters: Fetches user context and enforces per-user scoping for downstream logic.
- L6: `const user = await requireUser();`
- Why it matters: Contributes to control flow or state composition in this module.
- L7: `if (!user) {`
- Why it matters: Branches behavior for validation, authorization, or state guards.
- L8: `return { user: null, response: json({ error: "Unauthorized" }, { status: 401 }) };`
- Why it matters: Returns computed state/value to the caller.
- L10: `return { user, response: null };`
- Why it matters: Returns computed state/value to the caller.
- L13: `export function handleError(error: unknown) {`
- Why it matters: Defines a reusable sync helper that encapsulates one behavior boundary.
- L14: `if (error instanceof ZodError) {`
- Why it matters: Branches behavior for validation, authorization, or state guards.
- L15: `return json(`
- Why it matters: Returns computed state/value to the caller.
- L24: `if (error instanceof Error) {`
- Why it matters: Branches behavior for validation, authorization, or state guards.

## Intern Checks
- Validate any change here against at least one route-level or UI-level flow in the app.
- Keep this file aligned with its paired contracts (Prisma schema, zod schema, or API response shape).
