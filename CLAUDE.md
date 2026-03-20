# CloudNest — AI Agent Instructions

## Quick Reference

| Doc | Path |
|-----|------|
| Project Details | `docs/Agent/PROJECT_DETAILS.md` |
| Coding Standards | `docs/Agent/CODING_STANDARDS.md` |
| Architecture Decisions | `docs/Agent/ARCHITECTURE_DECISIONS.md` |

## Tech Stack

| Category | Technology |
|----------|-----------|
| Runtime | Node.js 24, pnpm |
| Framework | Next.js 15 (App Router, static export) |
| UI | React 19, Tailwind CSS 3 |
| Google APIs | Google Identity Services (OAuth), gapi.client (Drive API) |
| Storage | localStorage (auth/settings), IndexedDB via idb (file cache) |
| Linting | ESLint 9 flat config, typescript-eslint strict |
| Types | TypeScript 5 strict mode |
| Deployment | GitHub Pages via GitHub Actions |

## Running Locally

```bash
pnpm install
pnpm run dev        # http://localhost:3000/CloudNest
pnpm run build      # Static export to out/
pnpm run lint       # ESLint check
pnpm tsc --noEmit   # Type check
```

## Project Structure

```
app/            → Pages (Next.js App Router)
components/     → Shared React components
contexts/       → React Context providers (Auth, Theme, Upload)
hooks/          → Custom hooks (useFiles, useDrive, useStorage, useStats)
services/       → Pure logic — Drive API, OAuth, localStorage, IndexedDB
types/          → TypeScript interfaces
public/         → Static assets (favicon, robots.txt, sitemap, 404.html)
docs/Agent/     → AI agent documentation
ai/             → Per-ticket specs, plans, grill logs
```

## Critical Rules

1. **No backend code** — this is a static site. No API routes, no `getServerSideProps`, no `middleware.ts`.
2. **No `any` types** — use proper TypeScript types or `unknown` with narrowing. ESLint will error on `any`.
3. **Absolute imports only** — use `@/*` path alias. Never `../../`.
4. **All code must pass `pnpm run lint`** before commit.
5. **Google API calls go through `services/`** — never call gapi directly from components.
6. **Auth state goes through `AuthContext`** — never read localStorage directly for auth data.

## Key Gotchas

- **`basePath: '/CloudNest'`** — set in `next.config.ts`. `<Link>` and `<Image>` handle this automatically. Manual `window.location` or `router.push` calls need awareness.
- **Static export** — no `middleware.ts`, no `getServerSideProps`, no API routes. The `AuthGuard` component replaces middleware for auth.
- **Two Google libraries** — GIS (`accounts.google.com/gsi/client`) handles OAuth. gapi (`apis.google.com/js/api.js`) handles API calls. Both loaded lazily.
- **Token expiry ~1 hour** — client-side OAuth has no refresh tokens. Silent re-auth attempted first, then toast notification.
- **`images: { unoptimized: true }`** — required for static export. `<Image>` still provides lazy loading.
- **localStorage keys** use `cn_` prefix. CSS variables use `--cn-` prefix. Tailwind colors use `cn-` prefix.
- **Dev server URL** is `http://localhost:3000/CloudNest/` (includes basePath).
