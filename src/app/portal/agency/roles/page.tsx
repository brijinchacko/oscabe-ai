"use client";

import { useEffect, useState } from "react";
import { Loader2, MapPin, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface Job {
  id: string;
  title: string;
  companyName: string | null;
  location: string | null;
  remote: boolean;
  contractType: string;
  feePercent: number | null;
  salaryMin: number | null;
  salaryMax: number | null;
  description: string;
  createdAt: string;
  _count: { applications: number };
}

export default function AgencyRolesPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/jobs?status=ACTIVE&pageSize=50")
      .then((r) => r.json())
      .then((data) => setJobs(data.jobs ?? []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="size-8 animate-spin text-[#8B5CF6]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Shared Roles</h1>
        <p className="mt-1 text-sm text-gray-400">
          Browse available split-fee roles from the network
        </p>
      </div>

      {jobs.length === 0 ? (
        <div className="py-12 text-center text-gray-400">
          No shared roles available at the moment.
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
                      <span className="rounded-full bg-[#8B5CF6]/20 px-2 py-0.5 text-[#8B5CF6]">
                        Remote
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Briefcase className="size-3" />
                      {job.contractType}
                    </span>
                    {job.feePercent != null && (
                      <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-emerald-400">
                        Fee: {job.feePercent}%
                      </span>
                    )}
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
                  <p className="mt-2 text-xs text-gray-500">
                    {job._count.applications} candidate
                    {job._count.applications !== 1 ? "s" : ""} submitted
                  </p>
                </div>
                <Button
                  onClick={() =>
                    toast.info(
                      "Contact your account manager to claim this role"
                    )
                  }
                  className="ml-4 shrink-0 bg-[#8B5CF6] text-white hover:bg-[#7c4de6]"
                >
                  Claim Role
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
