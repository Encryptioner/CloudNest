"use client";

import { useEffect, useRef, useState, useMemo, useCallback } from "react";
import { useFiles } from "@/hooks/useFiles";
import { useStorage } from "@/hooks/useStorage";
import { useDrive } from "@/hooks/useDrive";
import { useUpload } from "@/contexts/UploadContext";
import { trackEvent, simplifyMimeType, sanitizeError } from "@/services/analytics";
import type { FileMetadata } from "@/types";
import { formatBytes } from "@/utils/format";

type SortKey = "date-desc" | "date-asc" | "name-asc" | "name-desc" | "size-desc" | "size-asc";
type TypeFilter = "all" | "folder" | "image" | "video" | "audio" | "pdf" | "doc" | "sheet" | "archive";

function FolderIcon({ size = 40 }: { size?: number }) {
  const id = `fg-${size}`;
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <defs>
        <linearGradient id={`${id}-back`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f59e0b" />
          <stop offset="100%" stopColor="#d97706" />
        </linearGradient>
        <linearGradient id={`${id}-front`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fde68a" />
          <stop offset="100%" stopColor="#fbbf24" />
        </linearGradient>
      </defs>
      <rect x="4" y="14" width="40" height="26" rx="3" fill={`url(#${id}-back)`} />
      <path d="M4 14h14l4 -5h2v5" fill={`url(#${id}-back)`} />
      <rect x="4" y="20" width="40" height="20" rx="3" fill={`url(#${id}-front)`} />
      <rect x="10" y="24" width="12" height="2" rx="1" fill="white" fillOpacity="0.4" />
    </svg>
  );
}

function FileTypeIcon({ mimeType, size = 40 }: { mimeType: string | null; size?: number }) {
  const t = mimeType ?? "";
  if (t === "application/vnd.google-apps.folder") return <FolderIcon size={size} />;

  const icons: { match: (t: string) => boolean; render: () => React.ReactNode }[] = [
    {
      match: (t) => t.startsWith("image/"),
      render: () => (
        <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
          <rect width="48" height="48" rx="8" fill="#ea580c" fillOpacity="0.15" />
          <rect x="10" y="12" width="28" height="24" rx="3" stroke="#fb923c" strokeWidth="2" fill="none" />
          <circle cx="19" cy="21" r="3" fill="#fb923c" />
          <path d="M10 30l8-8 6 6 4-4 10 8" stroke="#fb923c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        </svg>
      ),
    },
    {
      match: (t) => t.startsWith("video/"),
      render: () => (
        <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
          <rect width="48" height="48" rx="8" fill="#2563eb" fillOpacity="0.15" />
          <rect x="8" y="14" width="24" height="20" rx="3" stroke="#60a5fa" strokeWidth="2" fill="none" />
          <path d="M32 19l8-4v18l-8-4V19z" stroke="#60a5fa" strokeWidth="2" strokeLinejoin="round" fill="none" />
          <path d="M18 22l6 4-6 4V22z" fill="#60a5fa" />
        </svg>
      ),
    },
    {
      match: (t) => t.startsWith("audio/"),
      render: () => (
        <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
          <rect width="48" height="48" rx="8" fill="#db2777" fillOpacity="0.15" />
          <circle cx="24" cy="24" r="10" stroke="#f472b6" strokeWidth="2" fill="none" />
          <circle cx="24" cy="24" r="4" fill="#f472b6" />
          <path d="M24 14v-4M24 38v-4M14 24h-4M38 24h-4" stroke="#f472b6" strokeWidth="2" strokeLinecap="round" />
        </svg>
      ),
    },
    {
      match: (t) => t.includes("pdf"),
      render: () => (
        <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
          <rect width="48" height="48" rx="8" fill="#dc2626" fillOpacity="0.15" />
          <path d="M14 8h14l10 10v24a2 2 0 01-2 2H14a2 2 0 01-2-2V10a2 2 0 012-2z" stroke="#f87171" strokeWidth="2" fill="none" />
          <path d="M28 8v10h10" stroke="#f87171" strokeWidth="2" strokeLinejoin="round" fill="none" />
          <text x="15" y="34" fontFamily="monospace" fontSize="9" fontWeight="bold" fill="#f87171">PDF</text>
        </svg>
      ),
    },
    {
      match: (t) => t.includes("spreadsheet") || t.includes("sheet"),
      render: () => (
        <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
          <rect width="48" height="48" rx="8" fill="#059669" fillOpacity="0.15" />
          <rect x="10" y="10" width="28" height="28" rx="3" stroke="#34d399" strokeWidth="2" fill="none" />
          <line x1="10" y1="20" x2="38" y2="20" stroke="#34d399" strokeWidth="1.5" />
          <line x1="10" y1="30" x2="38" y2="30" stroke="#34d399" strokeWidth="1.5" />
          <line x1="24" y1="10" x2="24" y2="38" stroke="#34d399" strokeWidth="1.5" />
        </svg>
      ),
    },
    {
      match: (t) => t.includes("presentation") || t.includes("slide"),
      render: () => (
        <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
          <rect width="48" height="48" rx="8" fill="#d97706" fillOpacity="0.15" />
          <rect x="8" y="12" width="32" height="20" rx="3" stroke="#fbbf24" strokeWidth="2" fill="none" />
          <line x1="24" y1="32" x2="24" y2="40" stroke="#fbbf24" strokeWidth="2" />
          <line x1="18" y1="40" x2="30" y2="40" stroke="#fbbf24" strokeWidth="2" strokeLinecap="round" />
          <rect x="14" y="17" width="14" height="2" rx="1" fill="#fbbf24" fillOpacity="0.6" />
          <rect x="14" y="22" width="10" height="2" rx="1" fill="#fbbf24" fillOpacity="0.4" />
        </svg>
      ),
    },
    {
      match: (t) => t.includes("zip") || t.includes("compressed") || t.includes("archive"),
      render: () => (
        <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
          <rect width="48" height="48" rx="8" fill="#ea580c" fillOpacity="0.15" />
          <rect x="14" y="8" width="20" height="32" rx="3" stroke="#fb923c" strokeWidth="2" fill="none" />
          <line x1="20" y1="8" x2="28" y2="8" stroke="#fb923c" strokeWidth="2" />
          <line x1="20" y1="16" x2="28" y2="16" stroke="#fb923c" strokeWidth="2" />
          <line x1="20" y1="24" x2="28" y2="24" stroke="#fb923c" strokeWidth="2" />
          <rect x="20" y="28" width="8" height="6" rx="1" fill="#fb923c" fillOpacity="0.5" />
        </svg>
      ),
    },
    {
      match: (t) => t.includes("javascript") || t.includes("typescript") || t.includes("json") || t.includes("xml") || t.startsWith("text/x-"),
      render: () => (
        <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
          <rect width="48" height="48" rx="8" fill="#16a34a" fillOpacity="0.15" />
          <path d="M16 20l-6 4 6 4" stroke="#4ade80" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M32 20l6 4-6 4" stroke="#4ade80" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M26 14l-4 20" stroke="#4ade80" strokeWidth="2" strokeLinecap="round" />
        </svg>
      ),
    },
    {
      match: (t) => t.includes("document") || t.startsWith("text/"),
      render: () => (
        <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
          <rect width="48" height="48" rx="8" fill="#0284c7" fillOpacity="0.15" />
          <path d="M14 8h14l10 10v24a2 2 0 01-2 2H14a2 2 0 01-2-2V10a2 2 0 012-2z" stroke="#38bdf8" strokeWidth="2" fill="none" />
          <path d="M28 8v10h10" stroke="#38bdf8" strokeWidth="2" strokeLinejoin="round" fill="none" />
          <line x1="16" y1="24" x2="32" y2="24" stroke="#38bdf8" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="16" y1="29" x2="28" y2="29" stroke="#38bdf8" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="16" y1="34" x2="24" y2="34" stroke="#38bdf8" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      ),
    },
  ];

  for (const icon of icons) {
    if (icon.match(t)) return <>{icon.render()}</>;
  }

  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <rect width="48" height="48" rx="8" fill="#475569" fillOpacity="0.15" />
      <path d="M14 8h14l10 10v24a2 2 0 01-2 2H14a2 2 0 01-2-2V10a2 2 0 012-2z" stroke="#94a3b8" strokeWidth="2" fill="none" />
      <path d="M28 8v10h10" stroke="#94a3b8" strokeWidth="2" strokeLinejoin="round" fill="none" />
    </svg>
  );
}

