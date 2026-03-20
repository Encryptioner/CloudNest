# Phase 2: Establish CloudNest Branding

**Overview Plan:** See `overview.md`
**Spec Requirements Covered:** FR-14

## Changes

### Step 1: CSS Variables (globals.css)

- **File:** `app/globals.css`
- **Action:** Find-and-replace all CSS variable names:
  - `--dp-bg` → `--cn-bg`
  - `--dp-s1` → `--cn-s1`
  - `--dp-s2` → `--cn-s2`
  - `--dp-border` → `--cn-border`
  - `--dp-hover` → `--cn-hover`
  - `--dp-text` → `--cn-text`
  - `--dp-text2` → `--cn-text2`
  - `--dp-text3` → `--cn-text3`
  - `--dp-sidebar` → `--cn-sidebar`
- **Scope:** 18 definitions (9 per theme: dark + light)

### Step 2: Tailwind Config (tailwind.config.ts)

- **File:** `tailwind.config.ts`
- **Action:** Rename the color object key and CSS variable references:
  ```typescript
  cn: {
    bg: "var(--cn-bg)",
    s1: "var(--cn-s1)",
    s2: "var(--cn-s2)",
    border: "var(--cn-border)",
    hover: "var(--cn-hover)",
    text: "var(--cn-text)",
    text2: "var(--cn-text2)",
    text3: "var(--cn-text3)",
    sidebar: "var(--cn-sidebar)",
  }
  ```

### Step 3: Tailwind Class Usage (all component files)

- **Action:** Global find-and-replace across all `.tsx` and `.css` files:
  - `dp-bg` → `cn-bg`
  - `dp-s1` → `cn-s1`
  - `dp-s2` → `cn-s2`
  - `dp-border` → `cn-border`
  - `dp-hover` → `cn-hover`
  - `dp-text` → `cn-text`
  - `dp-text2` → `cn-text2`
  - `dp-text3` → `cn-text3`
  - `dp-sidebar` → `cn-sidebar`
- **Files affected:** All 20+ component/page files that use these classes
- **Caution:** Use word-boundary-aware replacement to avoid partial matches

### Step 4: HTML ID rename

- **File:** `app/dashboard/layout.tsx`
- **Action:** Rename `id="dp-scroll"` → `id="cn-scroll"`
- **Check:** Search all files for `dp-scroll` references and update them too

### Step 5: Brand text in UI

- **Action:** Ensure all user-visible brand text shows "CloudNest" in:
  - `app/page.tsx` — landing page (brand in navbar, hero, features, CTA, footer)
  - ~~`app/login/page.tsx`~~ — SKIP (file deleted in Phase 4)
  - `app/layout.tsx` — page title metadata
  - `app/docs/page.tsx` — documentation text
  - `app/dashboard/settings/page.tsx` — "About" section
  - `components/Sidebar.tsx` — brand text in sidebar

### Step 6: GitHub links

- **Action:** Ensure all GitHub links point to `https://github.com/Encryptioner/CloudNest` in:
  - `app/page.tsx` (3 occurrences)
  - `app/docs/page.tsx` (1 occurrence)
  - `app/dashboard/settings/page.tsx` (1 occurrence)

### Step 7: Internal Drive folder name

- **Action:** Ensure internal Drive folder name constant is `_CloudNest_`
- **Note:** Exploration found no frontend references — this constant was only in the deleted backend. Set when creating the new Drive service in Phase 3.

## Verification Steps

- [ ] `grep -r "dp-" app/ components/ contexts/ hooks/` returns zero results (except `dp-scroll` if not yet renamed)
- [ ] `grep -r "--dp-" app/` returns zero results
- [ ] Ensure inspiration references in `app/` or `components/` (except footer credit link)
- [ ] `pnpm run dev` starts and pages render with correct colors (CSS vars working)
- [ ] All brand text shows "CloudNest"

## Notes

- This is mostly mechanical find-and-replace but must be thorough. Missing one `dp-text` class means invisible text.
- The `app/docs/page.tsx` had extensive old brand references — rewritten in Phase 6 with CloudNest branding throughout.
- CSS variables are the safest to rename because Tailwind resolves them at build time — if one is missed, it shows as broken styling immediately.
