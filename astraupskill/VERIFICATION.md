# Verification scope and reproducibility

The change is a bounded task-relationship guard in two production files: the
collection POST route and the item PATCH route. `snapshots/` holds the exact
pre-change files; diffing them against the current routes shows only the two
guard blocks described in 03. The regression and its TypeScript loader live in
`tests/` so the check does not depend on a helper outside the project.

## What the regression proves

It loads the production route functions and supplies explicit doubles: Prisma
methods that record queries and writes, an authentication result, a
`NextRequest` stand-in, and a pass-through schema. Its assertions cover the
destination ownership predicate, the absence of writes on rejection, scoped
task updates, and ordinary allowed behavior. That is good evidence that the
handler places the guard before persistence and uses the authenticated
identity in the decision.

## What it does not prove

It is not evidence that real Zod validation ran. It does not cover cookie or
session handling (`requireUser`), generated Prisma types, SQL constraints,
migrations, Next routing, browser behavior, or transaction isolation. `npm
test` runs only `tests/timer.test.ts`, so the focused command must be run
explicitly. The sibling routes listed in 01 and 06 have no equivalent guard and
no regression.

## Recorded evidence

[evidence/results.json](evidence/results.json) is a frozen record of the
authoring run on 2026-09-22: command
`node --experimental-vm-modules --test tests/task-project-isolation.test.mjs`,
exit code 0, 7 tests executed, plus four stated limits. Its `cwd` and `project`
fields are paths on the authoring machine and will not exist on yours. The log
it names (`crud-b02-runtime7.log`) was never committed to this repository, so
there is no log file to open; rerun the command instead.

**Re-run on 2026-10-06** (Node 22.16.0, fresh clone, no `npm install`): the
same command reported `# tests 7`, `# pass 7`, `# fail 0`. The three
practice checks embedded in 05 were extracted from the markdown and run against
the same clone: `# tests 5`, `# pass 5` for Exercises 2, 4 and 5 combined.
Deleting the POST guard in a scratch copy made exactly case 6 fail, matching
the Exercise 1 answer in 06.

## Before broadening the claim

Run the project's normal checks with dependencies installed, then add a
database-backed create/reassign test using two users that verifies both the
persisted relationship and the response. To probe the lookup/write gap, delete
the project between the two steps and assert that no task row exists. Record
failures and environmental blockers as results rather than replacing them with
an unsupported pass statement.

Keep source reasoning, runtime evidence, and delivery integrity as separate
claims so another engineer can see what was tested and what still needs
investigation.
