# Master Life Plan

Master Life Plan is a personal planning web app for organizing long-term structure and daily execution:
- Areas -> Goals -> Projects -> Tasks
- Daily checklist-first workflow with timers and manual time editing
- Locked 30-minute schedule blocks (no auto-shift)
- Planned vs actual time tracking
- Offline mutation queue with reconnect sync

## Entry Experience
- Opening `/` shows a red demonic splash screen with:
  - `Track Time Daily`
  - `Use Time Wisely`
  - `Right Amount Of Hours`
- A 5-second countdown runs, then redirects to `/home`
- `/home` redirects to `/today`

## Core Features
- Authentication model
  - Local user/session code still exists for compatibility
  - App no longer requires login to use features
  - On first use, a local default user is created automatically
- Today (primary page)
  - Dashboard widgets at top (goal progress)
  - Daily checklist rows with:
    - Start/stop timer
    - `+30m` / `+1h` planned increments
    - Manual time edit modal
    - Complete toggle
  - Running timer banner
  - Schedule section (secondary, collapsible)
  - Time entries list with editing
- Schedule
  - 30-minute block granularity
  - Overlap prevention
  - Locked behavior (no auto-shift)
  - Optional task link per block
  - Extending selected block from task increments
- Life Plan
  - CRUD Areas
  - CRUD Projects in Areas
  - CRUD Tasks in Projects
  - Task tags and default estimates
  - Add task to today
- Goals + Dashboard
  - Daily/weekly goals
  - Match rules by tag/project/task/custom arrays
  - Widget visibility/order/display mode
- Review
  - Daily totals by tag/project and top tasks
  - Weekly totals by day, goal completion, tag/project breakdown
- Settings
  - Day window (`dayStartMin`, `dayEndMin`)
  - Timer rounding (`0`, `5`, `15`)
  - JSON export/import
  - Full data reset
- Offline-first behavior
  - PWA manifest + service worker for app shell/assets
  - React Query cache for fast reads
  - Dexie queue for offline writes
  - `/api/sync` replay on reconnect
  - Offline banner with pending count and sync action

## Tech Stack
- Next.js 16 App Router + React + TypeScript
- Tailwind CSS
- Prisma ORM + SQLite
- TanStack Query
- Dexie (IndexedDB queue)
- bcrypt for password hashing

## API Overview
- Auth
  - `POST /api/auth/signup`
  - `POST /api/auth/login`
  - `POST /api/auth/logout`
  - `GET /api/auth/state`
  - `GET /api/me`
- Planning CRUD
  - `GET/POST /api/areas`, `PATCH/DELETE /api/areas/:id`
  - `GET/POST /api/projects`, `PATCH/DELETE /api/projects/:id`
  - `GET/POST /api/tasks`, `PATCH/DELETE /api/tasks/:id`
  - `GET/POST /api/goals`, `PATCH/DELETE /api/goals/:id`
  - `GET/POST /api/widgets`, `PATCH/DELETE /api/widgets/:id`
- Today and scheduling
  - `GET /api/day?date=YYYY-MM-DD`
  - `POST /api/dayplan`
  - `POST /api/daytask`, `PATCH/DELETE /api/daytask/:id`
  - `POST /api/schedule-blocks`, `PATCH/DELETE /api/schedule-blocks/:id`
  - `POST /api/time-entries`, `PATCH/DELETE /api/time-entries/:id`
- Review + settings + sync
  - `GET /api/review/daily`
  - `GET /api/review/weekly`
  - `GET/PATCH /api/settings`
  - `GET /api/settings/export`
  - `POST /api/settings/import`
  - `POST /api/settings/reset`
  - `POST /api/sync`

## User Flow
1. Open app at `/` -> splash screen + 5-second countdown.
2. Redirect to `/home`.
3. Land on `/today` automatically with no sign-in.
4. Build day checklist, start timers, adjust planned time.
5. Optionally manage schedule blocks and goals.
6. Use `/plan` to build long-term hierarchy.
7. Use `/goals` to tune progress widgets.
8. Use `/review` for daily/weekly insights.
9. Use `/settings` for day bounds, backup/restore, reset.

## Setup
1. Install dependencies
```bash
npm install
```

2. Create env file from example
```bash
copy .env.example .env
```

3. Prisma generate + migrate
```bash
npm run prisma:generate
npm run prisma:migrate -- --name init
```

If SQLite file creation fails on first run (Windows), create once and rerun:
```bash
type NUL > prisma\\dev.db
npm run prisma:migrate -- --name init
```

4. Optional seed
```bash
npm run prisma:seed
```

5. Run app
```bash
npm run dev
```

## Scripts
- `npm run dev`
- `npm run build`
- `npm run start`
- `npm run lint`
- `npm run test`
- `npm run prisma:generate`
- `npm run prisma:migrate`
- `npm run prisma:seed`

## Tests
- `tests/timer.test.ts`
  - verifies running timer stop behavior
  - verifies rounding application for timer transitions


