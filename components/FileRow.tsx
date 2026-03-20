"use client";

import { useState } from "react";
import type { FileMetadata } from "@/types";
import { formatBytes } from "@/utils/format";

export function FileTypeIcon({ mimeType }: { mimeType: string | null }) {
  const type = mimeType ?? "";

  if (type === "application/vnd.google-apps.folder") {
    return (
      <svg className="h-8 w-8 text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
        <path d="M10 4H4c-1.11 0-2 .89-2 2v12c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2h-8l-2-2z" />
      </svg>
    );
  }

  const configs: Record<string, { bg: string; text: string; label: string }> = {
    "image/": { bg: "bg-purple-500/10", text: "text-purple-400", label: "IMG" },
    "video/": { bg: "bg-blue-500/10", text: "text-blue-400", label: "VID" },
    "audio/": { bg: "bg-pink-500/10", text: "text-pink-400", label: "AUD" },
    "pdf": { bg: "bg-red-500/10", text: "text-red-400", label: "PDF" },
    "zip": { bg: "bg-orange-500/10", text: "text-orange-400", label: "ZIP" },
    "compressed": { bg: "bg-orange-500/10", text: "text-orange-400", label: "ZIP" },
    "spreadsheet": { bg: "bg-emerald-500/10", text: "text-emerald-400", label: "XLS" },
    "sheet": { bg: "bg-emerald-500/10", text: "text-emerald-400", label: "XLS" },
    "presentation": { bg: "bg-orange-500/10", text: "text-orange-400", label: "PPT" },
    "slide": { bg: "bg-orange-500/10", text: "text-orange-400", label: "PPT" },
    "document": { bg: "bg-sky-500/10", text: "text-sky-400", label: "DOC" },
    "text/": { bg: "bg-sky-500/10", text: "text-sky-400", label: "TXT" },
  };

  let bg = "bg-cn-border";
  let text = "text-cn-text3";
  let label = "FILE";

  for (const [key, val] of Object.entries(configs)) {
    if (type.startsWith(key) || type.includes(key)) {
      bg = val.bg;
      text = val.text;
      label = val.label;
      break;
    }
  }

  return (
    <div className={`flex h-8 w-8 items-center justify-center rounded-lg text-[9px] font-bold ${bg} ${text}`}>
      {label}
    </div>
  );
}

export default function FileRow({
  file,
  onRename,
  onDelete,
  onDownload,
}: {
  file: FileMetadata;
  onRename: (file: FileMetadata, newName: string) => Promise<void>;
  onDelete: (file: FileMetadata) => Promise<void>;
  onDownload: (file: FileMetadata) => Promise<void>;
}) {
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState(file.fileName);
  const [deleting, setDeleting] = useState(false);

  async function commitRename() {
    const trimmed = editName.trim();
    if (trimmed && trimmed !== file.fileName) {
      await onRename(file, trimmed);
    } else {
      setEditName(file.fileName);
    }
    setEditing(false);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") commitRename();
    if (e.key === "Escape") {
      setEditName(file.fileName);
      setEditing(false);
    }
  }

  async function handleDelete() {
    setDeleting(true);
    await onDelete(file);
  }

  return (
    <tr className={`border-b border-cn-border transition hover:bg-cn-hover ${deleting ? "opacity-40" : ""}`}>
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          {file.hasThumbnail && file.thumbnailLink ? (
            <img
              src={file.thumbnailLink}
              alt=""
              className="h-8 w-8 rounded-lg object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
          ) : (
            <FileTypeIcon mimeType={file.mimeType} />
          )}
          {editing ? (
            <input
              autoFocus
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              onBlur={commitRename}
              onKeyDown={handleKeyDown}
              className="rounded-lg border border-orange-500/50 bg-cn-bg px-2 py-0.5 text-sm text-cn-text outline-none focus:ring-1 focus:ring-orange-500/30"
            />
          ) : (
            <span
              className="cursor-text truncate text-sm text-cn-text hover:text-orange-400 transition-colors"
              onClick={() => setEditing(true)}
              title="Click to rename"
            >
              {file.fileName}
            </span>
          )}
        </div>
      </td>
      <td className="px-4 py-3 text-sm text-cn-text3">{formatBytes(file.size)}</td>
      <td className="px-4 py-3">
        <span className="rounded-md border border-cn-border px-2 py-0.5 text-xs text-cn-text3">
          {file.accountEmail}
        </span>
      </td>
      <td className="px-4 py-3 text-sm text-cn-text3">
        {file.createdAt ? new Date(file.createdAt).toLocaleDateString() : "—"}
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-1">
          <button
            onClick={() => onDownload(file)}
            className="rounded-lg p-1.5 text-cn-text3 transition hover:bg-cn-hover hover:text-orange-400"
            title="Download"
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
          </button>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="rounded-lg p-1.5 text-cn-text3 transition hover:bg-cn-hover hover:text-red-400 disabled:opacity-40"
            title="Delete"
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
            </svg>
          </button>
        </div>
      </td>
    </tr>
  );
}
