"use client";

import type { AccountQuota } from "@/types";
import { formatBytes } from "@/utils/format";

export default function StorageBar({ quotas }: { quotas: AccountQuota[] }) {
  const totalUsed = quotas.reduce((sum, q) => sum + q.used, 0);
  const totalLimit = quotas.reduce((sum, q) => sum + q.limit, 0);
  const percent = totalLimit > 0 ? Math.min(100, (totalUsed / totalLimit) * 100) : 0;

  return (
    <div className="rounded-xl border border-cn-border bg-cn-s1 p-5">
      <div className="mb-3 flex items-end justify-between">
        <span className="text-2xl font-semibold text-cn-text">{formatBytes(totalUsed)}</span>
        <span className="text-sm text-cn-text3">of {formatBytes(totalLimit)} used</span>
      </div>

      <div className="h-2 w-full overflow-hidden rounded-full bg-cn-border">
        <div
          className="h-full rounded-full bg-orange-500 transition-all duration-700"
          style={{ width: `${percent}%` }}
        />
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {quotas
          .filter((q) => q.isConnected)
          .map((q) => {
            const pct = q.limit > 0 ? Math.min(100, (q.used / q.limit) * 100) : 0;
            return (
              <div key={q.email} className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="truncate text-cn-text2">{q.email}</span>
                  <span className="text-cn-text3">{pct.toFixed(0)}%</span>
                </div>
                <div className="h-1 w-full overflow-hidden rounded-full bg-cn-border">
                  <div
                    className="h-full rounded-full bg-orange-500/60"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
}
