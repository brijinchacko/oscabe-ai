"use client";

import { useEffect, useState } from "react";
import {
  ShieldCheck,
  Loader2,
  Send,
  Download,
  BarChart3,
  Calendar,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { PLATFORMS } from "@/lib/constants";

interface VerificationRequest {
  id: string;
  candidateName: string;
  assessmentType: string;
  status: string;
  createdAt: string;
  platforms: string[];
}

export default function AgencyVerifyPage() {
  const [requests, setRequests] = useState<VerificationRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [candidateName, setCandidateName] = useState("");
  const [candidateEmail, setCandidateEmail] = useState("");
  const [candidatePhone, setCandidatePhone] = useState("");
  const [assessmentType, setAssessmentType] = useState<"basic" | "advanced">(
    "basic",
  );
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [notes, setNotes] = useState("");

  // Load past requests
  useEffect(() => {
    fetch("/api/portal/agency/verify")
      .then((r) => r.json())
      .then((data) => {
        if (data.requests) setRequests(data.requests);
      })
      .catch(() => {
        // API may not exist yet - that is OK
      })
      .finally(() => setLoading(false));
  }, []);

  function togglePlatform(platform: string) {
    setSelectedPlatforms((prev) =>
      prev.includes(platform)
        ? prev.filter((p) => p !== platform)
        : [...prev, platform],
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!candidateName || !candidateEmail || selectedPlatforms.length === 0) {
      toast.error("Please fill in all required fields and select at least one platform.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/verify/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          candidateName,
          candidateEmail,
          candidatePhone,
          assessmentType,
          platforms: selectedPlatforms,
          notes,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error || "Failed to submit request");
        return;
      }

      toast.success(
        `Verification request submitted! Estimated delivery: ${json.estimatedDelivery}`,
      );

      // Add to local list
      setRequests((prev) => [
        {
          id: json.requestId,
          candidateName,
          assessmentType,
          status: "PENDING",
          createdAt: new Date().toISOString(),
          platforms: selectedPlatforms,
        },
        ...prev,
      ]);

      // Reset form
      setCandidateName("");
      setCandidateEmail("");
      setCandidatePhone("");
      setAssessmentType("basic");
      setSelectedPlatforms([]);
      setNotes("");
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  const totalVerifications = requests.length;
  const thisMonth = requests.filter((r) => {
    const d = new Date(r.createdAt);
    const now = new Date();
    return (
      d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
    );
  }).length;

  function statusBadge(status: string) {
    if (status === "COMPLETED") return "bg-green-500/20 text-green-400";
    if (status === "IN_PROGRESS") return "bg-yellow-500/20 text-yellow-400";
    return "bg-gray-500/20 text-gray-400";
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">OSCABE Verify</h1>
        <p className="mt-1 text-sm text-gray-400">
          Submit candidates for technical skill verification
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-6 backdrop-blur-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-400">Total Verifications</p>
              <p className="mt-1 text-2xl font-bold text-white">
                {totalVerifications}
              </p>
            </div>
            <div className="flex size-10 items-center justify-center rounded-lg bg-[#8B5CF6]/20">
              <BarChart3 className="size-5 text-[#8B5CF6]" />
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-6 backdrop-blur-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-400">This Month</p>
              <p className="mt-1 text-2xl font-bold text-white">{thisMonth}</p>
            </div>
            <div className="flex size-10 items-center justify-center rounded-lg bg-[#8B5CF6]/20">
              <Calendar className="size-5 text-[#8B5CF6]" />
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-6 backdrop-blur-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-400">Avg Score</p>
              <p className="mt-1 text-2xl font-bold text-white">&mdash;</p>
            </div>
            <div className="flex size-10 items-center justify-center rounded-lg bg-[#8B5CF6]/20">
              <TrendingUp className="size-5 text-[#8B5CF6]" />
            </div>
          </div>
        </div>
      </div>

      {/* Submit Form */}
      <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-6 backdrop-blur-sm">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-lg bg-[#8B5CF6]/20">
            <ShieldCheck className="size-5 text-[#8B5CF6]" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">
              Submit New Candidate for Verification
            </h2>
            <p className="text-xs text-gray-400">
              Fill in candidate details and select platforms to assess
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Candidate Details */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-300">
                Candidate Name <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={candidateName}
                onChange={(e) => setCandidateName(e.target.value)}
                placeholder="John Smith"
                className="w-full rounded-lg border border-white/[0.1] bg-white/[0.05] px-3 py-2 text-sm text-white placeholder-gray-500 outline-none focus:border-[#8B5CF6]/50 focus:ring-1 focus:ring-[#8B5CF6]/50"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-300">
                Candidate Email <span className="text-red-400">*</span>
              </label>
              <input
                type="email"
                value={candidateEmail}
                onChange={(e) => setCandidateEmail(e.target.value)}
                placeholder="john@example.com"
                className="w-full rounded-lg border border-white/[0.1] bg-white/[0.05] px-3 py-2 text-sm text-white placeholder-gray-500 outline-none focus:border-[#8B5CF6]/50 focus:ring-1 focus:ring-[#8B5CF6]/50"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-300">
                Phone
              </label>
              <input
                type="tel"
                value={candidatePhone}
                onChange={(e) => setCandidatePhone(e.target.value)}
                placeholder="+44 7xxx xxx xxx"
                className="w-full rounded-lg border border-white/[0.1] bg-white/[0.05] px-3 py-2 text-sm text-white placeholder-gray-500 outline-none focus:border-[#8B5CF6]/50 focus:ring-1 focus:ring-[#8B5CF6]/50"
              />
            </div>
          </div>

          {/* Assessment Type */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-300">
              Assessment Type
            </label>
            <div className="flex gap-4">
              <label
                className={`flex cursor-pointer items-center gap-3 rounded-lg border px-4 py-3 transition-all ${
                  assessmentType === "basic"
                    ? "border-[#8B5CF6]/50 bg-[#8B5CF6]/10"
                    : "border-white/[0.1] bg-white/[0.03] hover:border-white/[0.2]"
                }`}
              >
                <input
                  type="radio"
                  name="assessmentType"
                  value="basic"
                  checked={assessmentType === "basic"}
                  onChange={() => setAssessmentType("basic")}
                  className="sr-only"
                />
                <div>
                  <p className="text-sm font-medium text-white">Basic</p>
                  <p className="text-xs text-gray-400">&pound;30 per assessment</p>
                </div>
              </label>
              <label
                className={`flex cursor-pointer items-center gap-3 rounded-lg border px-4 py-3 transition-all ${
                  assessmentType === "advanced"
                    ? "border-[#8B5CF6]/50 bg-[#8B5CF6]/10"
                    : "border-white/[0.1] bg-white/[0.03] hover:border-white/[0.2]"
                }`}
              >
                <input
                  type="radio"
                  name="assessmentType"
                  value="advanced"
                  checked={assessmentType === "advanced"}
                  onChange={() => setAssessmentType("advanced")}
                  className="sr-only"
                />
                <div>
                  <p className="text-sm font-medium text-white">Advanced</p>
                  <p className="text-xs text-gray-400">&pound;75 per assessment</p>
                </div>
              </label>
            </div>
          </div>

          {/* Platforms */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-300">
              Platforms to Assess <span className="text-red-400">*</span>
            </label>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
              {PLATFORMS.map((platform) => (
                <label
                  key={platform}
                  className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-xs transition-all ${
                    selectedPlatforms.includes(platform)
                      ? "border-[#8B5CF6]/50 bg-[#8B5CF6]/10 text-white"
                      : "border-white/[0.08] bg-white/[0.02] text-gray-400 hover:border-white/[0.15]"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedPlatforms.includes(platform)}
                    onChange={() => togglePlatform(platform)}
                    className="sr-only"
                  />
                  <div
                    className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border ${
                      selectedPlatforms.includes(platform)
                        ? "border-[#8B5CF6] bg-[#8B5CF6]"
                        : "border-white/[0.2] bg-transparent"
                    }`}
                  >
                    {selectedPlatforms.includes(platform) && (
                      <svg
                        viewBox="0 0 12 12"
                        className="h-3 w-3 text-white"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path d="M2 6l3 3 5-5" />
                      </svg>
                    )}
                  </div>
                  <span className="truncate">{platform}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-300">
              Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Any additional context about the candidate or assessment requirements..."
              className="w-full rounded-lg border border-white/[0.1] bg-white/[0.05] px-3 py-2 text-sm text-white placeholder-gray-500 outline-none focus:border-[#8B5CF6]/50 focus:ring-1 focus:ring-[#8B5CF6]/50"
            />
          </div>

          <Button
            type="submit"
            disabled={submitting}
            className="bg-[#8B5CF6] text-white hover:bg-[#8B5CF6]/90 transition-transform hover:scale-[1.02]"
          >
            {submitting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Send className="mr-2 h-4 w-4" />
            )}
            Submit Verification Request
          </Button>
        </form>
      </div>

      {/* Past Requests */}
      <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-6 backdrop-blur-sm">
        <h2 className="mb-4 text-lg font-semibold text-white">
          Past Verification Requests
        </h2>
        {loading ? (
          <div className="flex h-32 items-center justify-center">
            <Loader2 className="size-6 animate-spin text-[#8B5CF6]" />
          </div>
        ) : requests.length === 0 ? (
          <p className="text-sm text-gray-400">
            No verification requests yet. Submit your first candidate above.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-white/[0.08] text-gray-400">
                  <th className="pb-3 font-medium">Candidate</th>
                  <th className="pb-3 font-medium">Type</th>
                  <th className="pb-3 font-medium">Status</th>
                  <th className="pb-3 font-medium">Submitted</th>
                  <th className="pb-3 font-medium">Report</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((req) => (
                  <tr
                    key={req.id}
                    className="border-b border-white/[0.05] last:border-0"
                  >
                    <td className="py-3 font-medium text-white">
                      {req.candidateName}
                    </td>
                    <td className="py-3 text-gray-300 capitalize">
                      {req.assessmentType}
                    </td>
                    <td className="py-3">
                      <span
                        className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${statusBadge(req.status)}`}
                      >
                        {req.status}
                      </span>
                    </td>
                    <td className="py-3 text-gray-300">
                      {new Date(req.createdAt).toLocaleDateString("en-GB")}
                    </td>
                    <td className="py-3">
                      {req.status === "COMPLETED" ? (
                        <button className="flex items-center gap-1 text-[#8B5CF6] hover:underline text-xs">
                          <Download className="h-3 w-3" />
                          Download
                        </button>
                      ) : (
                        <span className="text-xs text-gray-500">Pending</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
