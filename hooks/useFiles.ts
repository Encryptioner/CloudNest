"use client";

import { useCallback, useEffect, useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useFileStore } from "@/stores/fileStore";

export function useFiles() {
  const { accounts } = useAuth();
  const { files, isLoading, error, loadInitial, refreshFiles } = useFileStore();

  // Stable dependency: only re-trigger when account list changes
  const accountEmails = useMemo(
    () => accounts.map((a) => a.email).join(","),
    [accounts],
  );

  useEffect(() => {
    loadInitial(accounts);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- accounts identity changes often; accountEmails is the stable dep
  }, [accountEmails, loadInitial]);

  const refresh = useCallback(
    () => refreshFiles(accounts),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- same stable dep strategy
    [accountEmails, refreshFiles],
  );

  return { files, isLoading, error, refreshFiles: refresh };
}
