"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import {
  Loader2,
  Save,
  Plus,
  X,
  FileText,
  Upload,
  CheckCircle2,
  Trash2,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

interface CandidateProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  location: string | null;
  headline: string | null;
  summary: string | null;
  linkedIn: string | null;
  cvUrl: string | null;
  cvFileName: string | null;
  salaryMin: number | null;
  salaryMax: number | null;
  dayRateMin: number | null;
  dayRateMax: number | null;
  noticePeriod: string | null;
  availableFrom: string | null;
}

interface SkillEntry {
  id: string;
  skillId: string;
  proficiency: number | null;
  isVerified: boolean;
  skill: { id: string; name: string; category: string };
}

interface CvInfo {
  filename: string;
  url: string;
  uploadDate: string;
}

export default function CandidateProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<CandidateProfile | null>(null);
  const [skills, setSkills] = useState<SkillEntry[]>([]);
  const [skillSearch, setSkillSearch] = useState("");
  const [skillResults, setSkillResults] = useState<
    Array<{ id: string; name: string; category: string }>
  >([]);

  // CV state
  const [cvInfo, setCvInfo] = useState<CvInfo | null>(null);
  const [cvUploading, setCvUploading] = useState(false);
  const [cvDeleting, setCvDeleting] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    location: "",
    headline: "",
    summary: "",
    linkedIn: "",
    salaryMin: "",
    salaryMax: "",
    dayRateMin: "",
    dayRateMax: "",
    noticePeriod: "",
    availableFrom: "",
  });

  const fetchCvInfo = useCallback(async () => {
    try {
      const res = await fetch("/api/portal/candidate/cv");
      const data = await res.json();
      setCvInfo(data.cv ?? null);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    Promise.all([
      fetch("/api/portal/candidate/dashboard").then((r) => r.json()),
      fetch("/api/portal/candidate/skills").then((r) => r.json()),
      fetch("/api/portal/candidate/cv").then((r) => r.json()),
    ])
      .then(([dashData, skillsData, cvData]) => {
        if (dashData.candidate) {
          const c: CandidateProfile = dashData.candidate;
          setProfile(c);
          setForm({
            firstName: c.firstName ?? "",
            lastName: c.lastName ?? "",
            email: c.email ?? "",
            phone: c.phone ?? "",
            location: c.location ?? "",
            headline: c.headline ?? "",
            summary: c.summary ?? "",
            linkedIn: c.linkedIn ?? "",
            salaryMin: c.salaryMin?.toString() ?? "",
            salaryMax: c.salaryMax?.toString() ?? "",
            dayRateMin: c.dayRateMin?.toString() ?? "",
            dayRateMax: c.dayRateMax?.toString() ?? "",
            noticePeriod: c.noticePeriod ?? "",
            availableFrom: c.availableFrom
              ? c.availableFrom.split("T")[0]
              : "",
          });
        }
        if (skillsData.skills) {
          setSkills(skillsData.skills);
        }
        setCvInfo(cvData.cv ?? null);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  async function handleCvUpload(file: File) {
    // Client-side validation
    const ext = file.name.split(".").pop()?.toLowerCase();
    if (!ext || !["pdf", "doc", "docx"].includes(ext)) {
      toast.error("Invalid file type. Only PDF, DOC, and DOCX are allowed.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size exceeds 5MB limit.");
      return;
    }

    setCvUploading(true);
    try {
      const formData = new FormData();
      formData.append("cv", file);

      const res = await fetch("/api/portal/candidate/cv", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Upload failed");
      }

      toast.success("CV uploaded successfully");
      await fetchCvInfo();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to upload CV"
      );
    } finally {
      setCvUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }

  async function handleCvDelete() {
    setCvDeleting(true);
    try {
      const res = await fetch("/api/portal/candidate/cv", {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Delete failed");
      setCvInfo(null);
      toast.success("CV deleted");
    } catch {
      toast.error("Failed to delete CV");
    } finally {
      setCvDeleting(false);
    }
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      handleCvUpload(file);
    }
  }

  function handleDragOver(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDragOver(true);
  }

  function handleDragLeave(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDragOver(false);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const body: Record<string, unknown> = { ...form };
      if (form.salaryMin) body.salaryMin = parseInt(form.salaryMin, 10);
      else body.salaryMin = null;
      if (form.salaryMax) body.salaryMax = parseInt(form.salaryMax, 10);
      else body.salaryMax = null;
      if (form.dayRateMin) body.dayRateMin = parseInt(form.dayRateMin, 10);
      else body.dayRateMin = null;
      if (form.dayRateMax) body.dayRateMax = parseInt(form.dayRateMax, 10);
      else body.dayRateMax = null;
      if (form.availableFrom)
        body.availableFrom = new Date(form.availableFrom).toISOString();
      else body.availableFrom = null;

      const res = await fetch("/api/portal/candidate/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error("Failed to update");
      toast.success("Profile saved");
    } catch {
      toast.error("Failed to save profile");
    } finally {
      setSaving(false);
    }
  }

  async function searchSkills(query: string) {
    setSkillSearch(query);
    if (query.length < 2) {
      setSkillResults([]);
      return;
    }
    try {
      const res = await fetch(
        `/api/skills?search=${encodeURIComponent(query)}&limit=10`
      );
      const data = await res.json();
      setSkillResults(data.skills ?? []);
    } catch {
      /* ignore */
    }
  }

  async function addSkill(skillId: string) {
    try {
      const res = await fetch("/api/portal/candidate/skills", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ skillId }),
      });
      if (!res.ok) throw new Error("Failed to add skill");
      const newSkill = await res.json();
      setSkills((prev) => [...prev, newSkill]);
      setSkillSearch("");
      setSkillResults([]);
      toast.success("Skill added");
    } catch {
      toast.error("Failed to add skill");
    }
  }

  async function removeSkill(candidateSkillId: string) {
    try {
      await fetch(`/api/portal/candidate/skills?id=${candidateSkillId}`, {
        method: "DELETE",
      });
      setSkills((prev) => prev.filter((s) => s.id !== candidateSkillId));
      toast.success("Skill removed");
    } catch {
      toast.error("Failed to remove skill");
    }
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="size-8 animate-spin text-[#00D4FF]" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">My Profile</h1>
        <p className="mt-1 text-sm text-gray-400">
          Keep your profile up to date for better job matches
        </p>
      </div>

      {/* Resume / CV Section */}
      <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-6 backdrop-blur-sm">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-lg bg-[#00D4FF]/20">
            <FileText className="size-5 text-[#00D4FF]" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">
              Resume / CV
            </h2>
            <p className="text-sm text-gray-400">
              Upload your resume for better job matching
            </p>
          </div>
        </div>

        {/* Current CV display */}
        {cvInfo ? (
          <div className="mb-4 rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="size-5 shrink-0 text-emerald-400" />
                <div>
                  <p className="text-sm font-medium text-emerald-400">
                    CV Uploaded
                  </p>
                  <p className="mt-0.5 text-sm text-gray-300">
                    {cvInfo.filename}
                  </p>
                  <p className="text-xs text-gray-500">
                    Uploaded{" "}
                    {new Date(cvInfo.uploadDate).toLocaleDateString(
                      undefined,
                      {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      }
                    )}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={cvInfo.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 rounded-lg border border-white/[0.1] bg-white/[0.05] px-3 py-1.5 text-xs text-gray-300 transition-colors hover:bg-white/[0.1]"
                >
                  <ExternalLink className="size-3" />
                  View
                </a>
                <button
                  onClick={handleCvDelete}
                  disabled={cvDeleting}
                  className="inline-flex items-center gap-1 rounded-lg border border-red-500/20 bg-red-500/5 px-3 py-1.5 text-xs text-red-400 transition-colors hover:bg-red-500/10 disabled:opacity-50"
                >
                  {cvDeleting ? (
                    <Loader2 className="size-3 animate-spin" />
                  ) : (
                    <Trash2 className="size-3" />
                  )}
                  Delete
                </button>
              </div>
            </div>
          </div>
        ) : null}

        {/* Upload zone */}
        <div
          onClick={() => fileInputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer ${
            isDragOver
              ? "border-[#00D4FF]/50 bg-[#00D4FF]/5"
              : "border-white/20 hover:border-[#00D4FF]/50"
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.doc,.docx"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleCvUpload(file);
            }}
          />
          {cvUploading ? (
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="size-8 animate-spin text-[#00D4FF]" />
              <p className="text-sm text-gray-300">Uploading...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3">
              <div className="flex size-12 items-center justify-center rounded-full bg-white/[0.05]">
                <Upload className="size-6 text-gray-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-300">
                  {cvInfo
                    ? "Upload a new CV to replace the current one"
                    : "Upload Your CV"}
                </p>
                <p className="mt-1 text-xs text-gray-500">
                  Drag and drop or click to browse
                </p>
              </div>
              <p className="text-xs text-gray-500">
                PDF, DOC, DOCX - Max 5MB
              </p>
            </div>
          )}
        </div>
      </div>

      <form
        onSubmit={handleSave}
        className="space-y-6 rounded-xl border border-white/[0.08] bg-white/[0.03] p-6 backdrop-blur-sm"
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label className="text-gray-300">First Name</Label>
            <Input
              value={form.firstName}
              onChange={(e) =>
                setForm((p) => ({ ...p, firstName: e.target.value }))
              }
              className="border-white/[0.1] bg-white/[0.05] text-white"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-gray-300">Last Name</Label>
            <Input
              value={form.lastName}
              onChange={(e) =>
                setForm((p) => ({ ...p, lastName: e.target.value }))
              }
              className="border-white/[0.1] bg-white/[0.05] text-white"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label className="text-gray-300">Email</Label>
            <Input
              value={form.email}
              disabled
              className="border-white/[0.1] bg-white/[0.05] text-gray-400"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-gray-300">Phone</Label>
            <Input
              value={form.phone}
              onChange={(e) =>
                setForm((p) => ({ ...p, phone: e.target.value }))
              }
              className="border-white/[0.1] bg-white/[0.05] text-white"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-gray-300">Location</Label>
          <Input
            value={form.location}
            onChange={(e) =>
              setForm((p) => ({ ...p, location: e.target.value }))
            }
            placeholder="e.g. London, UK"
            className="border-white/[0.1] bg-white/[0.05] text-white placeholder:text-gray-500"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-gray-300">Headline</Label>
          <Input
            value={form.headline}
            onChange={(e) =>
              setForm((p) => ({ ...p, headline: e.target.value }))
            }
            placeholder="e.g. Senior Full-Stack Developer"
            className="border-white/[0.1] bg-white/[0.05] text-white placeholder:text-gray-500"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-gray-300">Summary</Label>
          <Textarea
            value={form.summary}
            onChange={(e) =>
              setForm((p) => ({ ...p, summary: e.target.value }))
            }
            rows={4}
            placeholder="Tell employers about yourself..."
            className="border-white/[0.1] bg-white/[0.05] text-white placeholder:text-gray-500"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-gray-300">LinkedIn</Label>
          <Input
            value={form.linkedIn}
            onChange={(e) =>
              setForm((p) => ({ ...p, linkedIn: e.target.value }))
            }
            placeholder="https://linkedin.com/in/yourprofile"
            className="border-white/[0.1] bg-white/[0.05] text-white placeholder:text-gray-500"
          />
        </div>

        {/* Salary preferences */}
        <div>
          <Label className="mb-2 block text-gray-300">Salary Preferences</Label>
          <div className="grid grid-cols-2 gap-4">
            <Input
              type="number"
              value={form.salaryMin}
              onChange={(e) =>
                setForm((p) => ({ ...p, salaryMin: e.target.value }))
              }
              placeholder="Min salary"
              className="border-white/[0.1] bg-white/[0.05] text-white placeholder:text-gray-500"
            />
            <Input
              type="number"
              value={form.salaryMax}
              onChange={(e) =>
                setForm((p) => ({ ...p, salaryMax: e.target.value }))
              }
              placeholder="Max salary"
              className="border-white/[0.1] bg-white/[0.05] text-white placeholder:text-gray-500"
            />
          </div>
        </div>

        <div>
          <Label className="mb-2 block text-gray-300">Day Rate Preferences</Label>
          <div className="grid grid-cols-2 gap-4">
            <Input
              type="number"
              value={form.dayRateMin}
              onChange={(e) =>
                setForm((p) => ({ ...p, dayRateMin: e.target.value }))
              }
              placeholder="Min day rate"
              className="border-white/[0.1] bg-white/[0.05] text-white placeholder:text-gray-500"
            />
            <Input
              type="number"
              value={form.dayRateMax}
              onChange={(e) =>
                setForm((p) => ({ ...p, dayRateMax: e.target.value }))
              }
              placeholder="Max day rate"
              className="border-white/[0.1] bg-white/[0.05] text-white placeholder:text-gray-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label className="text-gray-300">Notice Period</Label>
            <Input
              value={form.noticePeriod}
              onChange={(e) =>
                setForm((p) => ({ ...p, noticePeriod: e.target.value }))
              }
              placeholder="e.g. 1 month"
              className="border-white/[0.1] bg-white/[0.05] text-white placeholder:text-gray-500"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-gray-300">Available From</Label>
            <Input
              type="date"
              value={form.availableFrom}
              onChange={(e) =>
                setForm((p) => ({ ...p, availableFrom: e.target.value }))
              }
              className="border-white/[0.1] bg-white/[0.05] text-white"
            />
          </div>
        </div>

        <Button
          type="submit"
          disabled={saving}
          className="bg-[#00D4FF] text-black hover:bg-[#00b8dd]"
        >
          {saving ? (
            <Loader2 className="mr-2 size-4 animate-spin" />
          ) : (
            <Save className="mr-2 size-4" />
          )}
          Save Profile
        </Button>
      </form>

      {/* Skills Section */}
      <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-6 backdrop-blur-sm">
        <h2 className="mb-4 text-lg font-semibold text-white">Skills</h2>

        {/* Current Skills */}
        <div className="mb-4 flex flex-wrap gap-2">
          {skills.length === 0 && (
            <p className="text-sm text-gray-400">No skills added yet.</p>
          )}
          {skills.map((entry) => (
            <span
              key={entry.id}
              className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.1] bg-white/[0.05] px-3 py-1 text-sm text-white"
            >
              {entry.skill.name}
              {entry.isVerified && (
                <span className="text-xs text-emerald-400">&#10003;</span>
              )}
              {entry.proficiency != null && (
                <span className="text-xs text-gray-400">
                  ({entry.proficiency}/5)
                </span>
              )}
              <button
                onClick={() => removeSkill(entry.id)}
                className="ml-1 text-gray-400 hover:text-red-400"
              >
                <X className="size-3" />
              </button>
            </span>
          ))}
        </div>

        {/* Add Skill */}
        <div className="relative">
          <Input
            value={skillSearch}
            onChange={(e) => searchSkills(e.target.value)}
            placeholder="Search skills to add..."
            className="border-white/[0.1] bg-white/[0.05] text-white placeholder:text-gray-500"
          />
          {skillResults.length > 0 && (
            <div className="absolute z-10 mt-1 max-h-48 w-full overflow-y-auto rounded-lg border border-white/[0.1] bg-[#0a0a2e]">
              {skillResults.map((skill) => (
                <button
                  key={skill.id}
                  onClick={() => addSkill(skill.id)}
                  className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-white hover:bg-white/[0.05]"
                >
                  <Plus className="size-3 text-[#00D4FF]" />
                  {skill.name}
                  <span className="text-xs text-gray-400">
                    {skill.category}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
