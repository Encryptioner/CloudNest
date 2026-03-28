# Phase 6: Components + Landing Page + Docs

**Overview Plan:** See `overview.md`
**Spec Requirements Covered:** FR-5 (sidebar_toggled, cta_clicked, docs_viewed)

## Changes

### File: `components/Sidebar.tsx`
- **Action:** Modify
- **What changes:**
  1. Add `import { trackEvent } from "@/services/analytics"`
  2. **sidebar_toggled:** In collapse button onClick, add `trackEvent({ name: 'sidebar_toggled', params: { collapsed: true } })`. In expand button onClick, add `trackEvent({ name: 'sidebar_toggled', params: { collapsed: false } })`.
  3. **Update connectAccount call:** In `handleAddAccount()`, pass source: `connectAccount('sidebar')`
- **Why:** FR-5 — UI interaction tracking.

### File: `components/Navbar.tsx`
- **Action:** Modify
- **What changes:**
  1. Add `import { trackEvent } from "@/services/analytics"`
  2. **sign_out_requested:** Note: `signed_out` is already fired in AuthContext.signOut(). Don't duplicate. No tracking needed here — the context handles it.
  3. **profile_updated:** In `saveProfile()` after saving, add `trackEvent({ name: 'cta_clicked', params: { label: 'profile_updated', source: 'navbar' } })`
     **Decision:** Profile update is rare and not critical for analytics. Skip to keep the event taxonomy clean. The spec doesn't list `profile_updated` as a required event.

  Actually, reviewing the spec — FR-5 only lists theme_toggled (handled in ThemeContext), sidebar_toggled, cta_clicked, docs_viewed, view_changed, search_used, sort_changed, stats_viewed. No profile_updated required. **Skip Navbar instrumentation entirely** — signed_out is handled in AuthContext, theme is handled in ThemeContext.
- **Why:** N/A — no events needed in Navbar after context-level instrumentation.

### File: `app/page.tsx`
- **Action:** Modify
- **What changes:**
  1. Add `import { trackEvent } from "@/services/analytics"`
  2. **cta_clicked (navbar):** In the navbar CTA Link, add `onClick={() => trackEvent({ name: 'cta_clicked', params: { label: ctaLabel, source: 'navbar' } })}`
  3. **cta_clicked (hero):** In the hero CTA Link, add `onClick={() => trackEvent({ name: 'cta_clicked', params: { label: ctaLabel, source: 'hero' } })}`
  4. **cta_clicked (welcome_back):** In the welcome-back banner "Go to Dashboard" Link, add `onClick={() => trackEvent({ name: 'cta_clicked', params: { label: 'go_to_dashboard', source: 'welcome_back' } })}`
  5. **cta_clicked (bottom):** In the bottom CTA section Link, add similar tracking
- **Why:** FR-5 — landing page engagement tracking.

### File: `app/docs/page.tsx`
- **Action:** Modify
- **What changes:**
  1. Add `import { trackEvent } from "@/services/analytics"` and `useEffect` from React
  2. **docs_viewed:** Add `useEffect` on mount:
     ```typescript
     useEffect(() => {
       trackEvent({ name: 'docs_viewed' });
     }, []);
     ```
- **Why:** FR-5 — docs engagement tracking.

## Verification Steps
- [ ] `pnpm tsc --noEmit` passes
- [ ] `pnpm run lint` passes
- [ ] Sidebar collapse fires `sidebar_toggled` with `collapsed: true`
- [ ] Landing page CTA clicks fire `cta_clicked` with correct source
- [ ] Docs page fires `docs_viewed` on mount
- [ ] No duplicate `signed_out` events (only fires from AuthContext)

## Notes
- `<Link>` components in Next.js support `onClick` — the handler fires before navigation. Since `trackEvent` is synchronous (calls `window.gtag` which queues internally), no race condition.
- Navbar needs NO changes since signed_out and theme_toggled are handled at context level.
