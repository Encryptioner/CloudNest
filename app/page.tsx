"use client";

import Link from "next/link";
import { useTheme } from "@/contexts/ThemeContext";

const features = [
  {
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375" />
      </svg>
    ),
    color: "text-orange-400",
    bg: "bg-orange-500/10",
    title: "Unified Storage Pool",
    desc: "Combine unlimited Google Drive accounts into one dashboard. N accounts × 15 GB = effectively unlimited free cloud storage.",
  },
  {
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
      </svg>
    ),
    color: "text-orange-400",
    bg: "bg-orange-500/10",
    title: "Smart Upload Routing",
    desc: "Least-Used-Space strategy automatically routes every upload to the account with the most free space. Zero manual management.",
  },
  {
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
      </svg>
    ),
    color: "text-sky-400",
    bg: "bg-sky-500/10",
    title: "Folder Navigation",
    desc: "Full folder hierarchy with breadcrumb bar, grid & list views, search, sort, and file type filters across all your accounts.",
  },
  {
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 9.776c.112-.017.227-.026.344-.026h15.812c.117 0 .232.009.344.026m-16.5 0a2.25 2.25 0 0 0-1.883 2.542l.857 6a2.25 2.25 0 0 0 2.227 1.932H19.05a2.25 2.25 0 0 0 2.227-1.932l.857-6a2.25 2.25 0 0 0-1.883-2.542m-16.5 0V6A2.25 2.25 0 0 1 6 3.75h3.879a1.5 1.5 0 0 1 1.06.44l2.122 2.12a1.5 1.5 0 0 0 1.06.44H18A2.25 2.25 0 0 1 20.25 9v.776" />
      </svg>
    ),
    color: "text-violet-400",
    bg: "bg-violet-500/10",
    title: "Drag-to-Folder Panel",
    desc: "Start dragging any file and a panel slides in from the right showing every folder. Drop to move instantly — auto-scrolls for long lists.",
  },
  {
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 1 0 0 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186 9.566-5.314m-9.566 7.5 9.566 5.314m0 0a2.25 2.25 0 1 0 3.935 2.186 2.25 2.25 0 0 0-3.935-2.186zm0-12.814a2.25 2.25 0 1 0 3.933-2.185 2.25 2.25 0 0 0-3.933 2.185z" />
      </svg>
    ),
    color: "text-sky-400",
    bg: "bg-sky-500/10",
    title: "Shared with Me",
    desc: "Browse and navigate into folders that others have shared with your Drive accounts. Download files directly from the shared view.",
  },
  {
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
      </svg>
    ),
    color: "text-rose-400",
    bg: "bg-rose-500/10",
    title: "Trash Management",
    desc: "Delete sends files to Drive trash — nothing is gone for good. Restore any file or permanently delete from the Trash page.",
  },
  {
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
      </svg>
    ),
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
    title: "Runs in Your Browser",
    desc: "No server needed. Your data stays in your browser and your own Google Drive accounts. Nothing is stored on our servers.",
  },
  {
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
      </svg>
    ),
    color: "text-orange-400",
    bg: "bg-orange-500/10",
    title: "Rich Analytics",
    desc: "Storage breakdown per account, file type distribution, weekly upload activity, and per-type storage bars — all client-side.",
  },
  {
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
      </svg>
    ),
    color: "text-pink-400",
    bg: "bg-pink-500/10",
    title: "Open Source",
    desc: "100% free and open source. Privacy-first — runs entirely client-side. Inspect every line, contribute, or fork it for your needs.",
  },
];


function DriveIcon({ color, delay = "0s" }: { color: string; delay?: string }) {
  return (
    <div
      className="flex h-16 w-16 items-center justify-center rounded-2xl border border-cn-border bg-cn-s1 shadow-xl"
      style={{ animation: `float 4s ease-in-out ${delay} infinite` }}
    >
      <svg viewBox="0 0 24 24" className="h-8 w-8" fill={color}>
        <path d="M6.28 3h11.44l4.28 7-2 3.46-9.72-.01L4 13.46zm9.72 10l2 3.46-2 3.54H8l-2-3.54 2-3.46zm-9.72 0l-4.28.01L4 16.54 8 24h8l-2.28-3.96L12 17l-5.72-4z" />
      </svg>
    </div>
  );
}

