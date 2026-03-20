# Spec: DP-1 — Rebrand & Migrate to CloudNest on GitHub Pages (Static, Client-Side)

**Date:** 2026-03-18
**Status:** Grilled (v2 — Final)
**Original Requirement:** See `original-requirement.md`

## Overview

Transform CloudNest from a locally-hosted full-stack app (FastAPI + Next.js + SQLite) into a publicly-accessible static site on GitHub Pages. All Google Drive functionality moves to client-side JavaScript using Google's `gapi` library with tokens stored in localStorage. The backend directory is removed entirely. The `frontend/` directory is flattened to project root. Additionally, create project documentation (`docs/`, `CLAUDE.md`, `.claude/settings.json`, `.gitignore` updates), update credits/references throughout, and ensure good UI/UX with SEO and page speed optimization. (Note: The project was built from scratch as "CloudNest", inspired by a reference project for the concept.)

## Clarifications

1. **Q:** What should happen with the Google Drive functionality on GitHub Pages?
   **A:** Use client-side Google Drive API (`gapi`). Users configure their own Google Client ID via an in-app settings page. Tokens stored in localStorage.

2. **Q:** Should the inspiration project be credited?
   **A:** Yes. Credit it as "Inspired by" in README footnote and landing page footer. CloudNest is not a fork — it was built independently using that project as a reference for the concept. All UI references, GitHub links, and author info should point to Ankur (Encryptioner).

3. **Q:** Which Agent docs to create?
   **A:** PROJECT_DETAILS.md + CODING_STANDARDS.md + ARCHITECTURE_DECISIONS.md (three files, no agent boundaries or TDD docs).

4. **Q:** Framework approach for static hosting?
   **A:** Keep Next.js, use `output: 'export'` for static HTML generation. Deploy via GitHub Actions.

5. **Q:** GitHub username and repo?
   **A:** GitHub: `Encryptioner`. Portfolio: `https://encryptioner.github.io/`. Repo will be at `https://github.com/Encryptioner/CloudNest`. GitHub Pages URL: `https://encryptioner.github.io/CloudNest/`.

6. **Q:** How should users provide Google Cloud credentials?
   **A:** In-app config/settings page where users enter their Google Client ID. Stored in localStorage.

7. **Q:** Should the frontend/ directory be flattened to root?
   **A:** Yes. Flatten to root for cleaner project structure. Remove `backend/`, `config/`, Docker files, and move `frontend/*` to project root.

8. **Q:** Keep Docker files?
   **A:** No. Remove entirely. `pnpm run dev` is sufficient.

## Functional Requirements

### FR-1: Remove Backend & Flatten Project Structure

- **Description:** Remove the FastAPI backend, Docker infrastructure, and config directory entirely. Move `frontend/*` contents to project root. The project becomes a Next.js static export with a production-grade TypeScript + ESLint toolchain, using pnpm and Node 24.
- **Acceptance criteria:**
  - [ ] `backend/` directory is removed
  - [ ] `config/` directory is removed
  - [ ] `docker-compose.yml` and all Dockerfiles are removed
  - [ ] No Python dependencies remain in the project
  - [ ] `frontend/*` contents moved to project root (package.json, app/, components/, etc. at root level)
  - [ ] `frontend/` directory removed after flattening
  - [ ] **pnpm:** Project uses pnpm as package manager. `package-lock.json` removed, `pnpm-lock.yaml` committed.
  - [ ] **Node 24:** `package.json` has `"engines": { "node": ">=24" }`. `.nvmrc` or `.node-version` file set to `24`.
  - [ ] **packageManager field:** `package.json` includes `"packageManager": "pnpm@<pinned-version>"` (exact version, e.g., `pnpm@10.6.0`) for Corepack compatibility
  - [ ] `next.config.ts` uses `output: 'export'` for static generation
  - [ ] All API proxy rewrites in `next.config.ts` are removed
  - [ ] `pnpm run build` produces a fully static `out/` directory
  - [ ] `middleware.ts` deleted (incompatible with static export — replaced by FR-12)
  - [ ] **ESLint setup:** `eslint` + `@eslint/js` + `typescript-eslint` + `eslint-plugin-react-hooks` + `eslint-plugin-react` + `eslint-config-next` configured with flat config (`eslint.config.mjs`)
  - [ ] **ESLint rules enforced:** no `any` types (`@typescript-eslint/no-explicit-any: error`), no unused vars, no console.log in production, React hooks rules, import order
  - [ ] `pnpm run lint` script added to `package.json`
  - [ ] TypeScript strict mode preserved (`strict: true` in tsconfig — already enabled)
  - [ ] `tsconfig.json` updated: `noUncheckedIndexedAccess: true`, `noImplicitReturns: true` added for stricter safety

