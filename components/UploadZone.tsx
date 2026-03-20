"use client";

import { useEffect, useRef, useState } from "react";
import { useUpload } from "@/contexts/UploadContext";

export default function UploadZone({ onUploadComplete }: { onUploadComplete: () => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const { upload, addCompleteListener } = useUpload();

  useEffect(() => {
    return addCompleteListener(onUploadComplete);
  }, [addCompleteListener, onUploadComplete]);

  function handleFiles(fileList: FileList | null) {
    if (!fileList) return;
    Array.from(fileList).forEach((file) => upload(file));
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    handleFiles(e.dataTransfer.files);
  }

  function handleFileInput(e: React.ChangeEvent<HTMLInputElement>) {
    handleFiles(e.target.files);
    e.target.value = "";
  }

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
      className={`relative cursor-pointer rounded-xl border-2 border-dashed p-8 text-center transition-colors ${
        dragging
          ? "border-orange-500/60 bg-orange-500/5"
          : "border-cn-border hover:border-cn-text3 hover:bg-cn-hover"
      }`}
    >
      <input
        ref={inputRef}
        type="file"
        multiple
        className="hidden"
        onChange={handleFileInput}
      />

      <div className="space-y-3">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl border border-cn-border bg-cn-s1">
          <svg className="h-6 w-6 text-cn-text3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
          </svg>
        </div>
        <div>
          <p className="text-sm text-cn-text2">
            Drag & drop or <span className="font-medium text-orange-400">browse</span>
          </p>
          <p className="mt-1 text-xs text-cn-text3">Routed to the account with most free space</p>
        </div>
      </div>
    </div>
  );
}
