"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import type { ToastMessage } from "@/types";

interface ToastContextValue {
  addToast: (toast: Omit<ToastMessage, "id">) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used within ToastProvider");
  return context;
}

const ICONS: Record<ToastMessage["type"], string> = {
  info: "ℹ",
  warning: "⚠",
  error: "✕",
  success: "✓",
};

const COLORS: Record<ToastMessage["type"], string> = {
  info: "border-blue-500/30 bg-blue-500/10",
  warning: "border-orange-500/30 bg-orange-500/10",
  error: "border-red-500/30 bg-red-500/10",
  success: "border-green-500/30 bg-green-500/10",
};

const ICON_COLORS: Record<ToastMessage["type"], string> = {
  info: "text-blue-400",
  warning: "text-orange-400",
  error: "text-red-400",
  success: "text-green-400",
};

function ToastItem({
  toast,
  onDismiss,
}: {
  toast: ToastMessage;
  onDismiss: () => void;
}) {
  return (
    <div
      className={`flex items-start gap-3 rounded-lg border px-4 py-3 shadow-lg backdrop-blur-sm animate-fade-up ${COLORS[toast.type]}`}
    >
      <span className={`mt-0.5 text-lg font-bold ${ICON_COLORS[toast.type]}`}>
        {ICONS[toast.type]}
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-cn-text">{toast.title}</p>
        {toast.message && (
          <p className="mt-0.5 text-xs text-cn-text2">{toast.message}</p>
        )}
        {toast.action && (
          <button
            onClick={toast.action.onClick}
            className="mt-1.5 text-xs font-medium text-orange-400 hover:text-orange-300"
          >
            {toast.action.label}
          </button>
        )}
      </div>
      <button
        onClick={onDismiss}
        className="text-cn-text3 hover:text-cn-text2 text-sm"
        aria-label="Dismiss"
      >
        ✕
      </button>
    </div>
  );
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = useCallback((toast: Omit<ToastMessage, "id">) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const newToast: ToastMessage = { ...toast, id };
    setToasts((prev) => [...prev, newToast]);

    const duration = toast.duration ?? 5000;
    if (duration > 0) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, duration);
    }
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const value = useMemo(() => ({ addToast, removeToast }), [addToast, removeToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 w-80">
        {toasts.map((toast) => (
          <ToastItem
            key={toast.id}
            toast={toast}
            onDismiss={() => removeToast(toast.id)}
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
}
