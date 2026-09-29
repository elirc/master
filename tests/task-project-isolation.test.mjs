import test from 'node:test';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { loadTypeScript } from './helpers/load-typescript.mjs';

const root = fileURLToPath(new URL('..', import.meta.url));
let body;
let authUser = { id: 'user-1' };
let projectResult = null;
let taskCount = 1;
const projectReads = [];
const taskWrites = [];
const taskReads = [];
const taskCreates = [];
const prisma = {
  project: { async findFirst(args) { projectReads.push(args); return projectResult; } },
  task: {
    async create(args) { taskCreates.push(args); return { id: 'new-task', ...args.data }; },
    async updateMany(args) { taskWrites.push(args); return { count: taskCount }; },
    async findUnique(args) { taskReads.push(args); return { id: 'task-1', projectId: body.projectId }; },
  },
};
const { PATCH } = await loadTypeScript('src/app/api/tasks/[id]/route.ts', {
  root,
  globals: { Response },
  stubs: {
    'next/server': { NextRequest: class {} },
    zod: { z: {
      string: () => ({ optional() { return this; }, nullable() { return this; }, trim() { return this; }, min() { return this; }, max() { return this; } }),
      array: () => ({ optional() { return this; } }),
      number: () => ({ int() { return this; }, min() { return this; }, max() { return this; }, optional() { return this; } }),
      boolean: () => ({ optional() { return this; } }),
      object: () => ({ parse: (value) => value }),
    } },
    '@/lib/api': { withUser: async () => ({ user: authUser, response: authUser ? null : Response.json({ error: 'Unauthorized' }, { status: 401 }) }), handleError: (error) => Response.json({ error: String(error) }, { status: 400 }) },
    '@/lib/prisma': { prisma },
  },
});
const { POST } = await loadTypeScript('src/app/api/tasks/route.ts', {
  root,
  globals: { Response },
  stubs: {
    'next/server': { NextRequest: class {} },
    '@/lib/schemas': { taskSchema: { parse: (value) => value } },
    '@/lib/api': { withUser: async () => ({ user: authUser, response: authUser ? null : Response.json({ error: 'Unauthorized' }, { status: 401 }) }), handleError: (error) => Response.json({ error: String(error) }, { status: 400 }) },
    '@/lib/prisma': { prisma },
  },
});

function request(nextBody) { body = nextBody; return { async json() { return nextBody; } }; }
function same(actual, expected) { assert.equal(JSON.stringify(actual), JSON.stringify(expected)); }
function reset() {
  authUser = { id: 'user-1' };
  projectResult = null;
  taskCount = 1;
  projectReads.length = 0;
  taskWrites.length = 0;
  taskReads.length = 0;
  taskCreates.length = 0;
}

test('rejects a foreign or empty destination before task write', async () => {
  reset();
  const foreign = await PATCH(request({ projectId: 'foreign-project' }), { params: Promise.resolve({ id: 'task-1' }) });
  assert.equal(foreign.status, 404);
  same(projectReads[0], { where: { id: 'foreign-project', userId: 'user-1' }, select: { id: true } });
  assert.equal(taskWrites.length, 0);

  reset();
  const empty = await PATCH(request({ projectId: '' }), { params: Promise.resolve({ id: 'task-1' }) });
  assert.equal(empty.status, 404);
  same(projectReads[0], { where: { id: '', userId: 'user-1' }, select: { id: true } });
  assert.equal(taskWrites.length, 0);
});

test('updates an owned destination with user-scoped arguments and rereads task', async () => {
  reset();
  projectResult = { id: 'owned-project' };
  const response = await PATCH(request({ projectId: 'owned-project', title: 'Renamed' }), { params: Promise.resolve({ id: 'task-1' }) });
  assert.equal(response.status, 200);
  same(taskWrites[0], { where: { id: 'task-1', userId: 'user-1' }, data: { projectId: 'owned-project', title: 'Renamed' } });
  same(taskReads[0], { where: { id: 'task-1' } });
});

test('omitted projectId skips project lookup while preserving task ownership', async () => {
  reset();
  const response = await PATCH(request({ title: 'Renamed' }), { params: Promise.resolve({ id: 'task-1' }) });
  assert.equal(response.status, 200);
  assert.equal(projectReads.length, 0);
  same(taskWrites[0], { where: { id: 'task-1', userId: 'user-1' }, data: { title: 'Renamed' } });
});

test('returns 404 without reread when owned task update matches nothing', async () => {
  reset();
  taskCount = 0;
  const response = await PATCH(request({ title: 'Renamed' }), { params: Promise.resolve({ id: 'task-1' }) });
  assert.equal(response.status, 404);
  assert.equal(taskReads.length, 0);
});

test('unauthenticated request performs no reads or writes', async () => {
  reset();
  authUser = null;
  const response = await PATCH(request({ projectId: 'foreign-project' }), { params: Promise.resolve({ id: 'task-1' }) });
  assert.equal(response.status, 401);
  assert.equal(projectReads.length, 0);
  assert.equal(taskWrites.length, 0);
});

test('POST rejects a foreign project before create', async () => {
  reset();
  const response = await POST(request({ projectId: 'foreign-project', title: 'New task' }));
  assert.equal(response.status, 404);
  same(projectReads[0], { where: { id: 'foreign-project', userId: 'user-1' }, select: { id: true } });
  assert.equal(taskCreates.length, 0);
});

test('POST creates with the owned project and authenticated user payload', async () => {
  reset();
  projectResult = { id: 'owned-project' };
  const response = await POST(request({ projectId: 'owned-project', title: 'New task' }));
  assert.equal(response.status, 201);
  same(taskCreates[0], { data: { userId: 'user-1', projectId: 'owned-project', title: 'New task', notes: null, tags: [], defaultEstimateMin: 30, archived: false } });
});
