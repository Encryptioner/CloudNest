# Phase 2: Context-Level Instrumentation

**Overview Plan:** See `overview.md`
**Spec Requirements Covered:** FR-3 (account_connected, signed_out), FR-4 (file_uploaded, file_upload_failed), FR-5 (theme_toggled)

## Changes

### File: `contexts/AuthContext.tsx`
- **Action:** Modify
- **What changes:**
  1. Add `import { trackEvent, sanitizeError } from "@/services/analytics"`
  2. In `connectAccount()` (~line 72): after `storage.addAccount(account)` succeeds, call `trackEvent({ name: 'account_connected', params: { source: 'setup' } })`. **Problem:** source isn't known here — connectAccount doesn't receive a source param.
  **Solution:** Add optional `source` param to `connectAccount`: `connectAccount(source?: 'setup' | 'accounts' | 'settings' | 'sidebar')`. Default to `'setup'`. Pass through from each call site.
  3. In `connectAccount()` catch: already throws, so the call-site catches it. Instead, instrument at call sites (accounts, settings, sidebar pages) for `account_connect_failed`.
  4. In `signOut()` (~line 136): call `trackEvent({ name: 'signed_out' })` before clearing state.
- **Why:** Single instrumentation point for account connect and sign out — these are triggered from 4+ different UI locations.

### File: `contexts/UploadContext.tsx`
- **Action:** Modify
- **What changes:**
  1. Add `import { trackEvent, simplifyMimeType, sanitizeError } from "@/services/analytics"`
  2. In `upload()` `.then()` (~line 103): call `trackEvent({ name: 'file_uploaded', params: { file_type: simplifyMimeType(file.type), file_size: file.size } })`
  3. In `upload()` `.catch()` (~line 112): call `trackEvent({ name: 'file_upload_failed', params: { file_type: simplifyMimeType(file.type), error: sanitizeError(err?.message ?? 'Upload failed') } })`
  Need to capture the error in the catch: change `.catch(() => {` to `.catch((err: unknown) => {`
- **Why:** All uploads (file picker, drag-and-drop, folder-specific) route through this single function.

### File: `contexts/ThemeContext.tsx`
- **Action:** Modify
- **What changes:**
  1. Add `import { trackEvent } from "@/services/analytics"`
  2. In `toggle()` (~line 25): after computing `next`, call `trackEvent({ name: 'theme_toggled', params: { theme: next } })`
- **Why:** Theme toggle is called from landing page, docs navbar, and dashboard navbar — single point.

### File: `contexts/AuthContext.tsx` (interface update)
- **What changes:** Update `connectAccount` signature in `AuthContextValue` interface to accept optional source:
  ```typescript
  connectAccount: (source?: 'setup' | 'accounts' | 'settings' | 'sidebar') => Promise<void>;
  ```
  Update the implementation and default context accordingly.

## Verification Steps
- [ ] `pnpm tsc --noEmit` passes
- [ ] `pnpm run lint` passes
- [ ] Theme toggle fires `theme_toggled` event (verify in Phase 7)
- [ ] Upload success fires `file_uploaded` with correct file_type
- [ ] Upload failure fires `file_upload_failed` with sanitized error
- [ ] Sign out fires `signed_out`

## Notes
- `connectAccount` source param change requires updating call sites: setup page, accounts page, settings page, sidebar. These will be updated in their respective phases.
- The catch in UploadContext currently swallows the error — need to capture it as a parameter.
