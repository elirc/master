# Map the task write boundary

Start with [package.json](../package.json). This is a Next application using
Prisma, with its normal test command aimed at a timer test. The focused route
regression added for this lesson is a separate command; do not assume that
running the existing npm test automatically executes every new fixture.
Dependency manifests describe the application, while captured evidence tells
you which command actually ran for this change.

The [Prisma schema](../prisma/schema.prisma) defines User, Project and Task.
Project has userId; Task has both userId and projectId. Task's project relation
references the project identifier. Read those fields together and ask which
constraint expresses equal ownership. An ordinary project foreign key cannot
answer that question, so the route needs an authorization decision before
writing the relationship.

The collection route exports GET and POST. GET filters tasks by the current
user and can narrow by project. POST parses a task body and constructs a
create payload using the authenticated user ID. The supplied project ID is a
different trust boundary: it originated in the request and must be checked
against that same user. Merely sourcing task.userId from authentication does
not make every other field safe.

The item route exports PATCH and DELETE. PATCH uses a local optional-field
schema and updateMany constrained by task ID plus authenticated user ID.
DELETE archives a matching task. The change concerns POST and PATCH destination
selection; the archive behavior remains a useful neighboring path to inspect
without changing its product semantics.

Finally, [api.ts](../src/lib/api.ts) supplies withUser and handleError. withUser
obtains the authenticated user and produces an unauthorized response when
none exists. The focused fixture substitutes that dependency, so it checks
the route's response to an authentication result rather than session lookup.
Draw arrows from request to auth to parsing to project lookup to task write.
Label each arrow with its data, not just a function name. That diagram makes
it much easier to spot a request identifier crossing into persistence without
an ownership decision.
