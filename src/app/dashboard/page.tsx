"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { Loader2 } from "lucide-react";
import { Logo } from "@/components/shared/logo";

export default function DashboardPage() {
  const { isLoaded, isSignedIn, user: clerkUser } = useUser();
  const router = useRouter();
  const [status, setStatus] = useState("Loading your dashboard...");
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!isLoaded) return;
    if (!isSignedIn) {
      router.replace("/sign-in");
      return;
    }

    async function route() {
      try {
        // /api/user/me auto-creates user if not in DB
        const meRes = await fetch("/api/user/me");

        if (!meRes.ok) {
          setError(true);
          setStatus("Failed to load account. Please try again.");
          return;
        }

        const data = await meRes.json();

        if (data.hasCompletedOnboarding) {
          redirectByRole(data.role);
          return;
        }

        // Not onboarded yet - use portal selection from localStorage
        setStatus("Setting up your portal...");
        await onboardUser(data);
      } catch (err) {
        console.error("Dashboard routing error:", err);
        setError(true);
        setStatus("Something went wrong. Please try again.");
      }
    }

    async function onboardUser(userData: { role: string }) {
      const portalSelection = localStorage.getItem("oscabe-portal-selection") || "candidate";
      const roleMap: Record<string, string> = {
        employer: "EMPLOYER",
        candidate: "CANDIDATE",
        agency: "AGENCY",
        employee: "RECRUITER",
      };
      const role = roleMap[portalSelection] || "CANDIDATE";

      const res = await fetch("/api/user/onboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role,
          companyName: role === "EMPLOYER" ? (clerkUser?.fullName || "My Company") : undefined,
          agencyName: role === "AGENCY" ? (clerkUser?.fullName || "My Agency") : undefined,
        }),
      });

      localStorage.removeItem("oscabe-portal-selection");

      if (res.ok) {
        const data = await res.json();
        redirectByRole(data.role);
      } else {
        // Onboard failed, but user exists - redirect based on current role
        redirectByRole(userData.role || role);
      }
    }

    function redirectByRole(role: string) {
      switch (role) {
        case "ADMIN":
        case "RECRUITER":
          router.replace("/crm");
          break;
        case "EMPLOYER":
          router.replace("/portal/employer");
          break;
        case "CANDIDATE":
          router.replace("/portal/candidate");
          break;
        case "AGENCY":
          router.replace("/portal/agency");
          break;
        default:
          router.replace("/portal/candidate");
      }
    }

    route();
  }, [isLoaded, isSignedIn, router, clerkUser]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#02012B] relative overflow-hidden">
      <div className="pointer-events-none absolute -top-40 -left-40 h-[500px] w-[500px] rounded-full bg-[#4540DB]/15 blur-[120px]" />
      <div className="text-center relative z-10">
        <Logo variant="light" size="lg" />
        <div className="mt-8 flex flex-col items-center gap-3">
          {!error && <Loader2 className="h-5 w-5 animate-spin text-[#4540DB]" />}
          <p className="text-sm text-gray-400">{status}</p>
          {error && (
            <div className="mt-4 flex gap-3">
              <button
                onClick={() => { setError(false); setStatus("Retrying..."); window.location.reload(); }}
                className="rounded-lg bg-[#4540DB] px-6 py-2 text-sm font-medium text-white hover:bg-[#4540DB]/80"
              >
                Try Again
              </button>
              <button
                onClick={() => router.replace("/sign-in")}
                className="rounded-lg border border-white/20 px-6 py-2 text-sm font-medium text-gray-400 hover:bg-white/10 hover:text-white"
              >
                Back to Sign In
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
