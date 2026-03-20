# Phase 7: SEO, Deployment, Documentation

**Overview Plan:** See `overview.md`
**Spec Requirements Covered:** FR-5, FR-6, FR-8, FR-9, FR-10, FR-13

## Changes

### SEO (FR-13)

#### File: `app/layout.tsx` (MODIFY)

- **Action:** Add comprehensive metadata
- **Contents:**
  ```typescript
  export const metadata: Metadata = {
    title: {
      default: "CloudNest — Unified Google Drive Dashboard",
      template: "%s | CloudNest",
    },
    description: "Combine multiple Google Drive accounts into one dashboard. Free, open source, runs entirely in your browser.",
    metadataBase: new URL("https://encryptioner.github.io/CloudNest"),
    openGraph: {
      title: "CloudNest — Unified Google Drive Dashboard",
      description: "Combine multiple free Google accounts into one unified interface.",
      url: "https://encryptioner.github.io/CloudNest",
      siteName: "CloudNest",
      type: "website",
    },
    robots: { index: true, follow: true },
    alternates: {
      canonical: "https://encryptioner.github.io/CloudNest",
    },
  };
  ```

#### File: `public/robots.txt` (CREATE)

- **Contents:**
  ```
  User-agent: *
  Allow: /
  Sitemap: https://encryptioner.github.io/CloudNest/sitemap.xml
  ```

#### File: `public/sitemap.xml` (CREATE)

- **Contents:** Static sitemap with public routes only (grill finding R2-m3):
  ```xml
  <?xml version="1.0" encoding="UTF-8"?>
  <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    <url><loc>https://encryptioner.github.io/CloudNest/</loc></url>
    <url><loc>https://encryptioner.github.io/CloudNest/docs</loc></url>
    <url><loc>https://encryptioner.github.io/CloudNest/setup</loc></url>
  </urlset>
  ```

#### File: `public/manifest.json` (CREATE)

- **Contents:** PWA-ready web manifest
  ```json
  {
    "name": "CloudNest",
    "short_name": "CloudNest",
    "description": "Unified Google Drive Dashboard",
    "start_url": "/CloudNest/",
    "display": "standalone",
    "background_color": "#141c2f",
    "theme_color": "#f97316",
    "icons": [
      { "src": "/CloudNest/favicon.svg", "type": "image/svg+xml", "sizes": "any" }
    ]
  }
  ```

#### File: `app/dashboard/stats/page.tsx` (MODIFY)

- **Action:** Dynamic import for Recharts (grill finding R2-N2)
- **Change:** `const StatsChart = dynamic(() => import('@/components/StatsChart'), { ssr: false })`
- **Why:** FR-13 (code splitting for page speed)

### GitHub Pages Deployment (FR-5)

#### File: `.github/workflows/deploy.yml` (CREATE)

- **Action:** Create GitHub Actions workflow
- **Contents:**
  ```yaml
  name: Deploy to GitHub Pages

  on:
    push:
      branches: [main]

  permissions:
    contents: read
    pages: write
    id-token: write

  concurrency:
    group: "pages"
    cancel-in-progress: false

  jobs:
    build:
      runs-on: ubuntu-latest
      steps:
        - uses: actions/checkout@v4
        - uses: pnpm/action-setup@v4
        - uses: actions/setup-node@v4
          with:
            node-version: "24"
            cache: "pnpm"
        - run: pnpm install --frozen-lockfile
        - run: pnpm run build
        - uses: actions/upload-pages-artifact@v3
          with:
            path: out

    deploy:
      needs: build
      runs-on: ubuntu-latest
      environment:
        name: github-pages
        url: ${{ steps.deployment.outputs.page_url }}
      steps:
        - id: deployment
          uses: actions/deploy-pages@v4
  ```

#### File: `public/404.html` (CREATE)

- **Action:** Create plain HTML 404 page for GitHub Pages SPA routing
- **Why:** FR-5 (SPA routing on GitHub Pages). GitHub Pages serves this file for all 404s BEFORE Next.js loads. Must be plain HTML, not a Next.js component.
- **Contents:** Minimal HTML with a `<script>` that reads `window.location.pathname`, encodes it, and redirects to `/CloudNest/?redirect=<encoded-path>`. The app's root layout then reads the `redirect` query param and uses `router.replace()` to navigate to the original path.
- **Note:** `app/not-found.tsx` can also be created for in-app 404s (wrong routes after the app loads), but `public/404.html` is the critical one for GitHub Pages.

