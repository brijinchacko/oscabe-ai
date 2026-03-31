"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
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
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const accent = PORTALS.find((p) => p.id === selectedPortal)?.color || "#4540DB";

  function handleSelect(portalId: PortalType) {
    setSelectedPortal(portalId);
    localStorage.setItem("oscabe-portal-selection", portalId);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await signIn("credentials", {
        email,
        password,
        redirectTo: "/dashboard",
      });
    } catch (err: unknown) {
      setError("Invalid email or password.");
      setLoading(false);
    }
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

          <form onSubmit={handleSubmit} className="mt-6 w-full space-y-4 rounded-2xl border border-white/10 bg-[#0a0a2e] p-6 shadow-2xl">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300">Email</label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder-gray-500 outline-none focus:border-white/30 focus:ring-1 focus:ring-white/20"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300">Password</label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder-gray-500 outline-none focus:border-white/30 focus:ring-1 focus:ring-white/20"
                placeholder="Your password"
              />
            </div>

            {error && (
              <p className="text-sm text-red-400">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className={`w-full rounded-lg py-2.5 text-sm font-semibold text-white transition-all ${loading ? "opacity-60 cursor-not-allowed" : "hover:opacity-90"}`}
              style={{ background: accent }}
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>

            <p className="text-center text-xs text-gray-500">
              Don&apos;t have an account?{" "}
              <a href="/sign-up" className="text-[#00D4FF] hover:underline">Sign up</a>
            </p>
          </form>

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
