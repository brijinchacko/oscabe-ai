"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

interface Application {
  id: string;
  stage: string;
  createdAt: string;
  job: {
    id: string;
    title: string;
    companyName: string | null;
  };
}

const STAGE_COLORS: Record<string, string> = {
  SOURCED: "bg-gray-500/20 text-gray-400",
  SCREENING: "bg-blue-500/20 text-blue-400",
  SUBMITTED: "bg-indigo-500/20 text-indigo-400",
  INTERVIEW: "bg-purple-500/20 text-purple-400",
  OFFER: "bg-green-500/20 text-green-400",
  PLACED: "bg-emerald-500/20 text-emerald-400",
};

export default function CandidateApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/portal/candidate/dashboard")
      .then((r) => r.json())
      .then((data) => {
        setApplications(data.recentApplications ?? []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="size-8 animate-spin text-[#00D4FF]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">My Applications</h1>
        <p className="mt-1 text-sm text-gray-400">
          Track the status of your job applications
        </p>
      </div>

      <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-6 backdrop-blur-sm">
        {applications.length === 0 ? (
          <p className="py-8 text-center text-gray-400">
            You haven't applied to any jobs yet.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-white/[0.08] text-gray-400">
                  <th className="pb-3 font-medium">Job Title</th>
                  <th className="pb-3 font-medium">Company</th>
                  <th className="pb-3 font-medium">Stage</th>
                  <th className="pb-3 font-medium">Applied</th>
                </tr>
              </thead>
              <tbody>
                {applications.map((app) => (
                  <tr
                    key={app.id}
                    className="border-b border-white/[0.05] last:border-0"
                  >
                    <td className="py-3 font-medium text-white">
                      {app.job.title}
                    </td>
                    <td className="py-3 text-gray-300">
                      {app.job.companyName ?? "-"}
                    </td>
                    <td className="py-3">
                      <span
                        className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          STAGE_COLORS[app.stage] ??
                          "bg-gray-500/20 text-gray-400"
                        }`}
                      >
                        {app.stage}
                      </span>
                    </td>
                    <td className="py-3 text-gray-400">
                      {new Date(app.createdAt).toLocaleDateString()}
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