### README (FR-6)

#### File: `README.md` (REWRITE)

- **Action:** Complete rewrite
- **Structure:**
  1. **Title + tagline:** CloudNest — Unified Google Drive Dashboard
  2. **Live demo link:** `https://encryptioner.github.io/CloudNest/`
  3. **What is CloudNest?** — 2-3 sentences, "runs in your browser"
  4. **Features** — bullet list (unified pool, smart routing, etc.)
  5. **Quick Start:**
     - Option A: Visit the live demo URL
     - Option B: Clone + `pnpm install && pnpm run dev`
  6. **Google Cloud Setup** — step-by-step (mirrors setup wizard)
  7. **Tech Stack** — table (Node 24, pnpm, Next.js 15, React 19, Tailwind, gapi)
  8. **Known Limitations:**
     - 1-hour token expiry
     - Testing mode: 100 test users per Client ID
     - Browser storage: data lost if localStorage cleared
  9. **Security Notes** — browser storage model, no server, tokens short-lived
  10. **Contributing** — standard section
  11. **License** — MIT
  12. **Footnote:** "Inspired by" credit to the reference project
  - All links to Encryptioner

### Project Documentation (FR-8)

#### File: `docs/Agent/PROJECT_DETAILS.md` (CREATE)

- **Contents:** Project overview, workspace map (post-flatten structure), module descriptions (services/, hooks/, contexts/, components/, app/), data flow diagram (browser → gapi → Google Drive API)

#### File: `docs/Agent/CODING_STANDARDS.md` (CREATE)

- **Contents:** Per FR-8 acceptance criteria — TypeScript rules, ESLint config, React patterns, file organization, naming conventions, state management, CSS/styling, error handling, Google API patterns, git workflow

#### File: `docs/Agent/ARCHITECTURE_DECISIONS.md` (CREATE)

- **Contents:** Key decisions with reasoning:
  - ADR-1: Why static export (GitHub Pages, no server costs)
  - ADR-2: Why client-side gapi (no backend needed, user-controlled credentials)
  - ADR-3: Why localStorage + IndexedDB (browser-native, no external DB)
  - ADR-4: Why Next.js over Vite (existing codebase, static export support)
  - ADR-5: Why idb over localForage (size, TypeScript)
  - ADR-6: Why ESLint flat config (modern standard, better TypeScript support)
  - ADR-7: Why pnpm (strict dependencies, Corepack, faster CI)
  - ADR-8: Why Tailwind 3 not 4 (minimize scope, future upgrade path)

### CLAUDE.md (FR-9)

#### File: `CLAUDE.md` (CREATE)

- **Contents:** Per FR-9 acceptance criteria — quick reference table, tech stack, project structure, run/build commands, conventions, gotchas, critical rules

### Claude Code Settings (FR-10)

#### File: `.claude/settings.json` (CREATE)

- **Contents:** Per FR-10 — permissions for pnpm, git read commands, build/dev/lint. Ask-mode for destructive operations. Deny node_modules/out.

## Verification Steps

- [ ] `pnpm run build` produces clean `out/` directory
- [ ] `out/` contains `robots.txt`, `sitemap.xml`, `manifest.json`
- [ ] `out/404.html` exists
- [ ] GitHub Actions workflow is valid YAML (check with `act` or push to test)
- [ ] README renders correctly on GitHub with all sections
- [ ] `docs/Agent/` contains 3 files with substantive content
- [ ] `CLAUDE.md` exists at root with project info
- [ ] `.claude/settings.json` has correct permission structure
- [ ] All meta tags render in HTML source (`view-source:`)
- [ ] Lighthouse audit: Performance > 90, SEO > 90, Accessibility > 90

## Notes

- The GitHub Actions workflow uses the newer `actions/upload-pages-artifact` + `actions/deploy-pages` flow (not the older `gh-pages` branch approach). This is the recommended method for static sites.
- The `not-found.tsx` SPA routing trick: GitHub Pages serves this for all 404s. The script reads the URL and redirects to `/?redirect=<path>`, then the app's router picks up the original path. Alternative: use a simple `<script>` in a static `404.html` in the `public/` directory.
- `robots.txt` and `sitemap.xml` go in `public/` so they're copied to `out/` as-is during build.
- CLAUDE.md should reference file paths relative to the new flattened structure (not `frontend/`).
