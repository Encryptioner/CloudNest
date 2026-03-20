"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useStorage } from "@/hooks/useStorage";
import * as storage from "@/services/storage";
import type { UserProfile } from "@/types";
import { formatBytes } from "@/utils/format";

export default function SettingsPage() {
  const { clientId, accounts, staleAccounts, setClientId, connectAccount, disconnectAccount, reAuthAccount } = useAuth();
  const { quotas, totalUsed, totalLimit, refreshStorage } = useStorage();
  const [connecting, setConnecting] = useState(false);
  const [editingClientId, setEditingClientId] = useState(false);
  const [clientIdInput, setClientIdInput] = useState(clientId ?? "");
  const [profile, setProfile] = useState<UserProfile>(() => storage.getProfile());
  const [profileSaved, setProfileSaved] = useState(false);
  const [confirmDisconnect, setConfirmDisconnect] = useState<string | null>(null);

  const connectedCount = accounts.length;

  function saveClientId() {
    const trimmed = clientIdInput.trim();
    if (trimmed) {
      setClientId(trimmed);
    }
    setEditingClientId(false);
  }

  function handleProfileChange(field: keyof UserProfile, value: string) {
    setProfile((prev) => {
      const updated = { ...prev, [field]: value || (field === "avatarUrl" ? null : "") };
      storage.setProfile(updated);
      return updated;
    });
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 2000);
  }

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
          <h1 className="text-xl font-semibold text-cn-text">Settings</h1>
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

      {/* Client ID */}
      <div className="rounded-xl border border-cn-border bg-cn-s1 p-5">
        <h2 className="mb-3 text-sm font-medium text-cn-text">Google Cloud Client ID</h2>
        <p className="mb-3 text-xs text-cn-text3">
          Your OAuth Client ID from Google Cloud Console. Required to connect Google Drive accounts.
        </p>
        {editingClientId ? (
          <div className="flex gap-2">
            <input
              autoFocus
              value={clientIdInput}
              onChange={(e) => setClientIdInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") saveClientId(); if (e.key === "Escape") { setEditingClientId(false); setClientIdInput(clientId ?? ""); } }}
              placeholder="Enter your Client ID..."
              className="flex-1 rounded-lg border border-orange-500/50 bg-cn-bg px-3 py-2 text-xs text-cn-text outline-none"
            />
            <button
              onClick={saveClientId}
              className="rounded-lg bg-orange-500 px-4 py-2 text-xs font-medium text-white transition hover:bg-orange-400"
            >
              Save
            </button>
            <button
              onClick={() => { setEditingClientId(false); setClientIdInput(clientId ?? ""); }}
              className="rounded-lg border border-cn-border px-3 py-2 text-xs text-cn-text2 transition hover:bg-cn-hover"
            >
              Cancel
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <div className="flex-1 rounded-lg border border-cn-border bg-cn-bg px-3 py-2">
              <span className="text-xs text-cn-text">
                {clientId ? `${clientId.slice(0, 24)}...` : "Not configured"}
              </span>
            </div>
            <button
              onClick={() => setEditingClientId(true)}
              className="rounded-lg border border-cn-border px-3 py-2 text-xs text-cn-text2 transition hover:border-orange-500/30 hover:text-orange-400"
            >
              Edit
            </button>
          </div>
        )}
      </div>

      {/* Profile */}
      <div className="rounded-xl border border-cn-border bg-cn-s1 p-5">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-medium text-cn-text">Profile</h2>
          {profileSaved && (
            <span className="flex items-center gap-1 text-xs text-emerald-400">
              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
              </svg>
              Saved
            </span>
          )}
        </div>
        <div className="space-y-3">
          <div>
            <label className="mb-1 block text-xs text-cn-text3">Display Name</label>
            <input
              value={profile.displayName}
              onChange={(e) => handleProfileChange("displayName", e.target.value)}
              placeholder="Your name"
              className="w-full rounded-lg border border-cn-border bg-cn-bg px-3 py-2 text-xs text-cn-text placeholder-cn-text3 outline-none focus:border-orange-500/50"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-cn-text3">Bio</label>
            <textarea
              value={profile.bio}
              onChange={(e) => handleProfileChange("bio", e.target.value)}
              placeholder="A short bio..."
              rows={2}
              className="w-full rounded-lg border border-cn-border bg-cn-bg px-3 py-2 text-xs text-cn-text placeholder-cn-text3 outline-none focus:border-orange-500/50 resize-none"
            />
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
            <p className="text-sm text-cn-text3">{formatBytes(Math.max(0, totalLimit - totalUsed))} free</p>
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

      {/* Connected accounts */}
      <div>
        <h2 className="mb-3 text-sm font-medium text-cn-text">Connected Accounts</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {accounts.map((account) => {
            const quota = quotas.find((q) => q.email === account.email);
            const hasLiveQuota = quota?.isConnected;
            const used = hasLiveQuota ? quota.used : account.storageQuota.used;
            const limit = hasLiveQuota ? quota.limit : account.storageQuota.limit;
            const free = hasLiveQuota ? quota.free : account.storageQuota.free;
            const pct = limit > 0 ? Math.min(100, (used / limit) * 100) : 0;
            const isStale = staleAccounts.has(account.email);

            return (
              <div
                key={account.email}
                className={`rounded-xl border bg-cn-s1 p-5 transition ${isStale ? "border-amber-500/40" : "border-cn-border"}`}
              >
                <div className="mb-4 flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-cn-text">
                      {account.email}
                    </p>
                    <div className="mt-1 flex items-center gap-1.5">
                      {isStale ? (
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

                <div className="flex gap-2">
                  {isStale && (
                    <button
                      onClick={() => reAuthAccount(account.email)}
                      className="flex-1 rounded-lg bg-amber-500 py-2 text-xs font-medium text-white transition hover:bg-amber-400"
                    >
                      Re-authenticate
                    </button>
                  )}
                  {confirmDisconnect === account.email ? (
                    <div className="flex flex-1 gap-1.5">
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
                      className={`rounded-lg border border-cn-border py-2 text-xs text-cn-text2 transition hover:border-red-500/40 hover:text-red-400 ${isStale ? "px-3" : "w-full"}`}
                    >
                      Disconnect
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* About section */}
      <div className="rounded-xl border border-cn-border bg-cn-s1 p-5">
        <h2 className="mb-3 text-sm font-medium text-cn-text">About CloudNest</h2>
        <p className="text-sm text-cn-text2 leading-relaxed">
          CloudNest aggregates multiple Google Drive accounts into a unified storage pool. Files are automatically routed to the account with the most available space. All data is stored in your own Google Drive accounts -- CloudNest never stores files on its own servers.
        </p>
        <div className="mt-4 flex gap-3">
          <a
            href="https://github.com/Encryptioner/CloudNest"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 rounded-lg border border-cn-border px-3 py-2 text-xs text-cn-text2 transition hover:border-orange-500/30 hover:text-orange-400"
          >
            <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.477 2 2 6.477 2 12c0 4.418 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.342-3.369-1.342-.454-1.155-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.202 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.163 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
            </svg>
            View on GitHub
          </a>
          <a
            href="https://encryptioner.github.io/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 rounded-lg border border-cn-border px-3 py-2 text-xs text-cn-text2 transition hover:border-orange-500/30 hover:text-orange-400"
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
            </svg>
            Author Portfolio
          </a>
        </div>
      </div>
    </div>
  );
}
