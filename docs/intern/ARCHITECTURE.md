# System Architecture Overview

## High-Level Structure
- Framework: Next.js App Router with server route handlers under `src/app/api` and UI pages/components under `src/app` and `src/components`.
- Storage: SQLite via Prisma ORM; data model lives in `prisma/schema.prisma`.
- Client cache: React Query handles read caching and invalidation after mutations.
- Offline writes: Dexie (IndexedDB) queues mutations, replayed through `/api/sync`.

## Core Data Domains
- Identity/session: User, Session, UserSettings.
- Planning hierarchy: Area -> Project -> Task.
- Daily execution: DayPlan, DayTask, ScheduleBlock, TimeEntry.
- Tracking goals: Goal + DashboardWidget.

## Request and Mutation Flow
- UI issues reads with `apiFetch` + React Query (`TodayClient` is the main orchestrator).
- UI issues writes through `useOfflineMutation`.
- If online: write goes directly to route handlers.
- If offline: write payload is queued in IndexedDB.
- On reconnect: `useOfflineSync` sends queue to `POST /api/sync`.
- Server replays each mutation in `src/lib/sync.ts` with last-write-wins checks.

## Auth and User Resolution
- Shared auth helpers in `src/lib/auth.ts`.
- Routes call `withUser` from `src/lib/api.ts` for user-scoped access.
- Current behavior supports no-sign-in usage by resolving/creating a local default user.

## Today Page Composition
- Container: `src/components/today/today-client.tsx`.
- Checklist row: `TaskRow`.
- Schedule row: `ScheduleBlockRow`.
- Offline visibility: `OfflineBanner` in `AppShell`.
- Timer actions hit `/api/time-entries`, which delegates invariants to `src/lib/timer.ts`.

## API Contract and Validation
- Route input validation is centralized in `src/lib/schemas.ts` (zod).
- Shared error formatting is centralized in `src/lib/api.ts`.
- Aggregation endpoints:
- `GET /api/day` returns checklist/schedule/time/running-timer bundle.
- `GET /api/goals` returns goals/widgets plus computed planned/actual metrics.
- `POST /api/sync` replays offline queue and returns applied/failed mutation ids.

## Performance and Integrity Notes
- Important read paths are indexed in Prisma schema (day/task/time/date combos).
- Route handlers use `Promise.all` for parallel reads where possible.
- Timer and sync mutation logic use transactional writes to avoid partial updates.
