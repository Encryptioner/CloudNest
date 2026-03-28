"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useTheme } from "@/contexts/ThemeContext";
import { trackEvent } from "@/services/analytics";

const sections = [
  { id: "getting-started", num: "01", title: "Getting Started", color: "text-orange-400", accent: "border-orange-500/40" },
  { id: "setup-guide", num: "02", title: "Setup Guide", color: "text-blue-400", accent: "border-blue-500/40" },
  { id: "using-cloudnest", num: "03", title: "Using CloudNest", color: "text-emerald-400", accent: "border-emerald-500/40" },
  { id: "how-it-works", num: "04", title: "How It Works", color: "text-violet-400", accent: "border-violet-500/40" },
  { id: "faq", num: "05", title: "FAQ", color: "text-sky-400", accent: "border-sky-500/40" },
  { id: "troubleshooting", num: "06", title: "Troubleshooting", color: "text-rose-400", accent: "border-rose-500/40" },
];

function Code({ children }: { children: string }) {
  return (
    <code className="rounded bg-cn-s2 px-1.5 py-0.5 text-xs text-orange-400 font-mono">
      {children}
    </code>
  );
}

function Note({ type, children }: { type: "info" | "warn" | "tip"; children: React.ReactNode }) {
  const styles = {
    info: { border: "border-blue-500/20", bg: "bg-blue-500/5", text: "text-blue-400", label: "Note" },
    warn: { border: "border-amber-500/20", bg: "bg-amber-500/5", text: "text-amber-400", label: "Important" },
    tip: { border: "border-emerald-500/20", bg: "bg-emerald-500/5", text: "text-emerald-400", label: "Tip" },
  }[type];
  return (
    <div className={`rounded-xl border ${styles.border} ${styles.bg} p-4`}>
      <span className={`text-xs font-bold ${styles.text}`}>{styles.label} — </span>
      <span className="text-xs text-cn-text2 leading-relaxed">{children}</span>
    </div>
  );
}

function NumberedList({ items }: { items: React.ReactNode[] }) {
  return (
    <ol className="space-y-2.5">
      {items.map((item, i) => (
        <li key={i} className="flex gap-3 text-sm text-cn-text2">
          <span className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-cn-s2 text-[10px] font-bold text-cn-text3">
            {i + 1}
          </span>
          <span className="leading-relaxed">{item}</span>
        </li>
      ))}
    </ol>
  );
}

function SectionHeader({ num, color, accent, title }: { num: string; color: string; accent: string; title: string }) {
  return (
    <div className={`mb-6 flex items-center gap-4 border-l-2 ${accent} pl-5`}>
      <span className={`text-xs font-bold tabular-nums ${color}`}>{num}</span>
      <h2 className="text-xl font-bold text-cn-text">{title}</h2>
    </div>
  );
}

