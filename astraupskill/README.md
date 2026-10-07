# Master: protect relationships across CRUD operations

The app is a personal day planner (Next 16 App Router, Prisma 6
on SQLite, React Query, Dexie offline queue). A task belongs to a user and a
project. The schema's foreign key proves the project *exists*; it does not
prove the current user may attach their task to it. This lesson studies the
repair of that gap in task creation and reassignment, then sends you looking
for the same gap in the routes that were *not* repaired.

Start with the [collection route](../src/app/api/tasks/route.ts) (POST guard at
lines 38-44) and the [item route](../src/app/api/tasks/%5Bid%5D/route.ts)
(PATCH guard at lines 23-31). Before the change, POST trusted the submitted
project ID and PATCH protected the task row without protecting its new project
relationship. After it, a supplied destination must resolve inside the
authenticated user's projects before any task write, and missing and foreign
projects get the same `404 Project not found`.

Run the focused regression from the repo root (Node 22.13+ is needed because
the loader uses `node:module`'s `stripTypeScriptTypes`; no `npm install`
required):

```
node --experimental-vm-modules --test tests/task-project-isolation.test.mjs
```

Expect `# tests 7`, `# pass 7`. Note that `npm test` runs only
`tsx --test tests/timer.test.ts` (see `package.json`) and does **not** include
this regression.

| File | Use it for |
| --- | --- |
| [01-CODEBASE-MAP](01-CODEBASE-MAP.md) | Request → auth → parse → lookup → write, with line numbers |
| [02-CONCEPTS](02-CONCEPTS.md) | Existence vs ownership, omitted vs supplied, what the race really is here |
| [03-WORKED-CHANGE](03-WORKED-CHANGE.md) | The exact diff against the snapshots |
| [04-TESTING-AND-DEBUGGING](04-TESTING-AND-DEBUGGING.md) | How the vm-module loader and doubles work, and what they cannot prove |
| [05-PRACTICE](05-PRACTICE.md) | Goal + Check exercises you run with `node --test` |
| [06-SOLUTIONS-AND-REVIEW](06-SOLUTIONS-AND-REVIEW.md) | Answers, plus unrepaired findings in sibling routes |
| [07-TRACE-LAB](07-TRACE-LAB.md) | Request-by-request trace table |
| [VERIFICATION](VERIFICATION.md) | What was executed and what was not |

Work in three passes: read 01-02 without editing and write down the identity
used at each boundary; compare the snapshots in `snapshots/` with the current
routes and predict the database calls for an owned project, a foreign project
and a title-only edit; then do 05 before opening 06.

Your completion artifact is a short review note naming the invariant, the two
write paths that enforce it, one preserved behavior, one sibling route that
still violates it, and the integration test you would add next.