function PreviewModal({ file, onClose, onDownload }: { file: FileMetadata; onClose: () => void; onDownload: (file: FileMetadata) => void }) {
  const mime = file.mimeType ?? "";
  const isGoogleWorkspace = mime.startsWith("application/vnd.google-apps.") && mime !== "application/vnd.google-apps.folder";

  useEffect(() => {
    function handleKey(e: KeyboardEvent) { if (e.key === "Escape") onClose(); }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  function renderContent() {
    if (isGoogleWorkspace) {
      return (
        <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
          <svg className="h-12 w-12 text-cn-text3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
          </svg>
          <div>
            <p className="text-sm font-medium text-cn-text">Google Workspace file</p>
            <p className="mt-1 text-xs text-cn-text3">This file type can only be previewed in Google Drive.</p>
          </div>
          <a
            href={`https://drive.google.com/file/d/${file.driveFileId}/view`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 rounded-xl bg-orange-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-400"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
            </svg>
            Open in Google Drive
          </a>
        </div>
      );
    }
    // For non-workspace files, offer a download since we no longer have a proxy view endpoint
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
        <svg className="h-12 w-12 text-cn-text3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.964-7.178Z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
        </svg>
        <div>
          <p className="text-sm font-medium text-cn-text">{file.fileName}</p>
          <p className="mt-1 text-xs text-cn-text3">{formatBytes(file.size)} · {file.accountEmail}</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => onDownload(file)}
            className="flex items-center gap-2 rounded-xl bg-orange-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-400"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
            Download
          </button>
          <a
            href={`https://drive.google.com/file/d/${file.driveFileId}/view`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 rounded-xl border border-cn-border px-5 py-2.5 text-sm font-medium text-cn-text2 transition hover:bg-cn-hover"
          >
            Open in Drive
          </a>
        </div>
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="relative flex w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-cn-border bg-cn-s1 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-cn-border px-5 py-3">
          <div className="flex min-w-0 items-center gap-3">
            <svg className="h-4 w-4 flex-shrink-0 text-cn-text3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.964-7.178Z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
            </svg>
            <p className="truncate text-sm font-medium text-cn-text">{file.fileName}</p>
            <span className="flex-shrink-0 rounded-md border border-cn-border px-1.5 py-0.5 text-[10px] text-cn-text3">{file.accountEmail.split("@")[0]}</span>
          </div>
          <div className="flex items-center gap-2">
            {!isGoogleWorkspace && (
              <button
                onClick={() => onDownload(file)}
                className="flex items-center gap-1.5 rounded-lg border border-cn-border px-3 py-1.5 text-xs text-cn-text2 transition hover:bg-cn-hover hover:text-cn-text"
              >
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
                </svg>
                Download
              </button>
            )}
            <button
              onClick={onClose}
              className="flex h-7 w-7 items-center justify-center rounded-lg text-cn-text3 transition hover:bg-cn-hover hover:text-cn-text"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        {/* Content */}
        <div className="overflow-auto bg-cn-bg">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}

function ActionsMenu({
  file,
  onRename,
  onDownload,
  onDelete,
  onShare,
  onPreview,
  inFolder,
  onMoveToRoot,
}: {
  file: FileMetadata;
  onRename: () => void;
  onDownload: () => void;
  onDelete: () => void;
  onShare: () => void;
  onPreview: () => void;
  inFolder?: boolean;
  onMoveToRoot?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const isFolder = file.mimeType === "application/vnd.google-apps.folder";

  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  function handleLocate() {
    const id = file.driveFileId;
    const url = isFolder
      ? `https://drive.google.com/drive/folders/${id}`
      : `https://drive.google.com/file/d/${id}/view`;
    window.open(url, "_blank", "noopener,noreferrer");
    setOpen(false);
  }

  return (
    <div ref={menuRef} className="relative">
      <button
        onClick={(e) => { e.stopPropagation(); setOpen((v) => !v); }}
        className="flex h-7 w-7 items-center justify-center rounded-lg text-cn-text2 transition hover:bg-cn-s2 hover:text-cn-text"
        title="More actions"
      >
        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
          <circle cx="5" cy="12" r="1.5" />
          <circle cx="12" cy="12" r="1.5" />
          <circle cx="19" cy="12" r="1.5" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 bottom-full mb-1 z-30 min-w-[160px] rounded-xl border border-cn-border bg-cn-s1 py-1 shadow-xl">
          {!isFolder && (
            <button
              onClick={() => { onPreview(); setOpen(false); }}
              className="flex w-full items-center gap-2.5 px-3 py-2 text-xs text-cn-text2 transition hover:bg-cn-hover hover:text-cn-text"
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.964-7.178Z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
              </svg>
              Open
            </button>
          )}
          <button
            onClick={() => { onRename(); setOpen(false); }}
            className="flex w-full items-center gap-2.5 px-3 py-2 text-xs text-cn-text2 transition hover:bg-cn-hover hover:text-cn-text"
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125" />
            </svg>
            Rename
          </button>
          {!isFolder && (
            <button
              onClick={() => { onDownload(); setOpen(false); }}
              className="flex w-full items-center gap-2.5 px-3 py-2 text-xs text-cn-text2 transition hover:bg-cn-hover hover:text-cn-text"
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
              </svg>
              Download
            </button>
          )}
          <button
            onClick={() => { onShare(); setOpen(false); }}
            className="flex w-full items-center gap-2.5 px-3 py-2 text-xs text-cn-text2 transition hover:bg-cn-hover hover:text-cn-text"
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244" />
            </svg>
            Share link
          </button>
          <button
            onClick={handleLocate}
            className="flex w-full items-center gap-2.5 px-3 py-2 text-xs text-cn-text2 transition hover:bg-cn-hover hover:text-cn-text"
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
            </svg>
            Locate in Drive
          </button>
          {inFolder && onMoveToRoot && (
            <button
              onClick={() => { onMoveToRoot(); setOpen(false); }}
              className="flex w-full items-center gap-2.5 px-3 py-2 text-xs text-cn-text2 transition hover:bg-cn-hover hover:text-cn-text"
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
              </svg>
              Move to root
            </button>
          )}
          <div className="my-1 border-t border-cn-border" />
          <button
            onClick={() => { onDelete(); setOpen(false); }}
            className="flex w-full items-center gap-2.5 px-3 py-2 text-xs text-red-400 transition hover:bg-red-500/5"
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
            </svg>
            Delete
          </button>
        </div>
      )}
    </div>
  );
}

function GridCard({
  file,
  onOpen,
  onRename,
  onDelete,
  onMove,
  onUploadInto,
  inFolder,
  onMoveToRoot,
  onDragStartFile,
  onShare,
  onPreview,
  onDownload,
}: {
  file: FileMetadata;
  onOpen: (file: FileMetadata) => void;
  onRename: (file: FileMetadata, newName: string) => Promise<void>;
  onDelete: (file: FileMetadata) => Promise<void>;
  onMove: (file: FileMetadata, targetFolderDriveId: string) => Promise<void>;
  onUploadInto: (file: File, parentFolderDriveId: string) => void;
  inFolder: boolean;
  onMoveToRoot: () => void;
  onDragStartFile?: (file: FileMetadata) => void;
  onShare: (file: FileMetadata) => void;
  onPreview: (file: FileMetadata) => void;
  onDownload: (file: FileMetadata) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState(file.fileName);
  const [deleting, setDeleting] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const isFolder = file.mimeType === "application/vnd.google-apps.folder";
  const { confirm } = useUpload();

  async function commitRename() {
    const trimmed = editName.trim();
    if (trimmed && trimmed !== file.fileName) await onRename(file, trimmed);
    else setEditName(file.fileName);
    setEditing(false);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") commitRename();
    if (e.key === "Escape") { setEditName(file.fileName); setEditing(false); }
  }

  function handleDelete() {
    confirm(`Delete "${file.fileName}"?`, async () => {
      setDeleting(true);
      await onDelete(file);
    }, { confirmLabel: "Delete", danger: true });
  }

  function handleDragStart(e: React.DragEvent) {
    e.dataTransfer.setData("application/x-cloudnest-file-id", file.driveFileId);
    e.dataTransfer.setData("application/x-cloudnest-account-email", file.accountEmail);
    e.dataTransfer.effectAllowed = "move";
    onDragStartFile?.(file);
  }

  function handleDragOver(e: React.DragEvent) {
    if (!isFolder) return;
    e.preventDefault();
    e.stopPropagation();
    e.nativeEvent.stopImmediatePropagation();
    e.dataTransfer.dropEffect = "move";
    setDragOver(true);
  }

  function handleDragLeave() {
    setDragOver(false);
  }

  async function handleDrop(e: React.DragEvent) {
    if (!isFolder) return;
    e.preventDefault();
    e.stopPropagation();
    e.nativeEvent.stopImmediatePropagation();
    setDragOver(false);

    const internalId = e.dataTransfer.getData("application/x-cloudnest-file-id");
    if (internalId) {
      const draggedFileObj = files.find((f) => f.driveFileId === internalId);
      if (draggedFileObj) {
        await onMove(draggedFileObj, file.driveFileId);
      }
    } else {
      Array.from(e.dataTransfer.files).forEach((f) => onUploadInto(f, file.driveFileId));
    }
  }

  // Access files from parent scope for drag resolution
  const { files } = useFiles();

  return (
    <div
      draggable={!isFolder}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`group rounded-xl border bg-cn-s1 transition ${deleting ? "opacity-40" : ""} ${dragOver ? "border-orange-500 bg-orange-500/5" : "border-cn-border hover:border-orange-500/30 hover:bg-cn-hover"}`}
    >
      <div
        className={`relative flex h-32 items-center justify-center overflow-hidden rounded-t-xl bg-cn-bg ${isFolder ? "cursor-pointer" : ""}`}
        onClick={() => isFolder ? onOpen(file) : undefined}
      >
        <FileTypeIcon mimeType={file.mimeType} size={44} />
        <span className="absolute right-2 top-2 rounded-full border border-cn-border bg-cn-s1/90 px-1.5 py-0.5 text-[9px] font-semibold text-cn-text3">
          {file.accountEmail.split("@")[0]}
        </span>
      </div>

      <div className="flex items-end justify-between gap-1 p-3">
        <div className="min-w-0 flex-1">
          {editing ? (
            <input
              autoFocus
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              onBlur={commitRename}
              onKeyDown={handleKeyDown}
              className="w-full rounded-md border border-orange-500/50 bg-cn-bg px-2 py-0.5 text-xs text-cn-text outline-none"
            />
          ) : (
            <p
              className={`truncate text-sm font-medium text-cn-text ${isFolder ? "cursor-pointer hover:text-orange-400" : ""}`}
              onClick={() => isFolder ? onOpen(file) : undefined}
              title={file.fileName}
            >
              {file.fileName}
            </p>
          )}
          <p className="mt-0.5 text-xs text-cn-text3">{isFolder ? "Folder" : formatBytes(file.size)}</p>
        </div>
        <ActionsMenu file={file} onRename={() => setEditing(true)} onDownload={() => onDownload(file)} onDelete={handleDelete} onShare={() => onShare(file)} onPreview={() => onPreview(file)} inFolder={inFolder} onMoveToRoot={onMoveToRoot} />
      </div>
    </div>
  );
}

function ListRow({
  file,
  onOpen,
  onRename,
  onDelete,
  onMove,
  onUploadInto,
  inFolder,
  onMoveToRoot,
  onDragStartFile,
  onShare,
  onPreview,
  onDownload,
}: {
  file: FileMetadata;
  onOpen: (file: FileMetadata) => void;
  onRename: (file: FileMetadata, newName: string) => Promise<void>;
  onDelete: (file: FileMetadata) => Promise<void>;
  onMove: (file: FileMetadata, targetFolderDriveId: string) => Promise<void>;
  onUploadInto: (file: File, parentFolderDriveId: string) => void;
  inFolder: boolean;
  onMoveToRoot: () => void;
  onDragStartFile?: (file: FileMetadata) => void;
  onShare: (file: FileMetadata) => void;
  onPreview: (file: FileMetadata) => void;
  onDownload: (file: FileMetadata) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState(file.fileName);
  const [deleting, setDeleting] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const isFolder = file.mimeType === "application/vnd.google-apps.folder";
  const { confirm } = useUpload();
  const { files } = useFiles();

  async function commitRename() {
    const trimmed = editName.trim();
    if (trimmed && trimmed !== file.fileName) await onRename(file, trimmed);
    else setEditName(file.fileName);
    setEditing(false);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") commitRename();
    if (e.key === "Escape") { setEditName(file.fileName); setEditing(false); }
  }

  function handleDelete() {
    confirm(`Delete "${file.fileName}"?`, async () => {
      setDeleting(true);
      await onDelete(file);
    }, { confirmLabel: "Delete", danger: true });
  }

  function handleDragStart(e: React.DragEvent) {
    e.dataTransfer.setData("application/x-cloudnest-file-id", file.driveFileId);
    e.dataTransfer.setData("application/x-cloudnest-account-email", file.accountEmail);
    e.dataTransfer.effectAllowed = "move";
    onDragStartFile?.(file);
  }

  function handleDragOver(e: React.DragEvent) {
    if (!isFolder) return;
    e.preventDefault();
    e.stopPropagation();
    e.nativeEvent.stopImmediatePropagation();
    e.dataTransfer.dropEffect = "move";
    setDragOver(true);
  }

  function handleDragLeave() {
    setDragOver(false);
  }

  async function handleDrop(e: React.DragEvent) {
    if (!isFolder) return;
    e.preventDefault();
    e.stopPropagation();
    e.nativeEvent.stopImmediatePropagation();
    setDragOver(false);

    const internalId = e.dataTransfer.getData("application/x-cloudnest-file-id");
    if (internalId) {
      const draggedFileObj = files.find((f) => f.driveFileId === internalId);
      if (draggedFileObj) {
        await onMove(draggedFileObj, file.driveFileId);
      }
    } else {
      Array.from(e.dataTransfer.files).forEach((f) => onUploadInto(f, file.driveFileId));
    }
  }

  return (
    <tr
      draggable={!isFolder}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`group border-b border-cn-border transition ${deleting ? "opacity-40" : ""} ${dragOver ? "bg-orange-500/5 outline outline-1 outline-orange-500/40" : "hover:bg-cn-hover"}`}
    >
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <div
            className={`flex-shrink-0 ${isFolder ? "cursor-pointer" : ""}`}
            onClick={() => isFolder ? onOpen(file) : undefined}
          >
            <FileTypeIcon mimeType={file.mimeType} size={28} />
          </div>
          {editing ? (
            <input autoFocus value={editName} onChange={(e) => setEditName(e.target.value)} onBlur={commitRename} onKeyDown={handleKeyDown} className="rounded-lg border border-orange-500/50 bg-cn-bg px-2 py-0.5 text-sm text-cn-text outline-none" />
          ) : (
            <span
              className={`text-sm text-cn-text ${isFolder ? "cursor-pointer font-medium hover:text-orange-400" : ""}`}
              onClick={() => isFolder ? onOpen(file) : undefined}
              title={file.fileName}
            >
              {file.fileName}
            </span>
          )}
        </div>
      </td>
      <td className="hidden px-4 py-3 text-sm text-cn-text3 sm:table-cell">{isFolder ? "---" : formatBytes(file.size)}</td>
      <td className="hidden px-4 py-3 md:table-cell">
        <span className="rounded-md border border-cn-border px-2 py-0.5 text-xs text-cn-text3">{file.accountEmail.split("@")[0]}</span>
      </td>
      <td className="hidden px-4 py-3 text-sm text-cn-text3 md:table-cell">{new Date(file.createdAt).toLocaleDateString()}</td>
      <td className="px-4 py-3">
        <ActionsMenu file={file} onRename={() => setEditing(true)} onDownload={() => onDownload(file)} onDelete={handleDelete} onShare={() => onShare(file)} onPreview={() => onPreview(file)} inFolder={inFolder} onMoveToRoot={onMoveToRoot} />
      </td>
    </tr>
  );
}

type BreadcrumbEntry = { id: string | null; name: string };

function FolderDropPanel({
  draggedFile,
  folders,
  onDrop,
}: {
  draggedFile: FileMetadata;
  folders: FileMetadata[];
  onDrop: (targetDriveId: string) => void;
}) {
  const listRef = useRef<HTMLDivElement>(null);
  const scrollRafRef = useRef<number | null>(null);
  const [dropTarget, setDropTarget] = useState<string | null>(null);

  function stopScroll() {
    if (scrollRafRef.current !== null) {
      cancelAnimationFrame(scrollRafRef.current);
      scrollRafRef.current = null;
    }
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    stopScroll();
    const list = listRef.current;
    if (!list) return;
    const rect = list.getBoundingClientRect();
    const y = e.clientY - rect.top;
    const ZONE = 64;
    if (y < ZONE) {
      const speed = Math.max(3, Math.round(((ZONE - y) / ZONE) * 12));
      const scroll = () => { list.scrollTop -= speed; scrollRafRef.current = requestAnimationFrame(scroll); };
      scrollRafRef.current = requestAnimationFrame(scroll);
    } else if (y > rect.height - ZONE) {
      const speed = Math.max(3, Math.round(((y - (rect.height - ZONE)) / ZONE) * 12));
      const scroll = () => { list.scrollTop += speed; scrollRafRef.current = requestAnimationFrame(scroll); };
      scrollRafRef.current = requestAnimationFrame(scroll);
    }
  }

  function handleDragLeave() {
    stopScroll();
  }

  useEffect(() => () => stopScroll(), []);

  function renderFolderItem(driveId: string, name: string) {
    const isOver = dropTarget === driveId;
    return (
      <div
        key={driveId}
        onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); setDropTarget(driveId); }}
        onDragLeave={() => setDropTarget(null)}
        onDrop={(e) => { e.preventDefault(); e.stopPropagation(); setDropTarget(null); onDrop(driveId); }}
        className={`flex cursor-pointer items-center gap-3 rounded-xl border px-3 py-2.5 transition ${
          isOver ? "border-orange-500 bg-orange-500/10" : "border-cn-border bg-cn-s1 hover:border-orange-500/30 hover:bg-cn-hover"
        }`}
      >
        <svg width={20} height={20} viewBox="0 0 48 48" fill="none" className="flex-shrink-0">
          <defs>
            <linearGradient id="fp-back" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#d97706" />
            </linearGradient>
            <linearGradient id="fp-front" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#fde68a" />
              <stop offset="100%" stopColor="#fbbf24" />
            </linearGradient>
          </defs>
          <rect x="4" y="14" width="40" height="26" rx="3" fill="url(#fp-back)" />
          <path d="M4 14h14l4 -5h2v5" fill="url(#fp-back)" />
          <rect x="4" y="20" width="40" height="20" rx="3" fill="url(#fp-front)" />
        </svg>
        <span className="truncate text-xs text-cn-text" title={name}>{name}</span>
        {isOver && (
          <svg className="ml-auto h-3.5 w-3.5 flex-shrink-0 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
          </svg>
        )}
      </div>
    );
  }

  return (
    <div className="pointer-events-auto fixed right-0 top-0 z-40 flex h-full w-72 flex-col border-l border-cn-border bg-cn-s1 shadow-2xl">
      <div className="flex items-center justify-between border-b border-cn-border px-4 py-4">
        <div>
          <p className="text-sm font-semibold text-cn-text">Move to folder</p>
          <p className="mt-0.5 truncate text-[11px] text-cn-text3" title={draggedFile.fileName}>
            {draggedFile.fileName} · {draggedFile.accountEmail.split("@")[0]}
          </p>
        </div>
        <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-cn-border">
          <svg className="h-3.5 w-3.5 text-cn-text3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
          </svg>
        </div>
      </div>

      <div
        ref={listRef}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className="flex-1 overflow-y-auto p-3"
      >
        <div className="mb-2 space-y-1.5">
          <p className="px-1 text-[10px] font-semibold uppercase tracking-wider text-cn-text3">Root</p>
          {renderFolderItem("root", "My Drive (root)")}
        </div>

        {folders.length > 0 && (
          <div className="mt-4 space-y-1.5">
            <p className="px-1 text-[10px] font-semibold uppercase tracking-wider text-cn-text3">
              Folders ({folders.length})
            </p>
            {folders.map((f) => renderFolderItem(f.driveFileId, f.fileName))}
          </div>
        )}

        {folders.length === 0 && (
          <div className="mt-8 flex flex-col items-center gap-2 text-center">
            <svg className="h-8 w-8 text-cn-text3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
            </svg>
            <p className="text-xs text-cn-text3">No folders on this account</p>
          </div>
        )}
      </div>

      <div className="border-t border-cn-border px-4 py-3">
        <p className="text-[10px] text-cn-text3">Drop file onto a folder to move it</p>
      </div>
    </div>
  );
}

