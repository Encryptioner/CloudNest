"use client";

import { useState } from "react";
import FileRow, { FileTypeIcon } from "@/components/FileRow";
import { useDrive } from "@/hooks/useDrive";
import type { FileMetadata } from "@/types";
import { formatBytes } from "@/utils/format";

function GridCard({
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
    <div
      className={`group relative rounded-xl border border-cn-border bg-cn-s1 transition hover:border-orange-500/20 hover:bg-cn-hover ${deleting ? "opacity-40" : ""}`}
    >
      <div className="flex h-36 items-center justify-center overflow-hidden rounded-t-xl bg-cn-bg">
        {file.hasThumbnail && file.thumbnailLink ? (
          <img
            src={file.thumbnailLink}
            alt=""
            className="h-full w-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
        ) : (
          <FileTypeIcon mimeType={file.mimeType} />
        )}
      </div>

      <div className="p-3">
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
            className="cursor-text truncate text-sm font-medium text-cn-text hover:text-orange-400 transition-colors"
            onClick={() => setEditing(true)}
            title={file.fileName}
          >
            {file.fileName}
          </p>
        )}
        <p className="mt-0.5 text-xs text-cn-text3">{formatBytes(file.size)}</p>
      </div>

      <div className="absolute right-2 top-2 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
        <button
          onClick={() => onDownload(file)}
          className="rounded-lg bg-cn-s1/90 p-1.5 text-cn-text3 backdrop-blur-sm transition hover:text-orange-400"
          title="Download"
        >
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
          </svg>
        </button>
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="rounded-lg bg-cn-s1/90 p-1.5 text-cn-text3 backdrop-blur-sm transition hover:text-red-400 disabled:opacity-40"
          title="Delete"
        >
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
          </svg>
        </button>
      </div>
    </div>
  );
}

export default function FileList({
  files,
  onRefresh,
  view = "list",
}: {
  files: FileMetadata[];
  onRefresh: () => void;
  view?: "list" | "grid";
}) {
  const { renameFile, trashFile, getDownloadUrl } = useDrive();

  async function handleRename(file: FileMetadata, newName: string) {
    await renameFile(file, newName);
    onRefresh();
  }

  async function handleDelete(file: FileMetadata) {
    await trashFile(file);
    onRefresh();
  }

  async function handleDownload(file: FileMetadata) {
    const url = await getDownloadUrl(file);
    window.open(url, "_blank");
  }

  if (files.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-cn-border bg-cn-s1 py-20 text-center">
        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl border border-cn-border bg-cn-bg">
          <svg className="h-6 w-6 text-cn-text3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
          </svg>
        </div>
        <p className="text-sm text-cn-text3">No files yet. Upload something to get started.</p>
      </div>
    );
  }

  if (view === "grid") {
    return (
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
        {files.map((file) => (
          <GridCard
            key={file.driveFileId}
            file={file}
            onRename={handleRename}
            onDelete={handleDelete}
            onDownload={handleDownload}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-cn-border bg-cn-s1">
      <table className="w-full">
        <thead>
          <tr className="border-b border-cn-border">
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-cn-text3">Name</th>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-cn-text3">Size</th>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-cn-text3">Account</th>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-cn-text3">Date</th>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-cn-text3">Actions</th>
          </tr>
        </thead>
        <tbody>
          {files.map((file) => (
            <FileRow
              key={file.driveFileId}
              file={file}
              onRename={handleRename}
              onDelete={handleDelete}
              onDownload={handleDownload}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}
