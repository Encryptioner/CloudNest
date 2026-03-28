# Spec: DP-3 — Typed Google Analytics Event Tracking

**Date:** 2026-03-29
**Status:** Grilled
**Original Requirement:** See `original-requirement.md`

## Overview

Add comprehensive, type-safe Google Analytics event tracking to CloudNest. A centralized `services/analytics.ts` module will expose a single `trackEvent()` function where every event name and its parameters are defined via TypeScript discriminated unions — making it impossible to send a misspelled event or wrong parameter type. Instrument all key user actions across the app (~35 unique events), then verify via Chrome DevTools MCP that events fire correctly in GA's real-time view.

### Strategic Context
- **Problem:** Zero visibility into user behavior. We only know page view counts — not how users progress through setup, which features they use, where they drop off, or what errors they hit.
- **Who:** The developer (Ankur) — needs data to prioritize features, identify friction, and understand adoption.
- **Why now:** The app is feature-complete and being shared with users. Without analytics, decisions are blind guesses.
- **If not this:** Continue flying blind. No way to know if the setup funnel is working, which features are popular, or what errors users experience.

## Functional Requirements

### FR-1: Analytics Service (`services/analytics.ts`)

**Description:** A typed analytics service that wraps `gtag('event', ...)` with full type safety.

**Design:**

```typescript
// Discriminated union — each event defines its own params
type AnalyticsEvent =
  | { name: 'setup_started' }
  | { name: 'setup_step_changed'; params: { from_step: number; to_step: number } }
  | { name: 'setup_client_id_saved' }
  | { name: 'setup_account_connected'; params: { method: 'setup' | 'accounts' | 'settings' | 'sidebar' } }
  | { name: 'setup_completed'; params: { account_count: number } }
  | { name: 'account_connected'; params: { method: string } }
  | { name: 'account_disconnected' }
  | { name: 'account_reauth'; params: { source: string } }
  | { name: 'file_uploaded'; params: { file_type: string; file_size: number } }
  // ... etc for all events
  ;

export function trackEvent(event: AnalyticsEvent): void {
  if (typeof window !== 'undefined' && window.gtag) {
    const { name, ...rest } = event;
    window.gtag('event', name, 'params' in rest ? rest.params : undefined);
  }
}
```

**Acceptance criteria:**
- [ ] `trackEvent()` accepts only valid event names via discriminated union
- [ ] Each event's params are individually typed — passing wrong params is a compile error
- [ ] Events with no params don't require a `params` field
- [ ] No-op when `window.gtag` is undefined (SSR safety, ad blockers)
- [ ] No `any` types anywhere
- [ ] `gtag` type declaration added (global `Window` interface extension)
- [ ] Zero runtime dependencies — just a thin wrapper over `window.gtag`
- [ ] **Pure module constraint:** No React imports (no hooks, no contexts, no JSX). Must remain importable from any file without provider ordering concerns.
- [ ] Includes `sanitizeError(msg: string): string` helper that strips email-like patterns before sending to GA
- [ ] GA4 limits respected: event name max 40 chars, param name max 40 chars, param value max 100 chars

### FR-2: Event Taxonomy — Setup Funnel

**Description:** Track every step of the setup wizard to measure drop-off.

| Event Name | Params | Trigger |
|---|---|---|
| `setup_started` | — | User clicks "Let's Get Started" |
| `setup_step_viewed` | `{ step: number; step_name: string }` | Each step renders |
| `setup_client_id_saved` | — | Client ID validated and saved |
| `setup_account_connected` | `{ account_count: number }` | Account connected during setup |
| `setup_account_failed` | `{ error: string }` | Account connection failed during setup |
| `setup_completed` | `{ account_count: number; total_storage_gb: number }` | User reaches "Done" step |
| `setup_skipped_to_client_id` | — | User clicks "Already have a Client ID?" |

**Acceptance criteria:**
- [ ] All 7 events fire at the correct points in `app/setup/page.tsx`
- [ ] `setup_step_viewed` fires for each step including back-navigation
- [ ] Funnel visualization possible in GA: started → client_id → connected → completed

### FR-3: Event Taxonomy — Account Management

**Description:** Track account connect/disconnect/re-auth from all entry points.

