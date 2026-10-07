# Practice before reading the answers

Every exercise has a **Goal** and a **Check**. Run all commands from the repo
root with Node 22.13+; nothing needs `npm install`. Save practice test files in
a scratch folder **outside** the repo (for example `../scratch/`) and pass that
path to `node --test`; they locate the repo through `process.cwd()`.

## Exercise 1 — Run the existing regression

**Goal:** see the seven cases pass before you change anything.

```
node --experimental-vm-modules --test tests/task-project-isolation.test.mjs
```

**Check:** the summary shows `# tests 7`, `# pass 7`, `# fail 0`. Then write,
without looking, which of the seven cases would fail if lines 38-44 of
`src/app/api/tasks/route.ts` were deleted. (Answer in 06.)

## Exercise 2 — Prove the presence guard matters

**Goal:** show that `if (body.projectId)` would let `""` reach `updateMany`,
using a mutant copy rather than editing `src/`.

Save as `ex2-truthiness-mutant.test.mjs`:

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, readFile, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const repo = process.cwd();
const { loadTypeScript } = await import(pathToFileURL(path.join(repo, 'tests/helpers/load-typescript.mjs')));
const ROUTE = 'src/app/api/tasks/[id]/route.ts';

async function loadPatch(mutate) {
  const root = await mkdtemp(path.join(tmpdir(), 'mutant-'));
  const code = mutate(await readFile(path.join(repo, ROUTE), 'utf8'));
  await mkdir(path.join(root, path.dirname(ROUTE)), { recursive: true });
  await writeFile(path.join(root, ROUTE), code);
  const writes = [];
  const prisma = {
    project: { async findFirst() { return null; } },
    task: { async updateMany(a) { writes.push(a); return { count: 1 }; }, async findUnique() { return { id: 't1' }; } },
  };
  const chain = () => new Proxy({}, { get: (_t, k) => (k === 'parse' ? (v) => v : () => chain()) });
  const mod = await loadTypeScript(ROUTE, { root, globals: { Response }, stubs: {
    'next/server': { NextRequest: class {} },
    zod: { z: { string: chain, array: chain, number: chain, boolean: chain, object: () => ({ parse: (v) => v }) } },
    '@/lib/api': { withUser: async () => ({ user: { id: 'alice' }, response: null }), handleError: (e) => Response.json({ error: String(e) }, { status: 400 }) },
    '@/lib/prisma': { prisma },
  } });
  await rm(root, { recursive: true, force: true });
  const res = await mod.PATCH({ json: async () => ({ projectId: '' }) }, { params: Promise.resolve({ id: 't1' }) });
  return { status: res.status, writes: writes.length };
}

test('real route: empty projectId is looked up and rejected before any write', async () => {
  assert.deepEqual(await loadPatch((s) => s), { status: 404, writes: 0 });
});

test('truthiness mutant: empty projectId skips the lookup and reaches updateMany', async () => {
  const mutate = (s) => {
    const out = s.replace('if (body.projectId !== undefined) {', 'if (body.projectId) {');
    assert.notEqual(out, s, 'presence guard not found - has the route changed?');
    return out;
  };
  assert.deepEqual(await loadPatch(mutate), { status: 200, writes: 1 });
});
```

**Check:** `node --experimental-vm-modules --test ../scratch/ex2-truthiness-mutant.test.mjs`
reports `# pass 2`. Explain in one sentence why the mutant returns 200.

## Exercise 3 — Prediction matrix

**Goal:** predict lookups, writes and status before tracing. Rows: owned
project, foreign project, missing project, omitted `projectId`, `""`,
`null`. Columns: POST and PATCH. For each cell write *lookup? / write? /
status*. For `null`, say which layer rejects it and why the current suite
cannot show that (hint: see the `zod` stub in 04).

**Check:** compare with the table in 07 and the answer in 06. Every cell you
can test with the existing doubles should match a case in Exercise 1's suite.

## Exercise 4 — Find the same hole in an unrepaired route

**Goal:** demonstrate that `POST /api/daytask` and `POST /api/widgets` attach
another user's `taskId`/`goalId` with no ownership lookup.

