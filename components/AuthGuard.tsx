"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { clientId, accounts, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    if (!clientId) {
      router.replace("/setup");
      return;
    }

    if (accounts.length === 0) {
      router.replace("/setup?step=connect");
      return;
    }
  }, [isLoading, clientId, accounts, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-cn-bg">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-orange-500 border-t-transparent" />
          <p className="text-sm text-cn-text2">Loading...</p>
        </div>
      </div>
    );
  }

  if (!clientId || accounts.length === 0) {
    return null;
  }

  return <>{children}</>;
}
