# Plan Overview: DP-1 — Rebrand & Migrate to CloudNest on GitHub Pages

**Date:** 2026-03-18
**Spec:** See `../requirements/spec.md`
**Status:** Grilled

## Approach Summary

Seven-phase migration. Phase 1 restructures the project (flatten, tooling, pnpm). Phase 2 rebrands everything to CloudNest. Phase 3 builds the client-side Drive API and storage layer. Phase 4 implements auth and setup wizard. Phase 5 rewrites all dashboard pages against new services. Phase 6 rewrites landing and docs pages. Phase 7 handles SEO, deployment, and documentation files.

## Phases

| Phase | Description | FRs Covered | Files | Est. Complexity |
|-------|-------------|-------------|-------|-----------------|
| 1 | Scaffold: flatten, remove backend, pnpm, Node 24, ESLint, next.config | FR-1, FR-11 | ~15 delete, ~10 modify/create | High |
| 2 | Rebrand: CSS vars, Tailwind config, all text refs → CloudNest | FR-14 | ~20 modify | Medium |
| 3 | Core services: Drive API wrapper, browser storage, auth context | FR-2 (partial), FR-4, FR-12 (partial) | ~8 create | High |
| 4 | Auth & setup: wizard page, auth guard, login removal, redirects | FR-3, FR-12 | ~5 create/modify | Medium |
| 5 | Dashboard rewrites: files, shared, trash, stats, accounts, settings | FR-2 (completion), FR-7 (partial) | ~10 modify | High |
| 6 | Landing & docs pages: page.tsx rewrite, docs rewrite, author refs | FR-6, FR-7 | ~4 modify, 1 create | Medium |
| 7 | SEO, deployment, documentation: meta, 404, GH Actions, README, CLAUDE.md, docs/Agent | FR-5, FR-6, FR-8, FR-9, FR-10, FR-13 | ~12 create/modify | Medium |

## Implementation Order

```
Phase 1 (Scaffold)
  └─→ Phase 2 (Rebrand)
        └─→ Phase 3 (Core Services)
              └─→ Phase 4 (Auth & Setup)
              └─→ Phase 5 (Dashboard) ← depends on Phase 3 + 4
                    └─→ Phase 6 (Landing & Docs)
                          └─→ Phase 7 (SEO, Deploy, Docs)
```

**Why this order:**
1. Phase 1 MUST be first — every file path changes after flattening, and pnpm/ESLint must be working before code changes
2. Phase 2 early to avoid renaming dp→cn twice in later phases
3. Phase 3 before any UI work — all pages depend on the new service layer
4. Phase 4 before Phase 5 — dashboard pages need auth context to exist
5. Phase 5 is the bulk of work (6 pages rewritten)
6. Phase 6 after dashboard — landing page references dashboard features
7. Phase 7 last — docs and deployment describe the finished product

## Dependencies

- **No shared packages / monorepo concerns** — single project
- **External:** Users provide their own Google Cloud Client ID (no API keys in codebase)
- **pnpm:** Must be installed globally or via Corepack (`corepack enable`)
- **Node 24:** Required runtime; `.nvmrc` ensures correct version
- **idb package:** New dependency for IndexedDB wrapper (added in Phase 3)

## Risk Areas

1. **Node 24 + Next.js 15 compatibility** — Test `pnpm run build` immediately after Phase 1. Fall back to Node 22 if issues.
2. **Google API client-side limitations** — Upload and download patterns differ significantly from backend. Phase 3 isolates this complexity.
3. **49 API call sites** — Every `fetch("/api/...")` in the codebase must be replaced. Phase 5 handles this systematically page by page.
4. **CSS variable rename blast radius** — 18 CSS variable definitions + hundreds of Tailwind class usages. Phase 2 uses find-and-replace but must verify no breakage.

## Alternative Approaches Considered

1. **Rewrite in Vite + React** — Cleaner static hosting but requires rewriting all Next.js-specific code (layouts, routing, Image component). Rejected: too much rework for marginal benefit.
2. **Keep frontend/ directory** — Less disruptive but awkward for a single-app project. Rejected: user explicitly chose flattening.
3. **Phase-per-page rewrites** — Would be 10+ phases. Rejected: too granular, grouping by concern is faster.
