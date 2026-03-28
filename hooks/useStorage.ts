"use client";

import { useCallback, useEffect, useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useStorageStore } from "@/stores/storageStore";

export function useStorage() {
  const { accounts } = useAuth();
  const { quotas, totalUsed, totalLimit, totalFree, isLoading, refreshStorage } =
    useStorageStore();

  // Stable dependency: only re-trigger when account list changes
  const accountEmails = useMemo(
    () => accounts.map((a) => a.email).join(","),
    [accounts],
  );

  useEffect(() => {
    refreshStorage(accounts);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- accounts identity changes often; accountEmails is the stable dep
  }, [accountEmails, refreshStorage]);

  const refresh = useCallback(
    () => refreshStorage(accounts),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- same stable dep strategy
    [accountEmails, refreshStorage],
  );

  return { quotas, totalUsed, totalLimit, totalFree, isLoading, refreshStorage: refresh };
}
