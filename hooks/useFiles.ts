"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import * as drive from "@/services/drive";
import * as fileCache from "@/services/fileCache";
import type { FileMetadata } from "@/types";

export function useFiles() {
  const { accounts } = useAuth();
  const [files, setFiles] = useState<FileMetadata[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshFiles = useCallback(async () => {
    if (accounts.length === 0) {
      setFiles([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const allFiles: FileMetadata[] = [];

      for (const account of accounts) {
        try {
          const accountFiles = await drive.syncAllFiles(
            account.accessToken,
            account.email,
          );
          allFiles.push(...accountFiles);
          await fileCache.cacheFiles(account.email, accountFiles);
        } catch (err) {
          console.warn(`Failed to sync files for ${account.email}:`, err);
        }
      }

      setFiles(allFiles);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load files");
    } finally {
      setIsLoading(false);
    }
  }, [accounts]);

  // Load from cache first, then sync if stale
  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const cached = await fileCache.getCachedFiles();
        if (!cancelled && cached.length > 0) {
          setFiles(cached);
          setIsLoading(false);
        }

        const stale = await fileCache.isCacheStale();
        if (stale && !cancelled) {
          await refreshFiles();
        } else if (!cancelled) {
          setIsLoading(false);
        }
      } catch {
        if (!cancelled) {
          await refreshFiles();
        }
      }
    }

    load();
    return () => { cancelled = true; };
  }, [refreshFiles]);

  return { files, isLoading, error, refreshFiles };
}
