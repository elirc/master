# Walkthrough: `src/components/providers/app-providers.tsx`

## Why This File Matters
This file sits on a critical execution path for app behavior, data integrity, or user-facing workflow.

## Key Dependencies
- `import { useState } from "react";`
- `import { QueryClient, QueryClientProvider } from "@tanstack/react-query";`
- `import { ReactQueryDevtools } from "@tanstack/react-query-devtools";`
- `import { ToastProvider } from "@/hooks/use-toast";`
- `import { ToastViewport } from "@/components/ui/toast";`

## Top 20-30% Code Walkthrough
The lines below were selected as the highest-impact section of this file.
- L9: `export function AppProviders({ children }: { children: React.ReactNode }) {`
- Why it matters: Defines a reusable sync helper that encapsulates one behavior boundary.
- L23: `return (`
- Why it matters: Returns computed state/value to the caller.

## Intern Checks
- Validate any change here against at least one route-level or UI-level flow in the app.
- Keep this file aligned with its paired contracts (Prisma schema, zod schema, or API response shape).
