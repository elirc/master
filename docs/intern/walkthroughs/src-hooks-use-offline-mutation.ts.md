# Walkthrough: `src/hooks/use-offline-mutation.ts`

## Why This File Matters
This file sits on a critical execution path for app behavior, data integrity, or user-facing workflow.

## Key Dependencies
- `import { useQueryClient } from "@tanstack/react-query";`
- `import { enqueueMutation, type OfflineMutation } from "@/lib/offline/queue-db";`

## Top 20-30% Code Walkthrough
The lines below were selected as the highest-impact section of this file.
- L6: `export function useOfflineMutation(userId: string) {`
- Why it matters: Defines a reusable sync helper that encapsulates one behavior boundary.
- L19: `if (!navigator.onLine) {`
- Why it matters: Branches behavior for validation, authorization, or state guards.
- L27: `await enqueueMutation(mutation);`
- Why it matters: Contributes to control flow or state composition in this module.
- L28: `return null;`
- Why it matters: Returns computed state/value to the caller.
- L31: `const res = await fetch(options.endpoint, {`
- Why it matters: Contributes to control flow or state composition in this module.
- L38: `if (!res.ok) {`
- Why it matters: Branches behavior for validation, authorization, or state guards.
- L39: `throw new Error((await res.json().catch(() => ({ error: "Request failed" }))).error ?? "Request failed");`
- Why it matters: Contributes to control flow or state composition in this module.
- L42: `const data = (await res.json()) as T;`
- Why it matters: Contributes to control flow or state composition in this module.
- L44: `await queryClient.invalidateQueries();`
- Why it matters: Forces cached reads to refresh so UI reflects the latest persisted state.
- L45: `return data;`
- Why it matters: Returns computed state/value to the caller.
- L48: `return { mutateWithQueue };`
- Why it matters: Returns computed state/value to the caller.

## Intern Checks
- Validate any change here against at least one route-level or UI-level flow in the app.
- Keep this file aligned with its paired contracts (Prisma schema, zod schema, or API response shape).
