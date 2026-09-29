"use client";

import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

export function ToastViewport() {
  const { toasts, dismissToast } = useToast();

  return (
    <div className="pointer-events-none fixed right-4 top-4 z-50 flex w-full max-w-sm flex-col gap-2">
      {toasts.map((toast) => (
        <button
          key={toast.id}
          type="button"
          onClick={() => dismissToast(toast.id)}
          className={cn(
            "pointer-events-auto rounded-lg border px-4 py-3 text-left text-sm shadow-sm",
            toast.type === "error" && "border-red-300 bg-red-50 text-red-900",
            toast.type === "success" && "border-emerald-300 bg-emerald-50 text-emerald-900",
            toast.type === "info" && "border-slate-300 bg-white text-slate-900",
          )}
        >
          {toast.message}
        </button>
      ))}
    </div>
  );
}



