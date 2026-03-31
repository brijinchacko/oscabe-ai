"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Loader2 } from "lucide-react";
import { Logo } from "@/components/shared/logo";

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [statusText, setStatusText] = useState("Loading your dashboard...");
  const [error, setError] = useState(false);

  useEffect(() => {
    if (status === "loading") return;
    if (status !== "authenticated") {
      router.replace("/sign-in");
      return;
    }

    async function route() {
      try {
        const meRes = await fetch("/api/user/me");

        if (!meRes.ok) {
          setError(true);
          setStatusText("Failed to load account. Please try again.");
          return;
        }

        const data = await meRes.json();

        if (data.hasCompletedOnboarding) {
          redirectByRole(data.role);
          return;
        }

        setStatusText("Setting up your portal...");
        await onboardUser(data);
      } catch (err) {
        console.error("Dashboard routing error:", err);
        setError(true);
        setStatusText("Something went wrong. Please try again.");
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
          companyName: role === "EMPLOYER" ? (session?.user?.name || "My Company") : undefined,
          agencyName: role === "AGENCY" ? (session?.user?.name || "My Agency") : undefined,
        }),
      });

      localStorage.removeItem("oscabe-portal-selection");

      if (res.ok) {
        const data = await res.json();
        redirectByRole(data.role);
      } else {
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
  }, [status, router, session]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#02012B] relative overflow-hidden">
      <div className="pointer-events-none absolute -top-40 -left-40 h-[500px] w-[500px] rounded-full bg-[#4540DB]/15 blur-[120px]" />
      <div className="text-center relative z-10">
        <Logo variant="light" size="lg" />
        <div className="mt-8 flex flex-col items-center gap-3">
          {!error && <Loader2 className="h-5 w-5 animate-spin text-[#4540DB]" />}
          <p className="text-sm text-gray-400">{statusText}</p>
          {error && (
            <div className="mt-4 flex gap-3">
              <button
                onClick={() => { setError(false); setStatusText("Retrying..."); window.location.reload(); }}
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
