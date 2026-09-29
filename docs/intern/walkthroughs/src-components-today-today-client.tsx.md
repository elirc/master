# Walkthrough: `src/components/today/today-client.tsx`

## Why This File Matters
This file sits on a critical execution path for app behavior, data integrity, or user-facing workflow.

## Key Dependencies
- `import { useEffect, useMemo, useState } from "react";`
- `import { useQuery, useQueryClient } from "@tanstack/react-query";`
- `import { parseISO } from "date-fns";`
- `import { apiFetch, parseError } from "@/lib/api-client";`
- `import { buildTimeOptions, todayKey } from "@/lib/dates";`
- `import type { DayData, DayTaskItem, GoalWidgetData, ScheduleBlockItem, TimeEntryItem } from "@/types/api";`
- `import { GoalWidget } from "@/components/today/goal-widget";`
- `import { TaskRow } from "@/components/today/task-row";`

## Top 20-30% Code Walkthrough
The lines below were selected as the highest-impact section of this file.
- L25: `export function TodayClient() {`
- Why it matters: Defines a reusable sync helper that encapsulates one behavior boundary.
- L45: `const meQuery = useQuery({`
- Why it matters: Starts a cached data query; this drives UI state and refetch behavior.
- L52: `const dayQuery = useQuery({`
- Why it matters: Starts a cached data query; this drives UI state and refetch behavior.
- L57: `const goalsQuery = useQuery({`
- Why it matters: Starts a cached data query; this drives UI state and refetch behavior.
- L62: `const tasksQuery = useQuery({`
- Why it matters: Starts a cached data query; this drives UI state and refetch behavior.
- L67: `const displayedTasks = useMemo(() => {`
- Why it matters: Contributes to control flow or state composition in this module.
- L69: `return showCompleted ? rows : rows.filter((row) => row.status !== "COMPLETED");`
- Why it matters: Returns computed state/value to the caller.
- L72: `useEffect(() => {`
- Why it matters: Sets up side effects tied to lifecycle and dependency changes.
- L74: `if (running) {`
- Why it matters: Branches behavior for validation, authorization, or state guards.
- L82: `queryClient.setQueryData<DayData>(["day", date], (current) => (current ? update(current) : current));`
- Why it matters: Contributes to control flow or state composition in this module.
- L86: `if (!newTaskId) return;`
- Why it matters: Branches behavior for validation, authorization, or state guards.
- L89: `if (existing) {`
- Why it matters: Branches behavior for validation, authorization, or state guards.
- L97: `await offlineMutation.mutateWithQueue<{ dayTask: DayTaskItem }>({`
- Why it matters: Routes this write through online-or-queue logic for offline resilience.
- L109: `await queryClient.invalidateQueries({ queryKey: ["day", date] });`
- Why it matters: Forces cached reads to refresh so UI reflects the latest persisted state.
- L120: `await offlineMutation.mutateWithQueue<{ dayTask: DayTaskItem }>({`
- Why it matters: Routes this write through online-or-queue logic for offline resilience.
- L134: `await queryClient.invalidateQueries({ queryKey: ["day", date] });`
- Why it matters: Forces cached reads to refresh so UI reflects the latest persisted state.
- L140: `const data = await apiFetch<{ entry: TimeEntryItem }>("/api/time-entries", {`
- Why it matters: Calls the app API layer; request/response shape must match server contracts.
- L146: `await queryClient.invalidateQueries({ queryKey: ["day", date] });`
- Why it matters: Forces cached reads to refresh so UI reflects the latest persisted state.
- L154: `await apiFetch<{ entry: TimeEntryItem }>("/api/time-entries", {`
- Why it matters: Calls the app API layer; request/response shape must match server contracts.
- L160: `await queryClient.invalidateQueries({ queryKey: ["day", date] });`
- Why it matters: Forces cached reads to refresh so UI reflects the latest persisted state.
- L161: `await queryClient.invalidateQueries({ queryKey: ["goals", date] });`
- Why it matters: Forces cached reads to refresh so UI reflects the latest persisted state.
- L169: `await offlineMutation.mutateWithQueue<{ dayTask: DayTaskItem }>({`
- Why it matters: Routes this write through online-or-queue logic for offline resilience.
- L188: `if (selectedBlock) {`
- Why it matters: Branches behavior for validation, authorization, or state guards.
- L189: `if (selectedBlock.taskId && selectedBlock.taskId !== item.taskId) {`
- Why it matters: Branches behavior for validation, authorization, or state guards.
- L191: `if (!approved) {`
- Why it matters: Branches behavior for validation, authorization, or state guards.
- L197: `await offlineMutation.mutateWithQueue<{ block: ScheduleBlockItem }>({`
- Why it matters: Routes this write through online-or-queue logic for offline resilience.
- L212: `await queryClient.invalidateQueries({ queryKey: ["goals", date] });`
- Why it matters: Forces cached reads to refresh so UI reflects the latest persisted state.
- L215: `await queryClient.invalidateQueries({ queryKey: ["day", date] });`
- Why it matters: Forces cached reads to refresh so UI reflects the latest persisted state.
- L243: `if (parseISO(endTs).getTime() <= parseISO(startTs).getTime()) {`
- Why it matters: Branches behavior for validation, authorization, or state guards.
- L249: `if (editingEntry) {`
- Why it matters: Branches behavior for validation, authorization, or state guards.
- L250: `await offlineMutation.mutateWithQueue<{ entry: TimeEntryItem }>({`
- Why it matters: Routes this write through online-or-queue logic for offline resilience.
- L264: `await offlineMutation.mutateWithQueue<{ entry: TimeEntryItem }>({`
- Why it matters: Routes this write through online-or-queue logic for offline resilience.
- L281: `await queryClient.invalidateQueries({ queryKey: ["day", date] });`
- Why it matters: Forces cached reads to refresh so UI reflects the latest persisted state.
- L282: `await queryClient.invalidateQueries({ queryKey: ["goals", date] });`
- Why it matters: Forces cached reads to refresh so UI reflects the latest persisted state.
- L289: `if (newBlockEnd <= newBlockStart) {`
- Why it matters: Branches behavior for validation, authorization, or state guards.
- L295: `await offlineMutation.mutateWithQueue<{ block: ScheduleBlockItem }>({`
- Why it matters: Routes this write through online-or-queue logic for offline resilience.
- L310: `await queryClient.invalidateQueries({ queryKey: ["day", date] });`
- Why it matters: Forces cached reads to refresh so UI reflects the latest persisted state.
- L318: `if (dayQuery.isLoading || goalsQuery.isLoading || meQuery.isLoading) {`
- Why it matters: Branches behavior for validation, authorization, or state guards.
- L319: `return <p className="rounded-xl border border-slate-200 bg-white p-4 text-sm">Loading...</p>;`
- Why it matters: Returns computed state/value to the caller.
- L322: `if (dayQuery.isError || goalsQuery.isError || meQuery.isError) {`
- Why it matters: Branches behavior for validation, authorization, or state guards.
- L323: `return <p className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">Could not load today view.</p>;`
- Why it matters: Returns computed state/value to the caller.
- L330: `return (`
- Why it matters: Returns computed state/value to the caller.

## Intern Checks
- Validate any change here against at least one route-level or UI-level flow in the app.
- Keep this file aligned with its paired contracts (Prisma schema, zod schema, or API response shape).
