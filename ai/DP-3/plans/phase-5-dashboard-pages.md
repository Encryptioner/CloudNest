# Phase 5: Dashboard Pages (Accounts, Settings, Stats)

**Overview Plan:** See `overview.md`
**Spec Requirements Covered:** FR-3 (account_disconnected, account_reauth), FR-5 (stats_viewed)

## Changes

### File: `app/dashboard/accounts/page.tsx`
- **Action:** Modify
- **What changes:**
  1. Add `import { trackEvent } from "@/services/analytics"`
  2. **Update connectAccount call:** `connectAccount('accounts')` — pass source param
  3. **account_disconnected:** In `handleDisconnect()`, before calling `disconnectAccount(email)`, add `trackEvent({ name: 'account_disconnected', params: { source: 'accounts' } })`
  4. **account_reauth:** In re-authenticate button onClick, add `trackEvent({ name: 'account_reauth', params: { source: 'accounts' } })`
- **Why:** FR-3 — account management tracking from accounts page.

### File: `app/dashboard/settings/page.tsx`
- **Action:** Modify
- **What changes:**
  1. Add `import { trackEvent } from "@/services/analytics"`
  2. **Update connectAccount call:** `connectAccount('settings')` — pass source param
  3. **settings_client_id_updated:** In `saveClientId()` success, add `trackEvent({ name: 'cta_clicked', params: { label: 'client_id_updated', source: 'settings' } })`
     Actually — this should be a custom event. But re-checking the spec, FR-3 doesn't list a `settings_client_id_updated`. This is a settings-specific action. Use `cta_clicked` with appropriate params, or add to the union. **Decision:** Keep it simple — no separate event for client ID update. It's rare and not funnel-critical.
  4. **account_disconnected:** In disconnect handler, add `trackEvent({ name: 'account_disconnected', params: { source: 'settings' } })`
  5. **account_reauth:** In re-authenticate button, add `trackEvent({ name: 'account_reauth', params: { source: 'settings' } })`
- **Why:** FR-3 — account management tracking from settings page.

### File: `app/dashboard/stats/page.tsx`
- **Action:** Modify
- **What changes:**
  1. Add `import { trackEvent } from "@/services/analytics"`
  2. **stats_viewed:** Add `useEffect` on mount:
     ```typescript
     useEffect(() => {
       trackEvent({ name: 'stats_viewed' });
     }, []);
     ```
- **Why:** FR-5 — track analytics page engagement.

## Verification Steps
- [ ] `pnpm tsc --noEmit` passes
- [ ] `pnpm run lint` passes
- [ ] Disconnecting from accounts page fires `account_disconnected` with `source: 'accounts'`
- [ ] Re-auth from settings fires `account_reauth` with `source: 'settings'`
- [ ] Stats page fires `stats_viewed` on mount (once)

## Notes
- `connectAccount` source param was added in Phase 2 — call sites here just need to pass the value.
- Stats page useEffect with `[]` deps fires once on mount. No re-fire on data changes.
