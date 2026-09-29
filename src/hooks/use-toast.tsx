"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";

type Toast = {
  id: string;
  message: string;
  type: "info" | "error" | "success";
};

type ToastContextShape = {
  toasts: Toast[];
  showToast: (message: string, type?: Toast["type"]) => void;
  dismissToast: (id: string) => void;
};

const ToastContext = createContext<ToastContextShape | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback((message: string, type: Toast["type"] = "info") => {
    const id = crypto.randomUUID();
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((item) => item.id !== id));
    }, 3500);
  }, []);

  const value = useMemo(
    () => ({ toasts, showToast, dismissToast }),
    [dismissToast, showToast, toasts],
  );

  return <ToastContext.Provider value={value}>{children}</ToastContext.Provider>;
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return context;
}



