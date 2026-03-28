# Plan Overview: DP-3 — Typed Google Analytics Event Tracking

**Date:** 2026-03-29
**Spec:** See `../requirements/spec.md`
**Status:** Implemented

## Approach Summary

Create a pure TypeScript analytics service (`services/analytics.ts`) with a discriminated union of all events, a `trackEvent()` function, and helpers for MIME-to-category mapping and error sanitization. Then instrument ~35 unique events across 14 files in dependency order: contexts first (single instrumentation points), then pages/components (call-site events). Verify via Chrome DevTools MCP with GA4 debug mode.

## Targets

| Action | File Path | Reason |
|--------|-----------|--------|
| Create | `services/analytics.ts` | Core analytics service with typed events |
| Create | `types/gtag.d.ts` | Window.gtag type declaration |
| Modify | `contexts/AuthContext.tsx` | Instrument: account_connected, account_connect_failed, signed_out |
| Modify | `contexts/UploadContext.tsx` | Instrument: file_uploaded, file_upload_failed |
| Modify | `contexts/ThemeContext.tsx` | Instrument: theme_toggled |
| Modify | `app/setup/page.tsx` | Instrument: setup funnel (7 events) |
| Modify | `app/dashboard/files/page.tsx` | Instrument: file ops + UI interactions (~12 events) |
| Modify | `app/dashboard/trash/page.tsx` | Instrument: restore, permanent delete, UI interactions |
| Modify | `app/dashboard/shared/page.tsx` | Instrument: download, view/sort changes |
| Modify | `app/dashboard/accounts/page.tsx` | Instrument: disconnect, reauth (connect handled in AuthContext) |
| Modify | `app/dashboard/settings/page.tsx` | Instrument: client_id_updated, profile_updated, disconnect |
| Modify | `app/dashboard/stats/page.tsx` | Instrument: page view event on mount |
| Modify | `components/Sidebar.tsx` | Instrument: sidebar_toggled, nav clicks |
| Modify | `components/Navbar.tsx` | Instrument: sign_out_requested, profile_updated |
| Modify | `app/page.tsx` | Instrument: cta_clicked, docs link |
| Modify | `app/docs/page.tsx` | Instrument: docs_viewed on mount |

## Phases

| Phase | Description | Files | Est. Complexity |
|-------|-------------|-------|-----------------|
| 1 | Analytics service + gtag types | 2 create | Low |
| 2 | Context-level instrumentation (auth, upload, theme) | 3 modify | Low |
| 3 | Setup funnel instrumentation | 1 modify | Low |
| 4 | File operations + trash + shared instrumentation | 3 modify | Medium |
| 5 | Dashboard pages (accounts, settings, stats) | 3 modify | Low |
| 6 | Components + landing (sidebar, navbar, homepage, docs) | 4 modify | Low |
| 7 | Verification via Chrome DevTools MCP | 0 files | Medium |

## Implementation Order

1. **Phase 1 first** — everything depends on the analytics service existing
2. **Phase 2 next** — contexts are imported by pages; instrumenting here prevents duplicate events in phases 3-6
3. **Phases 3-6 are independent** — can be done in any order, but grouped by complexity/relatedness
4. **Phase 7 last** — verification requires all instrumentation to be in place

## Dependencies

- No external dependencies. gtag is already loaded in `layout.tsx`.
- No shared package changes. `services/analytics.ts` is a new pure module.
- `types/gtag.d.ts` must exist before `services/analytics.ts` can reference `window.gtag` without type errors.

## Risk Areas

- **High-traffic events (search, sort):** Could generate excessive GA events if not debounced. Mitigated by debouncing search and only tracking on change for sort/view.
- **PII in error strings:** OAuth errors may contain emails. Mitigated by `sanitizeError()` helper.
- **Bundle size:** Negligible — one ~80-line service file with zero dependencies.

## Alternative Approaches Considered

1. **React hook (`useAnalytics`)** — Rejected. Would require React context, can't be used in pure service files (ThemeContext, AuthContext). Pure module is simpler and universally importable.
2. **Third-party library (react-ga4, etc.)** — Rejected. Adds dependency for what's a 50-line wrapper. gtag is already loaded.
3. **Event bus pattern** — Rejected. Over-engineered for this use case. Direct `trackEvent()` calls are simpler and traceable.
