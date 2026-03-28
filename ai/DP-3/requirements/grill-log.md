# Grill Log: DP-3 — Typed Google Analytics Event Tracking

**Date:** 2026-03-29
**Grilled by:** Claude (Hard Critic Mode)
**Input:** Technical spec (`ai/DP-3/requirements/spec.md`)
**Ticket:** DP-3
**Verdict:** PASS WITH CONDITIONS

## Summary

Solid spec with good architecture decisions (discriminated unions, single instrumentation points, PII-free params). The main concerns are around the "instrument at the context level" strategy creating import cycles, missing the `folder_created` flow, and the search debounce requiring careful implementation to avoid noise. No blockers. Two majors worth addressing before planning.

**Stats:** 9 findings — 0 Blocker, 0 Critical, 2 Major, 4 Minor, 3 Note

## Findings

### MAJOR

#### [M1] ThemeContext cannot import analytics without creating a provider ordering issue
- **Location:** FR-5, Technical Note #1 ("instrument at the context/service level")
- **Issue:** The spec says to instrument `theme_toggled` inside `ThemeContext.toggle()`. But `ThemeContext` is the outermost provider after `<html>`. If `analytics.ts` is a pure module (no React context), this is fine. But if it ever needs React context (e.g., user ID), the ordering becomes fragile. More concretely: `ThemeContext` currently has zero imports from `@/services/` — adding one is a new coupling direction.
- **Risk:** Not a blocker since `services/analytics.ts` is a pure module with no React dependencies, but the spec should explicitly state that the analytics service must remain a pure module (no hooks, no contexts) to preserve this.
- **Recommendation:** Add a constraint to FR-1: "The analytics service MUST be a pure TypeScript module with no React imports — it only accesses `window.gtag`." This prevents future drift.

#### [M2] `folder_created` event listed but no creation flow identified in UploadContext
- **Location:** FR-4 event table
- **Issue:** The spec lists `folder_created` as an event but doesn't identify where folder creation happens. Looking at `app/dashboard/files/page.tsx`, folder creation is handled via `drive.createFolder()` called from the files page. The spec's strategy of "instrument at the context level" doesn't apply here since there's no context for folder creation — it's a direct handler in the files page.
- **Risk:** Minor — the event just needs to be instrumented at the call site in `files/page.tsx`. But it contradicts the "single instrumentation point" strategy, so implementers need clarity on which events go where.
- **Recommendation:** In Technical Notes, distinguish: "Context-level instrumentation for: account_connected, theme_toggled, file_uploaded. Call-site instrumentation for: all other events (file operations, UI interactions, navigation)."

### MINOR

#### [m1] `error` param in `account_connect_failed` may contain PII
- **Location:** FR-3, FR-6
- **Issue:** Google OAuth error messages can include email addresses (e.g., "User alice@gmail.com has not been added as a test user"). The spec says "no PII in error events" (NFR) but FR-3 passes raw `error: string` from catch blocks.
- **Risk:** Email addresses end up in GA event data.
- **Recommendation:** Add a `sanitizeError(msg: string): string` helper that strips email-like patterns before sending to GA.

#### [m2] `search_used` debounce strategy needs specification
- **Location:** FR-5
- **Issue:** The spec says "debounced ~1s, fires once per search session" but doesn't define what "search session" means. Is it per focus? Per route? If the user types "report", waits 2s, then types " 2024", does that fire once or twice?
- **Risk:** Either noise (fires too often) or missed data (fires too rarely).
- **Recommendation:** Define: "Fire once when the user stops typing for 1 second. Reset debounce on each keystroke. No deduplication beyond the debounce — if the user clears and retypes, that's a new event."

#### [m3] GA4 event name length limit
- **Location:** FR-2 through FR-6
- **Issue:** GA4 has a 40-character limit on event names. All proposed names are well under this limit (longest is ~25 chars), but this constraint isn't documented. Future additions might exceed it.
- **Risk:** Very low for current events. Informational for future-proofing.
- **Recommendation:** Add a note to FR-1: "GA4 event name limit: 40 chars, parameter name limit: 40 chars, parameter value limit: 100 chars."

#### [m4] Missing `file_previewed` event
- **Location:** FR-4
- **Issue:** The files page has a `PreviewModal` for previewing files (images, PDFs, etc.). This is a significant user action — it tells you what types of files users look at most — but isn't in the event taxonomy.
- **Risk:** Missing engagement data for a core feature.
- **Recommendation:** Add `file_previewed` with `{ file_type: string }` to FR-4.

### NOTES

#### [N1] Good: Single instrumentation point for uploads
- The spec correctly identifies `UploadContext` as the single point for upload events. This is sound — uploads can come from the file input, drag-and-drop, or folder-specific upload, and all route through `UploadContext.upload()`.

#### [N2] Good: PII exclusion in NFRs
- Explicitly calling out "no email, file names, or file IDs" is the right call. GA4 data can't be deleted retroactively, so PII leaks are permanent.

#### [N3] Consider: GA4 DebugView for verification instead of network inspection
- FR-8 proposes verifying via Chrome DevTools network tab. GA4 has a built-in [DebugView](https://support.google.com/analytics/answer/7201382) that shows events in real-time with params. It's more reliable than inspecting network requests (which use `sendBeacon` and may not show in the Network tab). The spec should mention enabling GA debug mode via `gtag('config', 'G-...', { debug_mode: true })` for testing.

## Security Assessment

| Category | Status | Notes |
|----------|--------|-------|
| Authentication | N/A | Analytics is fire-and-forget, no auth needed |
| Authorization | N/A | No user data accessed |
| Input Validation | OK | TypeScript union types prevent invalid events at compile time |
| Data Exposure | OK | NFR explicitly prohibits PII. See [m1] for edge case. |
| Rate Limiting | N/A | gtag handles batching internally |
| Multi-tenancy | N/A | No multi-tenant concerns |

## Assumptions Made

1. **`window.gtag` is always available when analytics service is called** — Risk if wrong: silent no-op (acceptable, handled by the `if` guard)
2. **GA4 measurement ID won't change** — Risk if wrong: low, it's in layout.tsx config
3. **No consent management needed** — Risk if wrong: GDPR compliance issue if CloudNest is used in EU. Currently acceptable since GA4 basic mode is cookieless and the app is a personal project.
4. **Ad blockers blocking gtag won't cause errors** — Risk if wrong: the `typeof window !== 'undefined' && window.gtag` guard handles this

## Missing from Spec

- [ ] `file_previewed` event (see [m4])
- [ ] Error sanitization helper to strip PII from error messages (see [m1])
- [ ] GA4 debug mode for testing verification (see [N3])
- [ ] Explicit constraint that analytics service must be a pure module (see [M1])

## Questions for Author

None — the spec is clear and the findings above are actionable without further input.

## Verdict Details

**PASS WITH CONDITIONS.** The spec is well-structured with good architectural decisions. Address these conditions before planning:

1. **[M1]** Add explicit constraint: analytics service must be a pure TypeScript module (no React imports)
2. **[M2]** Clarify which events use context-level vs call-site instrumentation
3. **[m1]** Add error sanitization to prevent PII leakage in error event params

All other findings (m2, m3, m4, notes) can be addressed during implementation without spec revision.
