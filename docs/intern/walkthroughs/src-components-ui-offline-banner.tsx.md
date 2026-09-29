# Walkthrough: `src/components/ui/offline-banner.tsx`

## Why This File Matters
This file sits on a critical execution path for app behavior, data integrity, or user-facing workflow.

## Key Dependencies
- No imports in this file; behavior is mostly self-contained.

## Top 20-30% Code Walkthrough
The lines below were selected as the highest-impact section of this file.
- L3: `export function OfflineBanner({`
- Why it matters: Defines a reusable sync helper that encapsulates one behavior boundary.
- L14: `if (!isOffline && pending === 0) return null;`
- Why it matters: Branches behavior for validation, authorization, or state guards.
- L16: `return (`
- Why it matters: Returns computed state/value to the caller.

## Intern Checks
- Validate any change here against at least one route-level or UI-level flow in the app.
- Keep this file aligned with its paired contracts (Prisma schema, zod schema, or API response shape).
