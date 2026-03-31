"use client";

import Script from "next/script";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

declare global {
  interface Window {
    gtag: (...args: unknown[]) => void;
    dataLayer: unknown[];
  }
}

function getCookieConsent(): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(/OSCABE_COOKIE_CONSENT=([^;]+)/);
  return match ? match[1] : null;
}

export function GoogleAnalytics() {
  const pathname = usePathname();
  const [hasConsent, setHasConsent] = useState(false);

  useEffect(() => {
    const consent = getCookieConsent();
    // Only load GA if user accepted "all" or "analytics"
    setHasConsent(consent === "all" || (consent || "").includes("analytics"));
  }, []);

  // Listen for consent changes
  useEffect(() => {
    function handleConsent() {
      const consent = getCookieConsent();
      setHasConsent(consent === "all" || (consent || "").includes("analytics"));
    }
    window.addEventListener("cookie-consent-updated", handleConsent);
    return () => window.removeEventListener("cookie-consent-updated", handleConsent);
  }, []);

  useEffect(() => {
    if (!hasConsent || !GA_MEASUREMENT_ID || typeof window.gtag !== "function") return;
    window.gtag("config", GA_MEASUREMENT_ID, { page_path: pathname });
  }, [pathname, hasConsent]);

  if (!GA_MEASUREMENT_ID || !hasConsent) return null;

  return (
    <>
      <Script
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
      />
      <Script
        id="google-analytics"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_MEASUREMENT_ID}', { page_path: window.location.pathname });
          `,
        }}
      />
    </>
  );
}