export default function FilesPage() {
  const { files, refreshFiles } = useFiles();
  const { refreshStorage } = useStorage();
  const driveOps = useDrive();
  const { upload, addCompleteListener, setCurrentFolder, toast, updateToast, confirm } = useUpload();
  const [syncing, setSyncing] = useState(false);
  const [view, setView] = useState<"list" | "grid">("grid");
  const [breadcrumb, setBreadcrumb] = useState<BreadcrumbEntry[]>([{ id: null, name: "All Files" }]);
  const scrollStack = useRef<number[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [search, setSearch] = useState("");
  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const [filterAccount, setFilterAccount] = useState<string>("all");
  const [filterType, setFilterType] = useState<TypeFilter>("all");
  const [sortBy, setSortBy] = useState<SortKey>("date-desc");
  const [draggedFile, setDraggedFile] = useState<FileMetadata | null>(null);
  const [shareModal, setShareModal] = useState<{ file: FileMetadata; link: string | null; loading: boolean; revoking: boolean } | null>(null);
  const [previewFile, setPreviewFile] = useState<FileMetadata | null>(null);
  const handlePreview = useCallback((file: FileMetadata) => { setPreviewFile(file); trackEvent({ name: "file_previewed", params: { file_type: simplifyMimeType(file.mimeType) } }); }, []);

  useEffect(() => {
    const unsub = addCompleteListener(() => {
      refreshFiles();
      refreshStorage();
    });
    return unsub;
  }, [addCompleteListener, refreshFiles, refreshStorage]);

  const currentFolder = breadcrumb[breadcrumb.length - 1] ?? { id: null, name: "My Drive" };

  useEffect(() => {
    setCurrentFolder(currentFolder.id, currentFolder.id ? currentFolder.name : null);
  }, [currentFolder, setCurrentFolder]);

  useEffect(() => {
    function onDragEnd() { setDraggedFile(null); }
    window.addEventListener("dragend", onDragEnd);
    return () => window.removeEventListener("dragend", onDragEnd);
  }, []);

  const panelFolders = useMemo(() => {
    if (!draggedFile) return [];
    return files.filter(
      (f) => f.accountEmail === draggedFile.accountEmail &&
             f.mimeType === "application/vnd.google-apps.folder" &&
             f.driveFileId !== draggedFile.driveFileId
    );
  }, [draggedFile, files]);

  const folderIds = useMemo(() => {
    const ids = new Set<string>();
    for (const f of files) {
      if (f.mimeType === "application/vnd.google-apps.folder") ids.add(f.driveFileId);
    }
    return ids;
  }, [files]);

  // Get unique account emails for filter dropdown
  const accountEmails = useMemo(() => {
    const emails = new Set<string>();
    for (const f of files) emails.add(f.accountEmail);
    return Array.from(emails);
  }, [files]);

  const visibleFiles = useMemo(() => {
    if (currentFolder.id === null) {
      return files.filter((f) => !f.parentDriveFileId || !folderIds.has(f.parentDriveFileId));
    }
    return files.filter((f) => f.parentDriveFileId === currentFolder.id);
  }, [files, currentFolder, folderIds]);

  const filteredFiles = useMemo(() => {
    let result = visibleFiles;

    if (search) {
      const q = search.toLowerCase();
      result = result.filter((f) => f.fileName.toLowerCase().includes(q));
    }

    if (filterAccount !== "all") {
      result = result.filter((f) => f.accountEmail === filterAccount);
    }

    if (filterType !== "all") {
      result = result.filter((f) => {
        const m = f.mimeType ?? "";
        switch (filterType) {
          case "folder": return m === "application/vnd.google-apps.folder";
          case "image": return m.startsWith("image/");
          case "video": return m.startsWith("video/");
          case "audio": return m.startsWith("audio/");
          case "pdf": return m.includes("pdf");
          case "sheet": return m.includes("spreadsheet") || m.includes("sheet");
          case "archive": return m.includes("zip") || m.includes("compressed") || m.includes("archive");
          case "doc": return m.includes("document") || m.startsWith("text/");
          default: return true;
        }
      });
    }

    return [...result].sort((a, b) => {
      switch (sortBy) {
        case "name-asc": return a.fileName.localeCompare(b.fileName);
        case "name-desc": return b.fileName.localeCompare(a.fileName);
        case "size-asc": return a.size - b.size;
        case "size-desc": return b.size - a.size;
        case "date-asc": return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        default: return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });
  }, [visibleFiles, search, filterAccount, filterType, sortBy]);

  function openFolder(file: FileMetadata) {
    const scroller = document.getElementById("cn-scroll");
    scrollStack.current = [...scrollStack.current, scroller?.scrollTop ?? 0];
    setBreadcrumb((prev) => [...prev, { id: file.driveFileId, name: file.fileName }]);
    setTimeout(() => { document.getElementById("cn-scroll")?.scrollTo({ top: 0 }); }, 0);
  }

  function navigateTo(index: number) {
    const savedScroll = scrollStack.current[index] ?? 0;
    scrollStack.current = scrollStack.current.slice(0, index);
    setBreadcrumb((prev) => prev.slice(0, index + 1));
    setTimeout(() => {
      const scroller = document.getElementById("cn-scroll");
      if (scroller) scroller.scrollTop = savedScroll;
    }, 0);
  }

  async function handleRename(file: FileMetadata, newName: string) {
    const tid = toast("Renaming...", "loading");
    try {
      await driveOps.renameFile(file, newName);
      await refreshFiles();
      updateToast(tid, "success", "Renamed");
      trackEvent({ name: "file_renamed" });
    } catch (err: unknown) {
      updateToast(tid, "error", "Rename failed");
      trackEvent({ name: "error_occurred", params: { category: "file_operation", action: "rename", error: sanitizeError(err instanceof Error ? err.message : "Rename failed") } });
    }
  }

  async function handleDelete(file: FileMetadata) {
    const tid = toast("Deleting...", "loading");
    try {
      await driveOps.trashFile(file);
      await refreshFiles();
      refreshStorage();
      updateToast(tid, "success", "Moved to trash");
      trackEvent({ name: "file_deleted", params: { file_type: simplifyMimeType(file.mimeType), location: "files" } });
    } catch (err: unknown) {
      updateToast(tid, "error", "Delete failed");
      trackEvent({ name: "error_occurred", params: { category: "file_operation", action: "delete", error: sanitizeError(err instanceof Error ? err.message : "Delete failed") } });
    }
  }

  async function handleMove(file: FileMetadata, targetFolderDriveId: string) {
    const isToRoot = targetFolderDriveId === "root";
    if (isToRoot) {
      confirm("Move to root?", async () => {
        const tid = toast("Moving to root...", "loading");
        try {
          await driveOps.moveFile(file, "root", file.parentDriveFileId ?? undefined);
          await refreshFiles();
          updateToast(tid, "success", "Moved to root");
          trackEvent({ name: "file_moved" });
        } catch {
          updateToast(tid, "error", "Move failed");
        }
      }, { confirmLabel: "Move", danger: false });
      return;
    }
    const tid = toast("Moving...", "loading");
    try {
      await driveOps.moveFile(file, targetFolderDriveId, file.parentDriveFileId ?? undefined);
      await refreshFiles();
      updateToast(tid, "success", "File moved");
      trackEvent({ name: "file_moved" });
    } catch {
      updateToast(tid, "error", "Move failed");
    }
  }

  async function handleShare(file: FileMetadata) {
    setShareModal({ file, link: null, loading: true, revoking: false });
    try {
      const link = await driveOps.shareFile(file);
      setShareModal((prev) => prev ? { ...prev, link, loading: false } : null);
      trackEvent({ name: "file_shared", params: { file_type: simplifyMimeType(file.mimeType) } });
    } catch {
      toast("Failed to generate share link", "error");
      setShareModal(null);
    }
  }

  async function handleUnshare() {
    if (!shareModal) return;
    setShareModal((prev) => prev ? { ...prev, revoking: true } : null);
    try {
      await driveOps.unshareFile(shareModal.file);
      toast("File is now private", "success");
      trackEvent({ name: "file_unshared" });
      setShareModal(null);
    } catch {
      toast("Failed to revoke sharing", "error");
      setShareModal((prev) => prev ? { ...prev, revoking: false } : null);
    }
  }

  async function handleDownload(file: FileMetadata) {
    try {
      const url = await driveOps.getDownloadUrl(file);
      window.open(url, "_blank");
      trackEvent({ name: "file_downloaded", params: { file_type: simplifyMimeType(file.mimeType) } });
    } catch {
      toast("Download failed", "error");
    }
  }

  async function handleSync() {
    setSyncing(true);
    await refreshFiles();
    setSyncing(false);
  }

  function handleFileInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    Array.from(e.target.files ?? []).forEach((f) => upload(f));
    e.target.value = "";
  }

  const handleDragStartFile = useCallback((file: FileMetadata) => setDraggedFile(file), []);

  return (
    <div className="space-y-5">
      <input ref={fileInputRef} type="file" multiple className="hidden" onChange={handleFileInputChange} />

      {draggedFile && (
        <FolderDropPanel
          draggedFile={draggedFile}
          folders={panelFolders}
          onDrop={(driveId) => handleMove(draggedFile, driveId)}
        />
      )}

      {previewFile && (
        <PreviewModal file={previewFile} onClose={() => setPreviewFile(null)} onDownload={handleDownload} />
      )}

      {shareModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={() => !shareModal.loading && !shareModal.revoking && setShareModal(null)}
        >
          <div
            className="w-full max-w-md rounded-2xl border border-cn-border bg-cn-s1 p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-cn-text">Share link</p>
                <p className="mt-0.5 truncate text-xs text-cn-text3" title={shareModal.file.fileName}>
                  {shareModal.file.fileName}
                </p>
              </div>
              <button
                onClick={() => setShareModal(null)}
                className="flex-shrink-0 rounded-lg p-1 text-cn-text3 hover:bg-cn-hover hover:text-cn-text"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {shareModal.loading ? (
              <div className="flex items-center justify-center gap-2 py-6 text-cn-text3">
                <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                </svg>
                <span className="text-xs">Generating link...</span>
              </div>
            ) : shareModal.link ? (
              <>
                <div className="mb-1 text-[11px] font-medium uppercase tracking-wider text-cn-text3">Shareable link</div>
                <div className="flex items-center gap-2 rounded-xl border border-cn-border bg-cn-bg px-3 py-2.5">
                  <input
                    readOnly
                    value={shareModal.link}
                    className="min-w-0 flex-1 bg-transparent text-xs text-cn-text outline-none"
                    onFocus={(e) => e.target.select()}
                  />
                  <button
                    onClick={() => { if (shareModal.link) { navigator.clipboard.writeText(shareModal.link); toast("Link copied!", "success"); trackEvent({ name: "share_link_copied" }); } }}
                    className="flex-shrink-0 rounded-lg border border-cn-border bg-cn-s1 px-2.5 py-1.5 text-[11px] font-medium text-cn-text2 transition hover:border-orange-500/30 hover:text-orange-400"
                  >
                    Copy
                  </button>
                </div>
                <p className="mt-2 text-[11px] text-cn-text3">Anyone with this link can view the file.</p>
                <div className="mt-5 flex justify-between gap-2">
                  <button
                    onClick={handleUnshare}
                    disabled={shareModal.revoking}
                    className="flex items-center gap-1.5 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs font-medium text-red-400 transition hover:bg-red-500/20 disabled:opacity-50"
                  >
                    {shareModal.revoking && (
                      <svg className="h-3 w-3 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                      </svg>
                    )}
                    Make private
                  </button>
                  <button
                    onClick={() => setShareModal(null)}
                    className="rounded-lg border border-cn-border px-4 py-2 text-xs text-cn-text2 transition hover:bg-cn-hover"
                  >
                    Done
                  </button>
                </div>
              </>
            ) : null}
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-cn-text">Files</h1>
          <p className="mt-1 text-sm text-cn-text2">
            {filteredFiles.length !== visibleFiles.length
              ? `${filteredFiles.length} of ${visibleFiles.length} items`
              : `${visibleFiles.length} ${visibleFiles.length === 1 ? "item" : "items"}`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleSync}
            disabled={syncing}
            className="flex items-center gap-1.5 rounded-lg border border-cn-border bg-cn-s1 px-3 py-2 text-xs text-cn-text2 transition hover:border-orange-500/30 hover:text-orange-400 disabled:opacity-40"
          >
            <svg className={`h-3.5 w-3.5 ${syncing ? "animate-spin" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
            </svg>
            <span className="hidden sm:inline">{syncing ? "Syncing..." : "Sync"}</span>
          </button>

          <div className="flex rounded-lg border border-cn-border bg-cn-s1 p-0.5">
            <button onClick={() => { setView("list"); trackEvent({ name: "view_changed", params: { view: "list", page: "files" } }); }} className={`rounded-md p-1.5 transition ${view === "list" ? "bg-cn-hover text-cn-text" : "text-cn-text3 hover:text-cn-text2"}`} title="List view">
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75Zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0ZM3.75 12h.007v.008H3.75V12Zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0Zm-.375 5.25h.007v.008H3.75v-.008Zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0Z" />
              </svg>
            </button>
            <button onClick={() => { setView("grid"); trackEvent({ name: "view_changed", params: { view: "grid", page: "files" } }); }} className={`rounded-md p-1.5 transition ${view === "grid" ? "bg-cn-hover text-cn-text" : "text-cn-text3 hover:text-cn-text2"}`} title="Grid view">
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25ZM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25Z" />
              </svg>
            </button>
          </div>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 rounded-lg bg-orange-500 px-4 py-2 text-xs font-medium text-white shadow-lg shadow-orange-500/20 transition hover:bg-orange-400"
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
            </svg>
            Upload
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[160px]">
          <svg className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-cn-text3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
          </svg>
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); clearTimeout(searchTimerRef.current); if (e.target.value.trim()) searchTimerRef.current = setTimeout(() => trackEvent({ name: "search_used", params: { page: "files" } }), 1000); }}
            placeholder="Search files..."
            className="w-full rounded-lg border border-cn-border bg-cn-s1 py-2 pl-8 pr-3 text-xs text-cn-text placeholder-cn-text3 outline-none focus:border-orange-500/50"
          />
        </div>

        <select
          value={filterAccount}
          onChange={(e) => setFilterAccount(e.target.value)}
          className="rounded-lg border border-cn-border bg-cn-s1 px-2.5 py-2 text-xs text-cn-text2 outline-none focus:border-orange-500/50"
        >
          <option value="all">All accounts</option>
          {accountEmails.map((email) => (
            <option key={email} value={email}>
              {email.split("@")[0]}
            </option>
          ))}
        </select>

        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value as TypeFilter)}
          className="rounded-lg border border-cn-border bg-cn-s1 px-2.5 py-2 text-xs text-cn-text2 outline-none focus:border-orange-500/50"
        >
          <option value="all">All types</option>
          <option value="folder">Folders</option>
          <option value="image">Images</option>
          <option value="video">Videos</option>
          <option value="audio">Audio</option>
          <option value="pdf">PDFs</option>
          <option value="doc">Documents</option>
          <option value="sheet">Spreadsheets</option>
          <option value="archive">Archives</option>
        </select>

        <select
          value={sortBy}
          onChange={(e) => { setSortBy(e.target.value as SortKey); trackEvent({ name: "sort_changed", params: { sort_by: e.target.value, page: "files" } }); }}
          className="rounded-lg border border-cn-border bg-cn-s1 px-2.5 py-2 text-xs text-cn-text2 outline-none focus:border-orange-500/50"
        >
          <option value="date-desc">Newest first</option>
          <option value="date-asc">Oldest first</option>
          <option value="name-asc">Name A-Z</option>
          <option value="name-desc">Name Z-A</option>
          <option value="size-desc">Largest first</option>
          <option value="size-asc">Smallest first</option>
        </select>
      </div>

      <div className="flex items-center gap-1 overflow-x-auto rounded-lg border border-cn-border bg-cn-s1 px-4 py-2">
        <svg className="mr-1 h-3.5 w-3.5 flex-shrink-0 text-cn-text3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
        </svg>
        {breadcrumb.map((entry, i) => (
          <div key={i} className="flex flex-shrink-0 items-center gap-1">
            {i > 0 && <span className="text-cn-text3">/</span>}
            <button
              onClick={() => navigateTo(i)}
              className={`rounded px-1.5 py-0.5 text-xs transition ${
                i === breadcrumb.length - 1 ? "font-medium text-cn-text" : "text-cn-text2 hover:text-orange-400"
              }`}
            >
              {entry.name}
            </button>
          </div>
        ))}
      </div>

      {filteredFiles.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-cn-border bg-cn-s1 py-20 text-center">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl border border-cn-border bg-cn-bg">
            <svg className="h-6 w-6 text-cn-text3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
            </svg>
          </div>
          <p className="text-sm text-cn-text3">
            {search || filterAccount !== "all" || filterType !== "all"
              ? "No files match your filters."
              : breadcrumb.length > 1
              ? "This folder is empty."
              : "No files yet. Upload something to get started."}
          </p>
        </div>
      ) : view === "grid" ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {filteredFiles.map((file) => (
            <GridCard key={file.driveFileId} file={file} onOpen={openFolder} onRename={handleRename} onDelete={handleDelete} onMove={handleMove} onUploadInto={upload} inFolder={currentFolder.id !== null} onMoveToRoot={() => handleMove(file, "root")} onDragStartFile={handleDragStartFile} onShare={handleShare} onPreview={handlePreview} onDownload={handleDownload} />
          ))}
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-cn-border bg-cn-s1">
          <table className="w-full">
            <thead>
              <tr className="border-b border-cn-border">
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-cn-text3">Name</th>
                <th className="hidden px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-cn-text3 sm:table-cell">Size</th>
                <th className="hidden px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-cn-text3 md:table-cell">Account</th>
                <th className="hidden px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-cn-text3 md:table-cell">Date</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-cn-text3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredFiles.map((file) => (
                <ListRow key={file.driveFileId} file={file} onOpen={openFolder} onRename={handleRename} onDelete={handleDelete} onMove={handleMove} onUploadInto={upload} inFolder={currentFolder.id !== null} onMoveToRoot={() => handleMove(file, "root")} onDragStartFile={handleDragStartFile} onShare={handleShare} onPreview={handlePreview} onDownload={handleDownload} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
