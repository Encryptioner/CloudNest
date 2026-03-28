# Grill Log: DP-3 Plan — Typed GA Event Tracking

**Date:** 2026-03-29
**Grilled by:** Claude (Hard Critic Mode)
**Input:** Implementation plan (overview + 7 phase files)
**Ticket:** DP-3
**Verdict:** PASS WITH CONDITIONS

## Summary

Well-structured plan with good phase ordering and clear single-instrumentation-point strategy. Main concerns: the `connectAccount` signature change in Phase 2 ripples to 4 call sites that aren't all addressed in Phase 2 itself, and the Navbar decision to skip instrumentation should be explicitly documented. No blockers or criticals.

**Stats:** 5 findings — 0 Blocker, 0 Critical, 1 Major, 3 Minor, 1 Note

## Findings

### MAJOR

#### [M1] connectAccount signature change creates cross-phase dependency
- **Location:** Phase 2 (AuthContext) + Phases 3, 5, 6
- **Issue:** Phase 2 adds `source` param to `connectAccount()`. But the call sites are in Phase 3 (setup), Phase 5 (accounts, settings), and Phase 6 (sidebar). Until those phases are complete, the intermediate state has a changed interface but callers passing no source — which is fine since it's optional, but confusing if someone reads the code mid-implementation.
- **Risk:** Low — TypeScript won't error since it's optional. But it means `source` defaults to undefined (not tracked) for any call site not yet updated.
- **Recommendation:** Document in Phase 2 that the default should be `'setup'` since that was the original behavior (setup page is the primary entry point). All other call sites update the source in their respective phases.

### MINOR

#### [m1] Phase 6 Navbar decision is buried in prose
- **Location:** Phase 6, Navbar section
- **Issue:** The decision to skip Navbar instrumentation is reached through a reasoning chain in the plan text. It should be a clear one-liner so implementers don't second-guess it.
- **Recommendation:** Add to Phase 6 notes: "Navbar requires NO changes — `signed_out` handled by AuthContext, `theme_toggled` handled by ThemeContext."

#### [m2] docs/page.tsx needs useEffect import check
- **Location:** Phase 6, docs/page.tsx
- **Issue:** The plan says "add `useEffect` from React" but the docs page component (`DocsPage`) may not currently import React hooks at all — it's a mostly static page. Adding a `useEffect` import is fine but should note this is a new import.
- **Recommendation:** Minor — just note that `useEffect` is a new import for this file.

#### [m3] Phase 4 search debounce cleanup
- **Location:** Phase 4, files/page.tsx
- **Issue:** The plan mentions needing cleanup for the search debounce timer ref but doesn't specify where — it's in the Notes section, not in the Changes section.
- **Recommendation:** Add to the Changes section: "Add `useEffect` cleanup for search timer ref on unmount."

### NOTES

#### [N1] Good: Phase ordering respects dependencies
- Phase 1 (service) → Phase 2 (contexts) → Phases 3-6 (consumers) is the correct dependency order. No phase imports something that doesn't exist yet.

## Spec Coverage

| Spec Requirement | Covered in Phase | Status |
|-----------------|-----------------|--------|
| FR-1 (Analytics service) | Phase 1 | Covered |
| FR-2 (Setup funnel) | Phase 3 | Covered |
| FR-3 (Account management) | Phase 2, 5 | Covered |
| FR-4 (File operations) | Phase 2, 4 | Covered |
| FR-5 (UI interactions) | Phase 4, 5, 6 | Covered |
| FR-6 (Errors) | Phase 4 | Covered |
| FR-7 (gtag types) | Phase 1 | Covered |
| FR-8 (Verification) | Phase 7 | Covered |

All spec requirements are covered. No orphan phases.

## Assumptions Made

1. `connectAccount` optional param won't break existing call sites — Correct, TypeScript allows omitting optional params
2. `trackEvent` is synchronous enough that `<Link onClick>` fires before navigation — Correct, gtag queues internally
3. GA4 debug mode can be toggled without code change — Need to verify; may need `debug_mode: true` in config

## Verdict Details

**PASS WITH CONDITIONS.** Address during implementation:
1. **[M1]** Set `connectAccount` default source to `'setup'` and document the ripple
2. **[m3]** Add search debounce cleanup to Phase 4 changes section

All other findings are minor documentation clarity issues.
