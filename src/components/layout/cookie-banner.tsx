"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`${name}=([^;]+)`));
  return match ? match[1] : null;
}

function setCookie(name: string, value: string, days: number) {
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${value}; expires=${expires}; path=/; SameSite=Lax`;
}

export function CookieBanner() {
  const [visible, setVisible] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [analyticsEnabled, setAnalyticsEnabled] = useState(true);

  useEffect(() => {
    const consent = getCookie("OSCABE_COOKIE_CONSENT");
    if (!consent) {
      const timer = setTimeout(() => setVisible(true), 500);
      return () => clearTimeout(timer);
    }
  }, []);

  // Listen for "show-cookie-consent" event (from footer Cookie Settings link)
  useEffect(() => {
    function handleShow() {
      setVisible(true);
      setShowPreferences(false);
    }
    window.addEventListener("show-cookie-consent", handleShow);
    return () => window.removeEventListener("show-cookie-consent", handleShow);
  }, []);

  function saveConsent(value: string) {
    setCookie("OSCABE_COOKIE_CONSENT", value, 365);
    setVisible(false);
    // Notify GA component
    window.dispatchEvent(new Event("cookie-consent-updated"));
    // Reload to apply GA changes
    if (value === "all" || value.includes("analytics")) {
      window.location.reload();
    }
  }

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 animate-in slide-in-from-bottom duration-500">
      <div className="bg-[#02012B] text-white shadow-2xl border-t border-[#4540DB]/30">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
            <p className="flex-1 text-sm text-gray-300">
              We use essential cookies to make our site work. We&apos;d also like
              to use analytics cookies to understand how you use our site.{" "}
              <Link
                href="/cookies"
                className="text-[#4540DB] underline underline-offset-2 hover:text-[#00D4FF]"
              >
                Learn more
              </Link>
            </p>
            <div className="flex shrink-0 items-center gap-3">
              <button
                onClick={() => setShowPreferences(!showPreferences)}
                className="text-sm text-gray-400 transition-colors hover:text-[#00D4FF]"
              >
                Manage Preferences
              </button>
              <Button
                variant="outline"
                size="sm"
                className="border-2 border-white/60 bg-transparent text-white font-semibold hover:bg-white/20 hover:border-white"
                onClick={() => saveConsent("essential")}
              >
                Essential Only
              </Button>
              <Button
                size="sm"
                className="bg-[#4540DB] text-white hover:bg-[#4540DB]/90"
                onClick={() => saveConsent("all")}
              >
                Accept All
              </Button>
            </div>
          </div>

          {/* Manage Preferences Panel */}
          {showPreferences && (
            <div className="mt-4 rounded-lg border border-white/10 bg-white/5 p-4">
              <h3 className="text-sm font-semibold text-white mb-3">Cookie Preferences</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-white">Essential Cookies</p>
                    <p className="text-xs text-gray-400">Required for the site to function. Cannot be disabled.</p>
                  </div>
                  <div className="rounded-full bg-[#22C55E]/20 px-3 py-1 text-xs font-medium text-[#22C55E]">Always On</div>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-white">Analytics Cookies</p>
                    <p className="text-xs text-gray-400">Help us understand how visitors use our site (Google Analytics).</p>
                  </div>
                  <button
                    onClick={() => setAnalyticsEnabled(!analyticsEnabled)}
                    className={`relative h-6 w-11 rounded-full transition-colors ${analyticsEnabled ? "bg-[#4540DB]" : "bg-gray-600"}`}
                  >
                    <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${analyticsEnabled ? "left-5.5 translate-x-0" : "left-0.5"}`} style={{ left: analyticsEnabled ? "22px" : "2px" }} />
                  </button>
                </div>
              </div>
              <div className="mt-4 flex justify-end">
                <Button
                  size="sm"
                  className="bg-[#4540DB] text-white hover:bg-[#4540DB]/90"
                  onClick={() => saveConsent(analyticsEnabled ? "essential,analytics" : "essential")}
                >
                  Save Preferences
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
