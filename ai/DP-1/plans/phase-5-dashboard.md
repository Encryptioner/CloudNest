# Phase 5: Dashboard Rewrites — All Dashboard Pages

**Overview Plan:** See `overview.md`
**Spec Requirements Covered:** FR-2 (completion), FR-7 (partial)

## Overview

Rewrite all 7 dashboard pages and 2 supporting contexts/hooks to use client-side Drive API services from Phase 3 instead of backend `/api/` calls. This is the largest phase — every `fetch("/api/...")` call is replaced.

## Changes

### File: `hooks/useFiles.ts` (REWRITE)

- **Action:** Complete rewrite to use `services/drive.ts` + `services/fileCache.ts`
- **Why:** FR-2 (client-side Drive), FR-4 (IndexedDB cache)
- **Current:** Fetches from `/api/files` via backend
- **New behavior:**
  - On mount: check IndexedDB cache staleness
  - If stale: call `drive.syncAllFiles()` for each connected account, cache results
  - If fresh: return cached files
  - Expose `refreshFiles()` that forces re-sync
  - Return `{ files, isLoading, error, refreshFiles }`
  - Multi-account: aggregates files across all connected accounts

### File: `hooks/useStorage.ts` (REWRITE)

- **Action:** Rewrite to use `services/drive.ts` → `getStorageQuota()`
- **Why:** FR-2 (storage quota from Drive API)
- **Current:** Fetches from `/api/accounts`
- **New behavior:**
  - Calls `drive.getStorageQuota()` for each connected account
  - Returns `{ quotas: AccountQuota[], totalUsed, totalFree, totalLimit, isLoading }`

### File: `hooks/useStats.ts` (REWRITE)

- **Action:** Rewrite to compute stats from cached file metadata
- **Why:** FR-2 (analytics from client-side data)
- **Current:** Fetches from backend
- **New behavior:**
  - Reads file metadata from IndexedDB cache
  - Computes: file count by type, storage by account, upload activity (from createdAt timestamps)
  - Returns computed stats objects for Recharts

### File: `contexts/UploadContext.tsx` (REWRITE)

- **Action:** Rewrite upload logic to use `services/drive.ts` → `uploadFile()`
- **Why:** FR-2 (client-side upload via REST API)
- **Current:** POSTs to `/api/files/upload` via XHR
- **New behavior:**
  - Picks best account via `drive.pickBestAccount()`
  - Uploads via `drive.uploadFile()` (REST API with resumable for >5MB)
  - Progress tracking via XHR `upload.onprogress`
  - Queue management preserved (existing queue logic is good)
  - Error handling: token expiry triggers re-auth toast
  - After successful upload: updates IndexedDB cache

### File: `app/dashboard/page.tsx` (MODIFY)

- **Action:** Replace `/api/files/{id}/thumbnail` calls with Drive thumbnail URLs
- **Why:** FR-2
- **Change:** Use `file.thumbnailLink` from cached metadata or construct URL

### File: `app/dashboard/files/page.tsx` (REWRITE — heaviest)

- **Action:** Replace all 8+ API calls with `useDrive()` hook operations
- **Why:** FR-2 (all file operations)
- **Current API calls to replace:**
  - `GET /api/files/{id}/view` → open Drive web view URL
  - `GET /api/files/{id}/download` → `drive.downloadFile()` (authenticated URL, open in tab)
  - `PUT /api/files/{id}/rename` → `drive.renameFile()`
  - `DELETE /api/files/{id}` → `drive.trashFile()`
  - `POST /api/files/{fileId}/move` → `drive.moveFile()`
  - `POST /api/files/{id}/share` → `drive.shareFile()`
  - `DELETE /api/files/{id}/share` → `drive.unshareFile()`
  - `POST /api/files/sync` → `refreshFiles()` from `useFiles` hook
- **Note:** File identification changes from numeric `id` to `driveFileId` + `accountEmail`

### File: `app/dashboard/shared/page.tsx` (REWRITE)

