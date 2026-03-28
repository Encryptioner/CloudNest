/**
 * Typed Google Analytics event tracking service.
 *
 * Pure TypeScript module — no React imports. Safe to import from any file
 * including contexts, services, and components.
 */

// ── Event taxonomy ──────────────────────────────────────────

type SetupEvent =
  | { name: "setup_started" }
  | { name: "setup_step_viewed"; params: { step: number; step_name: string } }
  | { name: "setup_skipped_to_client_id" }
  | { name: "setup_client_id_saved" }
  | { name: "setup_account_connected"; params: { account_count: number } }
  | { name: "setup_account_failed"; params: { error: string } }
  | { name: "setup_completed"; params: { account_count: number; total_storage_gb: number } };

type AccountEvent =
  | { name: "account_connected"; params: { source: "setup" | "accounts" | "settings" | "sidebar" } }
  | { name: "account_connect_failed"; params: { source: string; error: string } }
  | { name: "account_disconnected"; params: { source: "accounts" | "settings" } }
  | { name: "account_reauth"; params: { source: "accounts" | "settings" } }
  | { name: "signed_out" };

type FileEvent =
  | { name: "file_uploaded"; params: { file_type: string; file_size: number } }
  | { name: "file_upload_failed"; params: { file_type: string; error: string } }
  | { name: "file_downloaded"; params: { file_type: string } }
  | { name: "file_deleted"; params: { file_type: string; location: "files" | "trash" } }
  | { name: "file_restored"; params: { file_type: string } }
  | { name: "file_renamed" }
  | { name: "file_moved" }
  | { name: "file_shared"; params: { file_type: string } }
  | { name: "file_unshared" }
  | { name: "share_link_copied" }
  | { name: "folder_created" }
  | { name: "file_previewed"; params: { file_type: string } };

type UIEvent =
  | { name: "theme_toggled"; params: { theme: "dark" | "light" } }
  | { name: "view_changed"; params: { view: "grid" | "list"; page: string } }
  | { name: "search_used"; params: { page: string } }
  | { name: "sort_changed"; params: { sort_by: string; page: string } }
  | { name: "sidebar_toggled"; params: { collapsed: boolean } }
  | { name: "cta_clicked"; params: { label: string; source: string } }
  | { name: "docs_viewed" }
  | { name: "stats_viewed" };

type ErrorEvent = {
  name: "error_occurred";
  params: { category: string; action: string; error: string };
};

export type AnalyticsEvent =
  | SetupEvent
  | AccountEvent
  | FileEvent
  | UIEvent
  | ErrorEvent;

// ── Core tracking function ──────────────────────────────────

/**
 * Send a typed analytics event to Google Analytics.
 * No-ops gracefully when gtag is unavailable (SSR, ad blockers).
 */
export function trackEvent(event: AnalyticsEvent): void {
  if (typeof window === "undefined" || !window.gtag) return;

  const { name, ...rest } = event;
  const params = "params" in rest ? rest.params : undefined;
  window.gtag("event", name, params);
}

// ── Helpers ─────────────────────────────────────────────────

const MIME_CATEGORIES: [RegExp | string, string][] = [
  ["application/vnd.google-apps.folder", "folder"],
  [/^image\//, "image"],
  [/^video\//, "video"],
  [/^audio\//, "audio"],
  [/pdf/, "pdf"],
  [/spreadsheet|sheet/, "spreadsheet"],
  [/presentation|slide/, "presentation"],
  [/document|text\//, "document"],
];

/**
 * Map a raw MIME type to a GA-friendly category.
 * Returns: image, video, audio, pdf, spreadsheet, presentation, document, folder, or other.
 */
export function simplifyMimeType(mime: string | null): string {
  if (!mime) return "other";
  for (const [pattern, category] of MIME_CATEGORIES) {
    if (typeof pattern === "string" ? mime === pattern : pattern.test(mime)) {
      return category;
    }
  }
  return "other";
}

const EMAIL_PATTERN = /[\w.+-]+@[\w.-]+\.\w+/g;

/**
 * Strip email addresses from error messages to prevent PII leakage.
 */
export function sanitizeError(msg: string): string {
  return msg.replace(EMAIL_PATTERN, "[email]").slice(0, 100);
}
