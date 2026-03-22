"use client";

import { useState } from "react";
import {
  ShieldCheck,
  Clock,
  Monitor,
  Award,
  CheckCircle,
  Send,
  CalendarCheck,
  UserCheck,
  FileText,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const STANDARD_FEATURES = [
  "Core technical interview (60 min)",
  "Platform-specific questions",
  "Practical scenario assessment",
  "Written summary report",
  "Pass / Fail recommendation",
  "Delivered within 48 hours",
];

const ADVANCED_FEATURES = [
  "Everything in Standard, plus:",
  "Extended deep-dive interview (90 min)",
  "Live troubleshooting exercise",
  "Multi-platform cross-referencing",
  "Detailed scoring matrix",
  "Video recording of session",
  "Competency gap analysis",
  "Delivered within 48 hours",
];

const STEPS = [
  {
    step: 1,
    icon: Send,
    title: "Submit Request",
    description:
      "Fill in the candidate details and choose your screening level. We handle the rest.",
  },
  {
    step: 2,
    icon: CalendarCheck,
    title: "Schedule Assessment",
    description:
      "We coordinate directly with the candidate to book a convenient assessment slot.",
  },
  {
    step: 3,
    icon: UserCheck,
    title: "Engineer Conducts Interview",
    description:
      "A chartered engineer assesses the candidate against real-world scenarios for the role.",
  },
  {
    step: 4,
    icon: FileText,
    title: "Receive Report",
    description:
      "You receive a detailed technical report with scores, recommendations, and next steps.",
  },
];

const TRUST_ITEMS = [
  { icon: Award, label: "Assessed by Chartered Engineers" },
  { icon: Monitor, label: "20+ Platforms Covered" },
  { icon: Clock, label: "48hr Turnaround" },
];

export default function ScreeningPage() {
  const [form, setForm] = useState({
    candidateName: "",
    candidateEmail: "",
    candidatePhone: "",
    roleTitle: "",
    screeningType: "standard",
    notes: "",
    gdprConsent: false,
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) {
    const target = e.target;
    const value =
      target instanceof HTMLInputElement && target.type === "checkbox"
        ? target.checked
        : target.value;
    setForm((prev) => ({ ...prev, [target.name]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.gdprConsent) {
      toast.error("You must consent to data processing to continue.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/screening/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Something went wrong.");
        return;
      }
      toast.success("Screening order submitted successfully!");
      setSubmitted(true);
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="bg-[#02012B]">
      {/* Hero */}
      <section className="relative overflow-hidden py-20 sm:py-28">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
        <div className="relative mx-auto max-w-5xl px-6 text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#4540DB]/30 bg-[#4540DB]/10 px-4 py-1.5">
            <ShieldCheck className="size-4 text-[#00D4FF]" />
            <span className="text-sm font-medium text-[#00D4FF]">
              Technical Screening Service
            </span>
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
            Verify Technical Ability{" "}
            <span className="text-[#00D4FF]">Before You Hire</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-400">
            Our chartered engineers conduct rigorous technical assessments
            across PLC, SCADA, robotics, and controls platforms. Know exactly
            what you are getting before you commit.
          </p>
        </div>
      </section>

      {/* Trust bar */}
      <section className="border-y border-white/[0.06] bg-white/[0.02] py-6">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-center gap-8 px-6">
          {TRUST_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.label} className="flex items-center gap-2">
                <Icon className="size-5 text-[#00D4FF]" />
                <span className="text-sm font-medium text-gray-300">
                  {item.label}
                </span>
              </div>
            );
          })}
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-20">
        <div className="mx-auto max-w-5xl px-6">
          <h2 className="mb-4 text-center text-3xl font-bold text-white">
            Choose Your Screening Level
          </h2>
          <p className="mx-auto mb-12 max-w-2xl text-center text-gray-400">
            Both packages include a comprehensive written report and are
            conducted by engineers with real-world experience in the relevant
            platform.
          </p>

          <div className="grid gap-8 md:grid-cols-2">
            {/* Standard */}
            <div className="relative rounded-2xl border border-white/[0.08] bg-white/[0.03] p-8 backdrop-blur-sm">
              <h3 className="text-xl font-semibold text-white">Standard</h3>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-4xl font-bold text-white">&pound;150</span>
                <span className="text-gray-400">/ candidate</span>
              </div>
              <p className="mt-3 text-sm text-gray-400">
                Ideal for confirming core competency on a single platform.
              </p>
              <ul className="mt-6 space-y-3">
                {STANDARD_FEATURES.map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <CheckCircle className="mt-0.5 size-4 shrink-0 text-[#4540DB]" />
                    <span className="text-sm text-gray-300">{f}</span>
                  </li>
                ))}
              </ul>
              <a href="#order-form">
                <Button className="mt-8 w-full bg-white/[0.08] text-white hover:bg-white/[0.14]">
                  Order Standard Screening
                </Button>
              </a>
            </div>

            {/* Advanced */}
            <div className="relative rounded-2xl border border-[#4540DB]/40 bg-[#4540DB]/[0.06] p-8 backdrop-blur-sm">
              <div className="absolute -top-3 right-6 rounded-full bg-[#4540DB] px-3 py-0.5 text-xs font-semibold text-white">
                Most Popular
              </div>
              <h3 className="text-xl font-semibold text-white">Advanced</h3>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-4xl font-bold text-white">&pound;250</span>
                <span className="text-gray-400">/ candidate</span>
              </div>
              <p className="mt-3 text-sm text-gray-400">
                In-depth assessment with live exercises and video recording.
              </p>
              <ul className="mt-6 space-y-3">
                {ADVANCED_FEATURES.map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <CheckCircle className="mt-0.5 size-4 shrink-0 text-[#00D4FF]" />
                    <span className="text-sm text-gray-300">{f}</span>
                  </li>
                ))}
              </ul>
              <a href="#order-form">
                <Button className="mt-8 w-full bg-[#4540DB] text-white hover:bg-[#3632b0]">
                  Order Advanced Screening
                </Button>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="border-t border-white/[0.06] py-20">
        <div className="mx-auto max-w-5xl px-6">
          <h2 className="mb-12 text-center text-3xl font-bold text-white">
            How It Works
          </h2>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((step) => {
              const Icon = step.icon;
              return (
                <div key={step.step} className="text-center">
                  <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-xl bg-[#4540DB]/20">
                    <Icon className="size-6 text-[#4540DB]" />
                  </div>
                  <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-[#00D4FF]">
                    Step {step.step}
                  </div>
                  <h3 className="mb-2 text-lg font-semibold text-white">
                    {step.title}
                  </h3>
                  <p className="text-sm text-gray-400">{step.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Order Form */}
      <section
        id="order-form"
        className="border-t border-white/[0.06] py-20"
      >
        <div className="mx-auto max-w-2xl px-6">
          <h2 className="mb-2 text-center text-3xl font-bold text-white">
            Order a Screening
          </h2>
          <p className="mb-10 text-center text-gray-400">
            Submit the candidate details below and we will be in touch within
            one working day to schedule the assessment.
          </p>

          {submitted ? (
            <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-10 text-center">
              <CheckCircle className="mx-auto mb-4 size-12 text-emerald-400" />
              <h3 className="text-xl font-semibold text-white">
                Order Received
              </h3>
              <p className="mt-2 text-gray-400">
                We will be in touch shortly to schedule the assessment. A
                confirmation email has been sent.
              </p>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="space-y-5 rounded-2xl border border-white/[0.08] bg-white/[0.03] p-8 backdrop-blur-sm"
            >
              {/* Candidate Name */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-300">
                  Candidate Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  name="candidateName"
                  required
                  value={form.candidateName}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-white/[0.1] bg-white/[0.05] px-4 py-2.5 text-white placeholder-gray-500 outline-none focus:border-[#4540DB] focus:ring-1 focus:ring-[#4540DB]"
                  placeholder="Full name of the candidate"
                />
              </div>

              {/* Email */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-300">
                  Candidate Email <span className="text-red-400">*</span>
                </label>
                <input
                  type="email"
                  name="candidateEmail"
                  required
                  value={form.candidateEmail}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-white/[0.1] bg-white/[0.05] px-4 py-2.5 text-white placeholder-gray-500 outline-none focus:border-[#4540DB] focus:ring-1 focus:ring-[#4540DB]"
                  placeholder="candidate@example.com"
                />
              </div>

              {/* Phone */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-300">
                  Candidate Phone
                </label>
                <input
                  type="tel"
                  name="candidatePhone"
                  value={form.candidatePhone}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-white/[0.1] bg-white/[0.05] px-4 py-2.5 text-white placeholder-gray-500 outline-none focus:border-[#4540DB] focus:ring-1 focus:ring-[#4540DB]"
                  placeholder="+44 7XXX XXXXXX"
                />
              </div>

              {/* Role Applied For */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-300">
                  Role Applied For <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  name="roleTitle"
                  required
                  value={form.roleTitle}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-white/[0.1] bg-white/[0.05] px-4 py-2.5 text-white placeholder-gray-500 outline-none focus:border-[#4540DB] focus:ring-1 focus:ring-[#4540DB]"
                  placeholder="e.g. Siemens PLC Engineer"
                />
              </div>

              {/* Screening Type */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-300">
                  Screening Type <span className="text-red-400">*</span>
                </label>
                <select
                  name="screeningType"
                  value={form.screeningType}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-white/[0.1] bg-white/[0.05] px-4 py-2.5 text-white outline-none focus:border-[#4540DB] focus:ring-1 focus:ring-[#4540DB]"
                >
                  <option value="standard" className="bg-[#02012B]">
                    Standard (&pound;150)
                  </option>
                  <option value="advanced" className="bg-[#02012B]">
                    Advanced (&pound;250)
                  </option>
                </select>
              </div>

              {/* Notes */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-300">
                  Additional Notes
                </label>
                <textarea
                  name="notes"
                  rows={4}
                  value={form.notes}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-white/[0.1] bg-white/[0.05] px-4 py-2.5 text-white placeholder-gray-500 outline-none focus:border-[#4540DB] focus:ring-1 focus:ring-[#4540DB]"
                  placeholder="Any specific platforms, topics, or areas to focus on..."
                />
              </div>

              {/* GDPR Consent */}
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  name="gdprConsent"
                  id="gdprConsent"
                  checked={form.gdprConsent}
                  onChange={handleChange}
                  className="mt-1 size-4 rounded border-gray-600 bg-white/[0.05] accent-[#4540DB]"
                />
                <label
                  htmlFor="gdprConsent"
                  className="text-sm text-gray-400"
                >
                  I confirm I have lawful authority to submit this candidate for
                  screening and consent to OSCABE processing the provided data
                  in accordance with our{" "}
                  <a
                    href="/privacy"
                    className="text-[#00D4FF] underline"
                  >
                    Privacy Policy
                  </a>
                  . <span className="text-red-400">*</span>
                </label>
              </div>

              <Button
                type="submit"
                disabled={submitting}
                className="w-full bg-[#4540DB] py-3 text-white hover:bg-[#3632b0] disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Submit Screening Order"
                )}
              </Button>
            </form>
          )}
        </div>
      </section>
    </div>
  );
}
