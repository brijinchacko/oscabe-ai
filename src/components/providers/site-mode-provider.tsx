"use client";

import { createContext, useContext, useState, useEffect } from "react";

export type SiteMode = "employers" | "candidates" | "agencies";

interface SiteModeContextType {
  mode: SiteMode;
  setMode: (mode: SiteMode) => void;
}

const SiteModeContext = createContext<SiteModeContextType>({
  mode: "employers",
  setMode: () => {},
});

export function useSiteMode() {
  return useContext(SiteModeContext);
}

export function SiteModeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setModeState] = useState<SiteMode>("employers");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("oscabe-site-mode");
    if (stored === "employers" || stored === "candidates" || stored === "agencies") {
      setModeState(stored);
    }
    setMounted(true);
  }, []);

  function setMode(newMode: SiteMode) {
    setModeState(newMode);
    localStorage.setItem("oscabe-site-mode", newMode);
  }

  // Prevent hydration mismatch
  if (!mounted) {
    return (
      <SiteModeContext.Provider value={{ mode: "employers", setMode }}>
        {children}
      </SiteModeContext.Provider>
    );
  }

  return (
    <SiteModeContext.Provider value={{ mode, setMode }}>
      {children}
    </SiteModeContext.Provider>
  );
}
