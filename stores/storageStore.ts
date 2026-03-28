import { create } from "zustand";
import * as drive from "@/services/drive";
import type { AccountQuota, ConnectedAccount } from "@/types";

interface StorageState {
  quotas: AccountQuota[];
  totalUsed: number;
  totalLimit: number;
  totalFree: number;
  isLoading: boolean;
  refreshStorage: (accounts: ConnectedAccount[]) => Promise<void>;
  clearStorage: () => void;
}

/** In-flight refresh promise for deduplication */
let refreshPromise: Promise<void> | null = null;

function computeTotals(
  accounts: ConnectedAccount[],
  quotas: AccountQuota[],
): { totalUsed: number; totalLimit: number; totalFree: number } {
  let totalUsed = 0;
  let totalLimit = 0;
  let totalFree = 0;

  for (const account of accounts) {
    const q = quotas.find((q) => q.email === account.email);
    if (q?.isConnected) {
      totalUsed += q.used;
      totalLimit += q.limit;
      totalFree += q.free;
    } else {
      totalUsed += account.storageQuota.used;
      totalLimit += account.storageQuota.limit;
      totalFree += account.storageQuota.free;
    }
  }

  return { totalUsed, totalLimit, totalFree };
}

function buildFallbackQuotas(accounts: ConnectedAccount[]): AccountQuota[] {
  return accounts.map((a) => ({
    email: a.email,
    used: a.storageQuota.used,
    limit: a.storageQuota.limit,
    free: a.storageQuota.free,
    isConnected: true,
  }));
}

export const useStorageStore = create<StorageState>((set) => ({
  quotas: [],
  totalUsed: 0,
  totalLimit: 0,
  totalFree: 0,
  isLoading: true,

  refreshStorage: async (accounts: ConnectedAccount[]) => {
    if (accounts.length === 0) {
      set({ quotas: [], totalUsed: 0, totalLimit: 0, totalFree: 0, isLoading: false });
      return;
    }

    // Deduplicate concurrent calls
    if (refreshPromise) {
      await refreshPromise;
      return;
    }

    // Immediately show stored quota data so the UI is never empty
    const fallback = buildFallbackQuotas(accounts);
    const fallbackTotals = computeTotals(accounts, fallback);
    set({ quotas: fallback, ...fallbackTotals, isLoading: true });

    const doRefresh = async () => {
      try {
        const results = await drive.getAllQuotas(accounts);
        const totals = computeTotals(accounts, results);
        set({ quotas: results, ...totals, isLoading: false });
      } catch {
        // Fallback already set above — just stop loading
        set({ isLoading: false });
      } finally {
        refreshPromise = null;
      }
    };

    refreshPromise = doRefresh();
    await refreshPromise;
  },

  clearStorage: () => {
    set({ quotas: [], totalUsed: 0, totalLimit: 0, totalFree: 0, isLoading: false });
  },
}));
