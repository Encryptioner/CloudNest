"use client";

import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";
import { UploadProvider } from "@/contexts/UploadContext";
import AuthGuard from "@/components/AuthGuard";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <AuthGuard>
      <UploadProvider>
        <div className="flex h-screen overflow-hidden bg-cn-bg">
          <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
          <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
            <Navbar onMenuOpen={() => setSidebarOpen(true)} />
            <main id="cn-scroll" className="flex-1 overflow-y-auto p-4 lg:p-8">
              {children}
            </main>
          </div>
        </div>
      </UploadProvider>
    </AuthGuard>
  );
}
