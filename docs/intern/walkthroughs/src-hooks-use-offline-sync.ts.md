# Walkthrough: `src/hooks/use-offline-sync.ts`

## Why This File Matters
This file sits on a critical execution path for app behavior, data integrity, or user-facing workflow.

## Key Dependencies
- `import { useCallback, useEffect, useMemo, useState } from "react";`
- `import { useQueryClient } from "@tanstack/react-query";`
- `import { apiFetch } from "@/lib/api-client";`
- `import { getPendingMutations, pendingCount, removeMutations } from "@/lib/offline/queue-db";`

## Top 20-30% Code Walkthrough
The lines below were selected as the highest-impact section of this file.
- L8: `export function useOfflineSync(userId: string | null | undefined) {`
- Why it matters: Defines a reusable sync helper that encapsulates one behavior boundary.
- L14: `const refreshCount = useCallback(async () => {`
- Why it matters: Memoizes a callback so consumers do not re-render unnecessarily.
- L15: `if (!userId) return;`
- Why it matters: Branches behavior for validation, authorization, or state guards.
- L16: `const count = await pendingCount(userId);`
- Why it matters: Contributes to control flow or state composition in this module.
- L20: `const runSync = useCallback(async () => {`
- Why it matters: Memoizes a callback so consumers do not re-render unnecessarily.
- L21: `if (!userId || !navigator.onLine || syncing) return;`
- Why it matters: Branches behavior for validation, authorization, or state guards.
- L23: `const mutations = await getPendingMutations(userId);`
- Why it matters: Contributes to control flow or state composition in this module.
- L24: `if (!mutations.length) {`
- Why it matters: Branches behavior for validation, authorization, or state guards.
- L32: `const result = await apiFetch<{ applied: string[]; failed: { id: string; error: string }[] }>("/api/sync", {`
- Why it matters: Calls the app API layer; request/response shape must match server contracts.
- L37: `if (result.applied.length) {`
- Why it matters: Branches behavior for validation, authorization, or state guards.
- L38: `await removeMutations(result.applied);`
- Why it matters: Contributes to control flow or state composition in this module.
- L39: `await queryClient.invalidateQueries();`
- Why it matters: Forces cached reads to refresh so UI reflects the latest persisted state.
- L45: `await refreshCount();`
- Why it matters: Contributes to control flow or state composition in this module.
- L49: `useEffect(() => {`
- Why it matters: Sets up side effects tied to lifecycle and dependency changes.
- L53: `if (!offline) {`
- Why it matters: Branches behavior for validation, authorization, or state guards.
- L62: `return () => {`
- Why it matters: Returns computed state/value to the caller.
- L68: `useEffect(() => {`
- Why it matters: Sets up side effects tied to lifecycle and dependency changes.
- L72: `return useMemo(`
- Why it matters: Returns computed state/value to the caller.

## Intern Checks
- Validate any change here against at least one route-level or UI-level flow in the app.
- Keep this file aligned with its paired contracts (Prisma schema, zod schema, or API response shape).
