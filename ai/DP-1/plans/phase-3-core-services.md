# Phase 3: Core Services — Drive API, Storage, Auth Context

**Overview Plan:** See `overview.md`
**Spec Requirements Covered:** FR-2 (partial), FR-4, FR-12 (partial)

## Architecture

```
services/
├── drive.ts          # Google Drive API wrapper (gapi + REST)
├── auth.ts           # Google Identity Services OAuth wrapper
├── storage.ts        # localStorage abstraction (accounts, profile, settings)
└── fileCache.ts      # IndexedDB file metadata cache (via idb)

contexts/
├── AuthContext.tsx    # Auth state provider (accounts, tokens, client ID)
├── ThemeContext.tsx   # (existing — minor updates only)
└── UploadContext.tsx  # (rewritten in Phase 5)

hooks/
├── useAuth.ts        # Auth hook consuming AuthContext
├── useDrive.ts       # Drive operations hook (wraps services/drive.ts)
└── useFiles.ts       # (rewritten in Phase 5)

types/
└── index.ts          # Shared TypeScript types
```

## Changes

### File: `types/index.ts` (CREATE)

- **Action:** Create shared type definitions
- **Why:** FR-4 (storage structure), FR-2 (Drive types)
- **Contents:**
  ```typescript
  export interface ConnectedAccount {
    email: string;
    accessToken: string;
    tokenExpiry: number; // Unix timestamp ms
    storageQuota: {
      used: number;
      limit: number;
      free: number;
    };
  }

  export interface FileMetadata {
    driveFileId: string;
    fileName: string;
    accountEmail: string;
    size: number;
    mimeType: string | null;
    hasThumbnail: boolean;
    parentDriveFileId: string | null;
    createdAt: string;
  }

  export interface UserProfile {
    displayName: string;
    bio: string;
    avatarUrl: string | null;
  }
  ```

### File: `services/storage.ts` (CREATE)

- **Action:** Create localStorage abstraction
- **Why:** FR-4 (browser storage)
- **Contents:** Functions for:
  - `getClientId() / setClientId()` — `cn_clientId` key
  - `getAccounts() / setAccounts() / addAccount() / removeAccount()` — `cn_accounts` key
  - `getProfile() / setProfile()` — `cn_profile` key
  - `getTheme() / setTheme()` — `cn_theme` key
  - All functions typed with interfaces from `types/index.ts`

### File: `services/fileCache.ts` (CREATE)

- **Action:** Create IndexedDB file metadata cache using `idb`
- **Why:** FR-4 (file cache), grill finding R2-N3 (use idb)
- **Dependencies:** `pnpm add idb`
- **Contents:** Functions for:
  - `cacheFiles(accountEmail: string, files: FileMetadata[])` — bulk store
  - `getCachedFiles(accountEmail?: string)` — retrieve, filtered by account
  - `clearCache()` — full cache clear
  - `isCacheStale()` — returns true if >5 minutes since last sync
  - `getLastSyncTime() / setLastSyncTime()` — timestamp tracking

### File: `services/auth.ts` (CREATE)

- **Action:** Create Google Identity Services (GIS) OAuth wrapper
- **Why:** FR-2 (OAuth), FR-12 (auth flow)
- **Contents:**
  - `loadGIS()` — dynamically load GIS script
  - `requestAccessToken(clientId: string, scope: string)` — popup OAuth flow
  - `silentReAuth(clientId: string, account: ConnectedAccount)` — silent token refresh attempt
  - `isTokenExpired(account: ConnectedAccount)` — check expiry
  - `DRIVE_SCOPE = "https://www.googleapis.com/auth/drive"` constant
- **Key:** GIS loaded lazily, NOT in initial page load (FR-13 perf)

### File: `services/drive.ts` (CREATE)

- **Action:** Create Google Drive API wrapper
- **Why:** FR-2 (Drive integration)
- **Contents:**
  - `loadGapi()` — dynamically load gapi script
  - `initGapi()` — initialize gapi.client
  - `listFiles(token, query, pageSize)` — file listing via gapi.client.drive
  - `getStorageQuota(token)` — about().get via gapi
  - `uploadFile(token, file, parentId?, onProgress?)` — REST API with XHR for progress
  - `downloadFile(token, fileId)` — returns authenticated download URL (never in-memory)
  - `renameFile(token, fileId, newName)` — via gapi.client.drive
  - `moveFile(token, fileId, newParentId, oldParentId?)` — via gapi.client.drive
  - `trashFile(token, fileId)` — via gapi.client.drive
  - `restoreFile(token, fileId)` — via gapi.client.drive
  - `deleteFile(token, fileId)` — permanent delete via gapi.client.drive
  - `shareFile(token, fileId)` — create public permission
  - `unshareFile(token, fileId)` — remove public permission
  - `listTrash(token)` — list trashed files
  - `listSharedFiles(token)` — files not owned by user
  - `syncAllFiles(token)` — fetch all files for cache
  - `pickBestAccount(accounts)` — least-used-space routing
  - `retryOnRateLimit(fn)` — exponential backoff wrapper
- **Reference:** Port logic from `backend/services/drive_service.py`

### File: `contexts/AuthContext.tsx` (CREATE)

- **Action:** Create auth state provider
- **Why:** FR-12 (auth guard)
- **Contents:**
  - State: `clientId`, `accounts[]`, `isLoading`, `isAuthenticated`
  - Actions: `setClientId()`, `connectAccount()`, `disconnectAccount()`, `refreshToken()`
  - Auto-load from localStorage on mount
  - Token expiry checking on interval (every 5 min)
  - Silent re-auth attempt when tokens near expiry
  - Provides `isAuthenticated` (has clientId + at least one valid account)

### File: `hooks/useAuth.ts` (CREATE)

- **Action:** Create convenience hook wrapping AuthContext
- **Why:** FR-12 (auth hook)
- **Contents:** Re-export context values + derived state helpers

### File: `hooks/useDrive.ts` (CREATE)

- **Action:** Create Drive operations hook
- **Why:** FR-2 (Drive integration)
- **Contents:**
  - Wraps `services/drive.ts` functions with auth context (auto-injects token)
  - Handles multi-account: picks correct account token for each file operation
  - Error handling: catches token expiry, triggers re-auth flow
  - Loading states for each operation

### File: `app/layout.tsx` (MODIFY)

- **Action:** Wrap app with `AuthProvider` (alongside existing `ThemeProvider`)
- **Why:** FR-12 (auth context must be available app-wide)

## Verification Steps

- [ ] `pnpm run build` succeeds (services are tree-shakeable, no side effects at import)
- [ ] TypeScript compiles with no errors in new files
- [ ] `pnpm run lint` passes on new files
- [ ] `services/storage.ts` unit-testable (pure localStorage operations)
- [ ] `services/drive.ts` compiles (actual Drive API calls tested in Phase 5)

## Notes

- New packages to add: `pnpm add idb` and `pnpm add -D @types/gapi @types/gapi.client.drive-v3`
- GIS and gapi scripts are loaded dynamically via script injection — no npm packages for these (they must come from Google's CDN)
- GIS does not have official `@types` — create `types/gis.d.ts` with declarations for `google.accounts.oauth2.initTokenClient` and related types
- The `UploadContext.tsx` rewrite is deferred to Phase 5 because it depends on the dashboard file upload flow being clear
- All services use proper TypeScript types — no `any`
- Token storage in localStorage: `cn_accounts` stores serialized `ConnectedAccount[]`
- The `_CloudNest_` Drive folder name constant goes in `services/drive.ts`
