"use client";

import { useQueryClient } from "@tanstack/react-query";
import { enqueueMutation, type OfflineMutation } from "@/lib/offline/queue-db";

export function useOfflineMutation(userId: string) {
  const queryClient = useQueryClient();

  async function mutateWithQueue<T>(options: {
    endpoint: string;
    method: "POST" | "PATCH" | "DELETE";
    payload: Record<string, unknown>;
    mutationType: string;
    applyOptimistic?: () => void;
    onSuccess?: (data: T) => void;
  }) {
    options.applyOptimistic?.();

    if (!navigator.onLine) {
      const mutation: OfflineMutation = {
        id: crypto.randomUUID(),
        userId,
        type: options.mutationType,
        payload: options.payload,
        createdAt: new Date().toISOString(),
      };
      await enqueueMutation(mutation);
      return null;
    }

    const res = await fetch(options.endpoint, {
      method: options.method,
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(options.payload),
    });

    if (!res.ok) {
      throw new Error((await res.json().catch(() => ({ error: "Request failed" }))).error ?? "Request failed");
    }

    const data = (await res.json()) as T;
    options.onSuccess?.(data);
    await queryClient.invalidateQueries();
    return data;
  }

  return { mutateWithQueue };
}



