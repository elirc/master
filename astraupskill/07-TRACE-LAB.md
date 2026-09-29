# Trace one request at a time

Use Alice as the authenticated user. Let task T belong to Alice, project P
belong to Alice, and project Q belong to Bob. Keep these identities written
beside the source while you trace. Changing several fixture identities at
once makes it harder to determine which predicate caused a rejection.

| Request | Destination lookup | Task effect | Expected route outcome |
| --- | --- | --- | --- |
| POST with P | P and Alice match | Create for Alice in P | Created |
| POST with Q | Q and Alice do not match | None | Project not found |
| PATCH T with P | P and Alice match | Update T constrained to Alice | Success if T exists |
| PATCH T with Q | Q and Alice do not match | None | Project not found |
| PATCH T, title only | No lookup | Update T constrained to Alice | Success if T exists |
| PATCH missing T with P | P and Alice match | Update count is zero | Task not found |

First trace the foreign-project PATCH in the original snapshot. Identify the
point where the submitted relationship reaches data without a destination
ownership decision. Now trace the changed route and stop at the early return.
Write the list of operations that are no longer reachable. The comparison
should explain the bug without relying on a database error to reject it.

Next trace a title-only edit. The optional project field is absent, so the
new lookup branch must not run. The task's existing ownership predicate still
decides whether an update is allowed. This neighboring path demonstrates why
a security repair needs positive preservation tests as well as rejection
tests. A guard that requires every PATCH to include a project would change
the API's meaning and break ordinary edits.

Finally, pause after a successful project lookup and imagine a second writer
changing that project's ownership. Resume the first request on paper. The
exercise exposes the difference between sequential control-flow evidence and
concurrency evidence. Do not alter the expected focused-test results to imply
the race was executed. Instead, turn the interleaving into a separate proposed
integration experiment, with explicit setup, synchronization and final-state
assertions. That is how a simple trace becomes a useful design review tool.
