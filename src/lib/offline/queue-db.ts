"use client";

import Dexie, { type Table } from "dexie";

export type OfflineMutation = {
  id: string;
  userId: string;
  type: string;
  payload: Record<string, unknown>;
  createdAt: string;
};

class OfflineDb extends Dexie {
  queue!: Table<OfflineMutation, string>;

  constructor() {
    super("master-life-plan-db");
    this.version(1).stores({
      queue: "id, userId, createdAt, type",
    });
  }
}

export const offlineDb = new OfflineDb();

export async function enqueueMutation(mutation: OfflineMutation) {
  await offlineDb.queue.put(mutation);
}

export async function getPendingMutations(userId: string) {
  return offlineDb.queue.where("userId").equals(userId).sortBy("createdAt");
}

export async function removeMutations(ids: string[]) {
  await offlineDb.transaction("rw", offlineDb.queue, async () => {
    await Promise.all(ids.map((id) => offlineDb.queue.delete(id)));
  });
}

export async function pendingCount(userId: string) {
  return offlineDb.queue.where("userId").equals(userId).count();
}



