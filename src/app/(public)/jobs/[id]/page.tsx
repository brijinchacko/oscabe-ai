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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export default async function JobDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // Placeholder: In production, fetch the job from the database
  const job = null;

  if (!job) {
    return (
      <div className="bg-[#02012B]">
        {/* Breadcrumb */}
        <section className="border-b border-white/[0.08]">
          <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
            <Link
              href="/jobs"
              className="inline-flex items-center gap-1.5 text-sm text-gray-500 transition-colors hover:text-[#00D4FF]"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Jobs
            </Link>
          </div>
        </section>

        {/* Not Found State */}
        <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-center text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#4540DB]/15">
              <Briefcase className="h-10 w-10 text-[#4540DB]" />
            </div>
            <h1 className="mt-6 text-2xl font-bold text-white">
              Job Not Found
            </h1>
            <p className="mt-3 max-w-md text-gray-500">
              This job listing may have been removed or is no longer available.
              Browse our other open positions to find your next opportunity.
            </p>
            <Link href="/jobs">
              <Button className="mt-8 bg-[#4540DB] hover:bg-[#4540DB]/80 text-white shadow-lg shadow-[#4540DB]/25">
                Browse All Jobs
              </Button>
            </Link>
          </div>
        </section>
      </div>
    );
  }

  // Layout for when job data exists (future implementation)
  return (
    <div className="bg-[#02012B]">
      {/* Breadcrumb */}
      <section className="border-b border-white/[0.08]">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <Link
            href="/jobs"
            className="inline-flex items-center gap-1.5 text-sm text-gray-500 transition-colors hover:text-[#00D4FF]"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Jobs
          </Link>
        </div>
      </section>

      {/* Job Header */}
      <section className="border-b border-white/[0.08]">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white sm:text-3xl">
                {/* Job Title */}
              </h1>
              <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-gray-500">
                <span className="inline-flex items-center gap-1">
                  <Building2 className="h-4 w-4" />
                  {/* Company */}
                </span>
                <span className="inline-flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {/* Location */}
                </span>
                <span className="inline-flex items-center gap-1">
                  <PoundSterling className="h-4 w-4" />
                  {/* Salary */}
                </span>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <Badge className="border-white/[0.1] bg-white/[0.05] text-gray-300">{/* Contract Type */}</Badge>
                <Badge className="border-white/[0.1] bg-white/[0.05] text-gray-300">
                  <Calendar className="mr-1 h-3 w-3" />
                  {/* Posted Date */}
                </Badge>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="border-white/[0.1] text-gray-300 hover:bg-white/[0.06] hover:text-white">
                <Share2 className="mr-1.5 h-4 w-4" />
                Share
              </Button>
              <Button className="bg-[#4540DB] hover:bg-[#4540DB]/80 text-white shadow-lg shadow-[#4540DB]/25" size="lg">
                Apply Now
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Job Content */}
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-8 lg:flex-row">
          {/* Description */}
          <div className="min-w-0 flex-1">
            <div className="prose prose-invert max-w-none prose-p:text-gray-400 prose-headings:text-white prose-strong:text-white prose-li:text-gray-400">
              {/* Job description will render here */}
            </div>
          </div>

          {/* Sidebar */}
          <aside className="w-full shrink-0 lg:w-80">
            <div className="sticky top-24 space-y-6">
              <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-5 backdrop-blur-sm">
                <h3 className="mb-4 font-semibold text-white">Key Information</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#4540DB]/15">
                      <Clock className="h-4 w-4 text-[#4540DB]" />
                    </div>
                    <div>
                      <p className="text-gray-500">Contract Type</p>
                      <p className="font-medium text-white">{/* Contract */}</p>
                    </div>
                  </div>
                  <Separator className="bg-white/[0.08]" />
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#4540DB]/15">
                      <PoundSterling className="h-4 w-4 text-[#4540DB]" />
                    </div>
                    <div>
                      <p className="text-gray-500">Salary</p>
                      <p className="font-medium text-white">{/* Salary */}</p>
                    </div>
                  </div>
                  <Separator className="bg-white/[0.08]" />
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#4540DB]/15">
                      <MapPin className="h-4 w-4 text-[#4540DB]" />
                    </div>
                    <div>
                      <p className="text-gray-500">Location</p>
                      <p className="font-medium text-white">{/* Location */}</p>
                    </div>
                  </div>
                </div>
              </div>

              <Button className="w-full bg-[#4540DB] hover:bg-[#4540DB]/80 text-white shadow-lg shadow-[#4540DB]/25" size="lg">
                Apply Now
              </Button>
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
}
