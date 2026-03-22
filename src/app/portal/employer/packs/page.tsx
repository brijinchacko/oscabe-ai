"use client";

import { useState } from "react";
import {
  Users,
  MapPin,
  Clock,
  Loader2,
  Package,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const SPECIALISMS = [
  "Siemens PLC",
  "SCADA",
  "Robotics",
  "Controls",
  "Safety",
  "Commissioning",
];

interface AnonymisedCandidate {
  id: string;
  initials: string;
  headline: string;
  location: string;
  yearsExperience: number;
  skills: string[];
  availability: string;
}

export default function CandidatePacksPage() {
  const [selectedSpecialism, setSelectedSpecialism] = useState<string | null>(
    null
  );
  const [candidates, setCandidates] = useState<AnonymisedCandidate[]>([]);
  const [loading, setLoading] = useState(false);
  const [purchasing, setPurchasing] = useState(false);

  async function fetchCandidates(specialism: string) {
    setSelectedSpecialism(specialism);
    setLoading(true);
    setCandidates([]);
    try {
      const res = await fetch(
        `/api/candidate-packs?specialism=${encodeURIComponent(specialism)}`
      );
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Failed to load candidates.");
        return;
      }
      setCandidates(data.candidates || []);
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handlePurchase() {
    if (!selectedSpecialism) return;
    setPurchasing(true);
    try {
      const res = await fetch("/api/candidate-packs/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          specialism: selectedSpecialism,
          title: `${selectedSpecialism} Candidate Pack`,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Failed to generate pack.");
        return;
      }
      toast.success(
        `Pack generated with ${data.pack.candidates.length} candidates!`
      );
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setPurchasing(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Candidate Packs</h1>
        <p className="mt-1 text-sm text-gray-400">
          Browse anonymised candidate profiles by specialism. Purchase a pack to
          unlock full profiles and contact details.
        </p>
      </div>

      {/* Specialism selector */}
      <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-6 backdrop-blur-sm">
        <h2 className="mb-4 text-sm font-medium text-gray-300">
          Select a Specialism
        </h2>
        <div className="flex flex-wrap gap-3">
          {SPECIALISMS.map((spec) => (
            <button
              key={spec}
              onClick={() => fetchCandidates(spec)}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                selectedSpecialism === spec
                  ? "bg-[#4540DB] text-white shadow-lg shadow-[#4540DB]/20"
                  : "border border-white/[0.1] bg-white/[0.05] text-gray-300 hover:border-[#4540DB]/40 hover:bg-[#4540DB]/10 hover:text-white"
              }`}
            >
              {spec}
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      {selectedSpecialism && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">
              {selectedSpecialism} Engineers
              {!loading && (
                <span className="ml-2 text-sm font-normal text-gray-400">
                  ({candidates.length} found)
                </span>
              )}
            </h2>
            {candidates.length > 0 && (
              <Button
                onClick={handlePurchase}
                disabled={purchasing}
                className="bg-[#4540DB] text-white hover:bg-[#3632b0] disabled:opacity-50"
              >
                {purchasing ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Package className="mr-2 size-4" />
                    Purchase Pack ({"\u00A3"}1,500)
                  </>
                )}
              </Button>
            )}
          </div>

          {loading ? (
            <div className="flex h-48 items-center justify-center">
              <Loader2 className="size-8 animate-spin text-[#4540DB]" />
            </div>
          ) : candidates.length === 0 ? (
            <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] py-16 text-center backdrop-blur-sm">
              <Users className="mx-auto mb-3 size-10 text-gray-600" />
              <p className="text-gray-400">
                No candidates found for this specialism.
              </p>
              <p className="mt-1 text-sm text-gray-500">
                Try a different specialism or contact us for a custom search.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {candidates.map((candidate) => (
                <div
                  key={candidate.id}
                  className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-5 backdrop-blur-sm"
                >
                  <div className="flex items-start gap-4">
                    {/* Initials avatar */}
                    <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-[#4540DB]/20 text-sm font-bold text-[#4540DB]">
                      {candidate.initials}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="truncate font-medium text-white">
                        {candidate.headline}
                      </h3>
                      <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-400">
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="size-3" />
                          {candidate.location}
                        </span>
                        {candidate.yearsExperience > 0 && (
                          <span className="inline-flex items-center gap-1">
                            <Sparkles className="size-3" />
                            {candidate.yearsExperience}+ years
                          </span>
                        )}
                        <span className="inline-flex items-center gap-1">
                          <Clock className="size-3" />
                          {candidate.availability}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Skills badges */}
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {candidate.skills.slice(0, 6).map((skill) => (
                      <span
                        key={skill}
                        className="rounded-full border border-white/[0.08] bg-white/[0.05] px-2.5 py-0.5 text-xs text-gray-300"
                      >
                        {skill}
                      </span>
                    ))}
                    {candidate.skills.length > 6 && (
                      <span className="rounded-full border border-white/[0.08] bg-white/[0.05] px-2.5 py-0.5 text-xs text-gray-500">
                        +{candidate.skills.length - 6} more
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Empty state - no specialism selected */}
      {!selectedSpecialism && (
        <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] py-20 text-center backdrop-blur-sm">
          <Package className="mx-auto mb-4 size-12 text-gray-600" />
          <h3 className="text-lg font-medium text-gray-300">
            Select a specialism to get started
          </h3>
          <p className="mt-2 text-sm text-gray-500">
            Browse anonymised candidate profiles matched to your requirements.
          </p>
        </div>
      )}
    </div>
  );
}