| Event Name | Params | Trigger |
|---|---|---|
| `account_connected` | `{ source: 'setup' \| 'accounts' \| 'settings' \| 'sidebar' }` | Account connected from any page |
| `account_connect_failed` | `{ source: string; error: string }` | Connection attempt failed |
| `account_disconnected` | `{ source: 'accounts' \| 'settings' }` | Account disconnected |
| `account_reauth` | `{ source: 'accounts' \| 'settings' }` | Re-authenticate clicked |
| `signed_out` | — | User signs out |

**Acceptance criteria:**
- [ ] `account_connected` fires from accounts page, settings page, sidebar, and setup — each with correct `source`
- [ ] Disconnect and re-auth events fire with correct source
- [ ] `signed_out` fires once (not duplicated between Navbar and AuthContext)

### FR-4: Event Taxonomy — File Operations

**Description:** Track core file management actions.

| Event Name | Params | Trigger |
|---|---|---|
| `file_uploaded` | `{ file_type: string; file_size: number }` | Upload completed successfully |
| `file_upload_failed` | `{ file_type: string; error: string }` | Upload failed |
| `file_downloaded` | `{ file_type: string }` | File downloaded |
| `file_deleted` | `{ file_type: string; location: 'files' \| 'trash' }` | File trashed or permanently deleted |
| `file_restored` | `{ file_type: string }` | File restored from trash |
| `file_renamed` | — | File renamed |
| `file_moved` | — | File moved to folder |
| `file_shared` | `{ file_type: string }` | Share link created |
| `file_unshared` | — | Share link revoked |
| `share_link_copied` | — | Share link copied to clipboard |
| `folder_created` | — | New folder created |
| `file_previewed` | `{ file_type: string }` | File preview opened |

**Acceptance criteria:**
- [ ] Upload events fire from `UploadContext` (single instrumentation point for all upload sources)
- [ ] File operations fire from `app/dashboard/files/page.tsx` handlers
- [ ] Trash operations fire from `app/dashboard/trash/page.tsx`
- [ ] `file_type` is a simplified category (image/video/document/pdf/spreadsheet/other), not raw MIME

### FR-5: Event Taxonomy — UI Interactions

**Description:** Track engagement signals and feature discovery.

| Event Name | Params | Trigger |
|---|---|---|
| `theme_toggled` | `{ theme: 'dark' \| 'light' }` | Theme switch from any location |
| `view_changed` | `{ view: 'grid' \| 'list'; page: string }` | Grid/list toggle on files/shared/trash |
| `search_used` | `{ page: 'files' \| 'shared' \| 'trash' }` | User types in search (debounced) |
| `sort_changed` | `{ sort_by: string; page: string }` | Sort order changed |
| `sidebar_toggled` | `{ collapsed: boolean }` | Sidebar collapse/expand |
| `cta_clicked` | `{ label: string; source: string }` | CTA button on landing page |
| `docs_viewed` | — | Docs page visited |

**Acceptance criteria:**
- [ ] `search_used` fires once per search session (debounced ~1s), not per keystroke
- [ ] `view_changed` and `sort_changed` include the page context
- [ ] `cta_clicked` distinguishes between navbar, hero, and welcome-back banner CTAs

### FR-6: Event Taxonomy — Errors

**Description:** Track errors so we can monitor failure rates.

| Event Name | Params | Trigger |
|---|---|---|
| `error_occurred` | `{ category: string; action: string; error: string }` | Any caught error in file ops, auth, uploads |

**Acceptance criteria:**
- [ ] All `catch` blocks in file operation handlers, upload context, and auth service fire `error_occurred`
- [ ] `category` groups errors (auth, file_operation, upload, storage)
- [ ] `error` is the error message string (not the full stack trace)
- [ ] No PII (email addresses) in error event params

### FR-7: gtag Type Declaration

**Description:** Add TypeScript type declaration for `window.gtag` so the analytics service compiles without `any`.

**Acceptance criteria:**
- [ ] `types/gtag.d.ts` or extension in existing types file declares `gtag` on `Window`
- [ ] Signature covers `gtag('config', ...)`, `gtag('event', ...)`, `gtag('js', ...)`
- [ ] No `@ts-ignore` or `any` used

### FR-8: Verification via Chrome DevTools

**Description:** After instrumentation, verify events fire correctly using Chrome DevTools MCP.

