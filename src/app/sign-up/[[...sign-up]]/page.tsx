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
  { id: "employee", label: "Employee", description: "OSCABE team member", icon: ShieldCheck, color: "#22C55E" },
];

export default function SignUpPage() {
  const [selectedPortal, setSelectedPortal] = useState<PortalType | null>(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [agencyName, setAgencyName] = useState("");
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

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);

    const roleMap: Record<string, string> = {
      employer: "EMPLOYER",
      candidate: "CANDIDATE",
      agency: "AGENCY",
      employee: "RECRUITER",
    };

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName,
          lastName,
          email,
          password,
          role: roleMap[selectedPortal!],
          companyName: selectedPortal === "employer" ? companyName : undefined,
          agencyName: selectedPortal === "agency" ? agencyName : undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "Registration failed. Please try again.");
        setLoading(false);
        return;
      }

      // Auto-login after registration
      await signIn("credentials", {
        email,
        password,
        redirectTo: "/dashboard",
      });
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  const inputClass =
    "mt-1 block w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder-gray-500 outline-none focus:border-white/30 focus:ring-1 focus:ring-white/20";

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#02012B] relative overflow-hidden px-4">
      <div className="pointer-events-none absolute -top-40 -left-40 h-[500px] w-[500px] rounded-full blur-[120px]" style={{ background: `${accent}15` }} />
      <div className="pointer-events-none absolute -bottom-40 -right-40 h-[400px] w-[400px] rounded-full bg-[#00D4FF]/10 blur-[120px]" />

      {!selectedPortal ? (
        <div className="relative z-10 w-full max-w-lg">
          <div className="mb-8 flex flex-col items-center text-center">
            <Logo variant="light" size="lg" />
            <h1 className="mt-6 text-2xl font-extrabold text-white">Create Your Account</h1>
            <p className="mt-2 text-sm text-gray-400">Select how you want to use OSCABE</p>
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
            Already have an account?{" "}
            <a href="/sign-in" className="text-[#00D4FF] hover:underline">Sign in</a>
          </p>
        </div>
      ) : (
        <div className="relative z-10 w-full max-w-md">
          <div className="mb-6 flex flex-col items-center text-center">
            <Logo variant="light" size="md" />
            <div className="mt-4 inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-semibold uppercase tracking-wider" style={{ borderColor: `${accent}40`, background: `${accent}15`, color: accent }}>
              {(() => { const P = PORTALS.find((p) => p.id === selectedPortal); return P ? <P.icon className="h-3.5 w-3.5" /> : null; })()}
              {PORTALS.find((p) => p.id === selectedPortal)?.label} Portal
            </div>
          </div>

          <form onSubmit={handleSubmit} className="w-full space-y-4 rounded-2xl border border-white/10 bg-[#0a0a2e] p-6 shadow-2xl">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-300">First Name</label>
                <input
                  id="firstName"
                  type="text"
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className={inputClass}
                  placeholder="First name"
                />
              </div>
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-300">Last Name</label>
                <input
                  id="lastName"
                  type="text"
                  required
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className={inputClass}
                  placeholder="Last name"
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300">Email</label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputClass}
                placeholder="you@example.com"
              />
              {selectedPortal === "employee" && (
                <p className="mt-1 text-[11px] text-amber-400">Must be an @oscabe.com or @wartens.com email</p>
              )}
            </div>

            {selectedPortal === "employer" && (
              <div>
                <label htmlFor="companyName" className="block text-sm font-medium text-gray-300">Company Name</label>
                <input
                  id="companyName"
                  type="text"
                  required
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className={inputClass}
                  placeholder="Your company"
                />
              </div>
            )}

            {selectedPortal === "agency" && (
              <div>
                <label htmlFor="agencyName" className="block text-sm font-medium text-gray-300">Agency Name</label>
                <input
                  id="agencyName"
                  type="text"
                  required
                  value={agencyName}
                  onChange={(e) => setAgencyName(e.target.value)}
                  className={inputClass}
                  placeholder="Your agency"
                />
              </div>
            )}

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300">Password</label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={inputClass}
                placeholder="Min. 6 characters"
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300">Confirm Password</label>
              <input
                id="confirmPassword"
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={inputClass}
                placeholder="Confirm your password"
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
              {loading ? "Creating account..." : "Register"}
            </button>

            <p className="text-center text-xs text-gray-500">
              Already have an account?{" "}
              <a href="/sign-in" className="text-[#00D4FF] hover:underline">Sign in</a>
            </p>
          </form>

          <button
            onClick={() => setSelectedPortal(null)}
            className="mt-4 block w-full text-center text-sm text-gray-500 hover:text-white transition-colors"
          >
            Back to portal selection
          </button>
        </div>
      )}
    </div>
  );
}
