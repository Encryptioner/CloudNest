# Phase 4: Auth & Setup — Wizard, Auth Guard, Login Removal

**Overview Plan:** See `overview.md`
**Spec Requirements Covered:** FR-3, FR-12

## Changes

### File: `components/AuthGuard.tsx` (CREATE)

- **Action:** Create client-side auth guard component
- **Why:** FR-12 (replaces middleware.ts)
- **Contents:**
  - Wraps children, checks `useAuth()` for valid state
  - Three states:
    1. **Loading** — show skeleton/spinner while checking localStorage
    2. **No Client ID** — redirect to `/setup`
    3. **No accounts** — redirect to `/setup` (step: connect account)
    4. **Authenticated** — render children
  - No flash of wrong content (check completes before render)

### File: `app/setup/page.tsx` (CREATE)

- **Action:** Create the setup wizard page
- **Why:** FR-3 (setup wizard)
- **Contents:**
  - Multi-step wizard with stepper UI:
    1. **Welcome** — "Welcome to CloudNest" intro, explain what it does
    2. **Create Google Cloud Project** — step-by-step with external links
    3. **Enable Drive API** — direct link to API library
    4. **Configure OAuth Consent Screen** — scopes, test users, 100-user limit note
    5. **Create Client ID** — Web application type, add `https://encryptioner.github.io` as origin
    6. **Enter Client ID** — input field with format validation (`*.apps.googleusercontent.com`)
    7. **Connect Account** — trigger GIS OAuth flow, show success
    8. **Done** — redirect to dashboard
  - Client ID validation: regex match before saving
  - Stores Client ID via `services/storage.ts` → `setClientId()`
  - On account connect: calls `services/auth.ts` → `requestAccessToken()`, then stores account
  - Mobile-responsive layout
  - Help tooltips on complex steps
  - Back/Forward navigation between steps

### File: `app/setup/layout.tsx` (CREATE)

- **Action:** Create minimal layout for setup wizard (no sidebar/navbar)
- **Why:** Setup wizard is a standalone flow, not part of dashboard

### File: `app/dashboard/layout.tsx` (MODIFY)

- **Action:** Wrap dashboard content with `AuthGuard`
- **Why:** FR-12 (protect dashboard routes)
- **Change:** Add `<AuthGuard>` wrapper around existing layout children

### File: `app/login/page.tsx` (DELETE)

- **Action:** Delete the PIN-based login page
- **Why:** FR-12 (login removed, replaced by setup wizard + Google OAuth)

### File: `app/page.tsx` (MODIFY — minimal)

- **Action:** Update CTA buttons:
  - "Open Dashboard" → links to `/dashboard` (AuthGuard handles redirect if not authenticated)
  - "Get Started" → links to `/setup`
- **Why:** FR-12 (user flow: landing → setup or dashboard)
- **Note:** Full landing page rewrite is Phase 6; this is just updating nav links

### File: `components/Toast.tsx` (CREATE)

- **Action:** Create a simple toast notification component
- **Why:** FR-12 (re-auth toast notification for expired tokens)
- **Contents:**
  - Renders at top-right with slide-in animation
  - Supports: info, warning, error, success variants
  - Auto-dismiss after configurable timeout
  - Action button support (for "Re-authenticate" CTA)
  - Stacks multiple toasts

## Verification Steps

- [ ] Visiting `/dashboard` without auth redirects to `/setup`
- [ ] Setup wizard shows all 8 steps with forward/back navigation
- [ ] Client ID format validation works (rejects invalid formats)
- [ ] After entering valid Client ID + connecting an account → redirects to dashboard
- [ ] Returning with valid tokens → goes directly to dashboard
- [ ] `/login` route returns 404 (page deleted)
- [ ] Toast renders and auto-dismisses
- [ ] Mobile layout works for setup wizard

## Notes

- The setup wizard is the most UX-critical new page — it must be clear enough for someone who has never used Google Cloud Console
- Screenshots/illustrations in the wizard are nice-to-have; text instructions with external links are the minimum
- The toast component is reusable — Phase 5 uses it for file operation feedback too
- Auth state persists across page reloads via localStorage
