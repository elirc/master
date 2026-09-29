"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";
import { getPendingMutations, pendingCount, removeMutations } from "@/lib/offline/queue-db";

export function useOfflineSync(userId: string | null | undefined) {
  const [isOffline, setIsOffline] = useState(false);
  const [pending, setPending] = useState(0);
  const [syncing, setSyncing] = useState(false);
  const queryClient = useQueryClient();

  const refreshCount = useCallback(async () => {
    if (!userId) return;
    const count = await pendingCount(userId);
    setPending(count);
  }, [userId]);

  const runSync = useCallback(async () => {
    if (!userId || !navigator.onLine || syncing) return;

    const mutations = await getPendingMutations(userId);
    if (!mutations.length) {
      setPending(0);
      return;
    }

    setSyncing(true);

    try {
      const result = await apiFetch<{ applied: string[]; failed: { id: string; error: string }[] }>("/api/sync", {
        method: "POST",
        body: JSON.stringify({ mutations }),
      });

      if (result.applied.length) {
        await removeMutations(result.applied);
        await queryClient.invalidateQueries();
      }
    } catch {
      // Keep queue intact for next attempt.
    } finally {
      setSyncing(false);
      await refreshCount();
    }
  }, [queryClient, refreshCount, syncing, userId]);

  useEffect(() => {
    const updateOnlineState = () => {
      const offline = !navigator.onLine;
      setIsOffline(offline);
      if (!offline) {
        void runSync();
      }
    };

    updateOnlineState();
    window.addEventListener("online", updateOnlineState);
    window.addEventListener("offline", updateOnlineState);

    return () => {
      window.removeEventListener("online", updateOnlineState);
      window.removeEventListener("offline", updateOnlineState);
    };
  }, [runSync]);

  useEffect(() => {
    void refreshCount();
  }, [refreshCount]);

  return useMemo(
    () => ({ isOffline, pending, syncing, runSync, refreshCount }),
    [isOffline, pending, refreshCount, runSync, syncing],
  );
}



