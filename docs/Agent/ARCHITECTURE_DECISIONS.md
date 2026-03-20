# Architecture Decisions

Key technical decisions and their reasoning for the CloudNest project.

## ADR-1: Static Export on GitHub Pages

**Decision:** Use Next.js `output: 'export'` to generate a fully static site deployed on GitHub Pages.

**Why:** Zero hosting cost, no server maintenance, global CDN via GitHub. The app's core functionality (Google Drive API) works entirely client-side.

**Trade-off:** No SSR, no middleware, no API routes. All dynamic behavior must be client-side React.

## ADR-2: Client-Side Google Drive API (gapi + GIS)

**Decision:** Use Google Identity Services for OAuth and gapi.client for Drive API calls, all running in the browser.

**Why:** Eliminates the need for a backend server. Each user provides their own Google Cloud Client ID, so there are no shared secrets.

**Trade-off:** No refresh tokens (client-side OAuth only provides ~1 hour access tokens). Users must re-authenticate periodically. File uploads use REST API directly (gapi.client has poor multipart support).

## ADR-3: localStorage + IndexedDB for Storage

**Decision:** Auth state and settings in localStorage. File metadata cached in IndexedDB via `idb` library.

**Why:** Browser-native, zero dependencies for auth storage. IndexedDB handles large datasets (thousands of file records) better than localStorage.

**Trade-off:** Data is lost if browser storage is cleared. No cross-device sync.

## ADR-4: Next.js over Vite

**Decision:** Keep the existing Next.js framework rather than migrating to Vite + React.

**Why:** The codebase was already built on Next.js. App Router provides file-based routing, layouts, and metadata handling out of the box. Static export support is built in.

**Trade-off:** Some Next.js features (middleware, SSR, API routes) are unavailable with static export.

## ADR-5: idb over localForage

**Decision:** Use `idb` (1.2KB) for IndexedDB operations instead of `localForage` (29KB).

**Why:** idb is TypeScript-first, lightweight, and maintained by a Google Chrome team member. localForage includes a localStorage fallback that's unnecessary here.

## ADR-6: ESLint Flat Config with Direct Plugins

**Decision:** Use ESLint 9 flat config (`eslint.config.mjs`) with direct plugin imports instead of `eslint-config-next` via FlatCompat.

**Why:** `FlatCompat` + `eslint-config-next` causes circular reference errors. Direct plugin imports (`@next/eslint-plugin-next`, `eslint-plugin-react`, etc.) avoid this and are more explicit.

## ADR-7: pnpm over npm

**Decision:** Use pnpm as the package manager with Corepack.

**Why:** Strict dependency resolution prevents phantom dependencies. Content-addressable store is faster. `packageManager` field in package.json ensures consistent versions across environments.

## ADR-8: Tailwind CSS 3 (not 4)

**Decision:** Keep Tailwind CSS 3.x rather than upgrading to v4.

**Why:** Tailwind v4 has breaking changes to the config format and plugin system. The existing codebase uses v3 patterns extensively. Upgrading adds scope without user-facing benefit. Future ticket can handle the migration.