### FR-2: Client-Side Google Drive Integration

- **Description:** Replace all server-side Google Drive API calls with client-side `gapi` (Google API JavaScript client) and Google Identity Services (GIS) for OAuth.
- **Acceptance criteria:**
  - [ ] Google Identity Services (GIS) loaded for OAuth (`accounts.google.com/gsi/client`)
  - [ ] `gapi.client` loaded for Drive API calls (`apis.google.com/js/api.js`)
  - [ ] OAuth flow works entirely in the browser via GIS popup/redirect (no server callback)
  - [ ] Access tokens stored in localStorage with expiry timestamps
  - [ ] **Token expiry handling:** Attempt silent re-auth via GIS `requestAccessToken` with `prompt: ''` first. If that fails (user interaction required), show a non-blocking toast notification with "Re-authenticate" button. Never interrupt active operations.
  - [ ] File listing works via `gapi.client.drive.files.list`
  - [ ] **File upload:** Use Drive REST API directly with `fetch()` + `XMLHttpRequest` for progress tracking. Files >5MB use resumable upload protocol. Do NOT use `gapi.client` for uploads (poor multipart support).
  - [ ] **File download:** Generate authenticated download URLs using `webContentLink` or construct `https://www.googleapis.com/drive/v3/files/{id}?alt=media` with `Authorization` header. Open in new tab for large files. Do NOT download into memory.
  - [ ] Rename, move, delete, share/unshare work via `gapi.client.drive`
  - [ ] Multiple Google accounts can be connected (each with its own token in localStorage)
  - [ ] Smart upload routing (least-used-space) preserved
  - [ ] Rate limit handling: exponential backoff on 429 responses (matching current backend behavior)

### FR-3: In-App Setup Wizard & Configuration

- **Description:** Users must provide their own Google Cloud OAuth Client ID to use the app. A setup wizard guides novice users through the entire process step-by-step.
- **Acceptance criteria:**
  - [ ] First-time visitors (no Client ID in localStorage) are shown a setup wizard
  - [ ] Setup wizard has step-by-step instructions with screenshots/illustrations:
    1. Create a Google Cloud project
    2. Enable Google Drive API
    3. Configure OAuth consent screen (add scopes, add test users)
    4. Create OAuth Client ID (Web application type)
    5. Add `https://encryptioner.github.io` as authorized JavaScript origin
    6. Copy and paste the Client ID into the app
  - [ ] Mention that apps in testing mode are limited to 100 test users
  - [ ] Client ID stored in localStorage
  - [ ] Client ID format validation before saving (must match `*.apps.googleusercontent.com` pattern)
  - [ ] Settings page allows changing Client ID later
  - [ ] In-app help tooltips for novice users throughout the dashboard

### FR-4: Replace SQLite with Browser Storage

- **Description:** All data previously in SQLite moves to localStorage or IndexedDB.
- **Acceptance criteria:**
  - [ ] User profile (name, bio, avatar URL) stored in localStorage
  - [ ] Connected accounts list and their tokens (with expiry timestamps) in localStorage
  - [ ] File metadata cache in IndexedDB via `idb` or `localForage` wrapper
  - [ ] **Cache invalidation:** File metadata refreshed on dashboard load. Manual "Sync" button for full re-fetch. Cache entries expire after 5 minutes.
  - [ ] Theme preference in localStorage (already works this way via ThemeContext)
  - [ ] PIN-based auth removed (replaced by Google OAuth)

