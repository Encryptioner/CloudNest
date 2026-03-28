# Plan: Migrate CloudNest State Management to Zustand

## Context

CloudNest has no single source of truth for storage/file data. The same quota data lives in 3 places (localStorage snapshots, `useStorage()` hook state, AuthContext state) and each page creates independent hook instances with their own React state. This causes:

- **Settings vs Sidebar vs Accounts show different "free" values** (different computation logic)
- **Sidebar** computes its own totals by reducing `quotas` directly, ignoring fallback logic
- **File uploads** on one page don't update file counts on another page
- **Setup page** hardcodes 15GB per account (wrong for Workspace accounts)

**Fix:** Introduce Zustand stores as the single source of truth, keep hooks as thin wrappers for backward compatibility.

## Phases

### Phase 0: Install Zustand
- `pnpm add zustand`

### Phase 1: Create Storage Store
**New:** `stores/storageStore.ts`
- State: `quotas`, `totalUsed`, `totalLimit`, `totalFree`, `isLoading`
- Actions: `refreshStorage(accounts)`, `clearStorage()`
- Calls `drive.getAllQuotas()`, falls back to `account.storageQuota`
- Totals computed canonically: sum individual values (NOT `limit - used`)
- Deduplicates concurrent refresh calls via promise caching

### Phase 2: Create File Store
**New:** `stores/fileStore.ts`
- State: `files`, `isLoading`, `error`
- Actions: `loadInitial(accounts)` (cache-first + staleness check), `refreshFiles(accounts)`, `clearFiles()`
- Same cache-first-then-sync pattern from current `useFiles`
- Uses version counter to prevent stale writes

### Phase 3: Create Sidebar UI Store
**New:** `stores/sidebarStore.ts`
- State: `collapsed`, actions: `toggleCollapsed`, `setCollapsed`
- Uses Zustand `persist` middleware with `localStorage` key `sidebar-collapsed`
- Replaces direct localStorage access in `Sidebar.tsx`

### Phase 4: Rewire `useStorage` as Thin Wrapper
**Modify:** `hooks/useStorage.ts`
- Replace all `useState`/`useEffect`/`useCallback` with reads from `useStorageStore()`
- Trigger `refreshStorage(accounts)` on mount + when accounts change
- Same return shape — zero consumer changes needed

### Phase 5: Rewire `useFiles` as Thin Wrapper
**Modify:** `hooks/useFiles.ts`
- Same pattern: delegate to `useFileStore()`
- Call `loadInitial(accounts)` on mount
- Same return shape

### Phase 6: Clean Up AuthContext
**Modify:** `contexts/AuthContext.tsx`
- Remove `refreshAllQuotas` (confirmed: zero external consumers)
- Remove from interface, default value, and useMemo deps

### Phase 7: Fix Sidebar Bugs
**Modify:** `components/Sidebar.tsx`
- Use `totalUsed`/`totalLimit` from `useStorage()` instead of reducing `quotas` directly
- Replace `useState`/`useEffect` for collapsed with `useSidebarStore()`

### Phase 8: Fix Settings Free Computation
**Modify:** `app/dashboard/settings/page.tsx`
- Destructure `totalFree` from `useStorage()`
- Replace `formatBytes(Math.max(0, totalLimit - totalUsed))` with `formatBytes(totalFree)`

### Phase 9: Fix Setup Page Hardcoded 15GB
**Modify:** `app/setup/page.tsx` (line 351)
- Compute from `accounts.reduce((sum, a) => sum + a.storageQuota.limit, 0)` instead of `accounts.length * 15`

### Phase 10: Verify
- `pnpm tsc --noEmit`
- `pnpm run lint`
- Launch dev server, test with Chrome MCP:
  - Dashboard, Settings, Accounts show consistent storage numbers
  - Sidebar storage widget matches Dashboard
  - Navigate between pages — data stays in sync

## Files Changed

| Action | File |
|--------|------|
| Create | `stores/storageStore.ts` |
| Create | `stores/fileStore.ts` |
| Create | `stores/sidebarStore.ts` |
| Modify | `hooks/useStorage.ts` |
| Modify | `hooks/useFiles.ts` |
| Modify | `contexts/AuthContext.tsx` |
| Modify | `components/Sidebar.tsx` |
| Modify | `app/dashboard/settings/page.tsx` |
| Modify | `app/setup/page.tsx` |

## Files NOT Changed (by design)
- `services/*` — pure logic layer, untouched
- `contexts/ThemeContext.tsx`, `contexts/UploadContext.tsx` — work fine
- `hooks/useStats.ts`, `hooks/useDrive.ts` — stateless, fine as-is
- `types/index.ts` — UserProfile and ToastMessage are actively used, not dead code
- All page files except settings and setup — consume hooks which retain their API

## Key Design Decisions
1. **Hooks stay as thin wrappers** — zero consumer changes needed for pages/components
2. **Stores don't subscribe to AuthContext** — consumers pass `accounts` in, avoids circular deps
3. **Concurrent refresh deduplication** — promise caching prevents redundant API calls
4. **Effect dependency stability** — use serialized account emails as dep, not array reference
