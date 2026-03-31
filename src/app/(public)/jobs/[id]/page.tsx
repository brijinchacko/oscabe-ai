import Link from "next/link";
import {
  MapPin,
  Building2,
  Clock,
  Briefcase,
  PoundSterling,
  ArrowLeft,
  Calendar,
  Share2,
  CheckCircle,
  Send,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import prisma from "@/lib/prisma";

export default async function JobDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const job = await prisma.job.findUnique({
    where: { id },
    include: {
      skills: { include: { skill: true } },
    },
  });

  if (!job || job.status !== "ACTIVE") {
    return (
      <div className="bg-[#010118]">
        <section className="border-b border-white/[0.08]">
          <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
            <Link href="/jobs" className="inline-flex items-center gap-1.5 text-sm text-gray-500 transition-colors hover:text-[#00D4FF]">
              <ArrowLeft className="h-4 w-4" /> Back to Jobs
            </Link>
          </div>
        </section>
        <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-center text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#4540DB]/15">
              <Briefcase className="h-10 w-10 text-[#4540DB]" />
            </div>
            <h1 className="mt-6 text-2xl font-bold text-white">Job Not Found</h1>
            <p className="mt-3 max-w-md text-sm text-gray-400">This job listing may have been removed or is no longer available.</p>
            <Link href="/jobs">
              <Button className="mt-6 bg-[#4540DB] text-white hover:bg-[#4540DB]/90">Browse All Jobs</Button>
            </Link>
          </div>
        </section>
      </div>
    );
  }

  const daysAgo = Math.floor((Date.now() - new Date(job.createdAt).getTime()) / 86400000);

  return (
    <div className="bg-[#010118]">
      {/* Breadcrumb */}
      <section className="border-b border-white/[0.08]">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/jobs" className="inline-flex items-center gap-1.5 text-sm text-gray-500 transition-colors hover:text-[#00D4FF]">
            <ArrowLeft className="h-4 w-4" /> Back to Jobs
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Header */}
            <div>
              <h1 className="text-3xl font-bold text-white sm:text-4xl">{job.title}</h1>
              <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-gray-400">
                <span className="flex items-center gap-1.5">
                  <Building2 className="h-4 w-4" /> Confidential
                </span>
                {job.location && (
                  <span className="flex items-center gap-1.5">
                    <MapPin className="h-4 w-4" /> {job.location}
                  </span>
                )}
                <span className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4" /> {daysAgo === 0 ? "Posted today" : daysAgo === 1 ? "Posted yesterday" : `Posted ${daysAgo} days ago`}
                </span>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {job.contractType && (
                  <span className="rounded-full bg-[#4540DB]/15 px-3 py-1 text-xs font-medium text-[#4540DB]">{job.contractType}</span>
                )}
                {job.remote && (
                  <span className="rounded-full bg-[#00D4FF]/15 px-3 py-1 text-xs font-medium text-[#00D4FF]">Remote</span>
                )}
                {job.industry && (
                  <span className="rounded-full bg-white/[0.08] px-3 py-1 text-xs font-medium text-gray-400">{job.industry}</span>
                )}
              </div>
            </div>

            {/* Salary */}
            {(job.salaryMin || job.salaryMax) && (
              <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-5">
                <div className="flex items-center gap-2 text-sm font-medium text-gray-400">
                  <PoundSterling className="h-4 w-4" /> Salary
                </div>
                <p className="mt-1 text-xl font-bold text-[#22C55E]">
                  {job.salaryMin && job.salaryMax
                    ? `£${job.salaryMin.toLocaleString()} - £${job.salaryMax.toLocaleString()}`
                    : job.salaryMin
                      ? `From £${job.salaryMin.toLocaleString()}`
                      : `Up to £${(job.salaryMax || 0).toLocaleString()}`}
                  <span className="text-sm font-normal text-gray-500"> per annum</span>
                </p>
              </div>
            )}

            {/* Job Description */}
            {job.description && (
              <div>
                <h2 className="text-lg font-semibold text-white">Job Description</h2>
                <div className="mt-4 space-y-4 text-sm leading-relaxed text-gray-400 whitespace-pre-line">
                  {job.description}
                </div>
              </div>
            )}

            {/* Skills */}
            {job.skills.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold text-white">Required Skills</h2>
                <div className="mt-4 flex flex-wrap gap-2">
                  {job.skills.map((js) => (
                    <span key={js.skill.id} className="flex items-center gap-1.5 rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-1.5 text-xs text-gray-300">
                      <CheckCircle className="h-3 w-3 text-[#22C55E]" />
                      {js.skill.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Apply Card */}
            <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-6 backdrop-blur-sm">
              <h3 className="text-lg font-semibold text-white">Interested in this role?</h3>
              <p className="mt-2 text-sm text-gray-400">Apply now and our team will be in touch within 48 hours.</p>
              <Link href={`/register?jobId=${job.id}&jobTitle=${encodeURIComponent(job.title)}`}>
                <Button className="mt-4 w-full bg-[#4540DB] text-white hover:bg-[#4540DB]/90 shadow-lg shadow-[#4540DB]/25">
                  <Send className="mr-2 h-4 w-4" /> Apply Now
                </Button>
              </Link>
              <Link href="/contact">
                <Button variant="outline" className="mt-3 w-full border-white/[0.15] text-gray-300 hover:bg-white/[0.06]">
                  Ask a Question
                </Button>
              </Link>
            </div>

            {/* Job Summary */}
            <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-6 backdrop-blur-sm">
              <h3 className="mb-4 text-sm font-semibold text-white">Job Summary</h3>
              <div className="space-y-3">
                {job.location && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Location</span>
                    <span className="text-gray-300">{job.location}</span>
                  </div>
                )}
                {job.contractType && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Type</span>
                    <span className="text-gray-300">{job.contractType}</span>
                  </div>
                )}
                {job.remote !== undefined && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Remote</span>
                    <span className="text-gray-300">{job.remote ? "Yes" : "No"}</span>
                  </div>
                )}
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Posted</span>
                  <span className="text-gray-300">{new Date(job.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</span>
                </div>
              </div>
            </div>

            {/* Similar Jobs Placeholder */}
            <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-6 backdrop-blur-sm">
              <h3 className="mb-2 text-sm font-semibold text-white">Share This Job</h3>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="border-white/[0.1] text-gray-400 hover:text-white" onClick={() => {}}>
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
