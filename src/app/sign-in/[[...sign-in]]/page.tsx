"use client";

import { useState } from "react";
import { SignIn } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { Building2, UserCheck, Handshake, ShieldCheck, type LucideIcon } from "lucide-react";
import { Logo } from "@/components/shared/logo";

type PortalType = "employer" | "candidate" | "agency" | "employee";

const PORTALS: Array<{
  id: PortalType;
  label: string;
  description: string;
  icon: LucideIcon;
  color: string;
}> = [
  { id: "employer", label: "Employer", description: "Hire automation engineers", icon: Building2, color: "#4540DB" },
  { id: "candidate", label: "Candidate", description: "Find your next role", icon: UserCheck, color: "#00D4FF" },
  { id: "agency", label: "Agency", description: "Partner with OSCABE", icon: Handshake, color: "#8B5CF6" },
  { id: "employee", label: "Employee", description: "OSCABE/Wartens email only", icon: ShieldCheck, color: "#22C55E" },
];

export default function SignInPage() {
  const [selectedPortal, setSelectedPortal] = useState<PortalType | null>(null);

  const accent = PORTALS.find((p) => p.id === selectedPortal)?.color || "#4540DB";

  function handleSelect(portalId: PortalType) {
    setSelectedPortal(portalId);
    // Store selection so dashboard can auto-onboard
    localStorage.setItem("oscabe-portal-selection", portalId);
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#02012B] relative overflow-hidden px-4">
      <div className="pointer-events-none absolute -top-40 -left-40 h-[500px] w-[500px] rounded-full blur-[120px]" style={{ background: `${accent}15` }} />
      <div className="pointer-events-none absolute -bottom-40 -right-40 h-[400px] w-[400px] rounded-full bg-[#00D4FF]/10 blur-[120px]" />

      {!selectedPortal ? (
        <div className="relative z-10 w-full max-w-lg">
          <div className="mb-8 flex flex-col items-center text-center">
            <Logo variant="light" size="lg" />
            <h1 className="mt-6 text-2xl font-extrabold text-white">Sign In to OSCABE</h1>
            <p className="mt-2 text-sm text-gray-400">Select your portal to continue</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {PORTALS.map((portal) => (
              <button
                key={portal.id}
                onClick={() => handleSelect(portal.id)}
                className="group flex flex-col items-center gap-3 rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6 text-center backdrop-blur-sm transition-all duration-200 hover:border-white/[0.2] hover:bg-white/[0.06]"
              >
                <div
                  className="flex h-12 w-12 items-center justify-center rounded-xl transition-transform group-hover:scale-110"
                  style={{ background: `${portal.color}20` }}
                >
                  <portal.icon className="h-6 w-6" style={{ color: portal.color }} />
                </div>
                <div>
                  <p className="font-bold text-white">{portal.label}</p>
                  <p className="mt-0.5 text-[11px] text-gray-500">{portal.description}</p>
                </div>
              </button>
            ))}
          </div>

          <p className="mt-6 text-center text-xs text-gray-600">
            New to OSCABE?{" "}
            <a href="/sign-up" className="text-[#00D4FF] hover:underline">Create an account</a>
          </p>
        </div>
      ) : (
        <div className="relative z-10 flex w-full max-w-md flex-col items-center">
          <Logo variant="light" size="md" />
          <div className="mt-4 inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-semibold uppercase tracking-wider" style={{ borderColor: `${accent}40`, background: `${accent}15`, color: accent }}>
            {(() => { const P = PORTALS.find((p) => p.id === selectedPortal); return P ? <P.icon className="h-3.5 w-3.5" /> : null; })()}
            {PORTALS.find((p) => p.id === selectedPortal)?.label} Portal
          </div>

          <div className="mt-6 flex w-full justify-center [&_.cl-card]:border [&_.cl-card]:border-white/10 [&_.cl-card]:bg-[#0a0a2e] [&_.cl-card]:shadow-2xl">
            <SignIn
              appearance={{
                baseTheme: dark,
                variables: { colorPrimary: accent, borderRadius: "0.75rem" },
              }}
              forceRedirectUrl="/dashboard"
            />
          </div>

          <button
            onClick={() => setSelectedPortal(null)}
            className="mt-4 text-center text-sm text-gray-500 hover:text-white transition-colors"
          >
            Back to portal selection
          </button>
        </div>
      )}
    </div>
  );
}