export default function DocsPage() {
  const { theme, toggle } = useTheme();

  useEffect(() => { trackEvent({ name: "docs_viewed" }); }, []);

  return (
    <div className="min-h-screen bg-cn-bg text-cn-text">
      {/* ── Navbar ─────────────────────────────────────────── */}
      <nav className="sticky top-0 z-50 border-b border-cn-border bg-cn-bg/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-orange-500/20 bg-orange-500/10">
              <svg className="h-3.5 w-3.5 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0 3 3m-3-3-3 3M6.75 19.5a4.5 4.5 0 0 1-1.41-8.775 5.25 5.25 0 0 1 10.233-2.33 3 3 0 0 1 3.758 3.848A3.752 3.752 0 0 1 18 19.5H6.75Z" />
              </svg>
            </div>
            <span className="text-sm font-semibold">CloudNest</span>
            <span className="rounded-full border border-cn-border px-2 py-0.5 text-[10px] text-cn-text3">Docs</span>
          </Link>
          <div className="flex items-center gap-3">
            <a
              href="https://github.com/Encryptioner/CloudNest"
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-7 w-7 items-center justify-center rounded-lg text-cn-text3 transition hover:bg-cn-hover hover:text-cn-text"
              aria-label="GitHub"
            >
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2Z" />
              </svg>
            </a>
            <button
              onClick={toggle}
              className="flex h-7 w-7 items-center justify-center rounded-lg text-cn-text3 transition hover:bg-cn-hover hover:text-cn-text"
            >
              {theme === "dark" ? (
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" />
                </svg>
              ) : (
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z" />
                </svg>
              )}
            </button>
            <Link
              href="/dashboard"
              className="rounded-lg bg-orange-500 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-orange-400"
            >
              Open Dashboard
            </Link>
          </div>
        </div>
      </nav>

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        {/* ── Hero ─────────────────────────────────────────── */}
        <div className="mb-16 max-w-2xl">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-orange-500/20 bg-orange-500/5 px-3 py-1">
            <span className="h-1.5 w-1.5 rounded-full bg-orange-400" />
            <span className="text-xs font-medium text-orange-400">Documentation</span>
          </div>
          <h1 className="mb-4 text-4xl font-bold tracking-tight text-cn-text md:text-5xl">
            CloudNest
            <br />
            <span className="gradient-text">Documentation</span>
          </h1>
          <p className="text-lg leading-relaxed text-cn-text2">
            Everything you need to set up and use CloudNest — a client-side Google Drive dashboard that runs entirely in your browser. No servers, no backend, no data leaves your machine.
          </p>
        </div>

        {/* ── Two-column layout ──────────────────────────────── */}
        <div className="flex gap-12">
          {/* Left — sticky nav */}
          <aside className="hidden w-48 flex-shrink-0 lg:block">
            <div className="sticky top-20">
              <p className="mb-3 text-[10px] font-semibold uppercase tracking-wider text-cn-text3">Sections</p>
              <nav className="space-y-1">
                {sections.map((s) => (
                  <a
                    key={s.id}
                    href={`#${s.id}`}
                    className="flex items-center gap-2.5 rounded-lg px-2 py-1.5 text-xs text-cn-text2 transition hover:bg-cn-hover hover:text-cn-text"
                  >
                    <span className={`text-[10px] font-bold tabular-nums ${s.color}`}>{s.num}</span>
                    <span>{s.title}</span>
                  </a>
                ))}
              </nav>
            </div>
          </aside>

          {/* Right — content */}
          <div className="min-w-0 flex-1 space-y-16">

            {/* ── Getting Started ── */}
            <section id="getting-started">
              <SectionHeader num="01" color="text-orange-400" accent="border-orange-500/40" title="Getting Started" />
              <div className="space-y-5">
                <p className="text-sm leading-relaxed text-cn-text2">
                  <strong className="text-cn-text">CloudNest</strong> is a free, open-source Google Drive dashboard that runs entirely in your browser. It connects to one or more Google Drive accounts via OAuth and lets you browse, upload, share, and manage files — all without any backend server.
                </p>
                <p className="text-sm leading-relaxed text-cn-text2">
                  The app is hosted on <a href="https://encryptioner.github.io/" target="_blank" rel="noopener noreferrer" className="text-orange-400 underline underline-offset-2">GitHub Pages</a> as a static site. Your Google credentials and tokens stay in your browser and are never sent to any third-party server.
                </p>
                <div className="rounded-xl border border-cn-border bg-cn-s1 p-5">
                  <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-cn-text3">Prerequisites</p>
                  <div className="flex flex-wrap gap-2">
                    {["Google Account", "Modern Browser (Chrome, Firefox, Edge, Safari)"].map((p) => (
                      <span key={p} className="rounded-lg border border-cn-border bg-cn-s2 px-3 py-1.5 text-xs text-cn-text2">
                        {p}
                      </span>
                    ))}
                  </div>
                  <p className="mt-3 text-xs text-cn-text3">
                    That&apos;s it. No installations, no command-line tools, no server setup required.
                  </p>
                </div>
                <Note type="info">
                  CloudNest is a client-side-only application. All API calls to Google Drive happen directly from your browser. Nothing is proxied through a server.
                </Note>
              </div>
            </section>

            {/* ── Setup Guide ── */}
            <section id="setup-guide">
              <SectionHeader num="02" color="text-blue-400" accent="border-blue-500/40" title="Setup Guide" />
              <div className="space-y-8">
                <p className="text-sm leading-relaxed text-cn-text2">
                  Before you can use CloudNest, you need to create a Google Cloud project with OAuth credentials. This is a one-time setup that takes about 5 minutes. The in-app setup wizard walks you through the same steps below.
                </p>

                {/* Step A */}
                <div className="rounded-2xl border border-cn-border bg-cn-s1 p-6">
                  <div className="mb-4 flex items-center gap-3">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-500/10 text-xs font-bold text-blue-400">A</span>
                    <h3 className="text-base font-semibold text-cn-text">Create a Google Cloud Project</h3>
                  </div>
                  <NumberedList items={[
                    <>Go to <a href="https://console.cloud.google.com" target="_blank" rel="noopener noreferrer" className="text-orange-400 underline underline-offset-2">console.cloud.google.com</a> and sign in with your Google account.</>,
                    <>Click the project dropdown at the top of the page and select <strong className="text-cn-text">New Project</strong>.</>,
                    <>Give it any name (e.g., &quot;CloudNest&quot;) and click <strong className="text-cn-text">Create</strong>.</>,
                    <>Make sure the new project is selected in the project dropdown.</>,
                  ]} />
                </div>

                {/* Step B */}
                <div className="rounded-2xl border border-cn-border bg-cn-s1 p-6">
                  <div className="mb-4 flex items-center gap-3">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-500/10 text-xs font-bold text-blue-400">B</span>
                    <h3 className="text-base font-semibold text-cn-text">Enable the Google Drive API</h3>
                  </div>
                  <NumberedList items={[
                    <>Navigate to <strong className="text-cn-text">APIs &amp; Services &rarr; Library</strong>.</>,
                    <>Search for <strong className="text-cn-text">&quot;Google Drive API&quot;</strong>.</>,
                    <>Click on it and press <strong className="text-cn-text">Enable</strong>.</>,
                  ]} />
                </div>

                {/* Step C */}
                <div className="rounded-2xl border border-cn-border bg-cn-s1 p-6">
                  <div className="mb-4 flex items-center gap-3">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-500/10 text-xs font-bold text-blue-400">C</span>
                    <h3 className="text-base font-semibold text-cn-text">Configure OAuth Consent Screen</h3>
                  </div>
                  <NumberedList items={[
                    <>Go to <strong className="text-cn-text">APIs &amp; Services &rarr; OAuth consent screen</strong>.</>,
                    <>Choose <strong className="text-cn-text">External</strong> as the user type and click <strong className="text-cn-text">Create</strong>.</>,
                    <>Fill in the required fields: app name, user support email, and developer contact email.</>,
                    <>On the <strong className="text-cn-text">Scopes</strong> step, click <strong className="text-cn-text">Add or Remove Scopes</strong> and add the <Code>https://www.googleapis.com/auth/drive</Code> scope.</>,
                    <>
                      On the <strong className="text-cn-text">Test users</strong> step, add <strong className="text-cn-text">every Google account email</strong> you want to connect to CloudNest. Click <strong className="text-cn-text">Add Users</strong> and enter one email per line.
                      For example, if you have <Code>alice@gmail.com</Code>, <Code>bob@gmail.com</Code>, and <Code>work@company.com</Code>, add all three.
                    </>,
                    <>Click <strong className="text-cn-text">Save and Continue</strong> through the remaining steps.</>,
                  ]} />
                  <div className="mt-4 space-y-3">
                    <Note type="warn">
                      While the app is in &quot;Testing&quot; status, only the test users you add can sign in. You can add up to <strong className="text-cn-text">100 test users</strong>. To remove this limit, you would need to submit the app for Google verification.
                    </Note>
                    <Note type="tip">
                      Planning to pool storage from multiple Gmail accounts? Add all of them as test users now. You can always come back and add more later at{" "}
                      <a href="https://console.cloud.google.com/apis/credentials/consent" target="_blank" rel="noopener noreferrer" className="text-orange-400 underline underline-offset-2">console.cloud.google.com</a>.
                    </Note>
                  </div>
                </div>

                {/* Step D */}
                <div className="rounded-2xl border border-cn-border bg-cn-s1 p-6">
                  <div className="mb-4 flex items-center gap-3">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-500/10 text-xs font-bold text-blue-400">D</span>
                    <h3 className="text-base font-semibold text-cn-text">Create an OAuth Client ID</h3>
                  </div>
                  <NumberedList items={[
                    <>Go to <strong className="text-cn-text">APIs &amp; Services &rarr; Credentials</strong>.</>,
                    <>Click <strong className="text-cn-text">Create Credentials &rarr; OAuth client ID</strong>.</>,
                    <>Select <strong className="text-cn-text">Web application</strong> as the application type.</>,
                    <>Under <strong className="text-cn-text">Authorized JavaScript origins</strong>, add: <Code>https://encryptioner.github.io</Code></>,
                    <>Click <strong className="text-cn-text">Create</strong>. Copy the <strong className="text-cn-text">Client ID</strong> shown in the dialog.</>,
                  ]} />
                  <div className="mt-4">
                    <Note type="tip">
                      You only need the <strong className="text-cn-text">Client ID</strong> (ends in <Code>.apps.googleusercontent.com</Code>). The Client Secret is not needed since CloudNest uses the OAuth implicit flow in the browser.
                    </Note>
                  </div>
                </div>

                {/* Step E */}
                <div className="rounded-2xl border border-cn-border bg-cn-s1 p-6">
                  <div className="mb-4 flex items-center gap-3">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-500/10 text-xs font-bold text-blue-400">E</span>
                    <h3 className="text-base font-semibold text-cn-text">Enter Client ID in CloudNest</h3>
                  </div>
                  <NumberedList items={[
                    <>Open CloudNest in your browser. The setup wizard will appear on your first visit.</>,
                    <>Paste the <strong className="text-cn-text">Client ID</strong> you copied in the previous step into the input field.</>,
                    <>Click <strong className="text-cn-text">Save</strong>. The Client ID is stored in your browser&apos;s local storage.</>,
                  ]} />
                </div>

                {/* Step F */}
                <div className="rounded-2xl border border-cn-border bg-cn-s1 p-6">
                  <div className="mb-4 flex items-center gap-3">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-500/10 text-xs font-bold text-blue-400">F</span>
                    <h3 className="text-base font-semibold text-cn-text">Connect Your Google Account</h3>
                  </div>
                  <NumberedList items={[
                    <>Click <strong className="text-cn-text">Connect Google Account</strong> to start the OAuth flow.</>,
                    <>Google will show the <strong className="text-cn-text">account chooser</strong> — select the account you want to connect. Make sure this account is added as a <strong className="text-cn-text">test user</strong> in your OAuth consent screen (Step C).</>,
                    <>
                      You will see a <strong className="text-cn-text">&quot;Google hasn&apos;t verified this app&quot;</strong> warning screen. This is expected — see the detailed walkthrough below.
                    </>,
                    <>On the <strong className="text-cn-text">permissions screen</strong>, Google will ask you to grant access to &quot;See, edit, create, and delete all of your Google Drive files.&quot; Click <strong className="text-cn-text">Continue</strong> to approve.</>,
                    <>You&apos;ll be redirected back to CloudNest with full access to your Drive files.</>,
                  ]} />

                  {/* Unverified app warning walkthrough */}
                  <div className="mt-5 rounded-xl border border-amber-500/20 bg-amber-500/5 p-5">
                    <h4 className="mb-1 text-sm font-semibold text-amber-400">&quot;Google hasn&apos;t verified this app&quot; — What to do</h4>
                    <p className="mb-4 text-xs leading-relaxed text-cn-text2">
                      Since you created this Google Cloud project yourself, it&apos;s in <strong className="text-cn-text">&quot;Testing&quot; mode</strong>.
                      Google shows this warning for all unverified apps — it does not mean the app is unsafe.
                      This is <strong className="text-cn-text">your own project</strong>, running in <strong className="text-cn-text">your own browser</strong>, with credentials <strong className="text-cn-text">you created</strong>. It&apos;s completely safe to proceed.
                    </p>

                    <div className="space-y-3">
                      <div className="rounded-lg border border-cn-border bg-cn-bg p-3">
                        <div className="mb-2 flex items-center gap-2">
                          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-500/10 text-[10px] font-bold text-amber-400">1</span>
                          <p className="text-xs font-semibold text-cn-text">Warning Screen</p>
                        </div>
                        <p className="pl-7 text-xs text-cn-text2">
                          You&apos;ll see &quot;Google hasn&apos;t verified this app&quot; with two options.
                          <strong className="text-cn-text"> Do NOT click &quot;Back to safety&quot;</strong> — that cancels the connection.
                          Instead, click the small <strong className="text-cn-text">&quot;Advanced&quot;</strong> link at the bottom left of the dialog.
                        </p>
                      </div>

                      <div className="rounded-lg border border-cn-border bg-cn-bg p-3">
                        <div className="mb-2 flex items-center gap-2">
                          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-500/10 text-[10px] font-bold text-amber-400">2</span>
                          <p className="text-xs font-semibold text-cn-text">Advanced Options</p>
                        </div>
                        <p className="pl-7 text-xs text-cn-text2">
                          After clicking &quot;Advanced&quot;, additional text appears at the bottom. Click <strong className="text-cn-text">&quot;Go to [your app name] (unsafe)&quot;</strong>.
                          The &quot;unsafe&quot; label is Google&apos;s default wording for all unverified apps — it&apos;s not a reflection of your app&apos;s safety.
                        </p>
                      </div>

                      <div className="rounded-lg border border-cn-border bg-cn-bg p-3">
                        <div className="mb-2 flex items-center gap-2">
                          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-500/10 text-[10px] font-bold text-amber-400">3</span>
                          <p className="text-xs font-semibold text-cn-text">Grant Permissions</p>
                        </div>
                        <p className="pl-7 text-xs text-cn-text2">
                          Google will show the permissions CloudNest needs: access to your Google Drive files.
                          Click <strong className="text-cn-text">&quot;Continue&quot;</strong> to approve. This grants CloudNest (running in your browser) permission to manage your Drive files.
                        </p>
                      </div>
                    </div>

                    <div className="mt-3">
                      <Note type="tip">
                        This warning only appears because your Google Cloud project hasn&apos;t been submitted for Google verification — a process designed for apps serving thousands of users.
                        For personal use, &quot;Testing&quot; mode is perfectly fine. You&apos;ll see this warning each time you connect a new account or re-authenticate.
                      </Note>
                    </div>
                  </div>

                  {/* Multiple accounts guide */}
                  <div className="mt-5 rounded-xl border border-blue-500/20 bg-blue-500/5 p-5">
                    <h4 className="mb-1 text-sm font-semibold text-blue-400">Adding Multiple Accounts</h4>
                    <p className="mb-3 text-xs leading-relaxed text-cn-text2">
                      CloudNest&apos;s core feature is pooling storage from multiple Google accounts. Here&apos;s how to add more:
                    </p>
                    <NumberedList items={[
                      <>
                        <strong className="text-cn-text">Add as test user first:</strong> Before connecting a new account, go to your{" "}
                        <a href="https://console.cloud.google.com/apis/credentials/consent" target="_blank" rel="noopener noreferrer" className="text-orange-400 underline underline-offset-2">OAuth consent screen</a>{" "}
                        &rarr; <strong className="text-cn-text">Test users</strong> &rarr; <strong className="text-cn-text">Add Users</strong> and add the email address.
                      </>,
                      <>
                        <strong className="text-cn-text">Connect from CloudNest:</strong> In the setup wizard, click <strong className="text-cn-text">&quot;Add Another Account&quot;</strong>. Or, after setup, go to{" "}
                        <strong className="text-cn-text">Dashboard &rarr; Accounts</strong> or <strong className="text-cn-text">Dashboard &rarr; Settings</strong> and click <strong className="text-cn-text">&quot;Connect Account&quot;</strong>.
                      </>,
                      <>
                        <strong className="text-cn-text">Same flow each time:</strong> You&apos;ll go through the same Google sign-in process (account chooser &rarr; unverified warning &rarr; Advanced &rarr; Continue &rarr; grant permissions) for each account.
                      </>,
                      <>
                        <strong className="text-cn-text">Storage pools automatically:</strong> Each free Google account adds 15 GB. Connect 3 accounts and you get 45 GB of unified storage.
                        Google Workspace accounts may contribute more depending on your plan.
                      </>,
                    ]} />
                  </div>
                </div>
              </div>
            </section>

            {/* ── Using CloudNest ── */}
            <section id="using-cloudnest">
              <SectionHeader num="03" color="text-emerald-400" accent="border-emerald-500/40" title="Using CloudNest" />
              <div className="space-y-5">
                <p className="text-sm leading-relaxed text-cn-text2">
                  Once connected, CloudNest gives you a unified view of all your Google Drive accounts. Here&apos;s what you can do:
                </p>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {[
                    {
                      label: "File Browsing",
                      color: "text-orange-400",
                      bg: "bg-orange-500/10",
                      border: "border-orange-500/20",
                      items: ["Navigate folders with breadcrumb trail", "Grid and list view toggle", "Sort by name, date, or size", "Search across all accounts", "Preview files with thumbnails"],
                    },
                    {
                      label: "Upload & Organize",
                      color: "text-sky-400",
                      bg: "bg-sky-500/10",
                      border: "border-sky-500/20",
                      items: ["Drag-and-drop file upload", "Upload to specific folders", "Create new folders", "Rename and move files", "Automatic account routing by free space"],
                    },
                    {
                      label: "Sharing",
                      color: "text-violet-400",
                      bg: "bg-violet-500/10",
                      border: "border-violet-500/20",
                      items: ["View files shared with you", "Navigate into shared folders", "Share files with others", "Manage sharing permissions", "Download shared files directly"],
                    },
                    {
                      label: "Trash",
                      color: "text-rose-400",
                      bg: "bg-rose-500/10",
                      border: "border-rose-500/20",
                      items: ["View trashed files across all accounts", "Restore files back to Drive", "Permanently delete files", "Search and sort trash items"],
                    },
                    {
                      label: "Analytics",
                      color: "text-emerald-400",
                      bg: "bg-emerald-500/10",
                      border: "border-emerald-500/20",
                      items: ["Storage usage per account", "File type distribution charts", "Upload activity over time", "Storage breakdown by file type"],
                    },
                    {
                      label: "Settings",
                      color: "text-amber-400",
                      bg: "bg-amber-500/10",
                      border: "border-amber-500/20",
                      items: ["Total storage pool summary", "Per-account quota bars", "Connect or disconnect accounts", "Profile customization"],
                    },
                  ].map((page) => (
                    <div key={page.label} className={`rounded-2xl border ${page.border} bg-cn-s1 p-5`}>
                      <div className={`mb-3 inline-flex rounded-lg px-2.5 py-1 text-xs font-semibold ${page.color} ${page.bg}`}>{page.label}</div>
                      <ul className="space-y-1.5">
                        {page.items.map((item) => (
                          <li key={item} className="flex items-start gap-2 text-xs text-cn-text2">
                            <span className={`mt-0.5 flex-shrink-0 ${page.color}`}>&rsaquo;</span>
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* ── How It Works ── */}
            <section id="how-it-works">
              <SectionHeader num="04" color="text-violet-400" accent="border-violet-500/40" title="How It Works" />
              <div className="space-y-5">
                <p className="text-sm leading-relaxed text-cn-text2">
                  CloudNest is a <strong className="text-cn-text">fully client-side application</strong> built with Next.js and hosted as a static site on GitHub Pages. There is no backend server — every interaction with Google Drive happens directly from your browser using the Google Drive API.
                </p>

                <div className="grid gap-4 sm:grid-cols-3">
                  {[
                    {
                      title: "Authentication",
                      color: "border-violet-500/20",
                      desc: "OAuth 2.0 implicit flow. Your browser obtains an access token directly from Google. The token is stored in browser memory/storage and never sent to any third-party server.",
                    },
                    {
                      title: "Storage Model",
                      color: "border-violet-500/20",
                      desc: "Your OAuth Client ID and app preferences are stored in the browser's localStorage. Access tokens are kept in session storage and cleared when you close the tab.",
                    },
                    {
                      title: "API Calls",
                      color: "border-violet-500/20",
                      desc: "All Google Drive API requests are made directly from your browser to Google's servers. CloudNest acts as a UI layer — no proxy, no middleware, no data relay.",
                    },
                  ].map((card) => (
                    <div key={card.title} className={`rounded-2xl border ${card.color} bg-cn-s1 p-5`}>
                      <h3 className="mb-2 text-sm font-semibold text-cn-text">{card.title}</h3>
                      <p className="text-xs leading-relaxed text-cn-text2">{card.desc}</p>
                    </div>
                  ))}
                </div>

                <Note type="warn">
                  Access tokens expire after approximately <strong className="text-cn-text">1 hour</strong>. When a token expires, CloudNest will prompt you to re-authenticate. This is a Google security measure and cannot be extended for client-side apps.
                </Note>

                <div className="rounded-xl border border-cn-border bg-cn-s1 p-5">
                  <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-cn-text3">Privacy Guarantees</p>
                  <ul className="space-y-2">
                    {[
                      ["No server-side storage", "Your files, tokens, and credentials never touch any server other than Google's own APIs"],
                      ["No analytics or tracking", "CloudNest does not collect any usage data or telemetry"],
                      ["Open source", "The entire codebase is publicly auditable on GitHub"],
                      ["Statically hosted", "The app is a set of static files served via GitHub Pages — there is no server to intercept data"],
                    ].map(([k, v]) => (
                      <li key={k} className="flex gap-3 text-xs">
                        <span className="flex-shrink-0 font-semibold text-cn-text">{k}</span>
                        <span className="text-cn-text2">{v}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </section>

            {/* ── FAQ ── */}
            <section id="faq">
              <SectionHeader num="05" color="text-sky-400" accent="border-sky-500/40" title="FAQ" />
              <div className="divide-y divide-cn-border rounded-2xl border border-cn-border bg-cn-s1 overflow-hidden">
                {[
                  {
                    q: "Is my data safe?",
                    a: "Yes. CloudNest is a client-side application — your files and credentials never leave your browser. All API calls go directly from your browser to Google. The source code is fully open and auditable.",
                  },
                  {
                    q: "How many accounts can I connect?",
                    a: "There is no hard limit in CloudNest. However, while your Google Cloud project is in \"Testing\" mode, you can add up to 100 test users on the OAuth consent screen. Each connected account adds its full 15 GB free quota to the pool. To add a new account: first add its email as a test user in the Google Cloud Console, then click \"Connect Account\" in CloudNest's Accounts or Settings page.",
                  },
                  {
                    q: "Why does Google say \"This app isn't verified\"?",
                    a: "This is normal and expected. Your Google Cloud project is in \"Testing\" mode, which is Google's default for new projects. Google only \"verifies\" apps that serve thousands of users. Since this is your own personal project running in your own browser, it's completely safe. Click \"Advanced\" → \"Go to [app name] (unsafe)\" → \"Continue\" to proceed. You'll see this each time you connect a new account.",
                  },
                  {
                    q: "Why does my session expire after about an hour?",
                    a: "Google's OAuth access tokens for client-side apps are valid for approximately 1 hour. This is a security measure enforced by Google and cannot be changed. Simply re-authenticate when prompted.",
                  },
                  {
                    q: "Do I need to install anything?",
                    a: "No. CloudNest runs entirely in your browser. You just need a Google account and a modern web browser. The one-time setup involves creating a Google Cloud project to get OAuth credentials.",
                  },
                  {
                    q: "Can I use this with a Google Workspace account?",
                    a: "Yes. Add the Workspace email as a test user on the OAuth consent screen and connect it like any other Google account. Workspace accounts may have different storage quotas depending on your plan.",
                  },
                  {
                    q: "What happens if I clear my browser data?",
                    a: "Your stored Client ID and preferences will be removed. You will need to re-enter your Client ID and reconnect your accounts. Your actual files in Google Drive are not affected.",
                  },
                  {
                    q: "Is there a file size limit for uploads?",
                    a: "CloudNest uses the Google Drive API for uploads, which supports files up to 5 TB. However, browser-based uploads may be slower for very large files. Your available Drive storage quota also applies.",
                  },
                  {
                    q: "Can I self-host CloudNest?",
                    a: "Yes. Fork the repository, build the static site, and host it anywhere that serves static files. Update the Authorized JavaScript origins in your Google Cloud Console to match your hosting domain.",
                  },
                ].map((faq) => (
                  <div key={faq.q} className="p-5">
                    <p className="mb-1.5 text-sm font-semibold text-cn-text">{faq.q}</p>
                    <p className="text-sm leading-relaxed text-cn-text2">{faq.a}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* ── Troubleshooting ── */}
            <section id="troubleshooting">
              <SectionHeader num="06" color="text-rose-400" accent="border-rose-500/40" title="Troubleshooting" />
              <div className="space-y-3">
                {[
                  {
                    q: "\"Error 400: redirect_uri_mismatch\" during sign-in",
                    a: "The Authorized JavaScript origins in your Google Cloud Console do not include the domain CloudNest is running on. Go to APIs & Services \u2192 Credentials, edit your OAuth Client ID, and add https://encryptioner.github.io as an authorized origin. If self-hosting, add your own domain instead.",
                  },
                  {
                    q: "\"This app isn't verified\" warning",
                    a: "This is normal and expected for apps in Testing mode. Do NOT click \"Back to safety\" — that cancels the connection. Instead: (1) Click \"Advanced\" at the bottom left, (2) Click \"Go to [your app name] (unsafe)\", (3) Click \"Continue\" to grant permissions. The \"unsafe\" label is Google's default wording for all unverified apps. Since this is your own Google Cloud project, it's completely safe. Only accounts added as test users in the OAuth consent screen can sign in.",
                  },
                  {
                    q: "\"Access blocked: This app's request is invalid\" error",
                    a: "This usually means the Google Drive API is not enabled for your project. Go to APIs & Services \u2192 Library, search for \"Google Drive API\", and click Enable.",
                  },
                  {
                    q: "Google Drive API rate limit errors (403)",
                    a: "Google enforces rate limits on Drive API calls. If you see 403 errors, wait a few minutes and try again. Avoid rapid-fire operations like bulk deleting hundreds of files at once.",
                  },
                  {
                    q: "\"Storage quota exceeded\" on upload",
                    a: "The target Google Drive account is full. Connect another Google account with available storage, or free up space by deleting files and emptying the trash in the original account.",
                  },
                  {
                    q: "Can't connect a second Google account",
                    a: "Make sure the email address is added as a test user in your Google Cloud Console (APIs & Services → OAuth consent screen → Test users → Add Users). Only emails listed as test users can sign in while the project is in Testing mode. After adding the email, try connecting again from CloudNest.",
                  },
                  {
                    q: "Files not showing after connecting account",
                    a: "Give it a moment for the initial file list to load. If files still do not appear, try disconnecting and reconnecting the account. Make sure the Google Drive API scope was properly approved during OAuth consent.",
                  },
                  {
                    q: "Session keeps expiring too quickly",
                    a: "Access tokens last approximately 1 hour. This is a Google-enforced limit for client-side OAuth apps and cannot be extended. Browser extensions that aggressively clear cookies or storage may also cause premature session loss.",
                  },
                ].map((item) => (
                  <div key={item.q} className="rounded-xl border border-cn-border bg-cn-s1 p-5">
                    <p className="mb-1.5 flex items-start gap-2 text-sm font-semibold text-cn-text">
                      <span className="mt-0.5 flex-shrink-0 text-amber-400">!</span>
                      {item.q}
                    </p>
                    <p className="pl-5 text-sm leading-relaxed text-cn-text2">{item.a}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* ── CTA ── */}
            <section>
              <div className="rounded-2xl border border-orange-500/20 bg-orange-500/5 p-10 text-center">
                <h2 className="text-2xl font-bold text-cn-text">Ready to get started?</h2>
                <p className="mt-2 text-cn-text2">Open the dashboard and connect your Google Drive accounts.</p>
                <div className="mt-6 flex flex-wrap justify-center gap-3">
                  <Link href="/dashboard" className="rounded-xl bg-orange-500 px-6 py-3 font-semibold text-white shadow shadow-orange-500/25 transition hover:bg-orange-400">
                    Open Dashboard
                  </Link>
                  <Link href="/" className="rounded-xl border border-cn-border bg-cn-s1 px-6 py-3 font-semibold text-cn-text transition hover:border-orange-500/30">
                    Back to Home
                  </Link>
                </div>
              </div>
              <p className="mt-8 text-center text-xs text-cn-text3">
                CloudNest is free and open source.{" "}
                <a href="https://github.com/Encryptioner/CloudNest" target="_blank" rel="noopener noreferrer" className="text-orange-400 hover:underline">View on GitHub</a>
                {" "}&middot;{" "}
                <a href="https://encryptioner.github.io/" target="_blank" rel="noopener noreferrer" className="text-orange-400 hover:underline">Portfolio</a>
              </p>
            </section>

          </div>
        </div>
      </div>
    </div>
  );
}
