import type { ConnectedAccount, UserProfile } from "@/types";

const KEYS = {
  CLIENT_ID: "cn_clientId",
  ACCOUNTS: "cn_accounts",
  PROFILE: "cn_profile",
  THEME: "cn_theme",
} as const;

function getItem<T>(key: string): T | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(key);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function setItem<T>(key: string, value: T): void {
  localStorage.setItem(key, JSON.stringify(value));
}

// ── Client ID ──────────────────────────────────────────────
export function getClientId(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(KEYS.CLIENT_ID);
}

export function setClientId(clientId: string): void {
  localStorage.setItem(KEYS.CLIENT_ID, clientId);
}

export function clearClientId(): void {
  localStorage.removeItem(KEYS.CLIENT_ID);
}

// ── Connected Accounts ─────────────────────────────────────
export function getAccounts(): ConnectedAccount[] {
  return getItem<ConnectedAccount[]>(KEYS.ACCOUNTS) ?? [];
}

export function setAccounts(accounts: ConnectedAccount[]): void {
  setItem(KEYS.ACCOUNTS, accounts);
}

export function addAccount(account: ConnectedAccount): void {
  if (!account.email) {
    return;
  }
  const accounts = getAccounts();
  const existing = accounts.findIndex((a) => a.email === account.email);
  if (existing >= 0) {
    accounts[existing] = account;
  } else {
    accounts.push(account);
  }
  setAccounts(accounts);
}

export function removeAccount(email: string): void {
  const accounts = getAccounts().filter((a) => a.email !== email);
  setAccounts(accounts);
}

export function updateAccountToken(
  email: string,
  accessToken: string,
  tokenExpiry: number,
): void {
  const accounts = getAccounts();
  const account = accounts.find((a) => a.email === email);
  if (account) {
    account.accessToken = accessToken;
    account.tokenExpiry = tokenExpiry;
    setAccounts(accounts);
  }
}

// ── Profile ────────────────────────────────────────────────
export function getProfile(): UserProfile {
  return (
    getItem<UserProfile>(KEYS.PROFILE) ?? {
      displayName: "",
      bio: "",
      avatarUrl: null,
    }
  );
}

export function setProfile(profile: UserProfile): void {
  setItem(KEYS.PROFILE, profile);
}

// ── Theme ──────────────────────────────────────────────────
export function getTheme(): "dark" | "light" {
  if (typeof window === "undefined") return "dark";
  return (localStorage.getItem(KEYS.THEME) as "dark" | "light") ?? "dark";
}

export function setTheme(theme: "dark" | "light"): void {
  localStorage.setItem(KEYS.THEME, theme);
}
