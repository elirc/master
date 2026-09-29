# Walkthrough: `src/lib/prisma.ts`

## Why This File Matters
This file sits on a critical execution path for app behavior, data integrity, or user-facing workflow.

## Key Dependencies
- `import { PrismaClient } from "@prisma/client";`

## Top 20-30% Code Walkthrough
The lines below were selected as the highest-impact section of this file.
- L7: `export const prisma =`
- Why it matters: Declares exported configuration/state used by other modules.
- L13: `if (process.env.NODE_ENV !== "production") {`
- Why it matters: Branches behavior for validation, authorization, or state guards.

## Intern Checks
- Validate any change here against at least one route-level or UI-level flow in the app.
- Keep this file aligned with its paired contracts (Prisma schema, zod schema, or API response shape).