Save as `ex3-sibling-holes.test.mjs`:

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const root = process.cwd();
const { loadTypeScript } = await import(pathToFileURL(path.join(root, 'tests/helpers/load-typescript.mjs')));
const calls = [];
const record = (name, result) => async (args) => { calls.push([name, args]); return typeof result === 'function' ? result(args) : result; };
const prisma = {
  task: { findFirst: record('task.findFirst', null) },
  dayTask: { findUnique: record('dayTask.findUnique', null), findFirst: record('dayTask.findFirst', null), create: record('dayTask.create', (a) => a.data) },
  dashboardWidget: { upsert: record('dashboardWidget.upsert', (a) => a.create) },
  goal: { findFirst: record('goal.findFirst', null) },
};
const stubs = {
  'next/server': { NextRequest: class {} },
  '@/lib/schemas': { dayTaskCreateSchema: { parse: (v) => v }, widgetSchema: { parse: (v) => v } },
  '@/lib/api': { withUser: async () => ({ user: { id: 'alice' }, response: null }), handleError: (e) => Response.json({ error: String(e) }, { status: 400 }) },
  '@/lib/prisma': { prisma },
};
const req = (body) => ({ json: async () => body });

test('POST /api/daytask attaches a task id without checking its owner', async () => {
  calls.length = 0;
  const { POST } = await loadTypeScript('src/app/api/daytask/route.ts', { root, globals: { Response }, stubs });
  const res = await POST(req({ date: '2026-10-06', taskId: 'bob-task' }));
  assert.equal(res.status, 201);
  assert.ok(!calls.some(([n]) => n === 'task.findFirst'), 'no ownership lookup on the task');
  const create = calls.find(([n]) => n === 'dayTask.create')[1];
  assert.equal(create.data.taskId, 'bob-task');
  assert.equal(create.data.userId, 'alice');
});

test('POST /api/widgets attaches a goal id without checking its owner', async () => {
  calls.length = 0;
  const { POST } = await loadTypeScript('src/app/api/widgets/route.ts', { root, globals: { Response }, stubs });
  const res = await POST(req({ goalId: 'bob-goal', sortOrder: 0 }));
  assert.equal(res.status, 200);
  assert.ok(!calls.some(([n]) => n === 'goal.findFirst'));
  assert.equal(calls.find(([n]) => n === 'dashboardWidget.upsert')[1].create.goalId, 'bob-goal');
});
```

**Check:** `# pass 2` against today's code. Then, in a mutant copy (the
Exercise 2 technique), add a `prisma.task.findFirst({ where: { id: body.taskId,
userId: auth.user.id }, select: { id: true } })` guard to the daytask route
and flip the first test's expectations to `404` with no `dayTask.create`. Your
guarded copy passes; the real route fails the flipped test.

## Exercise 5 — Mass assignment in settings import

**Goal:** show which fields of an imported row the caller controls.

Save as `ex4-import-spread.test.mjs`:

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const root = process.cwd();
const { loadTypeScript } = await import(pathToFileURL(path.join(root, 'tests/helpers/load-typescript.mjs')));
const created = {};
const model = (name) => ({ deleteMany: async () => ({ count: 0 }), createMany: async ({ data }) => { created[name] = data; return { count: data.length }; } });
const tx = Object.fromEntries(['timeEntry', 'scheduleBlock', 'dayTask', 'dayPlan', 'dashboardWidget', 'goal', 'template', 'task', 'project', 'area'].map((m) => [m, model(m)]));
const prisma = { $transaction: async (fn) => fn(tx) };

test('settings import keeps caller-chosen ids and foreign keys; only userId is forced', async () => {
  const { POST } = await loadTypeScript('src/app/api/settings/import/route.ts', { root, globals: { Response }, stubs: {
    'next/server': { NextRequest: class {} },
    '@/lib/api': { withUser: async () => ({ user: { id: 'alice' }, response: null }) },
    '@/lib/prisma': { prisma },
  } });
  const res = await POST({ json: async () => ({ tasks: [{ id: 'chosen-id', projectId: 'bob-project', title: 'x', userId: 'bob' }] }) });
  assert.equal(res.status, 200);
  // JSON compare: objects built inside the vm context have a different Object prototype
  assert.equal(JSON.stringify(created.task[0]), JSON.stringify({ id: 'chosen-id', projectId: 'bob-project', title: 'x', userId: 'alice' }));
});
```

**Check:** `# pass 1`. Write down which spread order makes `userId: 'bob'`
lose, and which two fields the caller still controls.

## Exercise 6 — Is the lookup/write race exploitable here?

**Goal:** answer from repository facts, not from general principles.

**Check:** run `grep -n "userId" "src/app/api/projects/[id]/route.ts"` — the
only hits are the two `where` clauses (lines 21 and 41), so no request can
change a project's owner. Then name the one concurrent operation that *can*
interleave with task creation, say what the database does about it, and what
status the client sees (answer in 06).
