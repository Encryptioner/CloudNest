"use client";

import { createContext, useContext, useEffect, useState } from "react";
import * as storage from "@/services/storage";
import { trackEvent } from "@/services/analytics";

type Theme = "dark" | "light";

const ThemeContext = createContext<{ theme: Theme; toggle: () => void }>({
  theme: "dark",
  toggle: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>("dark");

  useEffect(() => {
    const stored = storage.getTheme();
    const preferred = window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
    const initial = stored ?? preferred;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initializing theme from browser storage on mount
    setTheme(initial);
    document.documentElement.classList.toggle("light", initial === "light");
  }, []);

  function toggle() {
    setTheme((t) => {
      const next = t === "dark" ? "light" : "dark";
      storage.setTheme(next);
      document.documentElement.classList.toggle("light", next === "light");
      trackEvent({ name: "theme_toggled", params: { theme: next } });
      return next;
    });
  }

  return (
    <ThemeContext.Provider value={{ theme, toggle }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
