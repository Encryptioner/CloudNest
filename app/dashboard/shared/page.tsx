"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useDrive } from "@/hooks/useDrive";
import * as drive from "@/services/drive";
import { trackEvent, simplifyMimeType } from "@/services/analytics";
import type { FileMetadata } from "@/types";
import { formatBytes } from "@/utils/format";

type SharedFile = FileMetadata & { sharedBy: string | null };

type FolderEntry = {
  driveFileId: string;
  fileName: string;
  accountEmail: string;
};

type SortKey = "name" | "size" | "date";

function FileTypeIcon({ mimeType, size = 28 }: { mimeType: string | null; size?: number }) {
  const t = mimeType ?? "";
  if (t === "application/vnd.google-apps.folder") {
    return (
      <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
        <rect x="4" y="14" width="40" height="26" rx="3" fill="#d97706" />
        <path d="M4 14h14l4 -5h2v5" fill="#d97706" />
        <rect x="4" y="20" width="40" height="20" rx="3" fill="#fbbf24" />
      </svg>
    );
  }
  const color = t.startsWith("image/") ? "#fb923c"
    : t.startsWith("video/") ? "#60a5fa"
    : t.startsWith("audio/") ? "#f472b6"
    : t.includes("pdf") ? "#f87171"
    : t.includes("spreadsheet") || t.includes("sheet") ? "#34d399"
    : t.includes("document") || t.startsWith("text/") ? "#38bdf8"
    : "#94a3b8";
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <path d="M14 8h14l10 10v24a2 2 0 01-2 2H14a2 2 0 01-2-2V10a2 2 0 012-2z" stroke={color} strokeWidth="2" fill="none" />
      <path d="M28 8v10h10" stroke={color} strokeWidth="2" strokeLinejoin="round" fill="none" />
    </svg>
  );
}

