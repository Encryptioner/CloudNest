# Phase 4: File Operations, Trash & Shared Instrumentation

**Overview Plan:** See `overview.md`
**Spec Requirements Covered:** FR-4, FR-5 (view_changed, search_used, sort_changed for these pages), FR-6 (error_occurred)

## Changes

### File: `app/dashboard/files/page.tsx`
- **Action:** Modify
- **What changes:**
  1. Add `import { trackEvent, simplifyMimeType, sanitizeError } from "@/services/analytics"`
  2. **file_renamed:** In `handleRename()` success path, add `trackEvent({ name: 'file_renamed' })`
  3. **file_deleted (trash):** In `handleDelete()` success path, add `trackEvent({ name: 'file_deleted', params: { file_type: simplifyMimeType(file.mimeType), location: 'files' } })`
  4. **file_moved:** In `handleMove()` success path, add `trackEvent({ name: 'file_moved' })`
  5. **file_shared:** In `handleShare()` success path, add `trackEvent({ name: 'file_shared', params: { file_type: simplifyMimeType(file.mimeType) } })`
  6. **file_unshared:** In `handleUnshare()` success path, add `trackEvent({ name: 'file_unshared' })`
  7. **file_downloaded:** In `handleDownload()` success path, add `trackEvent({ name: 'file_downloaded', params: { file_type: simplifyMimeType(file.mimeType) } })`
  8. **share_link_copied:** In the copy-to-clipboard onClick handler, add `trackEvent({ name: 'share_link_copied' })`
  9. **folder_created:** In the folder creation handler (if exists), add `trackEvent({ name: 'folder_created' })`
  10. **file_previewed:** When preview modal opens (setPreviewFile is called with a non-null value), add `trackEvent({ name: 'file_previewed', params: { file_type: simplifyMimeType(file.mimeType) } })`
  11. **view_changed:** In grid/list toggle handlers, add `trackEvent({ name: 'view_changed', params: { view: 'grid' | 'list', page: 'files' } })`
  12. **sort_changed:** In sort dropdown onChange, add `trackEvent({ name: 'sort_changed', params: { sort_by: value, page: 'files' } })`
  13. **search_used:** Add debounced tracking for search. Use a `useRef` + `setTimeout` pattern:
      ```typescript
      const searchTimerRef = useRef<ReturnType<typeof setTimeout>>();
      // In search onChange:
      clearTimeout(searchTimerRef.current);
      searchTimerRef.current = setTimeout(() => {
        if (value.trim()) trackEvent({ name: 'search_used', params: { page: 'files' } });
      }, 1000);
      ```
  14. **error_occurred:** In each catch block for file operations, add `trackEvent({ name: 'error_occurred', params: { category: 'file_operation', action: 'rename'|'delete'|..., error: sanitizeError(msg) } })`
- **Why:** FR-4 + FR-5 + FR-6 — complete file operations tracking.

### File: `app/dashboard/trash/page.tsx`
- **Action:** Modify
- **What changes:**
  1. Add `import { trackEvent, simplifyMimeType, sanitizeError } from "@/services/analytics"`
  2. **file_restored:** In `handleRestore()` success, add `trackEvent({ name: 'file_restored', params: { file_type: simplifyMimeType(file.mimeType) } })`
  3. **file_deleted (permanent):** In `handleDelete()` success, add `trackEvent({ name: 'file_deleted', params: { file_type: simplifyMimeType(file.mimeType), location: 'trash' } })`
  4. **view_changed, sort_changed, search_used:** Same pattern as files page but with `page: 'trash'`
  5. **error_occurred:** In catch blocks for restore/delete operations
- **Why:** FR-4 — trash operations tracking.

### File: `app/dashboard/shared/page.tsx`
- **Action:** Modify
- **What changes:**
  1. Add `import { trackEvent, simplifyMimeType } from "@/services/analytics"`
  2. **file_downloaded:** In `handleDownload()` success, add `trackEvent({ name: 'file_downloaded', params: { file_type: simplifyMimeType(file.mimeType) } })`
  3. **view_changed, sort_changed, search_used:** Same pattern with `page: 'shared'`
- **Why:** FR-4 + FR-5 — shared page tracking.

## Verification Steps
- [ ] `pnpm tsc --noEmit` passes
- [ ] `pnpm run lint` passes
- [ ] File rename fires `file_renamed`
- [ ] File delete from files page fires `file_deleted` with `location: 'files'`
- [ ] Permanent delete from trash fires `file_deleted` with `location: 'trash'`
- [ ] Search debounce fires only after 1s pause, not on every keystroke
- [ ] Error events fire with sanitized messages (no emails)

## Notes
- The search debounce ref needs cleanup on unmount. Add `useEffect` cleanup: `return () => clearTimeout(searchTimerRef.current)`.
- File operation handlers already have try/catch blocks — just add `trackEvent` in the appropriate branch.
- `simplifyMimeType` needs the file's mimeType which is available on the file object in each handler's scope.
