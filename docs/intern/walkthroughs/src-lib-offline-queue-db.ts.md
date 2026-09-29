# Walkthrough: `src/lib/offline/queue-db.ts`

## Why This File Matters
This file sits on a critical execution path for app behavior, data integrity, or user-facing workflow.

## Key Dependencies
- `import Dexie, { type Table } from "dexie";`

## Top 20-30% Code Walkthrough
The lines below were selected as the highest-impact section of this file.
- L5: `export type OfflineMutation = {`
- Why it matters: Contributes to control flow or state composition in this module.
- L24: `export const offlineDb = new OfflineDb();`
- Why it matters: Declares exported configuration/state used by other modules.
- L26: `export async function enqueueMutation(mutation: OfflineMutation) {`
- Why it matters: Defines an async entry point that other modules or routes call.
- L27: `await offlineDb.queue.put(mutation);`
- Why it matters: Contributes to control flow or state composition in this module.
- L30: `export async function getPendingMutations(userId: string) {`
- Why it matters: Defines an async entry point that other modules or routes call.
- L31: `return offlineDb.queue.where("userId").equals(userId).sortBy("createdAt");`
- Why it matters: Returns computed state/value to the caller.
- L34: `export async function removeMutations(ids: string[]) {`
- Why it matters: Defines an async entry point that other modules or routes call.
- L35: `await offlineDb.transaction("rw", offlineDb.queue, async () => {`
- Why it matters: Groups writes atomically so partial updates do not leak on failure.
- L36: `await Promise.all(ids.map((id) => offlineDb.queue.delete(id)));`
- Why it matters: Runs independent async operations in parallel for lower latency.
- L40: `export async function pendingCount(userId: string) {`
- Why it matters: Defines an async entry point that other modules or routes call.
- L41: `return offlineDb.queue.where("userId").equals(userId).count();`
- Why it matters: Returns computed state/value to the caller.

## Intern Checks
- Validate any change here against at least one route-level or UI-level flow in the app.
- Keep this file aligned with its paired contracts (Prisma schema, zod schema, or API response shape).