### FR-5: GitHub Pages Deployment

- **Description:** Deploy the static export to GitHub Pages via GitHub Actions.
- **Acceptance criteria:**
  - [ ] GitHub Actions workflow (`.github/workflows/deploy.yml`) builds and deploys to `gh-pages` branch. Uses `pnpm/action-setup` and Node 24.
  - [ ] `basePath` in `next.config.ts` set to `/CloudNest` for GitHub Pages subpath
  - [ ] All asset and link references work with the base path
  - [ ] Custom `out/404.html` page that redirects to the app root (handles direct navigation to SPA routes)
  - [ ] Site accessible at `https://encryptioner.github.io/CloudNest/`
  - [ ] Builds trigger on push to `main` branch

### FR-6: Update README

- **Description:** Complete rewrite of README for the new static/public version. Must be up-to-date with the new architecture and helpful for novice users.
- **Acceptance criteria:**
  - [ ] README reflects the new architecture (static site, client-side Drive API, GitHub Pages)
  - [ ] Live demo link prominently featured: `https://encryptioner.github.io/CloudNest/`
  - [ ] Quick start: "Visit the URL above" or clone and `pnpm run dev` for local development
  - [ ] Step-by-step Google Cloud setup instructions (mirrors in-app wizard)
  - [ ] Clone URL: `https://github.com/Encryptioner/CloudNest.git`
  - [ ] Features list updated to reflect client-side architecture
  - [ ] Known limitations section (1-hour token expiry, testing mode user limits, browser storage limits)
  - [ ] Security notes updated (browser storage model, no server-side encryption)
  - [ ] Tech stack table updated (no Python, no FastAPI, no SQLite)
  - [ ] Footnote crediting the inspiration project
  - [ ] All author/GitHub references point to Encryptioner (Ankur)

### FR-7: Update UI References and Author Info

- **Description:** All in-app UI references (footer, about, links) should point to Ankur/Encryptioner.
- **Acceptance criteria:**
  - [ ] All GitHub links in the UI point to `https://github.com/Encryptioner/CloudNest`
  - [ ] Author/developer name shows Ankur's info
  - [ ] Portfolio link `https://encryptioner.github.io/` in footer
  - [ ] The `/docs` page completely rewritten for new architecture:
    - How to set up Client ID (mirrors setup wizard)
    - How the client-side Drive integration works
    - Browser storage model explanation
    - FAQ updated for client-side app (remove all backend/Docker references)
  - [ ] In-app guidelines for novice users: tooltips, help icons, contextual guidance on first use

### FR-8: Create Documentation (`docs/` Directory)

- **Description:** Create a `docs/` directory at the project root with AI agent documentation. Note: `docs/` (project docs) is separate from `app/docs/` (in-app docs page).
- **Acceptance criteria:**
  - [ ] `docs/Agent/PROJECT_DETAILS.md` — Project overview, workspace map, module descriptions, data flow
  - [ ] `docs/Agent/CODING_STANDARDS.md` — Must cover:
    - TypeScript strict mode rules and no-`any` policy
    - ESLint configuration and enforced rules
    - React component patterns (functional components only, hooks rules, naming)
    - File/folder organization conventions (absolute imports via `@/*`, component co-location)
    - Naming conventions (PascalCase components, camelCase hooks/utils, UPPER_CASE constants)
    - State management patterns (React Context, custom hooks for data fetching)
    - CSS/styling conventions (Tailwind utility classes, CSS variable theming, no inline styles for theming)
    - Error handling patterns (try/catch in hooks, user-facing error messages, toast notifications)
    - Google API interaction patterns (gapi vs REST API, token management)
    - Git workflow (conventional commits, branch naming)
  - [ ] `docs/Agent/ARCHITECTURE_DECISIONS.md` — Key decisions (why static, why client-side gapi, why localStorage, why Next.js export, why flattened structure, why ESLint flat config)
  - [ ] Documentation is concise and practical — not bloated

### FR-9: Create CLAUDE.md

