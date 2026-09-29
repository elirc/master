# Walkthrough: `src/app/api/sync/route.ts`

## Why This File Matters
This file sits on a critical execution path for app behavior, data integrity, or user-facing workflow.

## Key Dependencies
- `import { NextRequest } from "next/server";`
- `import { handleError, withUser } from "@/lib/api";`
- `import { syncSchema } from "@/lib/schemas";`
- `import { replaySyncMutations } from "@/lib/sync";`

## Top 20-30% Code Walkthrough
The lines below were selected as the highest-impact section of this file.
- L3: `import { syncSchema } from "@/lib/schemas";`
- Why it matters: Validates input before business logic executes.
- L6: `export async function POST(request: NextRequest) {`
- Why it matters: Defines an async entry point that other modules or routes call.
- L7: `const auth = await withUser();`
- Why it matters: Fetches user context and enforces per-user scoping for downstream logic.
- L8: `if (!auth.user) return auth.response!;`
- Why it matters: Branches behavior for validation, authorization, or state guards.
- L11: `const body = syncSchema.parse(await request.json());`
- Why it matters: Validates input before business logic executes.
- L14: `const result = await replaySyncMutations(ownedMutations);`
- Why it matters: Contributes to control flow or state composition in this module.

## Intern Checks
- Validate any change here against at least one route-level or UI-level flow in the app.
- Keep this file aligned with its paired contracts (Prisma schema, zod schema, or API response shape).
