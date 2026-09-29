# Walkthrough: `src/app/(app)/layout.tsx`

## Why This File Matters
This file sits on a critical execution path for app behavior, data integrity, or user-facing workflow.

## Key Dependencies
- `import { AppShell } from "@/components/app-shell";`
- `import { requireUserOrRedirect } from "@/lib/auth";`

## Top 20-30% Code Walkthrough
The lines below were selected as the highest-impact section of this file.
- L4: `export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {`
- Why it matters: Contributes to control flow or state composition in this module.
- L5: `const user = await requireUserOrRedirect();`
- Why it matters: Contributes to control flow or state composition in this module.
- L7: `return <AppShell user={{ id: user.id, username: user.username }}>{children}</AppShell>;`
- Why it matters: Returns computed state/value to the caller.

## Intern Checks
- Validate any change here against at least one route-level or UI-level flow in the app.
- Keep this file aligned with its paired contracts (Prisma schema, zod schema, or API response shape).
