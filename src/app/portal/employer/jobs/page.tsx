"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Job {
  id: string;
  title: string;
  status: string;
  contractType: string;
  location: string | null;
  createdAt: string;
  _count: { applications: number };
}

const STATUS_COLORS: Record<string, string> = {
  ACTIVE: "bg-emerald-500/20 text-emerald-400",
  CLOSED: "bg-gray-500/20 text-gray-400",
  DRAFT: "bg-yellow-500/20 text-yellow-400",
  ON_HOLD: "bg-orange-500/20 text-orange-400",
};

export default function EmployerJobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/portal/employer/dashboard")
      .then((r) => r.json())
      .then((data) => {
        // Fetch all employer jobs via the jobs API
        if (data.employer?.id) {
          return fetch(`/api/jobs?pageSize=100`).then((r) => r.json());
        }
        return { jobs: [] };
      })
      .then((data) => setJobs(data.jobs ?? []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="size-8 animate-spin text-[#4540DB]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">My Jobs</h1>
          <p className="mt-1 text-sm text-gray-400">
            Manage all your job postings
          </p>
        </div>
        <Link href="/portal/employer/jobs/new">
          <Button className="bg-[#4540DB] text-white hover:bg-[#3632b0]">
            <Plus className="mr-2 size-4" />
            Post New Job
          </Button>
        </Link>
      </div>

      <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-6 backdrop-blur-sm">
        {jobs.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-gray-400">No jobs posted yet.</p>
            <Link href="/portal/employer/jobs/new">
              <Button className="mt-4 bg-[#4540DB] text-white hover:bg-[#3632b0]">
                <Plus className="mr-2 size-4" />
                Post Your First Job
              </Button>
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-white/[0.08] text-gray-400">
                  <th className="pb-3 font-medium">Title</th>
                  <th className="pb-3 font-medium">Status</th>
                  <th className="pb-3 font-medium">Type</th>
                  <th className="pb-3 font-medium">Applications</th>
                  <th className="pb-3 font-medium">Posted</th>
                </tr>
              </thead>
              <tbody>
                {jobs.map((job) => (
                  <tr
                    key={job.id}
                    className="border-b border-white/[0.05] last:border-0"
                  >
                    <td className="py-3 font-medium text-white">{job.title}</td>
                    <td className="py-3">
                      <span
                        className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          STATUS_COLORS[job.status] ??
                          "bg-gray-500/20 text-gray-400"
                        }`}
                      >
                        {job.status}
                      </span>
                    </td>
                    <td className="py-3 text-gray-300">{job.contractType}</td>
                    <td className="py-3 text-gray-300">
                      {job._count.applications}
                    </td>
                    <td className="py-3 text-gray-400">
                      {new Date(job.createdAt).toLocaleDateString()}
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
