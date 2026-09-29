# Master: protect relationships across CRUD operations

A task belongs to a user and a project. Those two relationships look ordinary
in a schema, but they encode a rule the application must enforce: the selected
project must belong to the authenticated task owner. A foreign key establishes
that a project exists. It does not establish that the current user may attach
their task to that project. This lesson repairs that distinction in task
creation and reassignment while preserving ordinary edits.

Open the [collection route](../src/app/api/tasks/route.ts) and the
[item route](../src/app/api/tasks/%5Bid%5D/route.ts). Follow POST and PATCH from
authentication through parsing to persistence. Before the change, POST trusted
the submitted project ID and PATCH protected the task row without protecting
its new project relationship. After the change, supplied destination IDs must
resolve inside the authenticated user's projects before a task write occurs.
Missing and foreign projects receive the same not-found response.

Use this course in three passes. On the first pass, read the map and concepts
without editing anything. Write down the identity used at each boundary. On
the second pass, compare the original snapshots with the repaired route and
predict the database calls for an owned project, a foreign project, and an
ordinary title edit. On the third pass, complete the exercises before opening
the answers. Keep predictions separate from observed test output.

The teaching methods deliberately vary: a worked patch explains the decision,
a trace table makes control flow visible, regression fixtures make forbidden
effects measurable, and a review exercise asks you to evaluate a proposed
shortcut. Senior-level judgment includes stating what a focused test cannot
prove. These tests load production route functions but replace authentication,
schema parsing, and Prisma boundaries. They do not certify the deployed app,
database constraints, cookie sessions, or concurrent ownership changes.

Your completion artifact is a short review note naming the invariant, the two
write paths that need it, one preserved behavior, and the next integration
test you would run. A passing command alone is not the learning objective.
