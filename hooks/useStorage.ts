"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import * as drive from "@/services/drive";
import type { AccountQuota } from "@/types";

export function useStorage() {
  const { accounts } = useAuth();
  const [quotas, setQuotas] = useState<AccountQuota[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refreshStorage = useCallback(async () => {
    if (accounts.length === 0) {
      setQuotas([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const results = await drive.getAllQuotas(accounts);
      setQuotas(results);
    } catch {
      // Use stored quota data as fallback
      setQuotas(
        accounts.map((a) => ({
          email: a.email,
          used: a.storageQuota.used,
          limit: a.storageQuota.limit,
          free: a.storageQuota.free,
          isConnected: true,
        })),
      );
    } finally {
      setIsLoading(false);
    }
  }, [accounts]);

  useEffect(() => {
    refreshStorage();
  }, [refreshStorage]);

  // Use live quota if connected, otherwise fall back to stored account data
  const totalUsed = accounts.reduce((sum, a) => {
    const q = quotas.find((q) => q.email === a.email);
    return sum + (q?.isConnected ? q.used : a.storageQuota.used);
  }, 0);
  const totalLimit = accounts.reduce((sum, a) => {
    const q = quotas.find((q) => q.email === a.email);
    return sum + (q?.isConnected ? q.limit : a.storageQuota.limit);
  }, 0);
  const totalFree = accounts.reduce((sum, a) => {
    const q = quotas.find((q) => q.email === a.email);
    return sum + (q?.isConnected ? q.free : a.storageQuota.free);
  }, 0);

  return { quotas, totalUsed, totalLimit, totalFree, isLoading, refreshStorage };
}
