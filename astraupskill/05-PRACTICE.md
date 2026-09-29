# Practice before reading the answers

Exercise one is a prediction task. Draw a matrix whose rows are owned project,
foreign project, missing project, omitted projectId, and supplied empty ID.
Use separate columns for POST and PATCH. For each meaningful combination,
predict the response family and whether a project lookup and task write are
allowed. Mark combinations that cannot be described as a valid creation body
without invoking schema behavior. Do not invent validation results from the
test double, which deliberately passes parsed values through.

Exercise two is a test-design task. A teammate writes a fixture whose project
lookup returns null and checks only status 404. Explain two defects that this
fixture could miss. Improve it to record the exact lookup arguments and every
task write. Then add a positive case so that an implementation which rejects
all requests cannot pass the suite. State which assertion proves preserved
behavior rather than only rejection.

Exercise three is a code-review task. Review this proposal: “The task update
already filters by userId, so checking the project is redundant.” Write a
counterexample with two named users, one task and two projects. Your explanation
must distinguish authorization on the task row from authorization on the
new relationship. Finish with a concrete predicate for each resource.

Exercise four is an API semantics task. Compare an omitted projectId, an empty
string, and a null value. Explain what the actual PATCH schema permits and
what the new presence guard does. Separate schema rejection from resource
lookup rejection. Suggest how you would test real parsing if dependencies were
available, without claiming the current lightweight fixture covers it.

Exercise five is a design discussion. Imagine an administrator can transfer
project ownership while another request creates a task. Sketch the interleaving
between lookup and write. List the repository facts you would need before
selecting a database constraint or transaction strategy. Your answer should
include one integration test and a description of the invariant it proves.
Score your work on explicit identities, effect ordering, preserved success
behavior and honest test limits, rather than the amount of code proposed.
