"use client";

import { Suspense, useState } from "react";
import { usePathname } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";
import { UploadProvider } from "@/contexts/UploadContext";
import AuthGuard from "@/components/AuthGuard";

function PageLoader() {
  return (
    <div className="flex flex-1 items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-cn-border border-t-orange-500" />
        <span className="text-xs text-cn-text3">Loading...</span>
      </div>
    </div>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  return (
    <AuthGuard>
      <UploadProvider>
        <div className="flex h-screen overflow-hidden bg-cn-bg">
          <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
          <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
            <Navbar onMenuOpen={() => setSidebarOpen(true)} />
            <main id="cn-scroll" className="flex-1 overflow-y-auto p-4 lg:p-8">
              <Suspense key={pathname} fallback={<PageLoader />}>
                {children}
              </Suspense>
            </main>
          </div>
        </div>
      </UploadProvider>
    </AuthGuard>
  );
}
