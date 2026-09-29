# Repair create and reassign together

Read the original route snapshots before the changed files. In POST, trace
the submitted projectId into prisma.task.create. In PATCH, notice that the
existing updateMany already constrains the task by userId. That is valuable
behavior to preserve, but it covers the source task rather than the selected
destination. The smallest coherent repair validates the destination on both
write paths that accept it.

For creation, parse the body and resolve a project using both body.projectId
and auth.user.id. Select only the identifier because the decision requires
existence within that scope, not a full project object. If the lookup returns
null, return a project-not-found response before calling task.create. Otherwise
continue using the existing payload construction, defaults and success status.
Do not accept userId from the request as a shortcut for this lookup.

For PATCH, apply the same lookup only when projectId is supplied. The key
branch is presence, not truthiness. A title-only body must bypass the project
lookup and retain its existing edit behavior; a supplied empty identifier must
not slip into the write unexamined. After an allowed destination lookup, keep
the existing task ID and user ID predicate. A zero update count remains a
task-not-found outcome, and the existing success response remains intact.

Review the order of effects as carefully as the response text. The important
negative assertion is that the forbidden relationship produces no task write.
A handler that writes first and then returns 404 would have the same visible
status but violate the rule. The fixture therefore records persistence calls
and checks arguments, rather than testing the response status alone.

This implementation intentionally leaves neighboring GET filtering and DELETE
archival alone. It also avoids changing schema versions or installing an
entire dependency tree just to demonstrate the boundary. Those choices keep
the before-and-after comparison narrow enough to teach. When proposing a
follow-up, identify a separate observable failure and its regression instead
of growing this patch into a general rewrite of the task API.
