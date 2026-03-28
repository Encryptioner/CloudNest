"use client";

import { useCallback, useEffect, useMemo, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useFileStore } from "@/stores/fileStore";
import { useToast } from "@/components/Toast";

export function useFiles() {
  const { accounts } = useAuth();
  const { files, isLoading, error, loadInitial, refreshFiles } = useFileStore();
  const { addToast } = useToast();
  const lastError = useRef<string | null>(null);

  // Stable dependency: only re-trigger when account list changes
  const accountEmails = useMemo(
    () => accounts.map((a) => a.email).join(","),
    [accounts],
  );

  useEffect(() => {
    loadInitial(accounts);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- accounts identity changes often; accountEmails is the stable dep
  }, [accountEmails, loadInitial]);

  // Surface errors as toasts (deduplicated)
  useEffect(() => {
    if (error && error !== lastError.current) {
      addToast({ type: "error", title: "File sync failed", message: error });
    }
    lastError.current = error;
  }, [error, addToast]);

  const refresh = useCallback(
    () => refreshFiles(accounts),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- same stable dep strategy
    [accountEmails, refreshFiles],
  );

  return { files, isLoading, error, refreshFiles: refresh };
}
