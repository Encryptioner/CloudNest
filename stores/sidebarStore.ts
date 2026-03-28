import { create } from "zustand";
import { persist } from "zustand/middleware";

interface SidebarState {
  collapsed: boolean;
  toggleCollapsed: () => void;
  setCollapsed: (value: boolean) => void;
}

export const useSidebarStore = create<SidebarState>()(
  persist(
    (set) => ({
      collapsed: false,
      toggleCollapsed: () => set((state) => ({ collapsed: !state.collapsed })),
      setCollapsed: (value: boolean) => set({ collapsed: value }),
    }),
    {
      name: "sidebar-collapsed",
      version: 1,
      migrate: (persisted, version) => {
        // v0 → v1: old code stored raw "true"/"false" string in localStorage
        // Zustand parses it as a boolean, not the expected {collapsed: boolean} shape
        if (version === 0) {
          if (typeof persisted === "boolean") {
            return { collapsed: persisted };
          }
          // If persisted is an object with collapsed already, pass through
          if (persisted && typeof persisted === "object" && "collapsed" in persisted) {
            return persisted as SidebarState;
          }
          return { collapsed: false };
        }
        return persisted as SidebarState;
      },
    },
  ),
);
