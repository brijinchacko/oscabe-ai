"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const STORAGE_KEY = "oscabe-cookie-consent";

type ConsentValue = "all" | "essential";

interface CookieConsent {
  consent: ConsentValue;
  timestamp: number;
}

export function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) {
        // Small delay for slide-in animation
        const timer = setTimeout(() => setVisible(true), 500);
        return () => clearTimeout(timer);
      }
    } catch {
      // localStorage unavailable
    }
  }, []);

  const saveConsent = (consent: ConsentValue) => {
    try {
      const value: CookieConsent = {
        consent,
        timestamp: Date.now(),
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
    } catch {
      // localStorage unavailable
    }
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 animate-in slide-in-from-bottom duration-500"
    >
      <div className="bg-[#02012B] text-white shadow-2xl border-t border-[#4540DB]/30">
        <div className="mx-auto flex max-w-7xl flex-col items-start gap-4 px-4 py-4 sm:flex-row sm:items-center sm:px-6 lg:px-8">
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
            <Link
              href="/cookies"
              className="text-sm text-gray-400 transition-colors hover:text-[#00D4FF]"
            >
              Cookie Settings
            </Link>
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
      </div>
    </div>
  );
}
