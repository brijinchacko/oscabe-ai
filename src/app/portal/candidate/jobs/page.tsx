"use client";

import { useEffect, useState } from "react";
import { Loader2, Search, MapPin, Briefcase } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface Job {
  id: string;
  title: string;
  companyName: string | null;
  location: string | null;
  remote: boolean;
  contractType: string;
  salaryMin: number | null;
  salaryMax: number | null;
  description: string;
  createdAt: string;
}

export default function CandidateJobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [candidateId, setCandidateId] = useState<string | null>(null);
  const [applyingTo, setApplyingTo] = useState<string | null>(null);

  useEffect(() => {
    // Get candidate id first
    fetch("/api/portal/candidate/dashboard")
      .then((r) => r.json())
      .then((data) => {
        if (data.candidate) setCandidateId(data.candidate.id);
      })
      .catch(console.error);

    loadJobs();
  }, []);

  function loadJobs(searchQuery?: string) {
    setLoading(true);
    const params = new URLSearchParams({ status: "ACTIVE", pageSize: "50" });
    if (searchQuery) params.set("search", searchQuery);

    fetch(`/api/jobs?${params}`)
      .then((r) => r.json())
      .then((data) => setJobs(data.jobs ?? []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    loadJobs(search);
  }

  async function handleApply(jobId: string) {
    if (!candidateId) {
      toast.error("Candidate profile not found");
      return;
    }

    setApplyingTo(jobId);
    try {
      const res = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          candidateId,
          jobId,
          stage: "SOURCED",
        }),
      });

      if (res.status === 409) {
        toast.error("You have already applied to this job");
        return;
      }

      if (!res.ok) throw new Error("Failed to apply");
      toast.success("Application submitted successfully!");
    } catch {
      toast.error("Failed to submit application");
    } finally {
      setApplyingTo(null);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Browse Jobs</h1>
        <p className="mt-1 text-sm text-gray-400">
          Find and apply to open positions
        </p>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search jobs by title, company, or description..."
            className="border-white/[0.1] bg-white/[0.05] pl-10 text-white placeholder:text-gray-500"
          />
        </div>
        <Button
          type="submit"
          className="bg-[#00D4FF] text-black hover:bg-[#00b8dd]"
        >
          Search
        </Button>
      </form>

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="size-8 animate-spin text-[#00D4FF]" />
        </div>
      ) : jobs.length === 0 ? (
        <div className="py-12 text-center text-gray-400">
          No active jobs found.
        </div>
      ) : (
        <div className="space-y-4">
          {jobs.map((job) => (
            <div
              key={job.id}
              className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-6 backdrop-blur-sm"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white">
                    {job.title}
                  </h3>
                  <p className="mt-1 text-sm text-gray-400">
                    {job.companyName ?? "Company"}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-3 text-xs text-gray-400">
                    {job.location && (
                      <span className="flex items-center gap-1">
                        <MapPin className="size-3" />
                        {job.location}
                      </span>
                    )}
                    {job.remote && (
                      <span className="rounded-full bg-[#00D4FF]/20 px-2 py-0.5 text-[#00D4FF]">
                        Remote
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Briefcase className="size-3" />
                      {job.contractType}
                    </span>
                    {job.salaryMin != null && job.salaryMax != null && (
                      <span>
                        ${job.salaryMin.toLocaleString()} - $
                        {job.salaryMax.toLocaleString()}
                      </span>
                    )}
                  </div>
                  <p className="mt-3 line-clamp-2 text-sm text-gray-300">
                    {job.description}
                  </p>
                </div>
                <Button
                  onClick={() => handleApply(job.id)}
                  disabled={applyingTo === job.id}
                  className="ml-4 shrink-0 bg-[#00D4FF] text-black hover:bg-[#00b8dd]"
                >
                  {applyingTo === job.id ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    "Apply"
                  )}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
