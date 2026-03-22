"use client";

import { useEffect, useState } from "react";
import {
  ShieldCheck,
  Plus,
  Loader2,
  CheckCircle,
  Clock,
  PlayCircle,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface ScreeningOrder {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  metadata: string;
}

interface ParsedContent {
  candidateName: string;
  candidateEmail: string;
  roleTitle: string;
  screeningType: string;
  price: number;
  status: string;
  notes?: string;
}

const STATUS_CONFIG: Record<string, { label: string; className: string; icon: React.ElementType }> = {
  ORDERED: {
    label: "Ordered",
    className: "bg-yellow-500/20 text-yellow-400",
    icon: Clock,
  },
  IN_PROGRESS: {
    label: "In Progress",
    className: "bg-blue-500/20 text-blue-400",
    icon: PlayCircle,
  },
  COMPLETED: {
    label: "Completed",
    className: "bg-emerald-500/20 text-emerald-400",
    icon: CheckCircle,
  },
};

export default function EmployerScreeningPage() {
  const [orders, setOrders] = useState<ScreeningOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    candidateName: "",
    candidateEmail: "",
    candidatePhone: "",
    roleTitle: "",
    screeningType: "standard",
    notes: "",
    gdprConsent: false,
  });

  useEffect(() => {
    fetchOrders();
  }, []);

  async function fetchOrders() {
    try {
      const res = await fetch("/api/portal/employer/dashboard");
      if (!res.ok) return;
      // We fetch screening activities separately
      // For now use the activity feed approach
    } catch {
      // Silently handle
    } finally {
      setLoading(false);
    }
  }

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
      toast.error("GDPR consent is required.");
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
        toast.error(data.error || "Failed to submit order.");
        return;
      }
      toast.success("Screening order submitted!");
      setShowForm(false);
      setForm({
        candidateName: "",
        candidateEmail: "",
        candidatePhone: "",
        roleTitle: "",
        screeningType: "standard",
        notes: "",
        gdprConsent: false,
      });

      // Add the new order to the list
      const newOrder: ScreeningOrder = {
        id: data.orderId,
        title: `Screening order: ${form.candidateName} - ${form.roleTitle}`,
        content: JSON.stringify({
          candidateName: form.candidateName,
          candidateEmail: form.candidateEmail,
          roleTitle: form.roleTitle,
          screeningType: form.screeningType,
          price: form.screeningType === "advanced" ? 250 : 150,
          status: "ORDERED",
          notes: form.notes,
        }),
        createdAt: new Date().toISOString(),
        metadata: JSON.stringify({ screeningType: form.screeningType }),
      };
      setOrders((prev) => [newOrder, ...prev]);
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  function parseContent(content: string): ParsedContent | null {
    try {
      return JSON.parse(content);
    } catch {
      return null;
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">
            Technical Screening
          </h1>
          <p className="mt-1 text-sm text-gray-400">
            Order and track technical assessments for your candidates
          </p>
        </div>
        <Button
          onClick={() => setShowForm(!showForm)}
          className="bg-[#4540DB] text-white hover:bg-[#3632b0]"
        >
          {showForm ? (
            <>
              <X className="mr-2 size-4" />
              Cancel
            </>
          ) : (
            <>
              <Plus className="mr-2 size-4" />
              New Screening
            </>
          )}
        </Button>
      </div>

      {/* Order Form */}
      {showForm && (
        <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-6 backdrop-blur-sm">
          <h2 className="mb-4 text-lg font-semibold text-white">
            Order New Screening
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
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
                  placeholder="Full name"
                />
              </div>
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
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-300">
                  Phone
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
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
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
                  <option value="standard" className="bg-[#0a0a2e]">
                    Standard ({"\u00A3"}150)
                  </option>
                  <option value="advanced" className="bg-[#0a0a2e]">
                    Advanced ({"\u00A3"}250)
                  </option>
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-300">
                  Notes
                </label>
                <input
                  type="text"
                  name="notes"
                  value={form.notes}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-white/[0.1] bg-white/[0.05] px-4 py-2.5 text-white placeholder-gray-500 outline-none focus:border-[#4540DB] focus:ring-1 focus:ring-[#4540DB]"
                  placeholder="Specific areas to focus on..."
                />
              </div>
            </div>

            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                name="gdprConsent"
                id="gdprConsentEmployer"
                checked={form.gdprConsent}
                onChange={handleChange}
                className="mt-1 size-4 rounded border-gray-600 bg-white/[0.05] accent-[#4540DB]"
              />
              <label
                htmlFor="gdprConsentEmployer"
                className="text-sm text-gray-400"
              >
                I confirm I have lawful authority to submit this candidate for
                screening and consent to OSCABE processing the data.{" "}
                <span className="text-red-400">*</span>
              </label>
            </div>

            <Button
              type="submit"
              disabled={submitting}
              className="bg-[#4540DB] text-white hover:bg-[#3632b0] disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <ShieldCheck className="mr-2 size-4" />
                  Submit Screening Order
                </>
              )}
            </Button>
          </form>
        </div>
      )}

      {/* Orders List */}
      <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-6 backdrop-blur-sm">
        <h2 className="mb-4 text-lg font-semibold text-white">
          Screening Orders
        </h2>

        {loading ? (
          <div className="flex h-32 items-center justify-center">
            <Loader2 className="size-6 animate-spin text-[#4540DB]" />
          </div>
        ) : orders.length === 0 ? (
          <div className="py-12 text-center">
            <ShieldCheck className="mx-auto mb-3 size-10 text-gray-600" />
            <p className="text-gray-400">No screening orders yet.</p>
            <p className="mt-1 text-sm text-gray-500">
              Click &ldquo;New Screening&rdquo; to order your first technical
              assessment.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map((order) => {
              const parsed = parseContent(order.content);
              const status = parsed?.status || "ORDERED";
              const config = STATUS_CONFIG[status] || STATUS_CONFIG.ORDERED;
              const StatusIcon = config.icon;

              return (
                <div
                  key={order.id}
                  className="flex items-center justify-between rounded-lg border border-white/[0.05] bg-white/[0.02] px-4 py-4"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex size-10 items-center justify-center rounded-lg bg-[#4540DB]/20">
                      <ShieldCheck className="size-5 text-[#4540DB]" />
                    </div>
                    <div>
                      <p className="font-medium text-white">
                        {parsed?.candidateName || "Unknown"} &mdash;{" "}
                        {parsed?.roleTitle || "Unknown Role"}
                      </p>
                      <p className="text-xs text-gray-400">
                        {parsed?.screeningType === "advanced"
                          ? "Advanced"
                          : "Standard"}{" "}
                        &middot;{" "}
                        {"\u00A3"}
                        {parsed?.price || 0} &middot;{" "}
                        {new Date(order.createdAt).toLocaleDateString("en-GB")}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${config.className}`}
                  >
                    <StatusIcon className="size-3.5" />
                    {config.label}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
