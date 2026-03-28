"use client";

import { useCallback, useEffect, useMemo, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useStorageStore } from "@/stores/storageStore";
import { useToast } from "@/components/Toast";

export function useStorage() {
  const { accounts } = useAuth();
  const { quotas, totalUsed, totalLimit, totalFree, isLoading, error, refreshStorage } =
    useStorageStore();
  const { addToast } = useToast();
  const lastError = useRef<string | null>(null);

  // Stable dependency: only re-trigger when account list changes
  const accountEmails = useMemo(
    () => accounts.map((a) => a.email).join(","),
    [accounts],
  );

  useEffect(() => {
    refreshStorage(accounts);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- accounts identity changes often; accountEmails is the stable dep
  }, [accountEmails, refreshStorage]);

  // Surface errors as toasts (deduplicated)
  useEffect(() => {
    if (error && error !== lastError.current) {
      addToast({ type: "error", title: "Storage sync failed", message: error });
    }
    lastError.current = error;
  }, [error, addToast]);

  const refresh = useCallback(
    () => refreshStorage(accounts),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- same stable dep strategy
    [accountEmails, refreshStorage],
  );

  return { quotas, totalUsed, totalLimit, totalFree, isLoading, refreshStorage: refresh };
}
