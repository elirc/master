# Answers and review criteria

## Exercise 1

Deleting the POST guard (lines 38-44 of `tasks/route.ts`) fails exactly one
case: *POST rejects a foreign project before create* (status becomes 201 and
`projectReads[0]` is `undefined`). *POST creates with the owned project...*
still passes, because it checks only the 201 and the create payload. That is a
useful lesson in itself: the positive case alone cannot detect a missing
guard, and the negative case alone cannot detect a guard that rejects
everything. You need both.

## Exercise 2

With `if (body.projectId)`, `""` is falsy, so the lookup is skipped,
`updateMany` runs with `data: { projectId: "" }`, the double reports
`count: 1`, and the route re-reads and returns 200. Against a real database
the write would then fail on `Task_projectId_fkey` and surface as a 400 with
the raw Prisma message — still not the uniform 404 the guard promises.

## Exercise 3

| Input | POST | PATCH |
| --- | --- | --- |
| Owned project | lookup, create, 201 | lookup, `updateMany`, 200 (404 if task not Alice's) |
| Foreign project | lookup, no write, 404 | lookup, no write, 404 |
| Missing project | lookup, no write, 404 | lookup, no write, 404 |
| Omitted | `taskSchema.projectId` is required (`src/lib/schemas.ts` line 24): ZodError, 400, no lookup | no lookup, `updateMany`, 200 |
| `""` | parses as a string → lookup finds nothing → 404 | same: lookup → 404 |
| `null` | ZodError, 400, no lookup | `z.string().optional()` rejects `null`: 400, no lookup |

The `null` and omitted-POST rows come from reading the schemas. The suite
cannot show them because its `zod`/`taskSchema` stubs pass every value through.
A real-schema test would load the route with actual Zod and assert a 400 with
zero Prisma calls.

## Review counterexample (the "already filters by userId" proposal)

Alice owns task A and project A; Bob owns project B. Alice PATCHes task A with
`projectId: B`. `updateMany({ where: { id: A, userId: Alice } })` matches, so
without the guard task A now points into Bob's project. The project query needs
`{ id: B, userId: Alice }`; the task write needs `{ id: A, userId: Alice }`.
Neither predicate replaces the other.

## Exercises 4 and 5 — open findings in sibling routes

These were verified by reading the code and by the Exercise 4/5 checks. They
are **not fixed** in this repository.

1. **Unchecked relationship ids (same bug class as the lesson).**
   `POST /api/daytask` writes `body.taskId` (`daytask/route.ts` line 37);
   `POST /api/widgets` writes `body.goalId` (`widgets/route.ts` lines 30-35);
   `POST /api/projects` and `PATCH /api/projects/[id]` write `areaId`
   (`projects/route.ts` line 46, `projects/[id]/route.ts` lines 20-23);
   schedule blocks (`schedule-blocks/route.ts` line 44,
   `schedule-blocks/[id]/route.ts` line 58) and time entries
   (`time-entries/route.ts` lines 18 and 53, via `src/lib/timer.ts` line 35)
   write `taskId`. None looks the target up with the caller's `userId`.
2. **The write becomes a read leak.** `GET /api/day` includes
   `dayTask.task.project.area` (`day/route.ts` lines 27-37) and
   `GET /api/widgets` includes `goal` (line 13). Once Alice's DayTask points at
   Bob's task, Alice's day view returns Bob's task title, project name and area
   name. Precondition: Alice must already know Bob's id. Ids are `cuid()`
   (`schema.prisma`), so this is not enumerable, but the invariant is broken.
3. **Existence oracle through error messages.** `handleError` returns
   `error.message` with 400 for any `Error` (`src/lib/api.ts` lines 24-25).
   `POST /api/projects` with a nonexistent `areaId` fails the
   `Project_areaId_fkey` constraint and returns the Prisma message; with
   Bob's real `areaId` it returns 201. The difference tells a caller whether an
   id exists, and the raw message exposes internals. The fix is an ownership
   lookup that returns the same 404 for both, plus a generic message for
   non-validation errors.
4. **Mass assignment in settings import.** Every row is created as
   `{ ...item, userId }` (`settings/import/route.ts` lines 26-71) with no
   schema. Because `userId` is spread last, the caller cannot forge it, but they
   choose `id`, `projectId`, `areaId`, `taskId`, `goalId` and every other
   column. An `id` that already belongs to another user's row makes
   `createMany` violate the primary key, and the route has no `try/catch`, so
   the request errors instead of returning `{ ok: true }` — another existence
   oracle. Fix: validate each collection with a Zod schema, regenerate ids, and
   remap foreign keys through an old-id → new-id table built from the caller's
   own imported rows.

## Exercise 6

No route writes `Project.userId`, so ownership cannot change between lookup
and write. The interleaving that can happen is deletion
(`DELETE /api/projects/[id]` or `POST /api/settings/reset`). SQLite then
rejects the `task.create` on `Task_projectId_fkey`, Prisma throws, and
`handleError` returns 400 with the raw message. The integrity is preserved by
the database; the response is merely untidy. An integration test would create
Alice's project, pause the POST after its lookup (for example with a wrapped
Prisma client), delete the project, resume, and assert both "no task row" and
the response status you decide is correct.

## Review criteria

Score your work on explicit identities, effect ordering, preserved success
behavior, and honest test limits — not on the amount of code proposed.
