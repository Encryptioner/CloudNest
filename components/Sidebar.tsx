"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useStorage } from "@/hooks/useStorage";
import { formatBytes } from "@/utils/format";

const navItems = [
  {
    href: "/dashboard",
    label: "Overview",
    icon: <svg className="h-4 w-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>,
  },
  {
    href: "/dashboard/files",
    label: "Files",
    icon: <svg className="h-4 w-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" /></svg>,
  },
  {
    href: "/dashboard/shared",
    label: "Shared",
    icon: <svg className="h-4 w-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 1 0 0 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186 9.566-5.314m-9.566 7.5 9.566 5.314m0 0a2.25 2.25 0 1 0 3.935 2.186 2.25 2.25 0 0 0-3.935-2.186Zm0-12.814a2.25 2.25 0 1 0 3.933-2.185 2.25 2.25 0 0 0-3.933 2.185Z" /></svg>,
  },
  {
    href: "/dashboard/trash",
    label: "Trash",
    icon: <svg className="h-4 w-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" /></svg>,
  },
  {
    href: "/dashboard/stats",
    label: "Analytics",
    icon: <svg className="h-4 w-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" /></svg>,
  },
  {
    href: "/dashboard/settings",
    label: "Settings",
    icon: <svg className="h-4 w-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" /></svg>,
  },
];

type SidebarProps = {
  isOpen: boolean;
  onClose: () => void;
};

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { quotas } = useStorage();
  const [collapsed, setCollapsed] = useState(() =>
    typeof window !== "undefined"
      ? localStorage.getItem("sidebar-collapsed") === "true"
      : false,
  );

  useEffect(() => {
    localStorage.setItem("sidebar-collapsed", String(collapsed));
  }, [collapsed]);

  const totalUsed = quotas.reduce((s: number, q) => s + q.used, 0);
  const totalLimit = quotas.reduce((s: number, q) => s + q.limit, 0);
  const pct = totalLimit > 0 ? Math.min(100, (totalUsed / totalLimit) * 100) : 0;
  const connectedCount = quotas.filter((q) => q.isConnected).length;

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`
          fixed inset-y-0 left-0 z-40 flex h-screen flex-none flex-col border-r border-cn-border bg-cn-sidebar transition-all duration-200
          lg:relative lg:z-auto lg:translate-x-0
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          w-64
          ${collapsed ? "lg:w-14" : "lg:w-60"}
        `}
      >
        {/* Logo + collapse toggle */}
        <div className={`flex items-center border-b border-cn-border px-3 py-[14px] ${collapsed ? "lg:justify-center" : "justify-between"}`}>
          <div className={`flex items-center gap-2.5 ${collapsed ? "lg:justify-center" : ""}`}>
            <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg border border-orange-500/20 bg-orange-500/10">
              <svg className="h-3.5 w-3.5 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0 3 3m-3-3-3 3M6.75 19.5a4.5 4.5 0 0 1-1.41-8.775 5.25 5.25 0 0 1 10.233-2.33 3 3 0 0 1 3.758 3.848A3.752 3.752 0 0 1 18 19.5H6.75Z" />
              </svg>
            </div>
            <span className={`text-sm font-semibold text-cn-text ${collapsed ? "lg:hidden" : ""}`}>CloudNest</span>
          </div>
          {/* Close button on mobile */}
          <button
            onClick={onClose}
            className="flex h-6 w-6 items-center justify-center rounded-md text-cn-text3 transition hover:bg-cn-hover hover:text-cn-text lg:hidden"
            title="Close menu"
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
          {/* Collapse toggle on desktop */}
          {!collapsed && (
            <button
              onClick={() => setCollapsed(true)}
              className="hidden h-6 w-6 items-center justify-center rounded-md text-cn-text3 transition hover:bg-cn-hover hover:text-cn-text lg:flex"
              title="Collapse sidebar"
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
              </svg>
            </button>
          )}
        </div>

        {/* Nav */}
        <nav className={`flex-1 space-y-0.5 py-4 ${collapsed ? "lg:px-1.5 px-3" : "px-3"}`}>
          {!collapsed && (
            <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-widest text-cn-text3">Menu</p>
          )}
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                title={collapsed ? item.label : undefined}
                onClick={onClose}
                className={`flex items-center gap-3 rounded-lg transition-all ${collapsed ? "lg:justify-center lg:px-0 lg:py-2.5 px-3 py-2.5" : "px-3 py-2.5"} text-sm ${
                  isActive
                    ? "bg-orange-500/10 font-medium text-orange-400"
                    : "text-cn-text2 hover:bg-cn-hover hover:text-cn-text"
                }`}
              >
                <span className={isActive ? "text-orange-400" : ""}>{item.icon}</span>
                <span className={collapsed ? "lg:hidden" : ""}>{item.label}</span>
                {!collapsed && isActive && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-orange-400" />}
              </Link>
            );
          })}
        </nav>

        {/* Storage */}
        {!collapsed && (
          <div className="mx-3 mb-3 rounded-xl border border-cn-border bg-cn-bg p-4">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-xs font-medium text-cn-text">Storage Pool</span>
              <span className="rounded-full border border-cn-border px-2 py-0.5 text-[10px] text-cn-text3">{connectedCount} active</span>
            </div>
            <div className="mb-2 h-1.5 w-full overflow-hidden rounded-full bg-cn-border">
              <div className="h-full rounded-full bg-orange-500 transition-all duration-500" style={{ width: `${pct}%` }} />
            </div>
            <div className="flex justify-between text-xs text-cn-text3">
              <span>{formatBytes(totalUsed)} used</span>
              <span>{formatBytes(Math.max(0, totalLimit - totalUsed))} free</span>
            </div>
          </div>
        )}

        {/* Expand button when collapsed (desktop only) */}
        {collapsed && (
          <div className="mb-3 hidden justify-center lg:flex">
            <button
              onClick={() => setCollapsed(false)}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-cn-text3 transition hover:bg-cn-hover hover:text-cn-text"
              title="Expand sidebar"
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
              </svg>
            </button>
          </div>
        )}
      </aside>
    </>
  );
}
