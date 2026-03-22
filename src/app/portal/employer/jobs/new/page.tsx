"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

export default function NewJobPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [employerId, setEmployerId] = useState<string | null>(null);
  const [companyName, setCompanyName] = useState("");

  const [form, setForm] = useState({
    title: "",
    description: "",
    location: "",
    remote: false,
    salaryMin: "",
    salaryMax: "",
    contractType: "PERMANENT",
    industry: "",
    skills: "",
  });

  useEffect(() => {
    fetch("/api/portal/employer/dashboard")
      .then((r) => r.json())
      .then((data) => {
        if (data.employer) {
          setEmployerId(data.employer.id);
          setCompanyName(data.employer.companyName ?? "");
        }
      })
      .catch(console.error);
  }, []);

  function updateField(field: string, value: string | boolean) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title || !form.description) {
      toast.error("Title and description are required");
      return;
    }

    setSubmitting(true);
    try {
      const body: Record<string, unknown> = {
        title: form.title,
        description: form.description,
        location: form.location || undefined,
        remote: form.remote,
        contractType: form.contractType,
        industry: form.industry || undefined,
        companyName: companyName || undefined,
        status: "ACTIVE",
        source: "PORTAL",
        publishedAt: new Date().toISOString(),
      };

      if (employerId) body.employerId = employerId;
      if (form.salaryMin) body.salaryMin = parseInt(form.salaryMin, 10);
      if (form.salaryMax) body.salaryMax = parseInt(form.salaryMax, 10);

      const res = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "Failed to create job");
      }

      toast.success("Job posted successfully");
      router.push("/portal/employer/jobs");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to post job");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Post a New Job</h1>
        <p className="mt-1 text-sm text-gray-400">
          Fill in the details below to create a new job listing
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-6 rounded-xl border border-white/[0.08] bg-white/[0.03] p-6 backdrop-blur-sm"
      >
        <div className="space-y-2">
          <Label className="text-gray-300">Job Title *</Label>
          <Input
            value={form.title}
            onChange={(e) => updateField("title", e.target.value)}
            placeholder="e.g. Senior Software Engineer"
            className="border-white/[0.1] bg-white/[0.05] text-white placeholder:text-gray-500"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-gray-300">Description *</Label>
          <Textarea
            value={form.description}
            onChange={(e) => updateField("description", e.target.value)}
            placeholder="Describe the role, responsibilities, and requirements..."
            rows={6}
            className="border-white/[0.1] bg-white/[0.05] text-white placeholder:text-gray-500"
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label className="text-gray-300">Location</Label>
            <Input
              value={form.location}
              onChange={(e) => updateField("location", e.target.value)}
              placeholder="e.g. London, UK"
              className="border-white/[0.1] bg-white/[0.05] text-white placeholder:text-gray-500"
            />
          </div>
          <div className="flex items-end gap-3 pb-1">
            <Switch
              checked={form.remote}
              onCheckedChange={(val) => updateField("remote", val)}
            />
            <Label className="text-gray-300">Remote</Label>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label className="text-gray-300">Salary Min</Label>
            <Input
              type="number"
              value={form.salaryMin}
              onChange={(e) => updateField("salaryMin", e.target.value)}
              placeholder="e.g. 50000"
              className="border-white/[0.1] bg-white/[0.05] text-white placeholder:text-gray-500"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-gray-300">Salary Max</Label>
            <Input
              type="number"
              value={form.salaryMax}
              onChange={(e) => updateField("salaryMax", e.target.value)}
              placeholder="e.g. 80000"
              className="border-white/[0.1] bg-white/[0.05] text-white placeholder:text-gray-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label className="text-gray-300">Contract Type</Label>
            <select
              value={form.contractType}
              onChange={(e) => updateField("contractType", e.target.value)}
              className="flex h-10 w-full rounded-md border border-white/[0.1] bg-white/[0.05] px-3 py-2 text-sm text-white"
            >
              <option value="PERMANENT">Permanent</option>
              <option value="CONTRACT">Contract</option>
              <option value="FIXED_TERM">Fixed Term</option>
              <option value="PART_TIME">Part Time</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label className="text-gray-300">Industry</Label>
            <Input
              value={form.industry}
              onChange={(e) => updateField("industry", e.target.value)}
              placeholder="e.g. Technology"
              className="border-white/[0.1] bg-white/[0.05] text-white placeholder:text-gray-500"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-gray-300">Skills (comma-separated)</Label>
          <Input
            value={form.skills}
            onChange={(e) => updateField("skills", e.target.value)}
            placeholder="e.g. React, TypeScript, Node.js"
            className="border-white/[0.1] bg-white/[0.05] text-white placeholder:text-gray-500"
          />
        </div>

        <div className="flex gap-3 pt-2">
          <Button
            type="submit"
            disabled={submitting}
            className="bg-[#4540DB] text-white hover:bg-[#3632b0]"
          >
            {submitting && <Loader2 className="mr-2 size-4 animate-spin" />}
            Post Job
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            className="border-white/[0.1] text-gray-300 hover:bg-white/[0.05]"
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
