# Repair create and reassign together

Read the snapshots in `snapshots/` before the current files. They are the
exact pre-change routes; diffing them against `src/app/api/tasks/route.ts`
and `src/app/api/tasks/[id]/route.ts` shows only the two inserted blocks
below (whitespace and line endings aside).

In the original POST, `body.projectId` flows straight into
`prisma.task.create`. In the original PATCH, `updateMany` is already
constrained by `{ id, userId }`. That is valuable and stays, but it covers
the *source* task, not the selected *destination*. The smallest coherent
repair validates the destination on both write paths that accept it.

## POST (`tasks/route.ts`, inserted at lines 38-44)

```ts
const project = await prisma.project.findFirst({
  where: { id: body.projectId, userId: auth.user.id },
  select: { id: true },
});
if (!project) {
  return Response.json({ error: "Project not found" }, { status: 404 });
}
```

It runs after `taskSchema.parse` and before `task.create`. It selects only
`id` because the decision needs existence-within-scope, not the project
object. The create payload, defaults (`notes ?? null`, `tags ?? []`,
`defaultEstimateMin ?? 30`, `archived ?? false`) and the 201 are unchanged.

## PATCH (`tasks/[id]/route.ts`, inserted at lines 23-31)

The same lookup, wrapped in `if (body.projectId !== undefined) { ... }`.
A title-only body skips it; a supplied `""` must enter it. After an allowed
lookup the existing `updateMany({ where: { id, userId }, data: body })` still
runs, a zero count is still `404 Task not found`, and the success path still
re-reads the task.

## Why the order of effects matters

The negative assertion that matters is "the forbidden relationship produces
no task write". A handler that wrote first and then returned 404 would show
the same status and still violate the rule. That is why the regression
records every `create`/`updateMany` call and its arguments instead of
checking status alone.

## What was deliberately left alone

GET filtering, DELETE archival, the schema and migrations are untouched, and
so are the sibling routes listed in 01 that accept `areaId`, `taskId` or
`goalId` without an ownership check. Leaving them keeps the before/after
comparison teachable, but it means the invariant is enforced for tasks only.
06 records those siblings as open findings; fixing one is a good follow-up
patch with its own regression, not a reason to grow this one.