- **Description:** Create a root-level `CLAUDE.md` with AI coding instructions tailored to this project.
- **Acceptance criteria:**
  - [ ] Quick reference table linking to key docs
  - [ ] Tech stack overview (Node 24, pnpm, Next.js 15, React 19, Tailwind, ESLint flat config, gapi, GIS, localStorage/IndexedDB)
  - [ ] Project structure (post-flatten)
  - [ ] Running locally commands (`pnpm install && pnpm run dev`)
  - [ ] Build and deploy commands
  - [ ] Key conventions and gotchas:
    - `basePath: '/CloudNest'` affects all routing
    - No `getServerSideProps`, no `middleware.ts`, no API routes (static export)
    - All Drive operations via client-side gapi/fetch
    - GIS for auth, gapi for API calls (two separate libraries)
  - [ ] Critical rules:
    - No backend code, no server-side features
    - No `any` types — use proper TypeScript types or `unknown` with narrowing
    - Absolute imports only (`@/*` path alias) — no relative `../../` imports
    - All code must pass `pnpm run lint` before commit
    - ESLint flat config with typescript-eslint
  - [ ] Tech stack pinned versions and upgrade policy documented

### FR-10: Create `.claude/settings.json`

- **Description:** Create Claude Code settings file for this project.
- **Acceptance criteria:**
  - [ ] Permissions for common operations (Read, Edit, Write, Glob, Grep)
  - [ ] Permissions for build/dev/lint commands (`pnpm run dev`, `pnpm run build`, `pnpm run lint`)
  - [ ] Permissions for pnpm read commands (`pnpm list`, `pnpm why`)
  - [ ] Permissions for git read commands
  - [ ] Ask-mode for destructive git operations and package installs (`pnpm add`, `pnpm remove`, `pnpm install`)
  - [ ] Deny rules for `node_modules/**` and `out/**`

### FR-11: Update `.gitignore`

- **Description:** Ensure `.gitignore` is comprehensive for the new static-only project.
- **Acceptance criteria:**
  - [ ] Remove backend-specific ignores (Python, venv, .db files can stay harmlessly)
  - [ ] Add `out/` (Next.js static export output)
  - [ ] Keep `node_modules/`, `.next/`, OS files, IDE files
  - [ ] `ai/` directory is NOT gitignored (specs and plans tracked)
  - [ ] `pnpm-lock.yaml` committed (needed for reproducible CI builds). `package-lock.json` removed.
  - [ ] `.claude/` tracked in git (project-level settings shared with team/AI)

### FR-12: Client-Side Auth Guard

- **Description:** Replace server-side `middleware.ts` with a client-side auth mechanism. This is the replacement for the deleted middleware.
- **Acceptance criteria:**
  - [ ] `useAuth` hook that checks for valid Google OAuth tokens in localStorage
  - [ ] Dashboard pages wrapped in an `AuthGuard` component that redirects to setup wizard if no tokens
  - [ ] `/login` page removed entirely — auth is via Google OAuth through the setup wizard and account connection flow
  - [ ] First-time flow: Landing page → Setup wizard (Client ID) → Connect Google account (OAuth) → Dashboard
  - [ ] Returning user flow: Landing page → Dashboard (if valid tokens exist)
  - [ ] Expired token flow: Dashboard → Toast notification with re-auth button → Silent re-auth attempt → Popup if needed

### FR-13: SEO & Page Speed Optimization

- **Description:** Ensure the static site has good SEO fundamentals and fast page load times.
- **Acceptance criteria:**
  - [ ] Proper `<meta>` tags on all pages: title, description, og:title, og:description, og:image
  - [ ] Semantic HTML structure (proper heading hierarchy, landmark elements)
  - [ ] `robots.txt` at root allowing indexing
  - [ ] `sitemap.xml` generated or static (for key public pages)
  - [ ] Next.js `<Image>` component used for all images (automatic optimization with static export)
  - [ ] Lazy-load `gapi` and GIS scripts (load only when needed, not on initial page load)
  - [ ] Code splitting via Next.js dynamic imports for heavy components (Recharts, etc.)
  - [ ] Proper `<link rel="canonical">` tags
  - [ ] Lighthouse score targets: Performance > 90, SEO > 90, Accessibility > 90
  - [ ] `favicon.svg` + `apple-touch-icon` + web manifest for PWA-ready metadata