export default function LandingPage() {
  const { theme, toggle } = useTheme();

  return (
    <div className="min-h-screen bg-cn-bg text-cn-text">
      {/* ── Navbar ─────────────────────────────────────────── */}
      <nav className="sticky top-0 z-50 border-b border-cn-border bg-cn-bg/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-orange-500/20 bg-orange-500/10">
              <svg className="h-4 w-4 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0 3 3m-3-3-3 3M6.75 19.5a4.5 4.5 0 0 1-1.41-8.775 5.25 5.25 0 0 1 10.233-2.33 3 3 0 0 1 3.758 3.848A3.752 3.752 0 0 1 18 19.5H6.75Z" />
              </svg>
            </div>
            <span className="text-sm font-semibold text-cn-text">CloudNest</span>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/docs" className="hidden text-xs text-cn-text2 transition hover:text-cn-text sm:inline">
              Docs
            </Link>
            <button
              onClick={toggle}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-cn-border text-cn-text2 transition hover:bg-cn-hover hover:text-cn-text"
              title="Toggle theme"
            >
              {theme === "dark" ? (
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" />
                </svg>
              ) : (
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z" />
                </svg>
              )}
            </button>
            <a
              href="https://github.com/Encryptioner/CloudNest"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 rounded-lg border border-cn-border px-3 py-1.5 text-xs text-cn-text2 transition hover:border-orange-500/40 hover:text-cn-text"
            >
              <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2z" />
              </svg>
              GitHub
            </a>
            <Link
              href="/setup"
              className="rounded-lg bg-orange-500 px-4 py-1.5 text-xs font-semibold text-white shadow shadow-orange-500/20 transition hover:bg-orange-400"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ───────────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        <div className="grid-bg absolute inset-0" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-cn-bg" />

        <div className="relative mx-auto max-w-6xl px-4 sm:px-6 py-24 text-center md:py-32">
          {/* Badge */}
          <div className="animate-fade-up mb-6 inline-flex items-center gap-2 rounded-full border border-orange-500/20 bg-orange-500/5 px-4 py-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-orange-400" />
            <span className="text-xs font-medium text-orange-400">Open Source · Free Forever · Runs in Your Browser</span>
          </div>

          <h1 className="animate-fade-up-d1 mb-6 text-5xl font-bold leading-tight tracking-tight text-cn-text md:text-7xl">
            Your Storage,{" "}
            <span className="gradient-text">Multiplied</span>
          </h1>

          <p className="animate-fade-up-d2 mx-auto mb-10 max-w-2xl text-lg leading-relaxed text-cn-text2">
            CloudNest aggregates multiple Google Drive accounts into a single unified dashboard.
            Get up to <strong className="text-cn-text">N × 15 GB</strong> free cloud storage with
            smart routing, drag-to-folder moves, trash management, shared files, and rich analytics —
            all running entirely in your browser.
          </p>

          <div className="animate-fade-up-d3 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/setup"
              className="flex items-center gap-2 rounded-xl bg-orange-500 px-6 py-3 font-semibold text-white shadow-lg shadow-orange-500/25 transition hover:bg-orange-400"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
              </svg>
              Open Dashboard
            </Link>
            <a
              href="https://github.com/Encryptioner/CloudNest"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-xl border border-cn-border bg-cn-s1 px-6 py-3 font-semibold text-cn-text transition hover:border-orange-500/40"
            >
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2z" />
              </svg>
              Star on GitHub
            </a>
          </div>

          {/* Floating drive icons illustration */}
          <div className="animate-fade-up-d4 relative mx-auto mt-16 flex max-w-lg items-end justify-center gap-4">
            <DriveIcon color="#4285F4" delay="0s" />
            <DriveIcon color="#34A853" delay="0.8s" />
            <div className="mb-6 flex h-8 w-8 items-center justify-center">
              <svg className="h-6 w-6 text-cn-text3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
              </svg>
            </div>
            <DriveIcon color="#FBBC04" delay="0.4s" />
            <DriveIcon color="#EA4335" delay="1.2s" />
            <div className="mb-6 flex h-8 w-8 items-center justify-center">
              <svg className="h-6 w-6 text-cn-text3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
              </svg>
            </div>
            {/* Unified pool */}
            <div
              className="flex h-20 w-20 items-center justify-center rounded-2xl border-2 border-orange-500/40 bg-orange-500/10 shadow-xl shadow-orange-500/20"
              style={{ animation: "float 3s ease-in-out infinite" }}
            >
              <svg className="h-10 w-10 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0 3 3m-3-3-3 3M6.75 19.5a4.5 4.5 0 0 1-1.41-8.775 5.25 5.25 0 0 1 10.233-2.33 3 3 0 0 1 3.758 3.848A3.752 3.752 0 0 1 18 19.5H6.75Z" />
              </svg>
            </div>
          </div>

          {/* Stats bar */}
          <div className="mt-12 flex flex-wrap items-center justify-center gap-8 border-t border-cn-border pt-8">
            {[
              { label: "Free Storage per Account", value: "15 GB" },
              { label: "Max Accounts", value: "Unlimited" },
              { label: "Server Required", value: "None" },
              { label: "Cost", value: "$0" },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <div className="text-2xl font-bold text-cn-text">{s.value}</div>
                <div className="mt-0.5 text-xs text-cn-text3">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ───────────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6 py-20">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold text-cn-text md:text-4xl">
            Everything you need,{" "}
            <span className="gradient-text">nothing you don&apos;t</span>
          </h2>
          <p className="mt-4 text-cn-text2">
            A focused set of features built for power users who want more from their free cloud storage.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <div
              key={f.title}
              className="group rounded-2xl border border-cn-border bg-cn-s1 p-6 transition hover:border-orange-500/30 hover:bg-cn-hover"
            >
              <div className={`mb-4 inline-flex rounded-xl p-2.5 ${f.bg}`}>
                <span className={f.color}>{f.icon}</span>
              </div>
              <h3 className="mb-2 font-semibold text-cn-text">{f.title}</h3>
              <p className="text-sm leading-relaxed text-cn-text2">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Dashboard pages showcase ────────────────────────── */}
      <section className="border-t border-cn-border bg-cn-s1 py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold text-cn-text md:text-4xl">
              Six dedicated views,{" "}
              <span className="gradient-text">one coherent app</span>
            </h2>
            <p className="mt-4 text-cn-text2">
              Every section of CloudNest is purpose-built — no bloat, no clutter.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                path: "/dashboard",
                label: "Overview",
                color: "text-orange-400",
                bg: "bg-orange-500/10",
                border: "border-orange-500/20",
                desc: "Stats cards, per-account storage bars, file type breakdown, and recent files at a glance.",
              },
              {
                path: "/dashboard/files",
                label: "Files",
                color: "text-sky-400",
                bg: "bg-sky-500/10",
                border: "border-sky-500/20",
                desc: "Upload, browse, rename, move (via drag panel), download, and trash files across all accounts.",
              },
              {
                path: "/dashboard/shared",
                label: "Shared with Me",
                color: "text-violet-400",
                bg: "bg-violet-500/10",
                border: "border-violet-500/20",
                desc: "Browse files and folders that other people have shared with your Drive accounts.",
              },
              {
                path: "/dashboard/trash",
                label: "Trash",
                color: "text-rose-400",
                bg: "bg-rose-500/10",
                border: "border-rose-500/20",
                desc: "See all trashed files, restore them to Drive, or permanently delete them.",
              },
              {
                path: "/dashboard/stats",
                label: "Analytics",
                color: "text-emerald-400",
                bg: "bg-emerald-500/10",
                border: "border-emerald-500/20",
                desc: "Weekly upload activity, storage by account, file type distribution, and per-type bars.",
              },
              {
                path: "/dashboard/settings",
                label: "Settings",
                color: "text-amber-400",
                bg: "bg-amber-500/10",
                border: "border-amber-500/20",
                desc: "Connect or disconnect Drive accounts, view quotas, and manage your profile.",
              },
            ].map((page) => (
              <div
                key={page.path}
                className={`rounded-2xl border ${page.border} bg-cn-bg p-5 transition hover:bg-cn-hover`}
              >
                <div className={`mb-3 inline-flex rounded-lg px-2.5 py-1 text-xs font-semibold ${page.color} ${page.bg}`}>
                  {page.label}
                </div>
                <p className="text-sm leading-relaxed text-cn-text2">{page.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Get started / Docs CTA ─────────────────────────── */}
      <section className="py-20">
        <div className="mx-auto max-w-4xl px-6">
          <div className="mb-10 text-center">
            <h2 className="text-3xl font-bold text-cn-text md:text-4xl">Get started in minutes</h2>
            <p className="mt-4 text-cn-text2">
              Our step-by-step wizard walks you through setup in about 5 minutes — no coding required.
            </p>
          </div>

          {/* Quick overview chips */}
          <div className="mb-10 grid gap-3 sm:grid-cols-3">
            {[
              { n: "01", label: "Create a free Google Cloud project and enable Drive API", color: "text-orange-400", bg: "bg-orange-500/10" },
              { n: "02", label: "Create an OAuth Client ID and paste it into CloudNest", color: "text-emerald-400", bg: "bg-emerald-500/10" },
              { n: "03", label: "Connect your Google accounts and start using the dashboard", color: "text-blue-400", bg: "bg-blue-500/10" },
            ].map((step) => (
              <div key={step.n} className="flex items-center gap-3 rounded-xl border border-cn-border bg-cn-s1 p-4">
                <span className={`flex-shrink-0 text-xs font-bold ${step.color} ${step.bg} rounded-lg px-2 py-1`}>{step.n}</span>
                <span className="text-sm text-cn-text2">{step.label}</span>
              </div>
            ))}
          </div>

          <div className="text-center">
            <Link
              href="/docs"
              className="inline-flex items-center gap-2 rounded-xl bg-orange-500 px-8 py-3.5 font-semibold text-white shadow-lg shadow-orange-500/25 transition hover:bg-orange-400"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
              </svg>
              Read the Full Setup Guide
            </Link>
            <p className="mt-3 text-xs text-cn-text3">Takes about 15 minutes end-to-end</p>
          </div>
        </div>
      </section>

      {/* ── Open Source CTA ────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6 py-20 text-center">
        <div className="relative overflow-hidden rounded-3xl border border-orange-500/20 bg-orange-500/5 p-12">
          <div className="absolute inset-0 grid-bg opacity-30" />
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-orange-500/5 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-orange-500/5 blur-3xl" />

          <div className="relative">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-orange-500/20 bg-orange-500/10 px-4 py-1.5">
              <svg className="h-3.5 w-3.5 text-orange-400" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2z" />
              </svg>
              <span className="text-xs font-medium text-orange-400">Open Source Initiative</span>
            </div>
            <h2 className="mb-4 text-3xl font-bold text-cn-text md:text-4xl">
              Built in the open, for everyone
            </h2>
            <p className="mx-auto mb-8 max-w-xl text-cn-text2">
              CloudNest is free software. Inspect every line, contribute improvements, report issues,
              or fork it for your own use. No vendor lock-in. No subscription. No data harvesting.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <a
                href="https://github.com/Encryptioner/CloudNest"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 rounded-xl border border-orange-500/30 bg-orange-500/10 px-6 py-3 font-semibold text-orange-400 transition hover:bg-orange-500/20"
              >
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2z" />
                </svg>
                View on GitHub
              </a>
              <Link
                href="/setup"
                className="rounded-xl bg-orange-500 px-6 py-3 font-semibold text-white shadow shadow-orange-500/25 transition hover:bg-orange-400"
              >
                Start Using CloudNest
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────── */}
      <footer className="border-t border-cn-border bg-cn-s1 py-8">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-orange-500/20 bg-orange-500/10">
              <svg className="h-3.5 w-3.5 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0 3 3m-3-3-3 3M6.75 19.5a4.5 4.5 0 0 1-1.41-8.775 5.25 5.25 0 0 1 10.233-2.33 3 3 0 0 1 3.758 3.848A3.752 3.752 0 0 1 18 19.5H6.75Z" />
              </svg>
            </div>
            <span className="text-sm font-medium text-cn-text2">CloudNest</span>
          </div>
          <div className="text-right">
            <p className="text-xs text-cn-text3">
              Built by{" "}
              <a href="https://encryptioner.github.io/" target="_blank" rel="noopener noreferrer" className="text-orange-400 hover:underline">
                Ankur
              </a>
              {" · "}
              Free &amp; open source
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
