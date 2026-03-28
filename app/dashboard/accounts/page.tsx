"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useStorage } from "@/hooks/useStorage";
import { formatBytes } from "@/utils/format";

export default function AccountsPage() {
  const { accounts, staleAccounts, connectAccount, disconnectAccount, reAuthAccount } = useAuth();
  const { quotas, totalUsed, totalLimit, totalFree, refreshStorage } = useStorage();
  const [connecting, setConnecting] = useState(false);
  const [confirmDisconnect, setConfirmDisconnect] = useState<string | null>(null);

  const connectedCount = accounts.length;

  async function handleConnect() {
    if (connecting) return;
    setConnecting(true);
    try {
      await connectAccount();
      await refreshStorage();
    } catch {
      // Connect failed or user cancelled
    }
    setConnecting(false);
  }

  function handleDisconnect(email: string) {
    disconnectAccount(email);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-cn-text">Accounts</h1>
          <p className="mt-1 text-sm text-cn-text2">
            {connectedCount} account{connectedCount !== 1 ? "s" : ""} connected
          </p>
        </div>
        <button
          onClick={handleConnect}
          disabled={connecting}
          className="flex items-center gap-1.5 rounded-lg bg-orange-500 px-3 py-2 text-xs font-medium text-white transition hover:bg-orange-400 disabled:opacity-60"
        >
          {connecting ? (
            <svg className="h-3.5 w-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z" />
            </svg>
          ) : (
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
          )}
          {connecting ? "Connecting..." : "Connect another account"}
        </button>
      </div>

      {/* Connection guide hint */}
      <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 px-4 py-3">
        <div className="flex items-start gap-3">
          <svg className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
          </svg>
          <div>
            <p className="text-xs text-cn-text2">
              <strong className="text-amber-400">When connecting:</strong> Google will show a &quot;This app isn&apos;t verified&quot; warning.
              Click <strong className="text-cn-text">Advanced</strong> → <strong className="text-cn-text">Go to [app name] (unsafe)</strong> → <strong className="text-cn-text">Continue</strong>.
              This is normal for personal projects in testing mode.
            </p>
            <p className="mt-1 text-[10px] text-cn-text3">
              New accounts must be added as test users in your{" "}
              <a href="https://console.cloud.google.com/apis/credentials/consent" target="_blank" rel="noopener noreferrer" className="text-orange-400 hover:underline">Google Cloud Console</a>{" "}
              first.
            </p>
          </div>
        </div>
      </div>

      {/* Storage pool overview */}
      <div className="rounded-xl border border-cn-border bg-cn-s1 p-5">
        <div className="mb-4 flex items-end justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-cn-text3">Total Storage Pool</p>
            <p className="mt-1 text-3xl font-semibold text-cn-text">{formatBytes(totalLimit)}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-cn-text2">{formatBytes(totalUsed)} used</p>
            <p className="text-sm text-cn-text3">{formatBytes(totalFree)} free</p>
          </div>
        </div>
        <div className="h-2.5 w-full overflow-hidden rounded-full bg-cn-hover">
          <div
            className="h-full rounded-full bg-orange-500 transition-all duration-700"
            style={{ width: `${totalLimit > 0 ? Math.min(100, (totalUsed / totalLimit) * 100) : 0}%` }}
          />
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {quotas.filter((q) => q.isConnected).map((q) => (
            <div key={q.email} className="flex items-center gap-2 rounded-lg border border-cn-border bg-cn-bg px-3 py-1.5">
              <span className="h-2 w-2 rounded-full bg-orange-500/80" />
              <span className="text-xs text-cn-text2">{q.email}</span>
              <span className="text-xs text-cn-text3">{formatBytes(q.used)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Drive accounts section */}
      <div>
        <h2 className="mb-3 text-sm font-medium text-cn-text">Google Drive Accounts</h2>
        {accounts.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-cn-border bg-cn-s1 py-16 text-center">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl border border-cn-border bg-cn-bg">
              <svg className="h-6 w-6 text-cn-text3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
              </svg>
            </div>
            <p className="text-sm text-cn-text3">No accounts connected yet.</p>
            <p className="mt-1 text-xs text-cn-text3">Connect a Google Drive account to get started.</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {accounts.map((account) => {
              const quota = quotas.find((q) => q.email === account.email);
              const hasLiveQuota = quota?.isConnected;
              const used = hasLiveQuota ? quota.used : account.storageQuota.used;
              const limit = hasLiveQuota ? quota.limit : account.storageQuota.limit;
              const free = hasLiveQuota ? quota.free : account.storageQuota.free;
              const pct = limit > 0 ? Math.min(100, (used / limit) * 100) : 0;

              return (
                <div
                  key={account.email}
                  className="rounded-xl border border-cn-border bg-cn-s1 p-5 transition"
                >
                  <div className="mb-4 flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-cn-text">
                        {account.email}
                      </p>
                      <div className="mt-1 flex items-center gap-1.5">
                        {staleAccounts.has(account.email) ? (
                          <>
                            <span className="inline-block h-1.5 w-1.5 rounded-full bg-amber-400" />
                            <span className="text-xs text-amber-400">Needs Re-auth</span>
                          </>
                        ) : (
                          <>
                            <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400" />
                            <span className="text-xs text-emerald-400">Connected</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="mb-4 space-y-1.5">
                    <div className="flex justify-between text-xs text-cn-text3">
                      <span>{formatBytes(used)} used</span>
                      <span>{pct.toFixed(0)}%</span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-cn-hover">
                      <div
                        className={`h-full rounded-full transition-all ${pct > 80 ? "bg-red-500" : "bg-orange-500"}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-cn-text3">
                      <span>{formatBytes(free)} free</span>
                      <span>of {formatBytes(limit)}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {staleAccounts.has(account.email) && (
                      <button
                        onClick={() => reAuthAccount(account.email)}
                        className="w-full rounded-lg border border-amber-500/40 py-2 text-xs font-medium text-amber-400 transition hover:bg-amber-500/10"
                      >
                        Re-authenticate
                      </button>
                    )}
                    {confirmDisconnect === account.email ? (
                      <div className="flex gap-1.5">
                        <button
                          onClick={() => { handleDisconnect(account.email); setConfirmDisconnect(null); }}
                          className="flex-1 rounded-lg bg-red-500 py-2 text-xs font-medium text-white transition hover:bg-red-400"
                        >
                          Confirm
                        </button>
                        <button
                          onClick={() => setConfirmDisconnect(null)}
                          className="rounded-lg border border-cn-border px-3 py-2 text-xs text-cn-text2 transition hover:bg-cn-hover"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setConfirmDisconnect(account.email)}
                        className="w-full rounded-lg border border-cn-border py-2 text-xs text-cn-text2 transition hover:border-red-500/40 hover:text-red-400"
                      >
                        Disconnect
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
