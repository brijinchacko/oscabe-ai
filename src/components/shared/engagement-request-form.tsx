"use client";

import { useState } from "react";
import { Loader2, CheckCircle2 } from "lucide-react";

interface EngagementRequestFormProps {
  engineerSlug?: string;
  source?: string;
  defaultType?: "engineer-request" | "general-requirement" | "call-request";
  compact?: boolean;
}

export function EngagementRequestForm({
  engineerSlug,
  source,
  defaultType = "engineer-request",
  compact = false,
}: EngagementRequestFormProps) {
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("submitting");
    setError(null);

    const form = e.currentTarget;
    const data = new FormData(form);

    try {
      const res = await fetch("/api/engagement-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: defaultType,
          engineerSlug: engineerSlug ?? undefined,
          companyName: String(data.get("companyName") || ""),
          contactName: String(data.get("contactName") || ""),
          contactEmail: String(data.get("contactEmail") || ""),
          contactPhone: String(data.get("contactPhone") || "") || undefined,
          roleTitle: String(data.get("roleTitle") || "") || undefined,
          platforms: String(data.get("platforms") || "") || undefined,
          startDate: String(data.get("startDate") || "") || undefined,
          duration: String(data.get("duration") || "") || undefined,
          message: String(data.get("message") || "") || undefined,
          source: source ?? (typeof window !== "undefined" ? window.location.pathname : undefined),
        }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({ error: "Submission failed" }));
        throw new Error(body.error ?? "Submission failed");
      }

      setStatus("success");
      form.reset();
    } catch (e) {
      setStatus("error");
      setError(e instanceof Error ? e.message : "Submission failed");
    }
  }

  if (status === "success") {
    return (
      <div className="rounded-2xl border border-emerald-400/30 bg-emerald-400/10 p-6 text-center">
        <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-400" />
        <h3 className="mt-3 text-lg font-semibold text-white">Request received</h3>
        <p className="mt-1 text-sm text-gray-300">
          We will respond within one working day. For urgent enquiries, call us on +44 1908 040 460.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={`space-y-${compact ? "3" : "4"}`}>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field name="companyName" label="Company" required />
        <Field name="contactName" label="Your name" required />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field name="contactEmail" label="Work email" type="email" required />
        <Field name="contactPhone" label="Phone (optional)" type="tel" />
      </div>
      <Field name="roleTitle" label="Role / requirement title" placeholder="e.g. Senior Siemens PLC Engineer" />
      <Field
        name="platforms"
        label="Required platforms / skills"
        placeholder="e.g. TIA Portal V18, Safety Integrated, WinCC Advanced"
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <Field name="startDate" label="Preferred start date" type="date" />
        <SelectField
          name="duration"
          label="Duration"
          options={[
            { value: "", label: "Choose..." },
            { value: "short-term", label: "Short-term (1-3 months)" },
            { value: "long-term", label: "Long-term (6+ months)" },
            { value: "part-time", label: "Part-time" },
          ]}
        />
      </div>
      <TextareaField name="message" label="Anything else we should know?" rows={4} />

      {error && (
        <div className="rounded-lg border border-red-400/30 bg-red-400/10 p-3 text-sm text-red-300">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={status === "submitting"}
        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#4540DB] px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-[#4540DB]/25 transition-all hover:bg-[#3733B0] disabled:opacity-60"
      >
        {status === "submitting" ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
        {status === "submitting" ? "Sending..." : "Submit Requirement"}
      </button>
      <p className="text-center text-xs text-gray-500">
        By submitting, you agree to OSCABE&apos;s privacy policy. We will respond within one working day.
      </p>
    </form>
  );
}

function Field({
  name,
  label,
  type = "text",
  required = false,
  placeholder,
}: {
  name: string;
  label: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-gray-400">
        {label}
        {required && <span className="ml-0.5 text-red-400">*</span>}
      </span>
      <input
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2.5 text-sm text-white placeholder:text-gray-600 focus:border-[#4540DB] focus:bg-white/[0.05] focus:outline-none focus:ring-2 focus:ring-[#4540DB]/30"
      />
    </label>
  );
}

function SelectField({
  name,
  label,
  options,
}: {
  name: string;
  label: string;
  options: { value: string; label: string }[];
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-gray-400">{label}</span>
      <select
        name={name}
        className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2.5 text-sm text-white focus:border-[#4540DB] focus:bg-white/[0.05] focus:outline-none focus:ring-2 focus:ring-[#4540DB]/30"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value} className="bg-[#02012B] text-white">
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function TextareaField({
  name,
  label,
  rows = 4,
}: {
  name: string;
  label: string;
  rows?: number;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-gray-400">{label}</span>
      <textarea
        name={name}
        rows={rows}
        className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2.5 text-sm text-white placeholder:text-gray-600 focus:border-[#4540DB] focus:bg-white/[0.05] focus:outline-none focus:ring-2 focus:ring-[#4540DB]/30"
      />
    </label>
  );
}
