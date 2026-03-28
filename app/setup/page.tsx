"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";

const CLIENT_ID_PATTERN = /^[a-zA-Z0-9-]+\.apps\.googleusercontent\.com$/;

const STEPS = [
  "Welcome",
  "Create Project",
  "Enable API",
  "Consent Screen",
  "Create Client ID",
  "Enter Client ID",
  "Connect Account",
  "Done",
] as const;

type StepName = (typeof STEPS)[number];

export default function SetupPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { clientId, accounts, setClientId, connectAccount, isAuthenticated } = useAuth();

  const [currentStep, setCurrentStep] = useState(0);
  const [inputClientId, setInputClientId] = useState("");
  const [clientIdError, setClientIdError] = useState("");
  const [connectError, setConnectError] = useState("");
  const [isConnecting, setIsConnecting] = useState(false);

  // If already authenticated, redirect to dashboard
  useEffect(() => {
    if (isAuthenticated) {
      router.replace("/dashboard");
    }
  }, [isAuthenticated, router]);

  // Handle ?step=connect param
  useEffect(() => {
    const step = searchParams.get("step");
    if (step === "connect" && clientId) {
      setCurrentStep(6);
    }
  }, [searchParams, clientId]);

  const handleSaveClientId = useCallback(() => {
    const trimmed = inputClientId.trim();
    if (!CLIENT_ID_PATTERN.test(trimmed)) {
      setClientIdError("Invalid format. Client ID should end with .apps.googleusercontent.com");
      return;
    }
    setClientIdError("");
    setClientId(trimmed);
    setCurrentStep(6);
  }, [inputClientId, setClientId]);

  const handleConnect = useCallback(async () => {
    setIsConnecting(true);
    setConnectError("");
    try {
      await connectAccount();
      setCurrentStep(7);
    } catch (err) {
      setConnectError(err instanceof Error ? err.message : "Failed to connect account");
    } finally {
      setIsConnecting(false);
    }
  }, [connectAccount]);

  const stepName: StepName = STEPS[currentStep] ?? "Welcome";

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-2xl">
        {/* Progress */}
        <div className="mb-8 flex items-center justify-center gap-1">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 w-8 rounded-full transition-colors ${
                i <= currentStep ? "bg-orange-500" : "bg-cn-border"
              }`}
            />
          ))}
        </div>

        <div className="rounded-2xl border border-cn-border bg-cn-s1 p-8 shadow-2xl">
          {/* Step: Welcome */}
          {stepName === "Welcome" && (
            <div className="text-center">
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-orange-500/20 bg-orange-500/10">
                <svg className="h-8 w-8 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0 3 3m-3-3-3 3M6.75 19.5a4.5 4.5 0 0 1-1.41-8.775 5.25 5.25 0 0 1 10.233-2.33 3 3 0 0 1 3.758 3.848A3.752 3.752 0 0 1 18 19.5H6.75Z" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-cn-text">Welcome to CloudNest</h1>
              <p className="mt-3 text-cn-text2 max-w-md mx-auto">
                Combine multiple Google Drive accounts into one unified dashboard.
                Free, open source, runs entirely in your browser.
              </p>
              <p className="mt-4 text-sm text-cn-text3">
                To get started, you will need to create a free Google Cloud project
                and provide your own OAuth Client ID. This takes about 5 minutes.
              </p>
              <button
                onClick={() => setCurrentStep(1)}
                className="mt-8 rounded-xl bg-orange-500 px-8 py-3 text-sm font-semibold text-white shadow-lg shadow-orange-500/20 transition hover:bg-orange-400"
              >
                Let&apos;s Get Started
              </button>
              <div className="mt-4">
                <button
                  onClick={() => setCurrentStep(5)}
                  className="text-xs text-cn-text3 hover:text-orange-400 transition"
                >
                  Already have a Client ID? <span className="underline">Skip to setup</span>
                </button>
              </div>
            </div>
          )}

          {/* Step: Create Project */}
          {stepName === "Create Project" && (
            <StepContent
              step={1}
              title="Create a Google Cloud Project"
              onBack={() => setCurrentStep(0)}
              onNext={() => setCurrentStep(2)}
            >
              <ol className="space-y-3 text-sm text-cn-text2">
                <li className="flex gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-orange-500/10 text-xs font-bold text-orange-400">1</span>
                  <span>Go to the <a href="https://console.cloud.google.com" target="_blank" rel="noopener noreferrer" className="text-orange-400 hover:underline">Google Cloud Console</a></span>
                </li>
                <li className="flex gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-orange-500/10 text-xs font-bold text-orange-400">2</span>
                  <span>Click <strong className="text-cn-text">Select a project</strong> at the top, then <strong className="text-cn-text">New Project</strong></span>
                </li>
                <li className="flex gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-orange-500/10 text-xs font-bold text-orange-400">3</span>
                  <span>Name it anything (e.g., &quot;CloudNest&quot;) and click <strong className="text-cn-text">Create</strong></span>
                </li>
              </ol>
            </StepContent>
          )}

          {/* Step: Enable API */}
          {stepName === "Enable API" && (
            <StepContent
              step={2}
              title="Enable Google Drive API"
              onBack={() => setCurrentStep(1)}
              onNext={() => setCurrentStep(3)}
            >
              <ol className="space-y-3 text-sm text-cn-text2">
                <li className="flex gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-orange-500/10 text-xs font-bold text-orange-400">1</span>
                  <span>Open the <a href="https://console.cloud.google.com/apis/library/drive.googleapis.com" target="_blank" rel="noopener noreferrer" className="text-orange-400 hover:underline">Google Drive API page</a></span>
                </li>
                <li className="flex gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-orange-500/10 text-xs font-bold text-orange-400">2</span>
                  <span>Make sure your new project is selected at the top</span>
                </li>
                <li className="flex gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-orange-500/10 text-xs font-bold text-orange-400">3</span>
                  <span>Click <strong className="text-cn-text">Enable</strong></span>
                </li>
              </ol>
            </StepContent>
          )}

          {/* Step: Consent Screen */}
          {stepName === "Consent Screen" && (
            <StepContent
              step={3}
              title="Configure OAuth Consent Screen"
              onBack={() => setCurrentStep(2)}
              onNext={() => setCurrentStep(4)}
            >
              <ol className="space-y-3 text-sm text-cn-text2">
                <li className="flex gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-orange-500/10 text-xs font-bold text-orange-400">1</span>
                  <span>Go to <a href="https://console.cloud.google.com/apis/credentials/consent" target="_blank" rel="noopener noreferrer" className="text-orange-400 hover:underline">OAuth consent screen</a></span>
                </li>
                <li className="flex gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-orange-500/10 text-xs font-bold text-orange-400">2</span>
                  <span>Choose <strong className="text-cn-text">External</strong> user type</span>
                </li>
                <li className="flex gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-orange-500/10 text-xs font-bold text-orange-400">3</span>
                  <span>Fill in the app name, support email, and developer email</span>
                </li>
                <li className="flex gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-orange-500/10 text-xs font-bold text-orange-400">4</span>
                  <span>Add <strong className="text-cn-text">all Google accounts</strong> you want to connect as <strong className="text-cn-text">Test users</strong></span>
                </li>
              </ol>
              <div className="mt-4 space-y-2">
                <div className="rounded-lg border border-orange-500/20 bg-orange-500/5 px-3 py-2 text-xs text-cn-text3">
                  <strong className="text-orange-400">Note:</strong> Apps in testing mode are limited to 100 test users.
                  Each Google account you want to connect must be added as a test user.
                </div>
                <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 px-3 py-2 text-xs text-cn-text3">
                  <strong className="text-emerald-400">Scopes:</strong> CloudNest only requests the{" "}
                  <code className="text-cn-text">drive</code> scope to list, upload, and manage your files.
                  No other permissions are needed.
                </div>
              </div>
            </StepContent>
          )}

          {/* Step: Create Client ID */}
          {stepName === "Create Client ID" && (
            <StepContent
              step={4}
              title="Create OAuth Client ID"
              onBack={() => setCurrentStep(3)}
              onNext={() => setCurrentStep(5)}
            >
              <ol className="space-y-3 text-sm text-cn-text2">
                <li className="flex gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-orange-500/10 text-xs font-bold text-orange-400">1</span>
                  <span>Go to <a href="https://console.cloud.google.com/apis/credentials" target="_blank" rel="noopener noreferrer" className="text-orange-400 hover:underline">Credentials</a></span>
                </li>
                <li className="flex gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-orange-500/10 text-xs font-bold text-orange-400">2</span>
                  <span>Click <strong className="text-cn-text">Create Credentials → OAuth client ID</strong></span>
                </li>
                <li className="flex gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-orange-500/10 text-xs font-bold text-orange-400">3</span>
                  <span>Application type: <strong className="text-cn-text">Web application</strong></span>
                </li>
                <li className="flex gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-orange-500/10 text-xs font-bold text-orange-400">4</span>
                  <div>
                    <span>Under <strong className="text-cn-text">Authorized JavaScript origins</strong>, add:</span>
                    <code className="mt-1 block rounded bg-cn-bg px-2 py-1 text-xs text-orange-400">https://encryptioner.github.io</code>
                    <span className="text-xs text-cn-text3 mt-1 block">For local development, also add: <code className="text-orange-400">http://localhost:3000</code></span>
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-orange-500/10 text-xs font-bold text-orange-400">5</span>
                  <span>Click <strong className="text-cn-text">Create</strong> and copy the Client ID</span>
                </li>
              </ol>
            </StepContent>
          )}

          {/* Step: Enter Client ID */}
          {stepName === "Enter Client ID" && (
            <StepContent
              step={5}
              title="Enter Your Client ID"
              onBack={() => setCurrentStep(4)}
            >
              <p className="text-sm text-cn-text2 mb-4">
                Paste the Client ID you just created. It looks like:
              </p>
              <code className="block rounded bg-cn-bg px-3 py-2 text-xs text-cn-text3 mb-4">
                123456789-abcdefg.apps.googleusercontent.com
              </code>
              <input
                type="text"
                value={inputClientId}
                onChange={(e) => {
                  setInputClientId(e.target.value);
                  setClientIdError("");
                }}
                placeholder="Paste your Client ID here"
                className="w-full rounded-xl border border-cn-border bg-cn-bg px-4 py-3 text-sm text-cn-text placeholder-cn-text3 outline-none transition focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/30"
                autoFocus
              />
              {clientIdError && (
                <p className="mt-2 text-xs text-red-400">{clientIdError}</p>
              )}
              <button
                onClick={handleSaveClientId}
                disabled={!CLIENT_ID_PATTERN.test(inputClientId.trim())}
                className="mt-4 w-full rounded-xl bg-orange-500 py-3 text-sm font-semibold text-white shadow-lg shadow-orange-500/20 transition hover:bg-orange-400 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Save & Continue
              </button>
            </StepContent>
          )}

          {/* Step: Connect Account */}
          {stepName === "Connect Account" && (
            <StepContent
              step={6}
              title="Connect a Google Account"
              onBack={() => setCurrentStep(5)}
            >
              <p className="text-sm text-cn-text2 mb-2">
                Sign in with a Google account to add it to your CloudNest dashboard.
                Each free account gives you 15 GB of storage.
              </p>
              <div className="mb-4 rounded-lg border border-emerald-500/20 bg-emerald-500/5 px-3 py-2 text-xs text-cn-text3">
                <strong className="text-emerald-400">Your data stays private.</strong>{" "}
                CloudNest runs entirely in your browser. Your tokens and files are never sent to any server.
                You can disconnect accounts or revoke access at any time from Settings.
              </div>
              {accounts.length > 0 && (
                <div className="mb-4 space-y-2">
                  <p className="text-xs font-medium text-cn-text3">Connected accounts:</p>
                  {accounts.map((a) => (
                    <div key={a.email} className="flex items-center gap-2 rounded-lg border border-green-500/20 bg-green-500/5 px-3 py-2">
                      <span className="text-green-400 text-xs">✓</span>
                      <span className="text-sm text-cn-text">{a.email}</span>
                    </div>
                  ))}
                </div>
              )}
              {connectError && (
                <div className="mb-4 rounded-lg border border-red-500/20 bg-red-500/5 px-3 py-2 text-xs text-red-400">
                  {connectError}
                </div>
              )}
              <div className="flex gap-3">
                <button
                  onClick={handleConnect}
                  disabled={isConnecting}
                  className="flex-1 rounded-xl bg-orange-500 py-3 text-sm font-semibold text-white shadow-lg shadow-orange-500/20 transition hover:bg-orange-400 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {isConnecting ? "Connecting..." : accounts.length > 0 ? "Add Another Account" : "Connect Google Account"}
                </button>
                {accounts.length > 0 && (
                  <button
                    onClick={() => setCurrentStep(7)}
                    className="rounded-xl border border-cn-border px-6 py-3 text-sm font-medium text-cn-text transition hover:bg-cn-hover"
                  >
                    Continue
                  </button>
                )}
              </div>
            </StepContent>
          )}

          {/* Step: Done */}
          {stepName === "Done" && (
            <div className="text-center">
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-green-500/10">
                <span className="text-3xl text-green-400">✓</span>
              </div>
              <h2 className="text-2xl font-bold text-cn-text">You&apos;re All Set!</h2>
              <p className="mt-3 text-cn-text2">
                CloudNest is ready. Your {accounts.length} connected account{accounts.length !== 1 ? "s" : ""} give{accounts.length === 1 ? "s" : ""} you {" "}
                <strong className="text-cn-text">
                  {(accounts.reduce((sum, a) => sum + a.storageQuota.limit, 0) / (1024 ** 3)).toFixed(0)} GB
                </strong>{" "}
                of unified storage.
              </p>
              <Link
                href="/dashboard"
                className="mt-8 inline-block rounded-xl bg-orange-500 px-8 py-3 text-sm font-semibold text-white shadow-lg shadow-orange-500/20 transition hover:bg-orange-400"
              >
                Open Dashboard
              </Link>
            </div>
          )}
        </div>

        {/* Help link */}
        <p className="mt-6 text-center text-xs text-cn-text3">
          Need help?{" "}
          <Link href="/docs" className="text-orange-400 hover:underline">
            Read the documentation
          </Link>
        </p>
      </div>
    </main>
  );
}

// ── Reusable step wrapper ──────────────────────────────────
function StepContent({
  step,
  title,
  children,
  onBack,
  onNext,
}: {
  step: number;
  title: string;
  children: React.ReactNode;
  onBack?: () => void;
  onNext?: () => void;
}) {
  return (
    <div>
      <p className="text-xs font-medium text-orange-400 mb-2">
        Step {step} of {STEPS.length - 2}
      </p>
      <h2 className="text-xl font-bold text-cn-text mb-6">{title}</h2>
      {children}
      <div className="mt-8 flex justify-between">
        {onBack && (
          <button
            onClick={onBack}
            className="rounded-xl border border-cn-border px-6 py-2.5 text-sm font-medium text-cn-text transition hover:bg-cn-hover"
          >
            Back
          </button>
        )}
        {onNext && (
          <button
            onClick={onNext}
            className="ml-auto rounded-xl bg-orange-500 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-orange-500/20 transition hover:bg-orange-400"
          >
            Next
          </button>
        )}
      </div>
    </div>
  );
}
