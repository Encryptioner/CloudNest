# Phase 3: Setup Funnel Instrumentation

**Overview Plan:** See `overview.md`
**Spec Requirements Covered:** FR-2

## Changes

### File: `app/setup/page.tsx`
- **Action:** Modify
- **What changes:**
  1. Add `import { trackEvent } from "@/services/analytics"`
  2. **setup_started:** In "Let's Get Started" button onClick (~line 109), add `trackEvent({ name: 'setup_started' })` before `setCurrentStep(1)`
  3. **setup_skipped_to_client_id:** In "Already have a Client ID?" button onClick (~line 116), add `trackEvent({ name: 'setup_skipped_to_client_id' })` before `setCurrentStep(5)`
  4. **setup_step_viewed:** Add a `useEffect` that fires whenever `currentStep` changes:
     ```typescript
     useEffect(() => {
       trackEvent({ name: 'setup_step_viewed', params: { step: currentStep, step_name: STEPS[currentStep] } });
     }, [currentStep]);
     ```
  5. **setup_client_id_saved:** In `handleSaveClientId()` after successful validation (~line 56), add `trackEvent({ name: 'setup_client_id_saved' })`
  6. **setup_account_connected:** In `handleConnect()` success path (~line 64), add `trackEvent({ name: 'setup_account_connected', params: { account_count: accounts.length + 1 } })`
  7. **setup_account_failed:** In `handleConnect()` catch (~line 66), add `trackEvent({ name: 'setup_account_failed', params: { error: sanitizeError(err instanceof Error ? err.message : 'Connection failed') } })`
  8. **setup_completed:** In the "Done" step's "Open Dashboard" link, change to an onClick handler that fires `trackEvent({ name: 'setup_completed', params: { account_count: accounts.length, total_storage_gb: Math.round(accounts.reduce((s, a) => s + a.storageQuota.limit, 0) / (1024 ** 3)) } })` before navigation
  9. **Update connectAccount call:** Pass source param: `connectAccount('setup')`
- **Why:** FR-2 — full setup funnel tracking for drop-off analysis.

## Verification Steps
- [ ] `pnpm tsc --noEmit` passes
- [ ] `pnpm run lint` passes
- [ ] Navigating through setup wizard fires step_viewed for each step
- [ ] Completing setup fires the full funnel: started → step_viewed → client_id_saved → account_connected → completed

## Notes
- The "Open Dashboard" link is currently a `<Link>` component. To add onClick tracking, wrap it or use `router.push` after tracking. Since `trackEvent` is fire-and-forget (synchronous call to gtag), we can keep the `<Link>` and just add an `onClick` handler — Next.js Link supports onClick.
- `setup_step_viewed` will fire on mount for step 0 (Welcome). This is intentional — it tells us how many people even see the wizard.
