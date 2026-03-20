# Coding Standards

## TypeScript

- **Strict mode required** — `strict: true`, `noUncheckedIndexedAccess: true`, `noImplicitReturns: true`
- **No `any` types** — `@typescript-eslint/no-explicit-any: error`. Use `unknown` with type narrowing instead.
- **Absolute imports only** — use `@/*` path alias. Never use relative `../../` imports.
- **Shared types** in `types/index.ts`. Import from `@/types`.

## ESLint

- Flat config in `eslint.config.mjs`
- `@next/eslint-plugin-next` + `eslint-plugin-react` + `eslint-plugin-react-hooks` + `typescript-eslint/strict`
- `no-console: warn` (allow `console.warn` and `console.error`)
- Run: `pnpm run lint`

## React / Next.js

- **Functional components only** — no class components
- **`"use client"` directive** on all components that use hooks, state, or browser APIs
- **Hooks rules** — never call hooks conditionally. Use lazy `useState(() => value)` for localStorage init.
- **No `getServerSideProps`** — static export only. All dynamic behavior is client-side.
- **No `middleware.ts`** — incompatible with static export. Use `AuthGuard` component instead.
- **basePath awareness** — `basePath: '/CloudNest'` is set in `next.config.ts`. `<Link>` and `<Image>` handle this automatically. Manual URLs need the prefix.

## File Organization

```
app/          → Pages (one directory per route)
components/   → Shared UI components (PascalCase filenames)
contexts/     → React Context providers
hooks/        → Custom hooks (camelCase, prefixed with "use")
services/     → Pure logic, no React (camelCase filenames)
types/        → TypeScript interfaces and type declarations
```

## Naming Conventions

| Category | Convention | Example |
|----------|-----------|---------|
| Components | PascalCase | `FileList.tsx`, `AuthGuard.tsx` |
| Hooks | camelCase, `use` prefix | `useFiles.ts`, `useDrive.ts` |
| Services | camelCase | `drive.ts`, `storage.ts` |
| Types | PascalCase | `FileMetadata`, `ConnectedAccount` |
| Constants | UPPER_SNAKE_CASE | `DRIVE_SCOPE`, `CLOUDNEST_FOLDER` |
| CSS variables | `--cn-*` prefix | `--cn-bg`, `--cn-text` |
| localStorage keys | `cn_` prefix | `cn_accounts`, `cn_clientId` |

## Branding

- **Product name:** CloudNest — always capitalize the C and N (not "cloudnest", "Cloudnest", or "Cloud Nest")
- **Prefix conventions:** All internal identifiers use `cn` prefix:
  - CSS variables: `--cn-*` (e.g., `--cn-bg`, `--cn-text`)
  - Tailwind classes: `cn-*` (e.g., `cn-bg`, `cn-sidebar`)
  - localStorage keys: `cn_*` (e.g., `cn_accounts`, `cn_clientId`)
  - Drive folder: `_CloudNest_`
- **Brand color:** Orange (`orange-400`/`orange-500`) as primary accent
- **Tagline:** "Your Storage, Multiplied" — used on landing page hero
- **Repo URL:** `https://github.com/Encryptioner/CloudNest`
- **Deploy URL:** `https://encryptioner.github.io/CloudNest/`

## Styling

- **Tailwind CSS 3** with custom `cn-*` color classes mapping to CSS variables
- **Two themes**: dark (`:root`) and light (`:root.light`) defined in `globals.css`
- **Orange accent** (`orange-400`/`orange-500`) as primary action color
- **No inline styles for theming** — always use CSS variables via Tailwind classes
- **Responsive** — mobile-first with `sm:`, `md:`, `lg:` breakpoints

## Google API Patterns

- **GIS** (`services/auth.ts`) for OAuth token acquisition — loaded lazily
- **gapi.client** (`services/drive.ts`) for Drive API calls — loaded lazily
- **REST API** for file uploads (multipart via XHR for progress tracking)
- **Never download files into memory** — generate authenticated URLs and open in new tab
- **Rate limit handling** — exponential backoff on 429 responses
- **Token management** — check expiry before API calls, attempt silent re-auth

## Error Handling

- Services throw errors — hooks catch and set error state
- User-facing errors shown via Toast notifications (not alert/confirm)
- Token expiry: silent re-auth attempt first, then toast with re-auth button
- Empty catch blocks forbidden (`no-empty` ESLint rule)

## Git Workflow

- Conventional commits: `feat:`, `fix:`, `docs:`, `refactor:`, `chore:`
- Branch naming: `feat/description`, `fix/description`
- `pnpm run lint` and `pnpm tsc --noEmit` must pass before commit
