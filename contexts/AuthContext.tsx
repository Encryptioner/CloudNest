"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { ConnectedAccount } from "@/types";
import * as storage from "@/services/storage";
import * as auth from "@/services/auth";
import * as drive from "@/services/drive";

interface AuthContextValue {
  clientId: string | null;
  accounts: ConnectedAccount[];
  staleAccounts: Set<string>;
  isLoading: boolean;
  isAuthenticated: boolean;
  setClientId: (id: string) => void;
  connectAccount: () => Promise<void>;
  disconnectAccount: (email: string) => void;
  refreshAccountToken: (email: string) => Promise<string | null>;
  reAuthAccount: (email: string) => Promise<void>;
  refreshAllQuotas: () => Promise<void>;
  signOut: () => void;
}

const EMPTY_SET = new Set<string>();

const AuthContext = createContext<AuthContextValue>({
  clientId: null,
  accounts: [],
  staleAccounts: EMPTY_SET,
  isLoading: true,
  isAuthenticated: false,
  setClientId: () => {},
  connectAccount: async () => {},
  disconnectAccount: () => {},
  refreshAccountToken: async () => null,
  reAuthAccount: async () => {},
  refreshAllQuotas: async () => {},
  signOut: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [clientId, setClientIdState] = useState<string | null>(null);
  const [accounts, setAccountsState] = useState<ConnectedAccount[]>([]);
  const [staleAccounts, setStaleAccounts] = useState<Set<string>>(EMPTY_SET);
  const [isLoading, setIsLoading] = useState(true);

  // Hydrate from localStorage after mount to avoid SSR/client mismatch
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time hydration from browser storage
    setClientIdState(storage.getClientId());
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time hydration from browser storage
    setAccountsState(storage.getAccounts());
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time hydration from browser storage
    setIsLoading(false);
  }, []);

  const setClientId = useCallback((id: string) => {
    storage.setClientId(id);
    setClientIdState(id);
  }, []);

  const connectAccount = useCallback(async () => {
    if (!clientId) throw new Error("No Client ID configured");

    const result = await auth.requestAccessToken(clientId);
    const quota = await drive.getStorageQuota(result.accessToken).catch(() => ({
      used: 0,
      limit: 15 * 1024 ** 3,
      free: 15 * 1024 ** 3,
    }));

    const account: ConnectedAccount = {
      email: result.email,
      accessToken: result.accessToken,
      tokenExpiry: Date.now() + result.expiresIn * 1000,
      storageQuota: quota,
    };

    storage.addAccount(account);
    setAccountsState(storage.getAccounts());
  }, [clientId]);

  const disconnectAccount = useCallback((email: string) => {
    storage.removeAccount(email);
    setAccountsState(storage.getAccounts());
  }, []);

  const refreshAccountToken = useCallback(
    async (email: string): Promise<string | null> => {
      if (!clientId) return null;

      const result = await auth.silentReAuth(clientId, email);
      if (!result) return null;

      storage.updateAccountToken(
        email,
        result.accessToken,
        Date.now() + result.expiresIn * 1000,
      );
      setAccountsState(storage.getAccounts());
      return result.accessToken;
    },
    [clientId],
  );

  const reAuthAccount = useCallback(
    async (email: string) => {
      if (!clientId) throw new Error("No Client ID configured");

      const result = await auth.requestAccessToken(clientId, email);
      storage.updateAccountToken(
        result.email,
        result.accessToken,
        Date.now() + result.expiresIn * 1000,
      );
      setAccountsState(storage.getAccounts());
      setStaleAccounts((prev) => {
        const next = new Set(prev);
        next.delete(email);
        return next;
      });
    },
    [clientId],
  );

  const signOut = useCallback(() => {
    storage.clearClientId();
    storage.setAccounts([]);
    setClientIdState(null);
    setAccountsState([]);
  }, []);

  const refreshAllQuotas = useCallback(async () => {
    const quotas = await drive.getAllQuotas(accounts);
    const updated = accounts.map((account) => {
      const quota = quotas.find((q) => q.email === account.email);
      if (quota) {
        return {
          ...account,
          storageQuota: {
            used: quota.used,
            limit: quota.limit,
            free: quota.free,
          },
        };
      }
      return account;
    });
    storage.setAccounts(updated);
    setAccountsState(updated);
  }, [accounts]);

  // Check token expiry periodically
  useEffect(() => {
    if (!clientId || accounts.length === 0) return;

    const checkExpiry = () => {
      for (const account of accounts) {
        if (auth.isTokenExpired(account.tokenExpiry)) {
          refreshAccountToken(account.email).then((token) => {
            if (!token) {
              setStaleAccounts((prev) => new Set([...prev, account.email]));
            }
          }).catch(() => {
            setStaleAccounts((prev) => new Set([...prev, account.email]));
          });
        }
      }
    };

    const interval = setInterval(checkExpiry, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [clientId, accounts, refreshAccountToken]);

  const isAuthenticated = useMemo(
    () =>
      !!clientId &&
      accounts.length > 0 &&
      accounts.some((a) => !auth.isTokenExpired(a.tokenExpiry)),
    [clientId, accounts],
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      clientId,
      accounts,
      staleAccounts,
      isLoading,
      isAuthenticated,
      setClientId,
      connectAccount,
      disconnectAccount,
      refreshAccountToken,
      reAuthAccount,
      refreshAllQuotas,
      signOut,
    }),
    [
      clientId,
      accounts,
      staleAccounts,
      isLoading,
      isAuthenticated,
      setClientId,
      connectAccount,
      disconnectAccount,
      refreshAccountToken,
      reAuthAccount,
      refreshAllQuotas,
      signOut,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  return useContext(AuthContext);
}
