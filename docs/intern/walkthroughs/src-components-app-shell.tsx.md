# Walkthrough: `src/components/app-shell.tsx`

## Why This File Matters
This file sits on a critical execution path for app behavior, data integrity, or user-facing workflow.

## Key Dependencies
- `import Link from "next/link";`
- `import { usePathname } from "next/navigation";`
- `import { cn } from "@/lib/utils";`
- `import { useOfflineSync } from "@/hooks/use-offline-sync";`
- `import { OfflineBanner } from "@/components/ui/offline-banner";`

## Top 20-30% Code Walkthrough
The lines below were selected as the highest-impact section of this file.
- L17: `export function AppShell({`
- Why it matters: Defines a reusable sync helper that encapsulates one behavior boundary.
- L27: `return (`
- Why it matters: Returns computed state/value to the caller.

## Intern Checks
- Validate any change here against at least one route-level or UI-level flow in the app.
- Keep this file aligned with its paired contracts (Prisma schema, zod schema, or API response shape).
