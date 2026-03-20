# Phase 6: Landing & Docs Pages

**Overview Plan:** See `overview.md`
**Spec Requirements Covered:** FR-6 (partial — README in Phase 7), FR-7

## Changes

### File: `app/page.tsx` (REWRITE)

- **Action:** Rewrite landing page for CloudNest + new architecture
- **Why:** FR-7 (author info, links), FR-14 (rebrand — completed in Phase 2 for text, but content rewrite needed)
- **Key changes:**
  - **Hero:** "CloudNest" branding, "Your drives, one nest" tagline
  - **Features:** Update to reflect client-side architecture:
    - Remove "No .env needed" (irrelevant)
    - Remove "Secure — bcrypt PIN, JWT cookie, Fernet encryption" (server-side features gone)
    - Add "Works anywhere — runs in your browser, no server needed"
    - Add "Your data stays yours — stored in your browser, nothing on our servers"
    - Keep: unified pool, smart routing, folder navigation, drag-to-folder, shared, trash, analytics, dark/light theme
  - **CTA buttons:** "Try CloudNest" → `/setup`, "View on GitHub" → `https://github.com/Encryptioner/CloudNest`
  - **Stats bar:** Update "Never leaves network" → "Runs in your browser"
  - **Setup steps:** Update to reflect new 3-step flow (Create project → Enter Client ID → Connect account)
  - **Footer:**
    - Author: Ankur (Encryptioner)
    - Portfolio: `https://encryptioner.github.io/`
    - GitHub: `https://github.com/Encryptioner/CloudNest`
    - "Inspired by" credit linking to the reference project
  - **Navbar:** CloudNest brand, theme toggle, GitHub link → Encryptioner, "Get Started" → `/setup`

### File: `app/docs/page.tsx` (REWRITE — complete)

- **Action:** Complete rewrite of in-app documentation page
- **Why:** FR-7 (docs rewrite for new architecture)
- **Current:** 550+ lines of backend-focused API docs, Docker setup, OAuth callback URIs
- **New content structure:**
  1. **Getting Started** — What CloudNest is, prerequisites (Google account)
  2. **Setup Guide** — Mirrors setup wizard steps (Google Cloud project, enable API, consent screen, Client ID, connect account)
  3. **Using CloudNest:**
    - File browsing and organization
    - Uploading files (smart routing explanation)
    - Sharing and unsharing
    - Trash management
    - Storage analytics
  4. **How It Works:**
    - Client-side architecture explanation (for technical users)
    - Browser storage model (localStorage for auth, IndexedDB for cache)
    - Google Drive API interaction
    - Token expiry and re-authentication
  5. **FAQ:**
    - "Is my data safe?" → stored in your browser + your own Google Drive
    - "Why do I need my own Client ID?" → privacy, no shared secrets
    - "Why does it ask me to re-authenticate?" → 1-hour token expiry, limitation of client-side OAuth
    - "Can I use this on mobile?" → yes, responsive design
    - "How many accounts can I connect?" → unlimited (each with its own 15GB)
    - "What browsers are supported?" → Chrome, Firefox, Safari, Edge
  6. **Troubleshooting:**
    - OAuth errors (wrong redirect URI, consent screen not configured)
    - Rate limiting (too many API calls)
    - Storage full (all accounts at capacity)
  - Help tooltips integrated via `title` attributes and info icons

### File: `app/layout.tsx` (MODIFY)

- **Action:** Update metadata for CloudNest
- **Why:** FR-13 (SEO meta tags), FR-14 (rebrand)
- **Changes:**
  ```typescript
  export const metadata: Metadata = {
    title: "CloudNest — Unified Google Drive Dashboard",
    description: "Combine multiple Google Drive accounts into one dashboard. Free, open source, runs in your browser.",
    // OG tags handled in Phase 7
  };
  ```

## Verification Steps

- [ ] Landing page renders with CloudNest branding
- [ ] All links point to Encryptioner GitHub / portfolio
- [ ] "Inspired by" credit is visible in footer
- [ ] "Get Started" links to `/setup`
- [ ] "View on GitHub" links to correct repo
- [ ] Docs page renders with new content (no backend/Docker references)
- [ ] FAQ answers are accurate for client-side architecture
- [ ] Mobile layout works for both pages

## Notes

- The landing page is the first thing users see — it must clearly communicate "runs in your browser, no server needed"
- The docs page should be sufficient for a user to go from zero to working setup without external help
- Both pages are public (no auth required) — important for SEO (Phase 7)
