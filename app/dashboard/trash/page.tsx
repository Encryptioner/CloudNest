"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useUpload } from "@/contexts/UploadContext";
import { useDrive } from "@/hooks/useDrive";
import * as drive from "@/services/drive";
import { trackEvent, simplifyMimeType, sanitizeError } from "@/services/analytics";
import type { FileMetadata } from "@/types";
import { formatBytes } from "@/utils/format";

type SortKey = "name" | "size" | "date";

function FileTypeIcon({ mimeType, size = 28 }: { mimeType: string | null; size?: number }) {
  const t = mimeType ?? "";
  if (t === "application/vnd.google-apps.folder") {
    return (
      <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
        <rect x="4" y="14" width="40" height="26" rx="3" fill="#64748b" />
        <path d="M4 14h14l4 -5h2v5" fill="#64748b" />
        <rect x="4" y="20" width="40" height="20" rx="3" fill="#94a3b8" />
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

function ActionButtons({
  file,
  acting,
  onRestore,
  onDelete,
}: {
  file: FileMetadata;
  acting: string | null;
  onRestore: (file: FileMetadata) => void;
  onDelete: (file: FileMetadata) => void;
}) {
  const restoreKey = `restore-${file.accountEmail}-${file.driveFileId}`;
  const deleteKey = `delete-${file.accountEmail}-${file.driveFileId}`;
  const isRestoring = acting === restoreKey;
  const isDeleting = acting === deleteKey;
  const busy = isRestoring || isDeleting;

  return (
    <>
      <button
        onClick={() => onRestore(file)}
        disabled={busy}
        className="flex h-7 w-7 items-center justify-center rounded-lg text-cn-text3 transition hover:bg-cn-s2 hover:text-green-400 disabled:opacity-40"
        title="Restore"
      >
        {isRestoring ? (
          <svg className="h-3.5 w-3.5 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
          </svg>
        ) : (
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 15 3 9m0 0 6-6M3 9h12a6 6 0 0 1 0 12h-3" />
          </svg>
        )}
      </button>
      <button
        onClick={() => onDelete(file)}
        disabled={busy}
        className="flex h-7 w-7 items-center justify-center rounded-lg text-cn-text3 transition hover:bg-cn-s2 hover:text-red-400 disabled:opacity-40"
        title="Delete permanently"
      >
        {isDeleting ? (
          <svg className="h-3.5 w-3.5 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
          </svg>
        ) : (
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
          </svg>
        )}
      </button>
    </>
  );
}

export default function TrashPage() {
  const { accounts } = useAuth();
  const driveOps = useDrive();
  const [files, setFiles] = useState<FileMetadata[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState<SortKey>("date");
  const [acting, setActing] = useState<string | null>(null);
  const { toast, updateToast } = useUpload();

  const fetchTrash = useCallback(async () => {
    setLoading(true);
    try {
      const allTrash: FileMetadata[] = [];
      for (const account of accounts) {
        try {
          const trashFiles = await drive.listTrash(account.accessToken, account.email);
          allTrash.push(...trashFiles);
        } catch {
          // Skip failed accounts
        }
      }
      setFiles(allTrash);
    } catch {
      // Silently fail
    }
    setLoading(false);
  }, [accounts]);

  // eslint-disable-next-line react-hooks/set-state-in-effect -- data fetching pattern
  useEffect(() => { fetchTrash(); }, [fetchTrash]);

  const filtered = useMemo(() => {
    const result = files.filter((f) => f.fileName.toLowerCase().includes(search.toLowerCase()));
    return [...result].sort((a, b) => {
      if (sortBy === "name") return a.fileName.localeCompare(b.fileName);
      if (sortBy === "size") return b.size - a.size;
      return (b.createdAt ?? "").localeCompare(a.createdAt ?? "");
    });
  }, [files, search, sortBy]);

  async function handleRestore(file: FileMetadata) {
    const key = `restore-${file.accountEmail}-${file.driveFileId}`;
    setActing(key);
    const tid = toast(`Restoring "${file.fileName}"...`, "loading");
    try {
      await driveOps.restoreFile(file);
      setFiles((prev) => prev.filter(
        (f) => !(f.driveFileId === file.driveFileId && f.accountEmail === file.accountEmail)
      ));
      updateToast(tid, "success", `"${file.fileName}" restored`);
      trackEvent({ name: "file_restored", params: { file_type: simplifyMimeType(file.mimeType) } });
    } catch (err: unknown) {
      updateToast(tid, "error", "Restore failed");
      trackEvent({ name: "error_occurred", params: { category: "file_operation", action: "restore", error: sanitizeError(err instanceof Error ? err.message : "Restore failed") } });
    }
    setActing(null);
  }

  async function handleDelete(file: FileMetadata) {
    const key = `delete-${file.accountEmail}-${file.driveFileId}`;
    setActing(key);
    const tid = toast(`Deleting "${file.fileName}" permanently...`, "loading");
    try {
      await driveOps.deleteFile(file);
      setFiles((prev) => prev.filter(
        (f) => !(f.driveFileId === file.driveFileId && f.accountEmail === file.accountEmail)
      ));
      updateToast(tid, "success", "Deleted permanently");
      trackEvent({ name: "file_deleted", params: { file_type: simplifyMimeType(file.mimeType), location: "trash" } });
    } catch (err: unknown) {
      updateToast(tid, "error", "Delete failed");
      trackEvent({ name: "error_occurred", params: { category: "file_operation", action: "permanent_delete", error: sanitizeError(err instanceof Error ? err.message : "Delete failed") } });
    }
    setActing(null);
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-cn-text">Trash</h1>
          <p className="mt-1 text-sm text-cn-text2">
            {loading ? "Loading..." : `${filtered.length} ${filtered.length === 1 ? "item" : "items"}`}
          </p>
        </div>
        <button
          onClick={fetchTrash}
          disabled={loading}
          className="flex items-center gap-1.5 rounded-lg border border-cn-border bg-cn-s1 px-3 py-2 text-xs text-cn-text2 transition hover:border-orange-500/30 hover:text-orange-400 disabled:opacity-40"
        >
          <svg className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
          </svg>
          {loading ? "Loading..." : "Refresh"}
        </button>
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
            placeholder="Search trash..."
            className="w-full rounded-lg border border-cn-border bg-cn-s1 py-2 pl-8 pr-3 text-xs text-cn-text placeholder-cn-text3 outline-none focus:border-orange-500/50"
          />
        </div>

        <select
          value={sortBy}
          onChange={(e) => { setSortBy(e.target.value as SortKey); trackEvent({ name: "sort_changed", params: { sort_by: e.target.value, page: "trash" } }); }}
          className="rounded-lg border border-cn-border bg-cn-s1 py-2 pl-3 pr-7 text-xs text-cn-text2 outline-none focus:border-orange-500/50"
        >
          <option value="date">Date trashed</option>
          <option value="name">Name</option>
          <option value="size">Size</option>
        </select>

        <div className="flex rounded-lg border border-cn-border bg-cn-s1 p-0.5">
          <button
            onClick={() => { setView("grid"); trackEvent({ name: "view_changed", params: { view: "grid", page: "trash" } }); }}
            className={`flex h-7 w-7 items-center justify-center rounded-md transition ${view === "grid" ? "bg-cn-s2 text-cn-text" : "text-cn-text3 hover:text-cn-text"}`}
            title="Grid view"
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
            </svg>
          </button>
          <button
            onClick={() => { setView("list"); trackEvent({ name: "view_changed", params: { view: "list", page: "trash" } }); }}
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
              <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
            </svg>
          </div>
          <p className="text-sm text-cn-text3">{search ? "No files match your search." : "Trash is empty."}</p>
        </div>
      ) : view === "grid" ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {filtered.map((file) => {
            const key = `${file.accountEmail}-${file.driveFileId}`;
            return (
              <div key={key} className="group relative flex flex-col items-center gap-2 rounded-xl border border-cn-border bg-cn-s1 p-3 opacity-75 transition hover:border-orange-500/20 hover:bg-cn-hover hover:opacity-100">
                <span className="absolute right-2 top-2 rounded-full border border-cn-border bg-cn-s1/90 px-1.5 py-0.5 text-[9px] font-semibold text-cn-text3">
                  {file.accountEmail.split("@")[0]}
                </span>
                <div className="mt-2"><FileTypeIcon mimeType={file.mimeType} size={40} /></div>
                <span className="line-clamp-2 w-full text-center text-[11px] text-cn-text" title={file.fileName}>
                  {file.fileName}
                </span>
                <span className="text-[10px] text-cn-text3">
                  {file.createdAt ? new Date(file.createdAt).toLocaleDateString() : "---"}
                </span>
                <div className="mt-auto flex w-full items-center justify-center gap-1 opacity-0 transition group-hover:opacity-100" onClick={(e) => e.stopPropagation()}>
                  <ActionButtons file={file} acting={acting} onRestore={handleRestore} onDelete={handleDelete} />
                </div>
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
                <th className="hidden px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-cn-text3 sm:table-cell">Size</th>
                <th className="hidden px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-cn-text3 md:table-cell">Account</th>
                <th className="hidden px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-cn-text3 md:table-cell">Trashed</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-cn-text3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((file) => {
                const key = `${file.accountEmail}-${file.driveFileId}`;
                return (
                  <tr key={key} className="border-b border-cn-border last:border-0 hover:bg-cn-hover">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <FileTypeIcon mimeType={file.mimeType} size={24} />
                        <span className="text-sm text-cn-text" title={file.fileName}>{file.fileName}</span>
                      </div>
                    </td>
                    <td className="hidden px-4 py-3 text-sm text-cn-text3 sm:table-cell">{formatBytes(file.size)}</td>
                    <td className="hidden px-4 py-3 md:table-cell">
                      <span className="rounded-md border border-cn-border px-2 py-0.5 text-xs text-cn-text3">{file.accountEmail.split("@")[0]}</span>
                    </td>
                    <td className="hidden px-4 py-3 text-sm text-cn-text3 md:table-cell">
                      {file.createdAt ? new Date(file.createdAt).toLocaleDateString() : "---"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <ActionButtons file={file} acting={acting} onRestore={handleRestore} onDelete={handleDelete} />
                      </div>
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
