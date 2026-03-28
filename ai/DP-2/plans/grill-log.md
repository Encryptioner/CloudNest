# Grill Log: Zustand State Migration Plan

**Date:** 2026-03-28
**Grilled by:** Claude (Hard Critic Mode)
**Input:** Implementation plan + implemented code at `ai/DP-2/plans/zustand-state-migration.md`
**Ticket:** DP-2
**Verdict:** PASS WITH CONDITIONS

## Summary

The plan correctly identifies the root cause (no single source of truth) and the Zustand migration is architecturally sound. However, the **implementation has a missed fix in Sidebar** that contradicts the plan's own goals, a **localStorage format migration gap** in the sidebar store that will break existing users, and **signOut doesn't clear Zustand stores** leaving stale data risk.

**Stats:** 7 findings — 0 Blocker, 2 Critical, 2 Major, 2 Minor, 1 Note

## Findings

### CRITICAL

#### [C1] Sidebar STILL computes "free" as `totalLimit - totalUsed` instead of using `totalFree`
- **Location:** `components/Sidebar.tsx:157`
- **Issue:** Line 157 reads `{formatBytes(Math.max(0, totalLimit - totalUsed))} free` — the exact same divergent computation the plan was supposed to eliminate. The Settings page was fixed (Phase 8) to use `totalFree`, but Sidebar was not updated. This means Sidebar and Settings can still show different "free" values due to float arithmetic differences.
- **Risk:** Contradicts the core goal of the migration. Sidebar free != Settings free != Accounts free in edge cases with non-integer byte values.
- **Recommendation:** Change Sidebar line 157 to use `totalFree` from `useStorage()`. Destructure it: `const { quotas, totalUsed, totalLimit, totalFree } = useStorage();` and replace `Math.max(0, totalLimit - totalUsed)` with `totalFree`.

#### [C2] Sidebar store localStorage format is incompatible with old format — breaks existing users
- **Location:** `stores/sidebarStore.ts`
- **Issue:** The old `Sidebar.tsx` stored `"true"` or `"false"` as raw strings under localStorage key `sidebar-collapsed`. Zustand's `persist` middleware stores `{"state":{"collapsed":true},"version":0}` — a JSON object. When an existing user upgrades, Zustand will try to `JSON.parse("true")` which succeeds (returns boolean `true`), but the shape won't match the expected `{state: {collapsed: boolean}, version: number}` structure. Zustand's persist rehydrator will silently fall back to the default (`false`), resetting their preference.
- **Risk:** Existing users with collapsed sidebar lose their setting. Minor UX regression but violates the principle of non-breaking state migration.
- **Recommendation:** Add a `migrate` function to the persist config, or use `storage.getItem` override that handles the legacy format. Example:
  ```typescript
  persist(
    (set) => ({ ... }),
    {
      name: "sidebar-collapsed",
      version: 1,
      migrate: (persisted, version) => {
        if (version === 0 && typeof persisted === 'boolean') {
          return { collapsed: persisted };
        }
        return persisted as SidebarState;
      },
    },
  )
  ```

### MAJOR

#### [M1] `signOut` does not clear Zustand stores
- **Location:** `contexts/AuthContext.tsx:132-137`
- **Issue:** `signOut` clears localStorage and resets accounts to `[]`. This eventually triggers `useStorage`'s `useEffect` to call `refreshStorage([])` which empties the store. But there's a race window: between `signOut()` and the next React render cycle, the Zustand stores still hold the previous user's quota/file data. If the component tree unmounts during sign-out navigation, the effect may never fire, leaving stale data in the stores for the next session.
- **Risk:** Stale storage/file data visible briefly during sign-out, or persisting across sessions if the user signs back in quickly.
- **Recommendation:** Call `useStorageStore.getState().clearStorage()` and `useFileStore.getState().clearFiles()` directly in `signOut()`. Import the stores in AuthContext. These are synchronous calls that clear the stores immediately.

