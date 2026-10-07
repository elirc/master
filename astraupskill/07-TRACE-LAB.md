# Trace one request at a time

Use Alice as the authenticated user. Task T and project P belong to Alice;
project Q belongs to Bob. Keep these identities written beside the source
while you trace. Changing several fixture identities at once makes it harder
to see which predicate caused a rejection.

| Request | Destination lookup | Task effect | Outcome | Regression case |
| --- | --- | --- | --- | --- |
| POST with P | `{ id: P, userId: Alice }` matches | Create for Alice in P | 201 | 7 |
| POST with Q | `{ id: Q, userId: Alice }` no match | None | 404 Project not found | 6 |
| PATCH T with P | matches | `updateMany` where `{ id: T, userId: Alice }` | 200 + re-read | 2 |
| PATCH T with Q | no match | None | 404 Project not found | 1 |
| PATCH T with `""` | `{ id: "", userId: Alice }` no match | None | 404 Project not found | 1 |
| PATCH T, title only | not run | `updateMany` scoped to Alice | 200 | 3 |
| PATCH unknown T, title only | not run | `count: 0`, no re-read | 404 Task not found | 4 |
| Any PATCH, no session | not run | None | 401 | 5 |

Case numbers are the order of `test(...)` calls in
`tests/task-project-isolation.test.mjs`.

**Trace 1 — foreign PATCH, before and after.** In
`snapshots/tasks-[id]-route.ts.original.txt`, follow `projectId: Q` from
`patchSchema.parse` straight into `updateMany`'s `data`. Nothing between them
looks at Q's owner. Now trace the current route and stop at the early return
on line 29. List the operations no longer reachable (`updateMany`,
`findUnique`, the 200). The comparison explains the bug without relying on a
database error to reject it.

**Trace 2 — title-only edit.** `projectId` is absent, so the branch on line 23
is skipped; the task's own `{ id, userId }` predicate still decides. This is
why a security repair needs positive preservation tests: a guard that required
every PATCH to include a project would change the API's meaning and break
ordinary edits.

**Trace 3 — the same request against an unrepaired sibling.** Trace
`POST /api/daytask` with `{ date, taskId: <Bob's task> }`
(`src/app/api/daytask/route.ts`): `findUnique` on Alice's
`(userId, date, taskId)` key finds nothing, `findFirst` picks a sort order, and
`dayTask.create` stores Bob's task id under Alice. Then trace
`GET /api/day`: its `include` walks from that DayTask to Bob's task, project and
area. Write the one-line guard that would have stopped it, and where it goes.

**Trace 4 — pause between lookup and write.** After a successful lookup for
P, imagine a second request deleting P (the only concurrent change the API
allows; see 02). Resume the first request on paper: the insert now references a
missing row, so the foreign key rejects it. Do not alter the expected
focused-test results to imply this race was executed; it is a proposed
integration experiment (see 06, Exercise 6) with explicit setup,
synchronization and final-state assertions.
