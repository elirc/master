# Verification scope and reproducibility

The change is a bounded task relationship guard. The production files are
the collection POST route and item PATCH route. Original snapshots preserve
the exact pre-change files for comparison. The local regression and its
TypeScript loader are delivered beside the course so that the test does not
depend on a hidden helper outside the project. Captured evidence is attached
after the final reviewed run; use that record for the exact command, case
count and exit status rather than inferring execution from examples here.

The regression loads production route functions. It supplies explicit Prisma
methods that record queries and writes, an authentication result, a Next
request type stand-in, and a permissive schema substitute. Assertions target
the destination ownership predicate, absence of writes on rejection, preservation
of scoped task updates, and ordinary allowed behavior. This is useful evidence
that the handler places the guard before persistence and uses authenticated
identity in the decision.

It is not evidence that real Zod validation ran. It does not establish cookie
or session correctness, generated Prisma typing, SQL constraints, migrations,
Next routing, browser behavior, or transaction isolation. The ordinary package
test script targets other tests; the focused command must be run explicitly.
No full dependency reinstall is required for this lightweight check, but that
convenience does not convert its doubles into production adapters.

Before broadening the claim, run the original project's normal checks with
the appropriate dependencies, then add a database-backed create/reassign test
using two users. Verify both persisted ownership and returned responses. If
project transfers exist, coordinate a competing transfer with the task write
and inspect the final invariant. Record failures and environmental blockers
as results rather than replacing them with an unsupported pass statement.

Astra review also compares changed files against the staged baseline, checks
snapshot fidelity and local course links, and verifies canonical delivery
hashes. Those mechanical checks protect the integrity of the handoff; they
do not prove the application correct. Keep source reasoning, runtime evidence,
and delivery verification as separate claims so another engineer can assess
what was tested and what still needs investigation.

## Astra execution evidence

The captured focused production-source suite executed 7 tests: all passed, zero failed and zero skipped. Read the [captured output](evidence/crud-b02-runtime7.log) and [exact command and limits](evidence/results.json). Earlier check records remain preserved in the workspace.
