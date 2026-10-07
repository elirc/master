# Map the task write boundary

[package.json](../package.json) shows a Next 16 app (`next dev --webpack`)
with Prisma 6.16 and Zod 4. `npm test` is `tsx --test tests/timer.test.ts`
only; the relationship regression in `tests/task-project-isolation.test.mjs`
is a separate command (see the README). Dependency manifests describe the
application; the captured evidence tells you which command actually ran.

## The data model

[schema.prisma](../prisma/schema.prisma) (SQLite) gives `Project` a `userId`
and an `areaId` (lines 94-107) and `Task` both a `userId` and a `projectId`
(lines 109-127). The initial migration creates plain single-column foreign
keys (`Task_projectId_fkey`, `Project_areaId_fkey`, ...). Nothing in the
schema says "task.userId must equal task.project.userId" — that rule exists
only in route code. The same shape repeats for `DayTask.taskId`,
`ScheduleBlock.taskId`, `TimeEntry.taskId` and `DashboardWidget.goalId`.

## The request path

```
request ─► withUser() ─► schema.parse(body) ─► project.findFirst({id, userId}) ─► task.create / task.updateMany
            src/lib/api.ts:5   lib/schemas.ts or a       tasks/route.ts:38-44           tasks/route.ts:46-56
                               local patchSchema         tasks/[id]/route.ts:23-31      tasks/[id]/route.ts:33-36
```

- `withUser()` ([api.ts](../src/lib/api.ts) lines 5-11) calls `requireUser()`
  and returns either `{ user }` or a ready-made 401 response.
- `handleError()` (same file, lines 13-29) maps `ZodError` to 400 with
  `issues`, **any other `Error` to 400 with its raw `message`**, and
  everything else to 500. Remember that second branch; 06 uses it.
- The collection route exports GET (filters by `auth.user.id`, optional
  `?projectId=`) and POST. POST takes `userId` from auth, but `projectId`
  comes from the request body — a different trust boundary.
- The item route exports PATCH and DELETE. PATCH parses a local
  `patchSchema` (lines 6-13, every field optional), then `updateMany` with
  `where: { id, userId }` and `data: body`. A zero `count` becomes
  `404 Task not found`; otherwise it re-reads the task by `id`. DELETE
  archives (`archived: true`) rather than deleting.

## Neighbors that write the same kind of relationship

| Route | Client-supplied relation id | Ownership check? |
| --- | --- | --- |
| `api/tasks` POST, `api/tasks/[id]` PATCH | `projectId` | Yes (this lesson) |
| `api/projects` POST, `api/projects/[id]` PATCH | `areaId` | No |
| `api/daytask` POST | `taskId` | No |
| `api/schedule-blocks` POST / `[id]` PATCH | `taskId` | No |
| `api/time-entries` POST (manual and `start`) | `taskId` | No |
| `api/widgets` POST | `goalId` | No |
| `api/settings/import` POST | every id and foreign key | No (rows spread as-is) |

Draw the arrows for one of these with the data on each arrow, not just the
function name. That is how you spot a request identifier crossing into
persistence without an ownership decision.
