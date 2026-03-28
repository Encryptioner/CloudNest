# Phase 7: Verification via Chrome DevTools MCP

**Overview Plan:** See `overview.md`
**Spec Requirements Covered:** FR-8

## Approach

Use Chrome DevTools MCP to navigate through key flows and verify events fire correctly by inspecting network requests to `google-analytics.com` or `analytics.google.com`.

## Verification Flows

### Flow 1: Setup Funnel
1. Clear localStorage to simulate new user
2. Navigate to `/CloudNest/setup`
3. Progress through each step — verify `setup_step_viewed` fires for each
4. Enter client ID — verify `setup_client_id_saved`
5. Connect account — verify `setup_account_connected` + `account_connected`
6. Complete setup — verify `setup_completed`

### Flow 2: File Operations
1. Navigate to `/CloudNest/dashboard/files`
2. Toggle grid/list view — verify `view_changed`
3. Use search — verify `search_used` fires after debounce (not on every keystroke)
4. Change sort — verify `sort_changed`
5. Preview a file — verify `file_previewed`
6. If possible, trigger a file operation (share, download)

### Flow 3: Theme Toggle
1. Click theme toggle — verify `theme_toggled` with correct `theme` param

### Flow 4: Landing Page CTAs
1. Navigate to `/CloudNest`
2. Click hero CTA — verify `cta_clicked` with `source: 'hero'`

### Flow 5: Sidebar
1. Collapse sidebar — verify `sidebar_toggled` with `collapsed: true`
2. Expand — verify `collapsed: false`

### Flow 6: Error Event
1. Trigger a known error scenario (e.g., disconnect account then try to download)
2. Verify `error_occurred` fires with sanitized error message

## Verification Method

Use `mcp__chrome-devtools__list_network_requests` to filter for requests to `google-analytics.com` or `analytics.google.com/g/collect`. The event name and params are encoded in the request URL/payload.

Alternative: Use `mcp__chrome-devtools__evaluate_script` to check `window.dataLayer` for pushed events.

## Verification Steps
- [ ] Setup funnel events fire in correct order
- [ ] File operation events fire with correct params
- [ ] Theme toggle fires with correct theme value
- [ ] CTA clicks fire with correct source
- [ ] Sidebar toggle fires correctly
- [ ] Search debounce works (single event, not per-keystroke)
- [ ] Error events have sanitized messages (no emails)
- [ ] No events fire during page load/SSR (only on user action)
- [ ] No TypeScript or lint errors across entire codebase
