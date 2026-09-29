"use client";

export function OfflineBanner({
  isOffline,
  pending,
  syncing,
  onSync,
}: {
  isOffline: boolean;
  pending: number;
  syncing: boolean;
  onSync: () => void;
}) {
  if (!isOffline && pending === 0) return null;

  return (
    <div className="sticky top-0 z-30 border-b border-amber-300 bg-amber-50 px-4 py-2 text-sm text-amber-900">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4">
        <p>
          {isOffline ? "Offline mode active." : "Back online."} {pending} pending change{pending === 1 ? "" : "s"}.
        </p>
        {!isOffline && pending > 0 && (
          <button
            type="button"
            disabled={syncing}
            onClick={onSync}
            className="rounded border border-amber-500 px-2 py-1 text-xs font-medium"
          >
            {syncing ? "Syncing..." : "Sync now"}
          </button>
        )}
      </div>
    </div>
  );
}



