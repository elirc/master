# Answers and review criteria

For the prediction exercise, an owned destination allows the route to continue
to the task operation. A foreign or missing destination returns project not
found before a task write. PATCH omission performs no project lookup because
the relationship is unchanged. A supplied empty string must enter destination
checking; in an ordinary fixture with no matching project it is rejected.
POST requires its own schema-valid body, so do not use a permissive substitute
to infer how malformed creation input is handled in production.

The status-only test can miss an unscoped project query and a write that occurs
before rejection. Assert the lookup's id and userId together, then assert zero
task writes for a forbidden destination. The positive fixture should require
the expected create payload or update predicate, a single intended write and
the existing success status. This catches a simplistic implementation that
returns not found for every request while satisfying all negative tests.

For the review counterexample, Alice owns task A and project A; Bob owns project
B. Alice submits task A with destination B. Filtering the update by task A and
Alice succeeds, but project B still belongs to Bob. The project query therefore
needs destination B plus Alice's identity, while the task update continues to
need task A plus Alice's identity. Neither predicate replaces the other.

The PATCH schema uses an optional string for projectId. Omission is allowed;
empty string is still a string; null is not made nullable for this field.
The presence guard addresses supplied values. A real-schema test would import
the production route with actual Zod and check malformed inputs before any
database calls, rather than giving its parser an always-successful substitute.
Do not describe null rejection as an executed result of the current fixture.

For the concurrency discussion, ownership could change after a successful
lookup but before task creation. Investigate whether such transfer exists,
which database engine is used, and whether the schema can encode the ownership
relationship. A meaningful integration test coordinates two transactions and
asserts the final task/project owner relationship, not merely that each request
returned an expected status. The current patch does not claim that stronger
guarantee. Good review language says exactly which request boundary improved
and names the remaining database-level question.
