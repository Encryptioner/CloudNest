# Phase 1: Analytics Service + gtag Types

**Overview Plan:** See `overview.md`
**Spec Requirements Covered:** FR-1, FR-7

## Changes

### File: `types/gtag.d.ts` (CREATE)
- **Action:** Create
- **What changes:** Declare `gtag` function on the global `Window` interface. Covers `gtag('config', ...)`, `gtag('event', ...)`, and `gtag('js', ...)` signatures.
- **Why:** FR-7 — TypeScript won't recognize `window.gtag` without this declaration.

### File: `services/analytics.ts` (CREATE)
- **Action:** Create
- **What changes:**
  1. **`AnalyticsEvent` discriminated union** — every event name with its typed params. ~35 event variants organized by category (setup, account, file, ui, error).
  2. **`trackEvent(event: AnalyticsEvent): void`** — the single public function. Guards against SSR and missing gtag. Extracts `name` and `params`, calls `window.gtag('event', name, params)`.
  3. **`simplifyMimeType(mime: string | null): string`** — maps raw MIME types to GA-friendly categories: `image`, `video`, `document`, `pdf`, `spreadsheet`, `presentation`, `folder`, `other`.
  4. **`sanitizeError(msg: string): string`** — strips email patterns from error messages before sending to GA.
- **Why:** FR-1 — core analytics service with type safety, PII protection, and MIME simplification.

## Event Union Structure

```
// Setup funnel
| { name: 'setup_started' }
| { name: 'setup_step_viewed'; params: { step: number; step_name: string } }
| { name: 'setup_skipped_to_client_id' }
| { name: 'setup_client_id_saved' }
| { name: 'setup_account_connected'; params: { account_count: number } }
| { name: 'setup_account_failed'; params: { error: string } }
| { name: 'setup_completed'; params: { account_count: number; total_storage_gb: number } }

// Account management
| { name: 'account_connected'; params: { source: 'setup' | 'accounts' | 'settings' | 'sidebar' } }
| { name: 'account_connect_failed'; params: { source: string; error: string } }
| { name: 'account_disconnected'; params: { source: 'accounts' | 'settings' } }
| { name: 'account_reauth'; params: { source: 'accounts' | 'settings' } }
| { name: 'signed_out' }

// File operations
| { name: 'file_uploaded'; params: { file_type: string; file_size: number } }
| { name: 'file_upload_failed'; params: { file_type: string; error: string } }
| { name: 'file_downloaded'; params: { file_type: string } }
| { name: 'file_deleted'; params: { file_type: string; location: 'files' | 'trash' } }
| { name: 'file_restored'; params: { file_type: string } }
| { name: 'file_renamed' }
| { name: 'file_moved' }
| { name: 'file_shared'; params: { file_type: string } }
| { name: 'file_unshared' }
| { name: 'share_link_copied' }
| { name: 'folder_created' }
| { name: 'file_previewed'; params: { file_type: string } }

// UI interactions
| { name: 'theme_toggled'; params: { theme: 'dark' | 'light' } }
| { name: 'view_changed'; params: { view: 'grid' | 'list'; page: string } }
| { name: 'search_used'; params: { page: string } }
| { name: 'sort_changed'; params: { sort_by: string; page: string } }
| { name: 'sidebar_toggled'; params: { collapsed: boolean } }
| { name: 'cta_clicked'; params: { label: string; source: string } }
| { name: 'docs_viewed' }
| { name: 'stats_viewed' }

// Errors
| { name: 'error_occurred'; params: { category: string; action: string; error: string } }
```

## Verification Steps
- [ ] `pnpm tsc --noEmit` passes with new files
- [ ] `pnpm run lint` passes
- [ ] `trackEvent({ name: 'setup_started' })` compiles
- [ ] `trackEvent({ name: 'setup_started', params: { bad: true } })` fails to compile
- [ ] `trackEvent({ name: 'invalid_event' })` fails to compile
- [ ] `simplifyMimeType('image/png')` returns `'image'`
- [ ] `sanitizeError('User alice@gmail.com failed')` returns `'User [email] failed'`
