# Existence, ownership and optional fields

Consider user Alice, task A and project B. Task A belongs to Alice; project B
belongs to Bob. A PATCH constrained by task A's identifier and Alice's user ID
correctly protects the task row. It still permits a bad relationship if it
writes project B without checking who owns B. Authorization is therefore not
a single check at the beginning of the request. It must cover the resources
whose relationships the operation changes.

The destination lookup combines two predicates: the submitted project ID and
the authenticated user's ID. A result proves the requested relationship is
allowed at that moment. No result means either the project is absent or it is
outside the user's scope. Returning the same not-found shape avoids exposing
which of those explanations applies. The task write must still retain its
own user constraint; validating the destination does not authorize editing
somebody else's task.

PATCH introduces a second distinction: omitted versus supplied. Omitting
projectId means this request does not change that relationship. Supplying an
empty string is not omission. A truthiness guard would skip the lookup for
that value even though it remains in the data passed to persistence. Check
presence explicitly with projectId !== undefined, then resolve any supplied
identifier. This preserves title-only edits while preventing a bypass through
a falsy string. Validation may later reject empty IDs earlier, but authorization
should not depend on accidentally favorable coercion.

There is also a time boundary. A lookup followed by a write is not an atomic
proof that ownership cannot change between them. Whether that matters depends
on available project mutation paths and database transaction semantics. This
patch establishes the application guard; it does not claim to solve every
concurrent reassignment scenario. Advanced work should investigate those
paths before proposing a transaction, composite ownership key, or conditional
write. Choose a stronger mechanism from an actual invariant and failure
scenario, not from the assumption that adding a transaction label solves
all races automatically.
