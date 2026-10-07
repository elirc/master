# Test the forbidden effect

## How the regression loads production code

[tests/task-project-isolation.test.mjs](../tests/task-project-isolation.test.mjs)
does not copy the ownership condition into a helper. It calls
`loadTypeScript()` from [tests/helpers/load-typescript.mjs](../tests/helpers/load-typescript.mjs),
which:

1. reads the real `.ts` route and strips types with Node's
   `stripTypeScriptTypes` (no tsc, no tsx);
2. evaluates it as a `vm.SourceTextModule` inside a fresh `vm` context
   (hence `--experimental-vm-modules`);
3. resolves `@/...` and relative imports to real files under `src/`, but
   replaces any specifier listed in `stubs` (`next/server`, `zod`,
   `@/lib/api`, `@/lib/prisma`, `@/lib/schemas`) with a synthetic module;
4. throws `Unstubbed external dependency` for anything else, so a test cannot
   silently pull in the real Prisma client.

Removing the guard from the production route therefore makes the negative
cases fail. It is still a focused boundary test, not a running Next server or
a database test.

Two details trip people up:

- The test compares arguments with `same()` (JSON string equality), not
  `assert.deepStrictEqual`. Objects created inside the vm context have that
  context's `Object.prototype`, so strict deep-equality against an object
  literal from the test file fails with "same structure but not
  reference-equal". Use JSON comparison (or `deepEqual` on JSON-parsed copies)
  in your own fixtures.
- The `zod` stub returns chainable no-ops and `object().parse` returns its
  input, so **no real validation runs**. Any claim about how `null` or a
  non-string `projectId` is handled must come from reading the schema, not
  from this suite.

## What a useful fixture observes

Three separate observations: the project lookup arguments (destination ID
*and* authenticated user ID), every task write with its predicate or payload,
and the response status and body. Together they distinguish a correct
rejection from a response that merely looks correct after an unwanted write.
On the success path, assert the destination reaches the write and the
authenticated identity remains authoritative.

The seven cases cover: foreign and empty destination on PATCH (404, zero
writes), owned destination on PATCH (scoped `updateMany` + re-read), omitted
`projectId` (no lookup), owned task not found (404, no re-read),
unauthenticated (401, no reads), and POST foreign/owned.

## Debugging from the earliest violated boundary

- A foreign-project case writes → was the lookup skipped, or its `null`
  ignored?
- A title-only update fails → does the guard confuse omission with a
  required destination?
- An empty string skips authorization → truthiness instead of presence.
- Another user's task changes → inspect the `updateMany` predicate
  independently of the destination query.

## Mutation testing

Mutating a production file to prove a test bites is safe only in a copy.
05 Exercise 2 gives a runnable check that copies the real PATCH route into a
temp directory, swaps the presence guard for a truthiness guard, and shows the
empty-ID case reaching `updateMany`. Never leave a mutant in `src/`.