### FR-14: Project Rebrand to CloudNest

- **Description:** Rename the project to "CloudNest" across all code, configuration, documentation, and UI.
- **Acceptance criteria:**
  - [ ] GitHub repo set to `Encryptioner/CloudNest`
  - [ ] `package.json` `"name"` field set to `cloudnest`
  - [ ] All in-app branding uses "CloudNest" consistently
  - [ ] CSS variable prefix: `--cn-*` (e.g., `--cn-bg`, `--cn-text`, `--cn-border`)
  - [ ] CSS class prefix: `cn-` in Tailwind config and components
  - [ ] localStorage keys prefixed with `cn_` (e.g., `cn_accounts`, `cn_theme`, `cn_clientId`)
  - [ ] `basePath` in `next.config.ts` set to `/CloudNest`
  - [ ] GitHub Pages URL: `https://encryptioner.github.io/CloudNest/`
  - [ ] All meta tags, OG tags, and SEO references use "CloudNest"
  - [ ] Internal Drive folder name: `_CloudNest_`
  - [ ] README title, description, and all references updated
  - [ ] Credit footnote preserved in README and landing page footer

## Non-Functional Requirements

- **Performance:** Static site should load fast on GitHub Pages. Lazy-load `gapi` library. Use IndexedDB for file metadata caching. Target <3s initial load on 3G. Code-split heavy libraries (Recharts).
- **Security:** No secrets in the codebase. Google Client ID is user-provided and stored locally. Access tokens are short-lived (~1 hour). Document that localStorage tokens are accessible to any JS on the page (standard browser security model). XSS protection via React's default escaping.
- **Responsive:** Maintain existing mobile/tablet/desktop responsive design. Setup wizard must work well on mobile.
- **Offline:** Basic UI should load without network. Drive operations require network. Show clear offline indicators.
- **Browser Compatibility:** Modern browsers (Chrome, Firefox, Safari, Edge). No IE support.
- **Accessibility:** Keyboard navigation, ARIA labels on interactive elements, sufficient color contrast, screen reader support for setup wizard.
- **UX for Novice Users:** Setup wizard with clear step-by-step guidance. In-app help tooltips. Contextual error messages that explain what went wrong and how to fix it. Loading states for all async operations.

## Out of Scope

- Server-side rendering or API routes (incompatible with static export)
- Backend/Docker infrastructure (being removed)
- Automated testing setup (can be added in a future ticket)
- Custom domain setup (users can configure this themselves)
- Service worker / full PWA capabilities (future enhancement)
- Token encryption at rest in browser (not practical in browser context)
- PIN-based authentication (replaced by Google OAuth)
- Google app verification for production (each user runs in testing mode with their own Client ID)

## Existing Code References

- `frontend/app/` — All page components (dashboard, login, docs, settings, etc.)
- `frontend/components/` — Shared UI components (Navbar, Sidebar, FileList, etc.)
- `frontend/hooks/useFiles.ts` — File operations (currently calls backend API — needs rewrite to use gapi)
- `frontend/hooks/useStats.ts` — Storage analytics (data source changes)
- `frontend/hooks/useStorage.ts` — Storage stats (data source changes)
- `frontend/contexts/ThemeContext.tsx` — Theme state (already client-side, no changes needed)
- `frontend/contexts/UploadContext.tsx` — Upload queue management (needs gapi integration)
- `frontend/middleware.ts` — Auth guard (DELETE — replaced by FR-12 client-side auth)
- `frontend/next.config.ts` — Needs `output: 'export'` and `basePath: '/CloudNest'`
- `backend/services/drive_service.py` — Reference for all Drive API operations that need JS equivalents

## Technical Notes