**Acceptance criteria:**
- [ ] Navigate through key flows and confirm events appear in network requests to `google-analytics.com`
- [ ] Verify setup funnel events fire in correct order
- [ ] Verify file upload event fires with correct params
- [ ] Verify account connect event fires with correct source
- [ ] Verify error event fires when an operation fails
- [ ] Verify no events fire during SSR/build

## Non-Functional Requirements

- **Performance:** `trackEvent()` must be fire-and-forget — no `await`, no blocking UI. gtag handles batching internally.
- **Bundle size:** Zero new dependencies. Just TypeScript types + one ~50-line service file.
- **Privacy:** Never send PII (email, file names, file IDs) in event params. Use categories/types only.
- **Ad blocker resilience:** `trackEvent()` silently no-ops if gtag is blocked. No errors thrown.
- **SSR safety:** Service must not reference `window` at module scope — only inside the function body.

## Out of Scope

- Google Analytics dashboard/report configuration — that's done in the GA web UI, not in code
- Enhanced ecommerce tracking
- User ID / cross-device tracking
- Consent management / GDPR cookie banner (no cookies used — GA4 is cookieless in basic mode)
- Custom dimensions or metrics beyond what GA4 provides by default
- Server-side analytics

## Existing Code References

- `app/layout.tsx:44-50` — Current gtag snippet (config only, no events)
- `services/auth.ts` — OAuth flow, token management (instrument errors here)
- `services/drive.ts` — Drive API calls (file operations originate here)
- `contexts/UploadContext.tsx` — Upload logic (single point to instrument uploads)
- `contexts/AuthContext.tsx` — Account connect/disconnect/signOut (instrument here, not at each call site)
- `app/setup/page.tsx` — Setup wizard (instrument each step)
- `app/dashboard/files/page.tsx` — File operations (rename, delete, move, share, download)
- `app/dashboard/trash/page.tsx` — Trash operations (restore, permanent delete)
- `app/dashboard/accounts/page.tsx` — Account management UI
- `app/dashboard/settings/page.tsx` — Settings page with account management
- `contexts/ThemeContext.tsx` — Theme toggle (instrument here for single point)
- `components/Sidebar.tsx` — Sidebar toggle, navigation
- `components/Navbar.tsx` — Sign out, profile modal
- `types/index.ts` — Existing type definitions

## Technical Notes

1. **Instrumentation strategy — two tiers:**
   - **Context-level (single point):** `account_connected` (in AuthContext.connectAccount), `file_uploaded`/`file_upload_failed` (in UploadContext.upload), `theme_toggled` (in ThemeContext.toggle), `signed_out` (in AuthContext.signOut). Pass `source` param to distinguish call sites where needed.
   - **Call-site level:** All other events (file operations, UI interactions, navigation, setup steps). These are page-specific handlers where the action only happens in one place.
2. **File type simplification:** Use a helper function to map MIME types to GA-friendly categories: `image`, `video`, `document`, `pdf`, `spreadsheet`, `presentation`, `folder`, `other`.
3. **Search debounce:** Don't track every keystroke. Fire `search_used` after 1s of inactivity, and only once per search session.
4. **Privacy:** Strip PII before sending. File names, email addresses, and file IDs must NEVER appear in GA events. Use file type, operation type, and source location only.
5. **gtag already loaded:** The gtag script is loaded in `layout.tsx` head. The analytics service just needs to call `window.gtag()` — no additional script loading needed.
6. **GA4 DebugView for verification:** Enable `debug_mode: true` in gtag config during testing to use GA4's built-in DebugView (real-time event stream with params). More reliable than network inspection since GA4 uses `sendBeacon`.
7. **Error sanitization:** All `error` params must pass through `sanitizeError()` which strips email-like patterns (`/[\w.-]+@[\w.-]+/g → '[email]'`) before sending to GA.

## Open Questions

None — requirements are clear from the user's request and codebase analysis.

## Change Log

| Date | Section Changed | What Changed | Why |
|------|----------------|--------------|-----|
| 2026-03-29 | FR-1, FR-4, Tech Notes | Added pure module constraint, error sanitization, file_previewed event, debug mode, two-tier instrumentation strategy | Grill findings M1, M2, m1, m4, N3 |
