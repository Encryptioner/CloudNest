"use client";

import type { AccountQuota } from "@/types";
import { formatBytes } from "@/utils/format";

export default function AccountCard({
  quota,
  onDisconnect,
}: {
  quota: AccountQuota;
  onDisconnect: (email: string) => void;
}) {
  const pct = quota.limit > 0 ? Math.min(100, (quota.used / quota.limit) * 100) : 0;

  return (
    <div
      className={`rounded-xl border p-5 transition ${
        quota.isConnected
          ? "border-cn-border bg-cn-s1"
          : "border-cn-border/50 bg-cn-bg opacity-60"
      }`}
    >
      <div className="mb-4 flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-cn-text">
            {quota.email}
          </p>
          <div className="mt-1 flex items-center gap-1.5">
            <span className={`h-1.5 w-1.5 rounded-full ${quota.isConnected ? "bg-emerald-400" : "bg-cn-text3"}`} />
            <span className={`text-xs ${quota.isConnected ? "text-emerald-400" : "text-cn-text3"}`}>
              {quota.isConnected ? "Connected" : "Disconnected"}
            </span>
          </div>
        </div>
      </div>

      {quota.isConnected && (
        <div className="mb-4 space-y-1.5">
          <div className="flex justify-between text-xs text-cn-text3">
            <span>{formatBytes(quota.used)} used</span>
            <span>{formatBytes(quota.free)} free</span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-cn-border">
            <div
              className={`h-full rounded-full transition-all ${pct > 80 ? "bg-red-500" : "bg-orange-500"}`}
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      )}

      <button
        onClick={() => onDisconnect(quota.email)}
        className="w-full rounded-lg border border-cn-border py-2 text-xs text-cn-text2 transition hover:border-red-500/40 hover:text-red-400"
      >
        Disconnect
      </button>
    </div>
  );
}