- **Static export limitations:** Next.js `output: 'export'` does not support `middleware.ts`, `getServerSideProps`, `getStaticPaths` with fallback, or API routes. All dynamic behavior must be client-side.
- **Two Google libraries:** GIS (`accounts.google.com/gsi/client`) handles OAuth. `gapi` (`apis.google.com/js/api.js`) handles API calls. They are separate scripts loaded independently.
- **basePath impact:** `basePath: '/CloudNest'` in `next.config.ts` affects all `<Link>` and `<Image>` components automatically. Manual `fetch()` calls, `window.location`, and `router.push()` calls need awareness of the base path.
- **IndexedDB wrapper:** Use `idb` (lightweight) or `localForage` (broader API) for IndexedDB operations. Avoid raw IndexedDB API.
- **Token storage structure:** `localStorage` key `cn_accounts` holds `Array<{ email, accessToken, tokenExpiry, storageQuota }>`. No refresh tokens (not available in client-side OAuth).
- **Upload strategy:** Use Drive REST API directly (`POST https://www.googleapis.com/upload/drive/v3/files?uploadType=resumable`) with `fetch` for files >5MB. Use simple upload for smaller files. Track progress via `XMLHttpRequest.upload.onprogress`.
- **Download strategy:** For owned files, construct URL `https://www.googleapis.com/drive/v3/files/{id}?alt=media` and set `Authorization: Bearer {token}` header. For shared files with `webContentLink`, open directly. For large files, always open in new tab.
- **SPA routing on GitHub Pages:** GitHub Pages doesn't support SPA routing natively. The `404.html` trick redirects all unknown routes to the app, which then handles routing client-side.
- **`docs/` vs `app/docs/`:** `docs/` at project root is AI agent documentation. `app/docs/page.tsx` is the in-app user-facing documentation page. They are completely separate.
- **Next.js Image in static export:** `output: 'export'` does NOT support the default Image Optimization API. Must set `images: { unoptimized: true }` in `next.config.ts`. `<Image>` still provides lazy loading and CLS prevention, but no server-side format conversion or resizing. Pre-optimize images at build time if needed.
- **pnpm packageManager field:** Must pin exact version (e.g., `"pnpm@10.6.0"`), not `@latest`. Corepack requires exact versions.
- **Drive API scope:** Use `https://www.googleapis.com/auth/drive` (full access) to preserve all existing functionality (browse all files, shared files, trash). Each user authorizes their own accounts through their own Client ID, so full scope is appropriate.
- **IndexedDB library:** Use `idb` (1.2KB, TypeScript-first, maintained by Google Chrome team) over `localForage` (29KB, includes unnecessary localStorage fallback).
- **Sitemap:** Only include public routes (landing page, docs, setup wizard). Dashboard pages are auth-gated and not crawlable.
- **Node 24 compatibility:** Verify `pnpm run build` succeeds with Node 24 early in implementation. If Next.js 15 has incompatibilities, fall back to Node 22 LTS.

## Change Log

| Date | Section Changed | What Changed | Why |
|------|----------------|--------------|-----|
| 2026-03-18 | Initial | Spec created | Initial requirement from user |
| 2026-03-18 | All | Updated after grill — addressed C1-C3, M1-M4, m1-m4, N1-N3. Added FR-12 (auth guard), FR-13 (SEO/perf). Resolved open questions. Added novice user UX requirements. | Grill findings + user follow-up requirements |
| 2026-03-18 | FR-1, FR-8, FR-9 | Added ESLint setup requirement (flat config + typescript-eslint), stricter tsconfig options, expanded CODING_STANDARDS.md scope, lint script in package.json | User requested TypeScript, ESLint, and production-ready maintainable stack |
| 2026-03-18 | FR-1, FR-5, FR-9, FR-10, FR-11 | Switched to pnpm package manager and Node 24. Added pnpm-lock.yaml, .nvmrc, packageManager field, engines field, CI pnpm setup. | User requested pnpm + Node 24 |
| 2026-03-18 | Technical Notes | Final grill v2: Added Image static export caveat, pnpm pin version, Drive scope decision, idb over localForage, sitemap scope, Node 24 compatibility note. | Grill v2 findings |
| 2026-03-18 | All + FR-14 | Established CloudNest branding. Updated all URLs, basePath, localStorage prefixes, CSS variable prefixes, repo name. Added FR-14 for rebrand checklist. | User chose CloudNest as project name |
