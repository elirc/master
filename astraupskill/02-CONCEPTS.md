# Existence, ownership and optional fields

Consider user Alice, task A and project B. Task A belongs to Alice; project B
belongs to Bob. A PATCH constrained by task A's identifier and Alice's user ID
correctly protects the task row. It still permits a bad relationship if it
writes project B without checking who owns B. Authorization is therefore not
a single check at the beginning of the request. It must cover every resource
whose relationship the operation changes.

The destination lookup combines two predicates: the submitted project ID and
the authenticated user's ID. A result proves the requested relationship is
allowed at that moment. No result means either the project is absent or it is
outside the user's scope. Returning the same not-found shape avoids revealing
which explanation applies (an *id oracle*). The task write must still keep its
own user constraint; validating the destination does not authorize editing
somebody else's task.

PATCH introduces a second distinction: omitted versus supplied. Omitting
`projectId` means this request does not change that relationship. The PATCH
schema is `projectId: z.string().optional()`, so `""` parses successfully and
is *not* omission. A truthiness guard (`if (body.projectId)`) would skip the
lookup for `""` even though `data: body` still passes it to `updateMany`.
The route checks presence explicitly — `body.projectId !== undefined` — so
title-only edits skip the lookup while a falsy string cannot bypass it.
(`null` is not accepted by this schema at all; it fails parsing with a 400
before any lookup.) Authorization should never depend on favorable coercion.

There is also a time boundary: lookup and write are two statements, not one
atomic proof. Whether that matters depends on which concurrent writes exist,
so check the repository instead of guessing:

- **Can a project change owner?** No API path writes `Project.userId`. The
  project PATCH schema allows only `areaId`, `name` and `order`
  (`src/app/api/projects/[id]/route.ts` lines 6-10), and settings import
  forces `userId` to the caller on every row it creates.
- **Can the project disappear?** Yes: `DELETE /api/projects/[id]` (line 41)
  or `POST /api/settings/reset`. If that lands between Alice's lookup and her
  `task.create`, the `Task_projectId_fkey` constraint rejects the insert;
  Prisma throws, and `handleError` turns it into a 400 carrying the raw
  Prisma message instead of a clean 404.

So in this codebase the interleaving produces an ugly error, not a
cross-user relationship. A stronger mechanism (a composite `(projectId,
userId)` foreign key, or a conditional insert) becomes necessary only if an
ownership-transfer feature is added. Choose the mechanism from an actual
invariant and failure scenario, not from the belief that wrapping two calls
in a transaction solves every race by itself.