export default function SharedPage() {
  const { accounts } = useAuth();
  const driveOps = useDrive();
  const [files, setFiles] = useState<SharedFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState<SortKey>("date");
  const [folderStack, setFolderStack] = useState<FolderEntry[]>([]);

  const currentFolder: FolderEntry | null = folderStack.length > 0 ? (folderStack[folderStack.length - 1] ?? null) : null;

  const fetchFiles = useCallback(async (folder: FolderEntry | null) => {
    setLoading(true);
    setSearch("");
    try {
      if (folder) {
        // List children of a shared folder
        const account = accounts.find((a) => a.email === folder.accountEmail);
        if (account) {
          const token = account.accessToken;
          const children = await drive.listFiles(
            token,
            `'${folder.driveFileId}' in parents and trashed = false`,
          );
          setFiles(children.map((f) => ({
            ...f,
            accountEmail: folder.accountEmail,
            sharedBy: null,
          })));
        }
      } else {
        // List all shared files across all accounts
        const allShared: SharedFile[] = [];
        for (const account of accounts) {
          try {
            const shared = await drive.listSharedFiles(account.accessToken, account.email);
            allShared.push(...shared);
          } catch {
            // Skip failed accounts
          }
        }
        setFiles(allShared);
      }
    } catch {
      // Silently fail
    }
    setLoading(false);
  }, [accounts]);

  // eslint-disable-next-line react-hooks/set-state-in-effect -- data fetching pattern
  useEffect(() => { fetchFiles(currentFolder); }, [folderStack, fetchFiles]); // eslint-disable-line react-hooks/exhaustive-deps

  function openFolder(file: SharedFile) {
    setFolderStack((prev) => [
      ...prev,
      { driveFileId: file.driveFileId, fileName: file.fileName, accountEmail: file.accountEmail },
    ]);
  }

  function navigateTo(index: number) {
    if (index < 0) setFolderStack([]);
    else setFolderStack((prev) => prev.slice(0, index + 1));
  }

  const isFolder = (f: SharedFile) => f.mimeType === "application/vnd.google-apps.folder";

  const filtered = useMemo(() => {
    const result = files.filter((f) => f.fileName.toLowerCase().includes(search.toLowerCase()));
    return [...result].sort((a, b) => {
      const aFolder = isFolder(a), bFolder = isFolder(b);
      if (aFolder !== bFolder) return aFolder ? -1 : 1;
      if (sortBy === "name") return a.fileName.localeCompare(b.fileName);
      if (sortBy === "size") return b.size - a.size;
      return (b.createdAt ?? "").localeCompare(a.createdAt ?? "");
    });
  }, [files, search, sortBy]);

  async function handleDownload(file: SharedFile) {
    try {
      const url = await driveOps.getDownloadUrl(file);
      window.open(url, "_blank");
      trackEvent({ name: "file_downloaded", params: { file_type: simplifyMimeType(file.mimeType) } });
    } catch {
      // Silent fail
    }
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-cn-text">Shared with me</h1>
          <p className="mt-1 text-sm text-cn-text2">
            {loading ? "Loading..." : `${filtered.length} ${filtered.length === 1 ? "item" : "items"}`}
          </p>
        </div>
        <button
          onClick={() => fetchFiles(currentFolder)}
          disabled={loading}
          className="flex items-center gap-1.5 rounded-lg border border-cn-border bg-cn-s1 px-3 py-2 text-xs text-cn-text2 transition hover:border-orange-500/30 hover:text-orange-400 disabled:opacity-40"
        >
          <svg className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
          </svg>
          {loading ? "Loading..." : "Refresh"}
        </button>
      </div>

      {/* Path bar */}
      <div className="flex items-center gap-1 text-xs text-cn-text3">
        <button onClick={() => navigateTo(-1)} className={`transition hover:text-cn-text ${folderStack.length === 0 ? "font-medium text-cn-text" : ""}`}>
          Shared with me
        </button>
        {folderStack.map((entry, i) => (
          <span key={entry.driveFileId} className="flex items-center gap-1">
            <svg className="h-3 w-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
            </svg>
            <button
              onClick={() => navigateTo(i)}
              className={`max-w-[160px] truncate transition hover:text-cn-text ${i === folderStack.length - 1 ? "font-medium text-cn-text" : ""}`}
            >
              {entry.fileName}
            </button>
          </span>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <svg className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-cn-text3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
          </svg>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search files..."
            className="w-full rounded-lg border border-cn-border bg-cn-s1 py-2 pl-8 pr-3 text-xs text-cn-text placeholder-cn-text3 outline-none focus:border-orange-500/50"
          />
        </div>

        <select
          value={sortBy}
          onChange={(e) => { setSortBy(e.target.value as SortKey); trackEvent({ name: "sort_changed", params: { sort_by: e.target.value, page: "shared" } }); }}
          className="rounded-lg border border-cn-border bg-cn-s1 py-2 pl-3 pr-7 text-xs text-cn-text2 outline-none focus:border-orange-500/50"
        >
          <option value="date">Date</option>
          <option value="name">Name</option>
          <option value="size">Size</option>
        </select>

        <div className="flex rounded-lg border border-cn-border bg-cn-s1 p-0.5">
          <button
            onClick={() => { setView("grid"); trackEvent({ name: "view_changed", params: { view: "grid", page: "shared" } }); }}
            className={`flex h-7 w-7 items-center justify-center rounded-md transition ${view === "grid" ? "bg-cn-s2 text-cn-text" : "text-cn-text3 hover:text-cn-text"}`}
            title="Grid view"
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
            </svg>
          </button>
          <button
            onClick={() => { setView("list"); trackEvent({ name: "view_changed", params: { view: "list", page: "shared" } }); }}
            className={`flex h-7 w-7 items-center justify-center rounded-md transition ${view === "list" ? "bg-cn-s2 text-cn-text" : "text-cn-text3 hover:text-cn-text"}`}
            title="List view"
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
            </svg>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <svg className="h-6 w-6 animate-spin text-cn-text3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
          </svg>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-cn-border bg-cn-s1 py-20 text-center">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl border border-cn-border bg-cn-bg">
            <svg className="h-6 w-6 text-cn-text3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 1 0 0 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186 9.566-5.314m-9.566 7.5 9.566 5.314m0 0a2.25 2.25 0 1 0 3.935 2.186 2.25 2.25 0 0 0-3.935-2.186Zm0-12.814a2.25 2.25 0 1 0 3.933-2.185 2.25 2.25 0 0 0-3.933 2.185Z" />
            </svg>
          </div>
          <p className="text-sm text-cn-text3">
            {search ? "No files match your search." : currentFolder ? "This folder is empty." : "No files have been shared with you."}
          </p>
        </div>
      ) : view === "grid" ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {filtered.map((file) => {
            const key = `${file.accountEmail}-${file.driveFileId}`;
            const folder = isFolder(file);
            return (
              <div
                key={key}
                className={`group relative flex flex-col items-center gap-2 rounded-xl border border-cn-border bg-cn-s1 p-3 transition hover:border-orange-500/20 hover:bg-cn-hover ${folder ? "cursor-pointer" : ""}`}
                onClick={folder ? () => openFolder(file) : undefined}
              >
                <span className="absolute right-2 top-2 rounded-full border border-cn-border bg-cn-s1/90 px-1.5 py-0.5 text-[9px] font-semibold text-cn-text3">
                  {file.accountEmail.split("@")[0]}
                </span>
                <div className="mt-2"><FileTypeIcon mimeType={file.mimeType} size={40} /></div>
                <span className="line-clamp-2 w-full text-center text-[11px] text-cn-text" title={file.fileName}>
                  {file.fileName}
                </span>
                {file.sharedBy && (
                  <span className="truncate w-full text-center text-[10px] text-cn-text3" title={file.sharedBy}>
                    {file.sharedBy}
                  </span>
                )}
                {!folder && (
                  <div className="mt-auto flex w-full items-center justify-center gap-1 opacity-0 transition group-hover:opacity-100" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => handleDownload(file)}
                      className="flex h-7 w-7 items-center justify-center rounded-lg text-cn-text3 transition hover:bg-cn-s2 hover:text-orange-400"
                      title="Download"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
                      </svg>
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-cn-border bg-cn-s1">
          <table className="w-full">
            <thead>
              <tr className="border-b border-cn-border">
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-cn-text3">Name</th>
                <th className="hidden px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-cn-text3 sm:table-cell">Shared by</th>
                <th className="hidden px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-cn-text3 sm:table-cell">Size</th>
                <th className="hidden px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-cn-text3 md:table-cell">Account</th>
                <th className="hidden px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-cn-text3 md:table-cell">Date</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-cn-text3">Download</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((file) => {
                const key = `${file.accountEmail}-${file.driveFileId}`;
                const folder = isFolder(file);
                return (
                  <tr key={key} className="border-b border-cn-border last:border-0 hover:bg-cn-hover">
                    <td className="px-4 py-3">
                      <div className={`flex items-center gap-3 ${folder ? "cursor-pointer" : ""}`} onClick={folder ? () => openFolder(file) : undefined}>
                        <FileTypeIcon mimeType={file.mimeType} size={24} />
                        <span className={`text-sm text-cn-text ${folder ? "hover:text-orange-400" : ""}`} title={file.fileName}>{file.fileName}</span>
                      </div>
                    </td>
                    <td className="hidden px-4 py-3 text-xs text-cn-text3 sm:table-cell">{file.sharedBy ?? "---"}</td>
                    <td className="hidden px-4 py-3 text-sm text-cn-text3 sm:table-cell">{folder ? "---" : formatBytes(file.size)}</td>
                    <td className="hidden px-4 py-3 md:table-cell">
                      <span className="rounded-md border border-cn-border px-2 py-0.5 text-xs text-cn-text3">{file.accountEmail.split("@")[0]}</span>
                    </td>
                    <td className="hidden px-4 py-3 text-sm text-cn-text3 md:table-cell">
                      {file.createdAt ? new Date(file.createdAt).toLocaleDateString() : "---"}
                    </td>
                    <td className="px-4 py-3">
                      {!folder && (
                        <button
                          onClick={() => handleDownload(file)}
                          className="flex h-7 w-7 items-center justify-center rounded-lg text-cn-text3 transition hover:bg-cn-s2 hover:text-orange-400"
                          title="Download"
                        >
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
                          </svg>
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