- **Action:** Replace API calls with `useDrive()` hook
- **Current:** Fetches from `/api/files/shared` and `/api/files/shared/.../children`
- **New:** `drive.listSharedFiles()` and `drive.listFiles()` with folder parent query

### File: `app/dashboard/trash/page.tsx` (REWRITE)

- **Action:** Replace API calls with `useDrive()` hook
- **Current:** Fetches from `/api/files/trash`, restore, permanent delete
- **New:** `drive.listTrash()`, `drive.restoreFile()`, `drive.deleteFile()`

### File: `app/dashboard/stats/page.tsx` (MODIFY)

- **Action:** Use rewritten `useStats` and `useStorage` hooks
- **Why:** FR-2 (data from client-side)
- **Change:** Import paths unchanged, but data shape may differ slightly
- **Note:** Use `next/dynamic` with `{ ssr: false }` for Recharts component (grill finding R2-N2)

### File: `app/dashboard/accounts/page.tsx` (REWRITE)

- **Action:** Replace account management API calls
- **Current:** Lists from `/api/accounts`, disconnects via `DELETE /api/accounts/{index}`
- **New:**
  - Lists accounts from `useAuth()` context (localStorage-backed)
  - Disconnect: `disconnectAccount()` from AuthContext
  - Shows storage quota per account from `useStorage()`
  - "Connect another account" triggers GIS OAuth flow

### File: `app/dashboard/settings/page.tsx` (REWRITE)

- **Action:** Replace backend settings with client-side configuration
- **Why:** FR-7 (author info), FR-3 (Client ID config)
- **Current:** OAuth URLs, backend account management
- **New:**
  - Display Client ID (editable via inline edit)
  - Profile editing (name, bio) → stored in localStorage
  - Connected accounts list with disconnect option
  - "About CloudNest" section with Encryptioner links
  - Link to portfolio: `https://encryptioner.github.io/`
  - GitHub link: `https://github.com/Encryptioner/CloudNest`

### Files: `components/Navbar.tsx`, `components/Sidebar.tsx` (MODIFY)

- **Action:** Update account selector in Navbar to use AuthContext instead of API
- **Why:** FR-2 (data from context, not API)
- **Change:** Replace `fetch("/api/accounts")` with `useAuth().accounts`

### Files: `components/FileList.tsx`, `components/FileRow.tsx` (MODIFY)

- **Action:** Update type references from `FileItem` (backend shape) to `FileMetadata` (new types)
- **Why:** FR-2 (data shape change)
- **Change:** Update field names (`file_name` → `fileName`, `drive_file_id` → `driveFileId`, etc.)

### Files: `components/AccountCard.tsx`, `components/StorageBar.tsx` (MODIFY)

- **Action:** Update props to match new `ConnectedAccount` and quota types
- **Why:** FR-2 (type alignment)

## Verification Steps

- [ ] Dashboard loads with file list from Drive API
- [ ] File operations work: rename, move, trash, share, unshare
- [ ] File download opens in new tab (not in-memory)
- [ ] File upload works with progress bar
- [ ] Upload routes to account with most free space
- [ ] Shared files page lists files from other users
- [ ] Trash page shows trashed files, restore and permanent delete work
- [ ] Stats page shows charts with data from IndexedDB cache
- [ ] Accounts page lists connected accounts with storage bars
- [ ] Settings page shows Client ID and profile
- [ ] No remaining `fetch("/api/")` calls in any dashboard file
- [ ] All TypeScript types pass (no `any`)
- [ ] `pnpm run lint` passes on all modified files

## Notes

- This is the highest-risk phase. Each page rewrite should be verified individually before moving to the next.
- File identification changes: backend used numeric `id` + `account_index`. New system uses `driveFileId` + `accountEmail`. All component props must update.
- The `useFiles` hook behavior changes: instead of polling every 4 seconds, it loads from cache and syncs on demand. This is better for client-side (avoids hitting Drive API rate limits).
- Error handling: all Drive API calls should catch 401 (expired token) and trigger re-auth via toast, catch 429 (rate limit) and retry with backoff.