#### [M2] `connectAccount` still falls back to hardcoded 15GB on quota fetch failure
- **Location:** `contexts/AuthContext.tsx:72-76`
- **Issue:** When connecting an account, if `drive.getStorageQuota()` fails, the fallback is `{ used: 0, limit: 15 * 1024**3, free: 15 * 1024**3 }`. The plan fixed the Setup page display (Phase 9) but did not fix the data source. Google Workspace accounts can have 30GB, 2TB, or unlimited storage. The wrong fallback propagates through localStorage → storageStore → all views.
- **Risk:** If quota fetch fails during connect, all views show "15 GB" for that account until the next successful live quota fetch. Misleading but not data-destructive.
- **Recommendation:** Either remove the 15GB fallback and instead surface the error to the user ("Could not fetch quota, please reconnect"), or use a sentinel value (e.g., `limit: 0`) that the UI can detect and show "Unknown" instead of a fake number.

### MINOR

#### [m1] `clearStorage()` and `clearFiles()` are defined but never called
- **Location:** `stores/storageStore.ts:88`, `stores/fileStore.ts:93`
- **Issue:** Both stores define `clearStorage`/`clearFiles` actions, but no code path invokes them. The signOut flow relies on the indirect path of setting `accounts` to `[]` → triggering the useEffect → calling `refreshStorage([])`/`loadInitial([])`. This works but is fragile and indirect.
- **Risk:** Dead code. If someone removes the "empty accounts" code path, the stores won't clear.
- **Recommendation:** Either use them in signOut (see M1) or remove them to avoid dead code.

#### [m2] Module-level mutable state (`refreshPromise`, `version`)
- **Location:** `stores/storageStore.ts:16`, `stores/fileStore.ts:16`
- **Issue:** `let refreshPromise` and `let version` are module-scoped mutable variables. In Next.js dev with fast refresh, module re-execution resets them, which can cause subtle bugs (e.g., deduplication silently breaking during development). In production static export, this is fine.
- **Risk:** Development-only quirks with fast refresh. Not a production issue for static export.
- **Recommendation:** Acceptable for now. Document with a comment that these are intentionally module-scoped singletons for the client-side-only app.

### NOTES

#### [N1] Plan accurately scoped — no unnecessary changes
- The decision to keep hooks as thin wrappers is excellent — zero consumer changes needed. The services layer was correctly left untouched. `useStats` and `useDrive` were correctly identified as not needing changes. Good discipline.

## Security Assessment

| Category | Status | Notes |
|----------|--------|-------|
| Authentication | N/A | No auth changes in this plan |
| Authorization | N/A | No authorization changes |
| Input Validation | N/A | No new user inputs |
| Data Exposure | OK | No new data exposed; localStorage keys unchanged |
| Rate Limiting | OK | Deduplication of concurrent refreshes is an improvement |
| Multi-tenancy | N/A | Single-user client-side app |

## Assumptions Made

1. **Zustand store persists across SPA navigation** — Correct, Zustand stores are module-scoped singletons
2. **`accounts` array reference changes trigger the effect** — Mitigated by `accountEmails` serialization, good
3. **All consumers import `useStorage`/`useFiles` hooks, not the stores directly** — True today, but not enforced. If someone imports `useStorageStore` directly without the effect wrapper, they get stale data
4. **Static export means no SSR** — Correct for this project. Module-level mutable state would be dangerous in SSR

## Missing from Plan

- [ ] Sidebar "free" computation fix (C1) — plan says "Fix Sidebar Bugs" in Phase 7 but implementation missed this specific line
- [ ] localStorage migration for sidebar collapsed state (C2)
- [ ] signOut store cleanup (M1)
- [ ] connectAccount 15GB fallback fix (M2)

## Questions for Author

None — the findings are clear and actionable.

## Verdict Details

**PASS WITH CONDITIONS.** The core architecture is sound and the primary goal (single source of truth via Zustand) is achieved. The two Critical findings must be addressed before shipping:

1. **C1**: Fix Sidebar line 157 to use `totalFree` (1-line change)
2. **C2**: Add localStorage migration for sidebar persist (5-line change)

The two Major findings (M1, M2) are strongly recommended but can be addressed in a follow-up if needed.
