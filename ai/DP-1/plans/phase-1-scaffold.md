# Phase 1: Scaffold — Flatten, Tooling, Static Export

**Overview Plan:** See `overview.md`
**Spec Requirements Covered:** FR-1, FR-11

## Changes

### Step 1: Delete backend, config, Docker files

| Action | File/Directory | Reason |
|--------|---------------|--------|
| Delete | `backend/` (entire directory, 18 files) | FR-1: Remove backend |
| Delete | `config/` (entire directory) | FR-1: Remove config |
| Delete | `docker-compose.yml` | FR-1: Remove Docker |

### Step 2: Flatten frontend/ to root

Move every file/directory from `frontend/` to project root:

| Source | Destination |
|--------|------------|
| `frontend/app/` | `app/` |
| `frontend/components/` | `components/` |
| `frontend/contexts/` | `contexts/` |
| `frontend/hooks/` | `hooks/` |
| `frontend/public/` | `public/` |
| `frontend/package.json` | `package.json` |
| `frontend/tsconfig.json` | `tsconfig.json` |
| `frontend/tailwind.config.ts` | `tailwind.config.ts` |
| `frontend/postcss.config.js` | `postcss.config.js` |
| `frontend/next.config.ts` | `next.config.ts` |
| `frontend/app/globals.css` | `app/globals.css` |

Then delete:
- `frontend/` directory (now empty)
- `frontend/Dockerfile`
- `frontend/.dockerignore`
- `frontend/middleware.ts` (incompatible with static export — FR-12 replaces it)
- `frontend/package-lock.json` (switching to pnpm)

### Step 3: Switch to pnpm + Node 24

- **Action:** Delete `package-lock.json` if it still exists at root
- **Action:** Run `pnpm install` to generate `pnpm-lock.yaml`
- **Action:** Create `.nvmrc` at root with content `24`
- **Action:** Update `package.json`:
  ```json
  {
    "name": "cloudnest",
    "packageManager": "pnpm@10.6.0",
    "engines": { "node": ">=24" },
    "scripts": {
      "dev": "next dev",
      "build": "next build",
      "start": "next start",
      "lint": "next lint"
    }
  }
  ```

### Step 4: Update next.config.ts

- **Action:** Rewrite `next.config.ts`:
  ```typescript
  import type { NextConfig } from "next";

  const nextConfig: NextConfig = {
    output: "export",
    basePath: "/CloudNest",
    images: { unoptimized: true },
  };

  export default nextConfig;
  ```
- **Why:** FR-1 (static export), FR-5 (basePath), grill finding R2-M2 (unoptimized images)

### Step 5: Update tsconfig.json

- **Action:** Add stricter options:
  ```json
  {
    "compilerOptions": {
      "noUncheckedIndexedAccess": true,
      "noImplicitReturns": true
    }
  }
  ```
- **Why:** FR-1 stricter TypeScript safety

### Step 6: ESLint setup

- **Action:** Install ESLint packages:
  ```
  pnpm add -D eslint @eslint/js @eslint/eslintrc typescript-eslint eslint-plugin-react eslint-plugin-react-hooks eslint-config-next
  ```
- **Action:** Create `eslint.config.mjs` (flat config):
  ```javascript
  import { dirname } from "path";
  import { fileURLToPath } from "url";
  import { FlatCompat } from "@eslint/eslintrc";
  import tseslint from "typescript-eslint";

  const __dirname = dirname(fileURLToPath(import.meta.url));
  const compat = new FlatCompat({ baseDirectory: __dirname });

  export default tseslint.config(
    ...compat.extends("next/core-web-vitals"),
    ...tseslint.configs.strict,
    {
      rules: {
        "@typescript-eslint/no-explicit-any": "error",
        "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
        "no-console": ["warn", { allow: ["warn", "error"] }],
      },
    },
    { ignores: ["out/", ".next/", "node_modules/"] }
  );
  ```

### Step 7: Update .gitignore

- **Action:** Rewrite `.gitignore` for new structure:
  ```
  # Dependencies
  node_modules/

  # Next.js
  .next/
  out/

  # OS
  .DS_Store
  Thumbs.db

  # IDE
  .vscode/
  .idea/
  *.swp

  # Environment
  .env
  .env.*
  ```
- **Why:** FR-11. Remove Python/backend ignores. Add `out/`. Keep `ai/` and `.claude/` tracked.

## Verification Steps

- [ ] `pnpm install` succeeds
- [ ] `pnpm tsc --noEmit` type-checks (may report errors in pages with `/api/` calls — expected)
- [ ] `pnpm run lint` runs (may report errors in existing code — expected)
- [ ] No `backend/`, `config/`, `docker-compose.yml`, `frontend/` directories remain
- [ ] `.nvmrc` contains `24`
- [ ] `package.json` has correct name, engines, packageManager fields
- [ ] Verify Node 24 compatibility: `node --version` outputs v24.x

**Note:** Full `pnpm run build` (static export) will likely fail at this phase because existing pages still reference `/api/` endpoints. Use `pnpm tsc --noEmit` for type-checking and `pnpm run dev` for visual verification. Full build verification happens after Phase 5 when all API calls are replaced.

## Notes

- ESLint will report many existing violations. We fix them as we rewrite each file in later phases, not now.
- The `middleware.ts` deletion will cause the auth redirect to stop working. Phase 4 replaces it.
- Install `@eslint/eslintrc` alongside ESLint packages (needed for `FlatCompat` in the config).
