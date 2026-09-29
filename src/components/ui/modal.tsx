"use client";

import { cn } from "@/lib/utils";

export function Modal({
  open,
  title,
  onClose,
  children,
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/30 p-4" role="dialog" aria-modal="true">
      <div className={cn("w-full max-w-lg rounded-xl bg-white p-4 shadow-xl")}> 
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
          <button type="button" onClick={onClose} className="rounded border px-2 py-1 text-sm text-slate-600">
            Close
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}



