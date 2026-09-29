# Test the forbidden effect

Open the [route regression](../tests/task-project-isolation.test.mjs). It loads
the actual TypeScript route using a local test loader and provides explicit
substitutes for infrastructure dependencies. This is more meaningful than
copying the ownership condition into a test helper: removing the guard from
production should cause the negative case to fail. It is still a focused
boundary test, not a running Next server or a real Prisma database test.

A useful fixture has three separate observations. First, record the project
lookup arguments and require both destination ID and authenticated user ID.
Second, record task writes and their predicates or payloads. Third, inspect
the response status and body. Combining these observations distinguishes a
correct rejection from a response that merely looks correct after an unwanted
write. On the success path, assert the destination actually reaches the write
and the authenticated identity remains authoritative.

For debugging, start with the earliest violated boundary. If a foreign project
case writes, inspect whether the project lookup was skipped or its null result
was ignored. If a title-only update unexpectedly fails, inspect whether the
new condition confuses omission with a required destination. If an empty
string skips authorization, inspect truthiness. If another user's task changes,
inspect the task update predicate independently of the destination query.

The schema substitute deliberately does not validate Zod behavior. Authentication
is supplied as a result, not reconstructed from a cookie. Database doubles
record calls, not SQL execution, constraints or transaction isolation. Explain
these substitutions when interpreting a green run. They isolate the route
decision but cannot prove that the surrounding adapters behave correctly.

As a mutation exercise, temporarily remove userId from the destination query
in a scratch copy. A strong argument assertion should fail even if the double
would otherwise return an owned project. Then restore it and try replacing
the presence check with truthiness. The empty-ID case should expose that
regression. Keep these experiments out of the delivered production files and
retain the original captured passing run as the verification record.
