import { create } from "zustand";
import * as drive from "@/services/drive";
import * as fileCache from "@/services/fileCache";
import type { ConnectedAccount, FileMetadata } from "@/types";

interface FileState {
  files: FileMetadata[];
  isLoading: boolean;
  error: string | null;
  refreshFiles: (accounts: ConnectedAccount[]) => Promise<void>;
  loadInitial: (accounts: ConnectedAccount[]) => Promise<void>;
  clearFiles: () => void;
}

/** Version counter to prevent stale writes from outdated async operations */
let version = 0;

export const useFileStore = create<FileState>((set) => ({
  files: [],
  isLoading: true,
  error: null,

  refreshFiles: async (accounts: ConnectedAccount[]) => {
    if (accounts.length === 0) {
      set({ files: [], isLoading: false, error: null });
      return;
    }

    const currentVersion = ++version;
    set({ isLoading: true, error: null });

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
          // Fall back to cached files for this account instead of dropping them
          try {
            const cached = await fileCache.getCachedFiles(account.email);
            allFiles.push(...cached);
          } catch {
            // Cache also failed — nothing we can do for this account
          }
        }
      }

      // Only update if this is still the latest refresh
      if (currentVersion === version) {
        set({ files: allFiles, isLoading: false });
      }
    } catch (err) {
      if (currentVersion === version) {
        // Total failure — try to preserve whatever we have in cache
        try {
          const cached = await fileCache.getCachedFiles();
          set({
            files: cached,
            error: err instanceof Error ? err.message : "Failed to load files",
            isLoading: false,
          });
        } catch {
          set({
            files: [],
            error: err instanceof Error ? err.message : "Failed to load files",
            isLoading: false,
          });
        }
      }
    }
  },

  loadInitial: async (accounts: ConnectedAccount[]) => {
    if (accounts.length === 0) {
      set({ files: [], isLoading: false, error: null });
      return;
    }

    const currentVersion = ++version;

    try {
      // Load from cache first for instant display
      const cached = await fileCache.getCachedFiles();
      if (currentVersion === version && cached.length > 0) {
        set({ files: cached, isLoading: false });
      }

      // Sync from API if cache is stale
      const stale = await fileCache.isCacheStale();
      if (stale && currentVersion === version) {
        const store = useFileStore.getState();
        await store.refreshFiles(accounts);
      } else if (currentVersion === version) {
        set({ isLoading: false });
      }
    } catch {
      if (currentVersion === version) {
        const store = useFileStore.getState();
        await store.refreshFiles(accounts);
      }
    }
  },

  clearFiles: () => {
    version++;
    set({ files: [], isLoading: false, error: null });
  },
}));
