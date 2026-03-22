"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Gift,
  Send,
  UserCheck,
  Banknote,
  CheckCircle2,
  Loader2,
  ShieldCheck,
  Users,
  Award,
} from "lucide-react";
import { toast } from "sonner";

const STEPS = [
  {
    icon: Send,
    title: "Submit Referral",
    description: "Fill in the form below with your details and the candidate you're referring.",
  },
  {
    icon: UserCheck,
    title: "We Contact & Verify",
    description:
      "Our team reaches out to the candidate and assesses their suitability for current roles.",
  },
  {
    icon: Banknote,
    title: "You Earn £200",
    description:
      "Once the candidate is successfully placed, you receive £200 — no cap on referrals.",
  },
];

const KEY_DETAILS = [
  "£200 per successful placement",
  "No limit on referrals",
  "Paid within 30 days of placement",
  "Referral tracked via unique code",
];

const TRUST_BADGES = [
  { icon: ShieldCheck, label: "Chartered Engineer Led" },
  { icon: Users, label: "500+ Engineers" },
  { icon: Award, label: "Startup of Year 2025" },
];

export default function ReferPage() {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [referralCode, setReferralCode] = useState("");
  const [consent, setConsent] = useState(false);

  const [form, setForm] = useState({
    referrerName: "",
    referrerEmail: "",
    referrerPhone: "",
    candidateName: "",
    candidateEmail: "",
    candidatePhone: "",
    candidateRole: "",
    notes: "",
  });

  function updateField(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!consent) {
      toast.error("Please agree to the GDPR consent before submitting.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/referrals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to submit referral");
      }

      const data = await res.json();
      setReferralCode(data.referralCode);
      setSubmitted(true);
      toast.success("Referral submitted successfully!");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Something went wrong";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#02012B]">
      {/* Hero */}
      <section className="relative overflow-hidden px-4 pb-16 pt-24 sm:px-6 lg:px-8">
        <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/10 via-transparent to-transparent" />
        <div className="relative mx-auto max-w-4xl text-center">
          <div className="mx-auto mb-6 flex size-20 items-center justify-center rounded-2xl bg-emerald-500/20 ring-1 ring-emerald-500/30">
            <Gift className="size-10 text-emerald-400" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
            Refer &amp; Earn{" "}
            <span className="text-emerald-400">£200</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-400">
            Know a talented automation engineer? Refer them to OSCABE and earn £200 for every
            successful placement.
          </p>
        </div>
      </section>

      {/* How it works */}
      <section className="px-4 pb-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <h2 className="mb-12 text-center text-2xl font-bold text-white">How It Works</h2>
          <div className="grid gap-8 md:grid-cols-3">
            {STEPS.map((step, i) => {
              const Icon = step.icon;
              return (
                <div
                  key={i}
                  className="relative rounded-xl border border-white/[0.08] bg-white/[0.03] p-6 text-center backdrop-blur"
                >
                  <div className="absolute -top-3 left-1/2 flex size-8 -translate-x-1/2 items-center justify-center rounded-full bg-emerald-500 text-sm font-bold text-white">
                    {i + 1}
                  </div>
                  <div className="mx-auto mb-4 mt-2 flex size-14 items-center justify-center rounded-xl bg-emerald-500/10">
                    <Icon className="size-7 text-emerald-400" />
                  </div>
                  <h3 className="mb-2 text-lg font-semibold text-white">{step.title}</h3>
                  <p className="text-sm text-gray-400">{step.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Key details */}
      <section className="px-4 pb-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-8">
            <h3 className="mb-6 text-center text-xl font-bold text-white">Key Details</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              {KEY_DETAILS.map((detail) => (
                <div key={detail} className="flex items-center gap-3">
                  <CheckCircle2 className="size-5 shrink-0 text-emerald-400" />
                  <span className="text-gray-300">{detail}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Form or Success */}
      <section id="form" className="px-4 pb-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl">
          {submitted ? (
            <div className="rounded-xl border border-emerald-500/20 bg-white/[0.03] p-8 text-center backdrop-blur">
              <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-emerald-500/20">
                <CheckCircle2 className="size-8 text-emerald-400" />
              </div>
              <h3 className="mb-2 text-2xl font-bold text-white">Referral Submitted!</h3>
              <p className="mb-6 text-gray-400">
                Thank you for your referral. We&apos;ll be in touch with your candidate shortly.
              </p>
              <div className="mb-6 rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-6 py-4">
                <p className="text-sm text-gray-400">Your Referral Code</p>
                <p className="mt-1 text-2xl font-bold tracking-wider text-emerald-400">
                  {referralCode}
                </p>
              </div>
              <p className="text-sm text-gray-400">
                Keep this code to track the status of your referral.
              </p>
              <button
                onClick={() => {
                  setSubmitted(false);
                  setForm({
                    referrerName: "",
                    referrerEmail: "",
                    referrerPhone: "",
                    candidateName: "",
                    candidateEmail: "",
                    candidatePhone: "",
                    candidateRole: "",
                    notes: "",
                  });
                  setConsent(false);
                }}
                className="mt-6 rounded-lg bg-emerald-500 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-emerald-600"
              >
                Submit Another Referral
              </button>
            </div>
          ) : (
            <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-8 backdrop-blur">
              <h3 className="mb-6 text-center text-2xl font-bold text-white">
                Submit Your Referral
              </h3>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Referrer details */}
                <div>
                  <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-emerald-400">
                    Your Details
                  </h4>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-1.5 block text-sm text-gray-400">
                        Your Name <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={form.referrerName}
                        onChange={(e) => updateField("referrerName", e.target.value)}
                        className="w-full rounded-lg border border-white/[0.08] bg-white/[0.05] px-4 py-2.5 text-white placeholder-gray-500 outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50"
                        placeholder="John Smith"
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm text-gray-400">
                        Your Email <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="email"
                        required
                        value={form.referrerEmail}
                        onChange={(e) => updateField("referrerEmail", e.target.value)}
                        className="w-full rounded-lg border border-white/[0.08] bg-white/[0.05] px-4 py-2.5 text-white placeholder-gray-500 outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50"
                        placeholder="john@example.com"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="mb-1.5 block text-sm text-gray-400">Your Phone</label>
                      <input
                        type="tel"
                        value={form.referrerPhone}
                        onChange={(e) => updateField("referrerPhone", e.target.value)}
                        className="w-full rounded-lg border border-white/[0.08] bg-white/[0.05] px-4 py-2.5 text-white placeholder-gray-500 outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50"
                        placeholder="+44 7xxx xxx xxx"
                      />
                    </div>
                  </div>
                </div>

                {/* Candidate details */}
                <div>
                  <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-emerald-400">
                    Candidate Details
                  </h4>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-1.5 block text-sm text-gray-400">
                        Candidate Name <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={form.candidateName}
                        onChange={(e) => updateField("candidateName", e.target.value)}
                        className="w-full rounded-lg border border-white/[0.08] bg-white/[0.05] px-4 py-2.5 text-white placeholder-gray-500 outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50"
                        placeholder="Jane Doe"
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm text-gray-400">
                        Candidate Email <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="email"
                        required
                        value={form.candidateEmail}
                        onChange={(e) => updateField("candidateEmail", e.target.value)}
                        className="w-full rounded-lg border border-white/[0.08] bg-white/[0.05] px-4 py-2.5 text-white placeholder-gray-500 outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50"
                        placeholder="jane@example.com"
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm text-gray-400">Candidate Phone</label>
                      <input
                        type="tel"
                        value={form.candidatePhone}
                        onChange={(e) => updateField("candidatePhone", e.target.value)}
                        className="w-full rounded-lg border border-white/[0.08] bg-white/[0.05] px-4 py-2.5 text-white placeholder-gray-500 outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50"
                        placeholder="+44 7xxx xxx xxx"
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm text-gray-400">
                        Primary Skill / Role
                      </label>
                      <input
                        type="text"
                        value={form.candidateRole}
                        onChange={(e) => updateField("candidateRole", e.target.value)}
                        className="w-full rounded-lg border border-white/[0.08] bg-white/[0.05] px-4 py-2.5 text-white placeholder-gray-500 outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50"
                        placeholder="e.g. PLC Programmer, SCADA Engineer"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="mb-1.5 block text-sm text-gray-400">Notes</label>
                      <textarea
                        value={form.notes}
                        onChange={(e) => updateField("notes", e.target.value)}
                        rows={3}
                        className="w-full rounded-lg border border-white/[0.08] bg-white/[0.05] px-4 py-2.5 text-white placeholder-gray-500 outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50"
                        placeholder="Any additional information about the candidate..."
                      />
                    </div>
                  </div>
                </div>

                {/* GDPR Consent */}
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="gdpr"
                    checked={consent}
                    onChange={(e) => setConsent(e.target.checked)}
                    className="mt-1 size-4 rounded border-gray-600 bg-white/5 accent-emerald-500"
                  />
                  <label htmlFor="gdpr" className="text-sm text-gray-400">
                    I confirm that the candidate has given their consent to share their details with
                    OSCABE for recruitment purposes, in accordance with GDPR. I understand that OSCABE
                    will process this data as described in the{" "}
                    <Link href="/privacy" className="text-emerald-400 underline">
                      Privacy Policy
                    </Link>
                    . <span className="text-red-400">*</span>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className={`flex w-full items-center justify-center gap-2 rounded-lg px-6 py-3 text-sm font-semibold text-white transition-colors ${
                    loading
                      ? "cursor-not-allowed bg-emerald-500/50"
                      : "bg-emerald-500 hover:bg-emerald-600"
                  }`}
                >
                  {loading ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="size-4" />
                      Submit Referral
                    </>
                  )}
                </button>
              </form>
            </div>
          )}
        </div>
      </section>

      {/* Track referrals CTA */}
      <section className="px-4 pb-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-gray-400">
            Already referred someone?{" "}
            <Link
              href="/portal/candidate/referrals"
              className="font-medium text-emerald-400 underline transition-colors hover:text-emerald-300"
            >
              Track your referrals
            </Link>
          </p>
        </div>
      </section>

      {/* Trust badges */}
      <section className="border-t border-white/[0.08] px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-center gap-8">
          {TRUST_BADGES.map((badge) => {
            const Icon = badge.icon;
            return (
              <div key={badge.label} className="flex items-center gap-2 text-gray-500">
                <Icon className="size-5" />
                <span className="text-sm">{badge.label}</span>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
