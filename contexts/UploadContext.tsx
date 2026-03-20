"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import * as drive from "@/services/drive";
import { useAuth } from "@/contexts/AuthContext";

type Snack = { id: number; name: string; progress: number; status: "uploading" | "done" | "error" };
type Toast = { id: number; message: string; type: "loading" | "success" | "error" };
type ConfirmState = { message: string; description?: string; confirmLabel: string; danger: boolean; onConfirm: () => void };

interface UploadCtx {
  upload: (file: File, parentFolderDriveId?: string | null) => void;
  addCompleteListener: (fn: () => void) => () => void;
  setCurrentFolder: (folderId: string | null, folderName?: string | null) => void;
  toast: (message: string, type: "loading" | "success" | "error") => number;
  updateToast: (id: number, type: "success" | "error", message: string) => void;
  confirm: (message: string, onConfirm: () => void, opts?: { description?: string; confirmLabel?: string; danger?: boolean }) => void;
}

const UploadContext = createContext<UploadCtx>({
  upload: () => {},
  addCompleteListener: () => () => {},
  setCurrentFolder: () => {},
  toast: () => 0,
  updateToast: () => {},
  confirm: () => {},
} as UploadCtx);

export function UploadProvider({ children }: { children: React.ReactNode }) {
  const { accounts } = useAuth();
  const [snacks, setSnacks] = useState<Snack[]>([]);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [confirmState, setConfirmState] = useState<ConfirmState | null>(null);
  const [dragging, setDragging] = useState(false);
  const idRef = useRef(0);
  const listeners = useRef<Set<() => void>>(new Set());
  const dragCounter = useRef(0);
  const currentFolderRef = useRef<string | null>(null);
  const currentFolderNameRef = useRef<string | null>(null);

  function addCompleteListener(fn: () => void) {
    listeners.current.add(fn);
    return () => listeners.current.delete(fn);
  }

  function setCurrentFolder(folderId: string | null, folderName?: string | null) {
    currentFolderRef.current = folderId;
    currentFolderNameRef.current = folderName ?? null;
  }

  function toast(message: string, type: "loading" | "success" | "error"): number {
    const id = ++idRef.current;
    setToasts((t) => [...t, { id, message, type }]);
    if (type !== "loading") {
      setTimeout(() => setToasts((t) => t.filter((item) => item.id !== id)), type === "error" ? 5000 : 3000);
    }
    return id;
  }

  function updateToast(id: number, type: "success" | "error", message: string) {
    setToasts((t) => t.map((item) => (item.id === id ? { ...item, type, message } : item)));
    setTimeout(() => setToasts((t) => t.filter((item) => item.id !== id)), type === "error" ? 5000 : 3000);
  }

  function confirm(
    message: string,
    onConfirm: () => void,
    opts?: { description?: string; confirmLabel?: string; danger?: boolean },
  ) {
    setConfirmState({
      message,
      description: opts?.description,
      confirmLabel: opts?.confirmLabel ?? "Confirm",
      danger: opts?.danger ?? false,
      onConfirm,
    });
  }

  const upload = useCallback((file: File, parentFolderDriveId?: string | null) => {
    const id = ++idRef.current;
    setSnacks((s) => [...s, { id, name: file.name, progress: 0, status: "uploading" }]);

    const bestAccount = drive.pickBestAccount(accounts);
    if (!bestAccount) {
      setSnacks((s) => s.map((sn) => (sn.id === id ? { ...sn, status: "error" } : sn)));
      setTimeout(() => setSnacks((s) => s.filter((sn) => sn.id !== id)), 5000);
      return;
    }

    const parentId = parentFolderDriveId !== undefined ? parentFolderDriveId : currentFolderRef.current;

    drive
      .uploadFile(
        bestAccount.accessToken,
        file,
        parentId ?? undefined,
        (pct) => {
          setSnacks((s) =>
            s.map((sn) => (sn.id === id ? { ...sn, progress: pct } : sn)),
          );
        },
      )
      .then(() => {
        setSnacks((s) =>
          s.map((sn) =>
            sn.id === id ? { ...sn, status: "done", progress: 100 } : sn,
          ),
        );
        listeners.current.forEach((fn) => fn());
        setTimeout(() => setSnacks((s) => s.filter((sn) => sn.id !== id)), 3000);
      })
      .catch(() => {
        setSnacks((s) =>
          s.map((sn) => (sn.id === id ? { ...sn, status: "error" } : sn)),
        );
        setTimeout(() => setSnacks((s) => s.filter((sn) => sn.id !== id)), 5000);
      });
  }, [accounts]);

  useEffect(() => {
    function onDragEnter(e: DragEvent) {
      if (e.dataTransfer?.types.includes("application/x-cloudnest-file-id")) return;
      e.preventDefault();
      dragCounter.current++;
      if (dragCounter.current === 1) setDragging(true);
    }
    function onDragLeave() {
      dragCounter.current--;
      if (dragCounter.current === 0) setDragging(false);
    }
    function onDragOver(e: DragEvent) {
      if (e.dataTransfer?.types.includes("application/x-cloudnest-file-id")) return;
      e.preventDefault();
    }
    function onDrop(e: DragEvent) {
      if (e.dataTransfer?.types.includes("application/x-cloudnest-file-id")) return;
      e.preventDefault();
      dragCounter.current = 0;
      setDragging(false);
      Array.from(e.dataTransfer?.files ?? []).forEach((f) => upload(f));
    }

    window.addEventListener("dragenter", onDragEnter);
    window.addEventListener("dragleave", onDragLeave);
    window.addEventListener("dragover", onDragOver);
    window.addEventListener("drop", onDrop);
    return () => {
      window.removeEventListener("dragenter", onDragEnter);
      window.removeEventListener("dragleave", onDragLeave);
      window.removeEventListener("dragover", onDragOver);
      window.removeEventListener("drop", onDrop);
    };
  }, [upload]);

  return (
    <UploadContext.Provider value={{ upload, addCompleteListener, setCurrentFolder, toast, updateToast, confirm }}>
      {children}

      {/* Drag-to-upload overlay */}
      {dragging && (
        <div className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center bg-cn-bg/80 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-4 rounded-2xl border-2 border-dashed border-orange-500/60 bg-cn-s1/80 px-16 py-12">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-orange-500/20 bg-orange-500/10">
              <svg className="h-8 w-8 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
              </svg>
            </div>
            <div className="text-center">
              <p className="text-lg font-semibold text-cn-text">Drop to upload</p>
              <p className="mt-1 text-sm text-cn-text2">Files will be uploaded to your connected drives</p>
            </div>
          </div>
        </div>
      )}

      {/* Confirm dialog */}
      {confirmState && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={() => setConfirmState(null)}
        >
          <div
            className="w-full max-w-sm rounded-2xl border border-cn-border bg-cn-s1 p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-sm font-semibold text-cn-text">{confirmState.message}</p>
            {confirmState.description && (
              <p className="mt-1.5 text-xs text-cn-text3">{confirmState.description}</p>
            )}
            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => setConfirmState(null)}
                className="rounded-lg border border-cn-border px-4 py-2 text-xs text-cn-text2 transition hover:bg-cn-hover"
              >
                Cancel
              </button>
              <button
                onClick={() => { const fn = confirmState.onConfirm; setConfirmState(null); fn(); }}
                className={`rounded-lg px-4 py-2 text-xs font-medium transition ${
                  confirmState.danger
                    ? "bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20"
                    : "bg-orange-500 text-white hover:bg-orange-400"
                }`}
              >
                {confirmState.confirmLabel}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Status toasts + upload snacks */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2" style={{ maxWidth: "320px" }}>
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`flex items-center gap-3 rounded-xl border px-4 py-3 shadow-xl ${
              t.type === "success"
                ? "border-emerald-500/30 bg-cn-s1"
                : t.type === "error"
                ? "border-red-500/30 bg-cn-s1"
                : "border-cn-border bg-cn-s1"
            }`}
          >
            {t.type === "loading" ? (
              <div className="h-5 w-5 flex-shrink-0 animate-spin rounded-full border-2 border-cn-border border-t-orange-500" />
            ) : t.type === "success" ? (
              <div className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-emerald-500/20">
                <svg className="h-3 w-3 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                </svg>
              </div>
            ) : (
              <div className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-red-500/20">
                <svg className="h-3 w-3 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>
              </div>
            )}
            <p className="text-xs font-medium text-cn-text">{t.message}</p>
          </div>
        ))}

        {snacks.map((snack) => (
          <div
            key={snack.id}
            className="flex items-center gap-3 rounded-xl border border-cn-border bg-cn-s1 px-4 py-3 shadow-xl"
          >
            {snack.status === "uploading" ? (
              <div className="h-5 w-5 flex-shrink-0 animate-spin rounded-full border-2 border-cn-border border-t-orange-500" />
            ) : snack.status === "done" ? (
              <div className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-emerald-500/20">
                <svg className="h-3 w-3 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                </svg>
              </div>
            ) : (
              <div className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-red-500/20">
                <svg className="h-3 w-3 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-medium text-cn-text">{snack.name}</p>
              {snack.status === "uploading" ? (
                <div className="mt-1.5 h-1 w-full overflow-hidden rounded-full bg-cn-border">
                  <div
                    className="h-full rounded-full bg-orange-500 transition-all duration-300"
                    style={{ width: `${snack.progress}%` }}
                  />
                </div>
              ) : (
                <p className="mt-0.5 text-[10px] text-cn-text3">
                  {snack.status === "done" ? "Upload complete" : "Upload failed"}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </UploadContext.Provider>
  );
}

export const useUpload = () => useContext(UploadContext);
