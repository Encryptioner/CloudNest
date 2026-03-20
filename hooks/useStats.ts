"use client";

import { useMemo } from "react";
import type { FileMetadata, AccountQuota } from "@/types";

export interface ComputedStats {
  totalFiles: number;
  totalFolders: number;
  totalSize: number;
  filesByType: Record<string, number>;
  sizeByType: Record<string, number>;
  filesByAccount: Record<string, number>;
  storageByAccount: AccountQuota[];
  weeklyUploads: { date: string; count: number }[];
}

function getMimeCategory(mimeType: string | null): string {
  const t = mimeType ?? "";
  if (t === "application/vnd.google-apps.folder") return "Folders";
  if (t.startsWith("image/")) return "Images";
  if (t.startsWith("video/")) return "Videos";
  if (t.startsWith("audio/")) return "Audio";
  if (t.includes("pdf")) return "PDFs";
  if (t.includes("spreadsheet") || t.includes("sheet")) return "Spreadsheets";
  if (t.includes("presentation") || t.includes("slide")) return "Presentations";
  if (t.includes("document") || t.startsWith("text/")) return "Documents";
  if (t.includes("zip") || t.includes("compressed")) return "Archives";
  return "Other";
}

export function computeStats(
  files: FileMetadata[],
  quotas: AccountQuota[],
): ComputedStats {
  const filesByType: Record<string, number> = {};
  const sizeByType: Record<string, number> = {};
  const filesByAccount: Record<string, number> = {};
  let totalFolders = 0;

  for (const f of files) {
    const cat = getMimeCategory(f.mimeType);
    const isFolder = f.mimeType === "application/vnd.google-apps.folder";
    filesByType[cat] = (filesByType[cat] ?? 0) + 1;
    sizeByType[cat] = (sizeByType[cat] ?? 0) + (f.size || 0);
    if (isFolder) {
      totalFolders++;
    } else {
      filesByAccount[f.accountEmail] = (filesByAccount[f.accountEmail] ?? 0) + 1;
    }
  }

  // Weekly uploads (last 8 weeks) — folders excluded
  const weeklyMap: Record<string, number> = {};
  const now = new Date();
  for (let i = 7; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i * 7);
    const label = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    weeklyMap[label] = 0;
  }
  for (const f of files) {
    if (f.mimeType === "application/vnd.google-apps.folder") continue;
    const created = new Date(f.createdAt);
    const weeksAgo = Math.floor(
      (now.getTime() - created.getTime()) / (7 * 24 * 60 * 60 * 1000),
    );
    if (weeksAgo <= 7) {
      const d = new Date(now);
      d.setDate(d.getDate() - weeksAgo * 7);
      const label = d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
      if (weeklyMap[label] !== undefined) weeklyMap[label]++;
    }
  }
  const weeklyUploads = Object.entries(weeklyMap).map(([date, count]) => ({
    date,
    count,
  }));

  return {
    totalFiles: files.length - totalFolders,
    totalFolders,
    totalSize: files.reduce((s, f) => s + (f.size || 0), 0),
    filesByType,
    sizeByType,
    filesByAccount,
    storageByAccount: quotas,
    weeklyUploads,
  };
}

export function useStats(
  files: FileMetadata[],
  quotas: AccountQuota[],
): ComputedStats {
  return useMemo(() => computeStats(files, quotas), [files, quotas]);
}
