"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Search,
  MapPin,
  Briefcase,
  SlidersHorizontal,
  X,
  Clock,
  Building2,
  Loader2,
  ArrowRight,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { INDUSTRIES } from "@/lib/constants";

const CONTRACT_TYPES = ["Permanent", "Contract", "Temp to Perm"];

export default function JobsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [location, setLocation] = useState("");
  const [selectedContracts, setSelectedContracts] = useState<string[]>([]);
  const [salaryMin, setSalaryMin] = useState("");
  const [salaryMax, setSalaryMax] = useState("");
  const [remoteOnly, setRemoteOnly] = useState(false);
  const [industry, setIndustry] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [jobs, setJobs] = useState<Array<{ id: string; title: string; company?: string; companyName?: string; client?: { companyName: string }; location: string; contractType: string; salaryMin?: number; salaryMax?: number; remote?: boolean; description?: string; postedAt?: string; createdAt?: string }>>([]);
  const [totalJobs, setTotalJobs] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.set("search", searchQuery);
      if (location) params.set("location", location);
      if (remoteOnly) params.set("remote", "true");
      if (industry) params.set("industry", industry);
      params.set("page", String(currentPage));
      params.set("limit", "20");

      const res = await fetch(`/api/jobs/public?${params}`);
      if (res.ok) {
        const data = await res.json();
        setJobs(data.jobs || []);
        setTotalJobs(data.total || 0);
        setTotalPages(data.totalPages || 1);
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, [searchQuery, location, remoteOnly, industry, currentPage]);

  useEffect(() => {
    const timer = setTimeout(() => fetchJobs(), 300);
    return () => clearTimeout(timer);
  }, [fetchJobs]);

  function toggleContract(contract: string) {
    setSelectedContracts((prev) =>
      prev.includes(contract)
        ? prev.filter((c) => c !== contract)
        : [...prev, contract]
    );
  }

  function clearFilters() {
    setSearchQuery("");
    setLocation("");
    setSelectedContracts([]);
    setSalaryMin("");
    setSalaryMax("");
    setRemoteOnly(false);
    setIndustry("");
  }

  const hasActiveFilters =
    searchQuery ||
    location ||
    selectedContracts.length > 0 ||
    salaryMin ||
    salaryMax ||
    remoteOnly ||
    industry;

  const filterSidebar = (
    <div className="space-y-6">
      <div>
        <Label htmlFor="filter-search" className="mb-2 text-sm font-semibold text-white">
          Search
        </Label>
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
          <Input
            id="filter-search"
            placeholder="Job title, skills..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-white/[0.05] border-white/[0.1] text-white placeholder:text-gray-500 focus:border-[#4540DB] focus:ring-[#4540DB]/20"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="filter-location" className="mb-2 text-sm font-semibold text-white">
          Location
        </Label>
        <div className="relative">
          <MapPin className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
          <Input
            id="filter-location"
            placeholder="City, region..."
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="pl-9 bg-white/[0.05] border-white/[0.1] text-white placeholder:text-gray-500 focus:border-[#4540DB] focus:ring-[#4540DB]/20"
          />
        </div>
      </div>

      <Separator className="bg-white/[0.08]" />

      <div>
        <p className="mb-3 text-sm font-semibold text-white">Contract Type</p>
        <div className="space-y-2.5">
          {CONTRACT_TYPES.map((type) => (
            <label key={type} className="flex cursor-pointer items-center gap-2.5">
              <Checkbox
                checked={selectedContracts.includes(type)}
                onCheckedChange={() => toggleContract(type)}
                className="border-white/[0.2] data-[state=checked]:bg-[#4540DB] data-[state=checked]:border-[#4540DB]"
              />
              <span className="text-sm text-gray-400">{type}</span>
            </label>
          ))}
        </div>
      </div>

      <Separator className="bg-white/[0.08]" />

      <div>
        <p className="mb-3 text-sm font-semibold text-white">Salary Range</p>
        <div className="flex items-center gap-2">
          <Input
            placeholder="Min"
            type="number"
            value={salaryMin}
            onChange={(e) => setSalaryMin(e.target.value)}
            className="w-full bg-white/[0.05] border-white/[0.1] text-white placeholder:text-gray-500 focus:border-[#4540DB] focus:ring-[#4540DB]/20"
          />
          <span className="text-sm text-gray-500">-</span>
          <Input
            placeholder="Max"
            type="number"
            value={salaryMax}
            onChange={(e) => setSalaryMax(e.target.value)}
            className="w-full bg-white/[0.05] border-white/[0.1] text-white placeholder:text-gray-500 focus:border-[#4540DB] focus:ring-[#4540DB]/20"
          />
        </div>
      </div>

      <Separator className="bg-white/[0.08]" />

      <div className="flex items-center justify-between">
        <Label htmlFor="remote-toggle" className="text-sm font-semibold text-white">
          Remote Only
        </Label>
        <Switch
          id="remote-toggle"
          checked={remoteOnly}
          onCheckedChange={setRemoteOnly}
        />
      </div>

      <Separator className="bg-white/[0.08]" />

      <div>
        <Label className="mb-2 text-sm font-semibold text-white">Industry</Label>
        <Select value={industry} onValueChange={(v) => setIndustry(v ?? "")}>
          <SelectTrigger className="w-full bg-white/[0.05] border-white/[0.1] text-white focus:border-[#4540DB] focus:ring-[#4540DB]/20">
            <SelectValue placeholder="All industries" />
          </SelectTrigger>
          <SelectContent className="bg-[#0a0a2e] border-white/[0.1] text-white">
            {INDUSTRIES.map((ind) => (
              <SelectItem key={ind} value={ind} className="text-gray-300 focus:bg-white/[0.08] focus:text-white">
                {ind}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {hasActiveFilters && (
        <Button variant="outline" className="w-full border-white/[0.1] text-gray-300 hover:bg-white/[0.06] hover:text-white" onClick={clearFilters}>
          <X className="mr-1.5 h-4 w-4" />
          Clear All Filters
        </Button>
      )}
    </div>
  );

  return (
    <div className="bg-[#010118]">
      {/* Hero Banner */}
      <section className="relative overflow-hidden py-16 sm:py-20">
        {/* Hero background image */}
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=1920&h=800&fit=crop"
            alt="Professional working on laptop searching for career opportunities"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-[#010118]/85" />
        </div>

        {/* Grid pattern */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
        {/* Gradient orbs */}
        <div className="pointer-events-none absolute -left-40 -top-40 h-[500px] w-[500px] rounded-full bg-[#4540DB]/20 blur-[120px]" />
        <div className="pointer-events-none absolute -right-40 bottom-0 h-[400px] w-[400px] rounded-full bg-[#00D4FF]/15 blur-[120px]" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
            Browse Automation Jobs
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-400">
            Find your next role in PLC, SCADA, Controls, Robotics, and more.
          </p>
          <div className="mx-auto mt-8 max-w-xl">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-500" />
              <input
                type="text"
                placeholder="Search jobs by title, skill, or keyword..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-12 w-full rounded-xl border border-white/[0.1] bg-white/[0.05] pl-12 pr-4 text-sm text-white shadow-lg backdrop-blur-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#4540DB] focus:border-[#4540DB]"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex gap-8">
          {/* Sidebar - Desktop */}
          <aside className="hidden w-72 shrink-0 md:block">
            <div className="sticky top-24 rounded-xl border border-white/[0.08] bg-white/[0.03] p-5 backdrop-blur-sm">
              <h2 className="mb-4 text-base font-semibold text-white">Filters</h2>
              {filterSidebar}
            </div>
          </aside>

          {/* Mobile Filter Toggle */}
          <div className="mb-4 md:hidden w-full">
            <Button
              variant="outline"
              className="w-full border-white/[0.1] text-gray-300 hover:bg-white/[0.06] hover:text-white"
              onClick={() => setShowFilters(!showFilters)}
            >
              <SlidersHorizontal className="mr-2 h-4 w-4" />
              {showFilters ? "Hide Filters" : "Show Filters"}
            </Button>
            {showFilters && (
              <div className="mt-4 rounded-xl border border-white/[0.08] bg-white/[0.03] p-5 backdrop-blur-sm">
                {filterSidebar}
              </div>
            )}
          </div>

          {/* Job Cards Area */}
          <div className="min-w-0 flex-1">
            <div className="mb-6 flex items-center justify-between">
              <p className="text-sm text-gray-500">
                {loading ? "Loading..." : `${totalJobs} job${totalJobs !== 1 ? "s" : ""} found`}
              </p>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-[#4540DB]" />
              </div>
            ) : jobs.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-white/[0.1] bg-white/[0.02] py-20 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#4540DB]/15">
                  <Briefcase className="h-8 w-8 text-[#4540DB]" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-white">No matching jobs found</h3>
                <p className="mt-2 max-w-sm text-sm text-gray-500">
                  Try adjusting your search or filters. New roles are added regularly.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {jobs.map((job) => {
                  // Company hidden for confidentiality
                  const posted = job.postedAt || job.createdAt;
                  const daysAgo = posted ? Math.floor((Date.now() - new Date(posted).getTime()) / 86400000) : null;

                  return (
                    <Link key={job.id} href={`/jobs/${job.id}`}>
                      <div className="group rounded-xl border border-white/[0.08] bg-white/[0.03] p-5 backdrop-blur-sm transition-all hover:border-[#4540DB]/30 hover:bg-white/[0.06]">
                        <div className="flex items-start justify-between gap-4">
                          <div className="min-w-0 flex-1">
                            <h3 className="text-lg font-semibold text-white group-hover:text-[#4540DB] transition-colors">
                              {job.title}
                            </h3>
                            <div className="mt-2 flex flex-wrap items-center gap-2.5 text-sm text-gray-400">
                              {job.location && (
                                <span className="flex items-center gap-1">
                                  <MapPin className="h-3.5 w-3.5 text-gray-500" />
                                  {job.location}
                                </span>
                              )}
                              {job.contractType && (
                                <span className="rounded-full border border-[#4540DB]/30 bg-[#4540DB]/10 px-2.5 py-0.5 text-[11px] font-medium text-[#4540DB]">
                                  {job.contractType}
                                </span>
                              )}
                              {job.remote && (
                                <span className="rounded-full border border-[#00D4FF]/30 bg-[#00D4FF]/10 px-2.5 py-0.5 text-[11px] font-medium text-[#00D4FF]">
                                  Remote
                                </span>
                              )}
                            </div>
                            {(job.salaryMin || job.salaryMax) && (
                              <p className="mt-2 text-sm font-medium text-[#22C55E]">
                                {job.salaryMin && job.salaryMax
                                  ? `£${(job.salaryMin / 1000).toFixed(0)}k - £${(job.salaryMax / 1000).toFixed(0)}k`
                                  : job.salaryMin
                                    ? `From £${(job.salaryMin / 1000).toFixed(0)}k`
                                    : `Up to £${((job.salaryMax || 0) / 1000).toFixed(0)}k`}
                              </p>
                            )}
                            {job.description && (
                              <p className="mt-2 line-clamp-2 text-sm text-gray-500">
                                {job.description.replace(/^Job Title:[^]*?(?:About the Role:|About The Job|We are|The role|This is|Our client)/i, "").substring(0, 180).trim()}
                              </p>
                            )}
                          </div>
                          <div className="flex shrink-0 flex-col items-end gap-2">
                            {daysAgo !== null && (
                              <span className="flex items-center gap-1 text-xs text-gray-500">
                                <Clock className="h-3 w-3" />
                                {daysAgo === 0 ? "Today" : daysAgo === 1 ? "Yesterday" : `${daysAgo}d ago`}
                              </span>
                            )}
                            <span className="flex items-center gap-1 text-xs font-medium text-[#4540DB] opacity-0 transition-opacity group-hover:opacity-100">
                              View <ArrowRight className="h-3 w-3" />
                            </span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8 flex items-center justify-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage <= 1}
                  onClick={() => setCurrentPage((p) => p - 1)}
                  className="border-white/[0.1] text-gray-400 hover:text-white"
                >
                  Previous
                </Button>
                <span className="px-3 py-1 text-sm text-gray-500">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage((p) => p + 1)}
                  className="border-white/[0.1] text-gray-400 hover:text-white"
                >
                  Next
                </Button>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
