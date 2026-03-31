"use client";

import { useState, useEffect, type FormEvent } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  Loader2,
  CheckCircle2,
  X,
  Search,
  User,
  Briefcase,
  Wrench,
  Settings2,
  ShieldCheck,
  ChevronRight,
  ChevronLeft,
  Upload,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { APP_NAME } from "@/lib/constants";

// ── Types ───────────────────────────────────────────────────────────

interface SkillOption {
  id: string;
  name: string;
  shortName: string;
  category: string;
}

interface FormData {
  // Step 1
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  location: string;
  linkedIn: string;
  specialism: string;
  industry: string;
  // Step 2
  headline: string;
  summary: string;
  cvText: string;
  cvFile: File | null;
  // Step 3
  skills: SkillOption[];
  // Step 4
  contractType: string;
  salaryMin: string;
  salaryMax: string;
  dayRateMin: string;
  dayRateMax: string;
  noticePeriod: string;
  availableFrom: string;
  rightToWork: boolean;
  // Step 5
  gdprConsent: boolean;
}

// ── Constants ───────────────────────────────────────────────────────

const STEPS = [
  { label: "Basic Info", icon: User },
  { label: "Experience", icon: Briefcase },
  { label: "Skills", icon: Wrench },
  { label: "Preferences", icon: Settings2 },
  { label: "Submit", icon: ShieldCheck },
];

const COMMON_SKILLS = [
  "PLC Programming",
  "SCADA",
  "HMI",
  "DCS",
  "Robotics",
  "Control Systems",
  "Siemens",
  "Allen-Bradley",
  "Mitsubishi",
  "ABB",
  "Schneider Electric",
  "Beckhoff",
  "TwinCAT",
  "FactoryTalk",
  "WinCC",
  "Ignition",
  "Python",
  "C/C++",
  "Electrical Design",
  "Commissioning",
];

const SPECIALISM_OPTIONS = [
  "PLC Programming",
  "SCADA",
  "Controls Engineering",
  "Robotics",
  "EC&I",
  "Commissioning",
  "Software Development",
  "Data & AI",
  "Business Operations",
  "Project Management",
  "Other",
];

const INDUSTRY_OPTIONS = [
  "Automotive",
  "Pharma",
  "Water & Utilities",
  "Oil & Gas",
  "Food & Beverage",
  "Power Generation",
  "Building Automation",
  "Manufacturing",
  "Technology",
  "Professional Services",
  "Financial Services",
  "Other",
];

const NOTICE_PERIODS = [
  { value: "immediate", label: "Immediate" },
  { value: "1_week", label: "1 Week" },
  { value: "2_weeks", label: "2 Weeks" },
  { value: "1_month", label: "1 Month" },
  { value: "3_months", label: "3 Months" },
];

// ── Page Component ──────────────────────────────────────────────────

export default function RegisterPage() {
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [form, setForm] = useState<FormData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    location: "",
    linkedIn: "",
    specialism: "",
    industry: "",
    headline: "",
    summary: "",
    cvText: "",
    cvFile: null,
    skills: [],
    contractType: "EITHER",
    salaryMin: "",
    salaryMax: "",
    dayRateMin: "",
    dayRateMax: "",
    noticePeriod: "",
    availableFrom: "",
    rightToWork: false,
    gdprConsent: false,
  });

  // Skills search
  const [skillSearch, setSkillSearch] = useState("");
  const [skillResults, setSkillResults] = useState<SkillOption[]>([]);
  const [searchingSkills, setSearchingSkills] = useState(false);

  // Debounced skill search
  useEffect(() => {
    if (!skillSearch || skillSearch.length < 2) {
      setSkillResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setSearchingSkills(true);
      try {
        const res = await fetch(`/api/skills/public?search=${encodeURIComponent(skillSearch)}`);
        if (res.ok) {
          const data = await res.json();
          setSkillResults(
            data.filter(
              (s: SkillOption) => !form.skills.some((sel) => sel.id === s.id)
            )
          );
        }
      } catch {
        // Silently handle
      } finally {
        setSearchingSkills(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [skillSearch, form.skills]);

  function updateField<K extends keyof FormData>(key: K, value: FormData[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function addSkill(skill: SkillOption) {
    if (!form.skills.some((s) => s.id === skill.id)) {
      updateField("skills", [...form.skills, skill]);
    }
    setSkillSearch("");
    setSkillResults([]);
  }

  function addCommonSkill(name: string) {
    if (form.skills.some((s) => s.name === name)) return;
    // Create a temporary skill entry for common skills
    const tempSkill: SkillOption = {
      id: `temp_${name}`,
      name,
      shortName: name,
      category: "Common",
    };
    updateField("skills", [...form.skills, tempSkill]);
  }

  function removeSkill(skillId: string) {
    updateField(
      "skills",
      form.skills.filter((s) => s.id !== skillId)
    );
  }

  function canProceed(): boolean {
    switch (step) {
      case 1:
        return !!(form.firstName && form.lastName && form.email);
      case 2:
        return true;
      case 3:
        return true;
      case 4:
        return true;
      case 5:
        return form.gdprConsent;
      default:
        return true;
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!form.gdprConsent) {
      toast.error("Please accept the GDPR consent to continue.");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        phone: form.phone || undefined,
        location: form.location || undefined,
        linkedIn: form.linkedIn || undefined,
        specialism: form.specialism || undefined,
        industry: form.industry || undefined,
        headline: form.headline || undefined,
        summary: form.summary || undefined,
        cvText: form.cvText || undefined,
        skillIds: form.skills
          .filter((s) => !s.id.startsWith("temp_"))
          .map((s) => s.id),
        skillNames: form.skills
          .filter((s) => s.id.startsWith("temp_"))
          .map((s) => s.name),
        contractType: form.contractType,
        salaryMin: form.salaryMin ? parseInt(form.salaryMin, 10) : undefined,
        salaryMax: form.salaryMax ? parseInt(form.salaryMax, 10) : undefined,
        dayRateMin: form.dayRateMin ? parseInt(form.dayRateMin, 10) : undefined,
        dayRateMax: form.dayRateMax ? parseInt(form.dayRateMax, 10) : undefined,
        noticePeriod: form.noticePeriod || undefined,
        availableFrom: form.availableFrom || undefined,
        rightToWork: form.rightToWork,
        gdprConsent: form.gdprConsent,
      };

      const res = await fetch("/api/register-candidate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Registration failed. Please try again.");
        return;
      }

      setSubmitted(true);
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  // ── Success Screen ──────────────────────────────────────────────

  if (submitted) {
    return (
      <div className="min-h-screen bg-[#02012B] flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-[#00D4FF]/20">
            <CheckCircle2 className="h-10 w-10 text-[#00D4FF]" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-3">
            Registration Complete!
          </h1>
          <p className="text-gray-400 mb-8">
            Thank you for registering with {APP_NAME}. Our team will review your
            profile and match you with relevant opportunities.
          </p>
          <div className="flex flex-col gap-3">
            <Link href="/sign-up">
              <Button
                className="w-full text-white font-semibold py-3"
                style={{
                  background: "#00D4FF",
                  boxShadow: "0 4px 14px rgba(0, 212, 255, 0.4)",
                }}
              >
                Create an Account
              </Button>
            </Link>
            <Link href="/jobs">
              <Button
                variant="outline"
                className="w-full border-white/20 text-gray-300 hover:bg-white/5 hover:text-white"
              >
                Browse Jobs
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ── Main Form ───────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-[#02012B] py-12 px-4">
      <div className="mx-auto max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white sm:text-4xl">
            Join {APP_NAME}
          </h1>
          <p className="mt-2 text-gray-400">
            Register as a candidate and get matched with the best automation &amp;
            controls roles in the UK.
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {STEPS.map((s, i) => {
              const stepNum = i + 1;
              const Icon = s.icon;
              const isComplete = step > stepNum;
              const isCurrent = step === stepNum;
              return (
                <div key={s.label} className="flex flex-1 items-center">
                  <div className="flex flex-col items-center flex-1">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all ${
                        isComplete
                          ? "border-[#00D4FF] bg-[#00D4FF] text-[#02012B]"
                          : isCurrent
                          ? "border-[#00D4FF] bg-[#00D4FF]/20 text-[#00D4FF]"
                          : "border-white/20 bg-white/5 text-gray-500"
                      }`}
                    >
                      {isComplete ? (
                        <CheckCircle2 className="h-5 w-5" />
                      ) : (
                        <Icon className="h-5 w-5" />
                      )}
                    </div>
                    <span
                      className={`mt-1.5 text-[10px] font-medium uppercase tracking-wider hidden sm:block ${
                        isCurrent ? "text-[#00D4FF]" : "text-gray-500"
                      }`}
                    >
                      {s.label}
                    </span>
                  </div>
                  {i < STEPS.length - 1 && (
                    <div
                      className={`h-[2px] flex-1 mx-1 ${
                        step > stepNum ? "bg-[#00D4FF]" : "bg-white/10"
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Form Card */}
        <form onSubmit={handleSubmit}>
          <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 sm:p-8 shadow-2xl">
            {/* Step 1: Basic Info */}
            {step === 1 && (
              <div className="space-y-5">
                <h2 className="text-xl font-semibold text-white">
                  Basic Information
                </h2>
                <p className="text-sm text-gray-400">
                  Tell us a bit about yourself so we can get in touch.
                </p>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <Label className="text-gray-300">
                      First Name <span className="text-[#00D4FF]">*</span>
                    </Label>
                    <Input
                      required
                      value={form.firstName}
                      onChange={(e) => updateField("firstName", e.target.value)}
                      placeholder="John"
                      className="mt-1.5 border-white/10 bg-white/5 text-white placeholder:text-gray-500 focus:border-[#00D4FF] focus:ring-[#00D4FF]/20"
                    />
                  </div>
                  <div>
                    <Label className="text-gray-300">
                      Last Name <span className="text-[#00D4FF]">*</span>
                    </Label>
                    <Input
                      required
                      value={form.lastName}
                      onChange={(e) => updateField("lastName", e.target.value)}
                      placeholder="Smith"
                      className="mt-1.5 border-white/10 bg-white/5 text-white placeholder:text-gray-500 focus:border-[#00D4FF] focus:ring-[#00D4FF]/20"
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-gray-300">
                    Email <span className="text-[#00D4FF]">*</span>
                  </Label>
                  <Input
                    required
                    type="email"
                    value={form.email}
                    onChange={(e) => updateField("email", e.target.value)}
                    placeholder="john.smith@example.com"
                    className="mt-1.5 border-white/10 bg-white/5 text-white placeholder:text-gray-500 focus:border-[#00D4FF] focus:ring-[#00D4FF]/20"
                  />
                </div>

                <div>
                  <Label className="text-gray-300">Phone</Label>
                  <Input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => updateField("phone", e.target.value)}
                    placeholder="+44 7700 900000"
                    className="mt-1.5 border-white/10 bg-white/5 text-white placeholder:text-gray-500 focus:border-[#00D4FF] focus:ring-[#00D4FF]/20"
                  />
                </div>

                <div>
                  <Label className="text-gray-300">Location</Label>
                  <Input
                    value={form.location}
                    onChange={(e) => updateField("location", e.target.value)}
                    placeholder="e.g. Manchester, UK"
                    className="mt-1.5 border-white/10 bg-white/5 text-white placeholder:text-gray-500 focus:border-[#00D4FF] focus:ring-[#00D4FF]/20"
                  />
                </div>

                <div>
                  <Label className="text-gray-300">LinkedIn URL</Label>
                  <Input
                    value={form.linkedIn}
                    onChange={(e) => updateField("linkedIn", e.target.value)}
                    placeholder="https://linkedin.com/in/your-profile"
                    className="mt-1.5 border-white/10 bg-white/5 text-white placeholder:text-gray-500 focus:border-[#00D4FF] focus:ring-[#00D4FF]/20"
                  />
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <Label className="text-gray-300">Specialism</Label>
                    <Select
                      value={form.specialism}
                      onValueChange={(val) => updateField("specialism", val ?? "")}
                    >
                      <SelectTrigger className="mt-1.5 border-white/10 bg-white/5 text-white">
                        <SelectValue placeholder="Select your specialism" />
                      </SelectTrigger>
                      <SelectContent>
                        {SPECIALISM_OPTIONS.map((s) => (
                          <SelectItem key={s} value={s}>
                            {s}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-gray-300">Industry Experience</Label>
                    <Select
                      value={form.industry}
                      onValueChange={(val) => updateField("industry", val ?? "")}
                    >
                      <SelectTrigger className="mt-1.5 border-white/10 bg-white/5 text-white">
                        <SelectValue placeholder="Select your industry" />
                      </SelectTrigger>
                      <SelectContent>
                        {INDUSTRY_OPTIONS.map((ind) => (
                          <SelectItem key={ind} value={ind}>
                            {ind}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Experience */}
            {step === 2 && (
              <div className="space-y-5">
                <h2 className="text-xl font-semibold text-white">
                  Experience
                </h2>
                <p className="text-sm text-gray-400">
                  Share your professional background. You can upload a CV or paste
                  your details below.
                </p>

                <div>
                  <Label className="text-gray-300">Headline</Label>
                  <Input
                    value={form.headline}
                    onChange={(e) => updateField("headline", e.target.value)}
                    placeholder='e.g. "Senior PLC Engineer | Siemens & Allen-Bradley"'
                    className="mt-1.5 border-white/10 bg-white/5 text-white placeholder:text-gray-500 focus:border-[#00D4FF] focus:ring-[#00D4FF]/20"
                  />
                </div>

                <div>
                  <Label className="text-gray-300">Summary</Label>
                  <Textarea
                    value={form.summary}
                    onChange={(e) => updateField("summary", e.target.value)}
                    placeholder="Brief summary of your experience, skills, and what you're looking for..."
                    rows={4}
                    className="mt-1.5 border-white/10 bg-white/5 text-white placeholder:text-gray-500 focus:border-[#00D4FF] focus:ring-[#00D4FF]/20"
                  />
                </div>

                <div>
                  <Label className="text-gray-300">Upload CV</Label>
                  <div className="mt-1.5">
                    <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-white/20 bg-white/5 px-6 py-8 transition-colors hover:border-[#00D4FF]/50 hover:bg-white/10">
                      <Upload className="mb-2 h-8 w-8 text-gray-500" />
                      <span className="text-sm text-gray-400">
                        {form.cvFile
                          ? form.cvFile.name
                          : "Click to upload PDF or DOC"}
                      </span>
                      <span className="mt-1 text-xs text-gray-600">
                        Max 5MB
                      </span>
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0] || null;
                          updateField("cvFile", file);
                        }}
                      />
                    </label>
                  </div>
                </div>

                <div>
                  <Label className="text-gray-300">
                    Or paste your CV / experience below
                  </Label>
                  <Textarea
                    value={form.cvText}
                    onChange={(e) => updateField("cvText", e.target.value)}
                    placeholder="Paste your CV text here..."
                    rows={6}
                    className="mt-1.5 border-white/10 bg-white/5 text-white placeholder:text-gray-500 focus:border-[#00D4FF] focus:ring-[#00D4FF]/20"
                  />
                </div>
              </div>
            )}

            {/* Step 3: Skills */}
            {step === 3 && (
              <div className="space-y-5">
                <h2 className="text-xl font-semibold text-white">Skills</h2>
                <p className="text-sm text-gray-400">
                  Select your key skills. Search our database or pick from common
                  automation skills.
                </p>

                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                  <Input
                    value={skillSearch}
                    onChange={(e) => setSkillSearch(e.target.value)}
                    placeholder="Search skills..."
                    className="pl-9 border-white/10 bg-white/5 text-white placeholder:text-gray-500 focus:border-[#00D4FF] focus:ring-[#00D4FF]/20"
                  />
                  {searchingSkills && (
                    <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-[#00D4FF]" />
                  )}
                </div>

                {/* Search results */}
                {skillResults.length > 0 && (
                  <div className="max-h-48 overflow-y-auto rounded-lg border border-white/10 bg-[#02012B]">
                    {skillResults.map((skill) => (
                      <button
                        key={skill.id}
                        type="button"
                        onClick={() => addSkill(skill)}
                        className="flex w-full items-center justify-between px-4 py-2.5 text-sm text-gray-300 transition-colors hover:bg-white/10 hover:text-white"
                      >
                        <span>{skill.name}</span>
                        <span className="text-xs text-gray-500">
                          {skill.category}
                        </span>
                      </button>
                    ))}
                  </div>
                )}

                {/* Common skills */}
                <div>
                  <Label className="text-gray-400 text-xs uppercase tracking-wider">
                    Common Skills
                  </Label>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {COMMON_SKILLS.map((name) => {
                      const isSelected = form.skills.some(
                        (s) => s.name === name
                      );
                      return (
                        <button
                          key={name}
                          type="button"
                          onClick={() =>
                            isSelected
                              ? removeSkill(`temp_${name}`)
                              : addCommonSkill(name)
                          }
                          className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-all ${
                            isSelected
                              ? "border-[#00D4FF] bg-[#00D4FF]/20 text-[#00D4FF]"
                              : "border-white/15 bg-white/5 text-gray-400 hover:border-white/30 hover:text-white"
                          }`}
                        >
                          {name}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Selected skills */}
                {form.skills.length > 0 && (
                  <div>
                    <Label className="text-gray-400 text-xs uppercase tracking-wider">
                      Selected ({form.skills.length})
                    </Label>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {form.skills.map((skill) => (
                        <span
                          key={skill.id}
                          className="inline-flex items-center gap-1.5 rounded-full bg-[#00D4FF]/15 px-3 py-1 text-xs font-medium text-[#00D4FF]"
                        >
                          {skill.name}
                          <button
                            type="button"
                            onClick={() => removeSkill(skill.id)}
                            className="rounded-full p-0.5 hover:bg-[#00D4FF]/30 transition-colors"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Step 4: Preferences */}
            {step === 4 && (
              <div className="space-y-5">
                <h2 className="text-xl font-semibold text-white">
                  Preferences
                </h2>
                <p className="text-sm text-gray-400">
                  Help us find the right roles for you by setting your preferences.
                </p>

                <div>
                  <Label className="text-gray-300">Contract Type</Label>
                  <div className="mt-2 flex gap-2">
                    {["PERMANENT", "CONTRACT", "EITHER"].map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => updateField("contractType", type)}
                        className={`flex-1 rounded-lg border px-3 py-2.5 text-sm font-medium transition-all ${
                          form.contractType === type
                            ? "border-[#00D4FF] bg-[#00D4FF]/20 text-[#00D4FF]"
                            : "border-white/15 bg-white/5 text-gray-400 hover:border-white/30 hover:text-white"
                        }`}
                      >
                        {type === "EITHER"
                          ? "Either"
                          : type.charAt(0) + type.slice(1).toLowerCase()}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-gray-300">Min Salary (GBP)</Label>
                    <Input
                      type="number"
                      value={form.salaryMin}
                      onChange={(e) => updateField("salaryMin", e.target.value)}
                      placeholder="30000"
                      className="mt-1.5 border-white/10 bg-white/5 text-white placeholder:text-gray-500 focus:border-[#00D4FF] focus:ring-[#00D4FF]/20"
                    />
                  </div>
                  <div>
                    <Label className="text-gray-300">Max Salary (GBP)</Label>
                    <Input
                      type="number"
                      value={form.salaryMax}
                      onChange={(e) => updateField("salaryMax", e.target.value)}
                      placeholder="60000"
                      className="mt-1.5 border-white/10 bg-white/5 text-white placeholder:text-gray-500 focus:border-[#00D4FF] focus:ring-[#00D4FF]/20"
                    />
                  </div>
                </div>

                {(form.contractType === "CONTRACT" ||
                  form.contractType === "EITHER") && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-gray-300">
                        Min Day Rate (GBP)
                      </Label>
                      <Input
                        type="number"
                        value={form.dayRateMin}
                        onChange={(e) =>
                          updateField("dayRateMin", e.target.value)
                        }
                        placeholder="300"
                        className="mt-1.5 border-white/10 bg-white/5 text-white placeholder:text-gray-500 focus:border-[#00D4FF] focus:ring-[#00D4FF]/20"
                      />
                    </div>
                    <div>
                      <Label className="text-gray-300">
                        Max Day Rate (GBP)
                      </Label>
                      <Input
                        type="number"
                        value={form.dayRateMax}
                        onChange={(e) =>
                          updateField("dayRateMax", e.target.value)
                        }
                        placeholder="500"
                        className="mt-1.5 border-white/10 bg-white/5 text-white placeholder:text-gray-500 focus:border-[#00D4FF] focus:ring-[#00D4FF]/20"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <Label className="text-gray-300">Notice Period</Label>
                  <Select
                    value={form.noticePeriod}
                    onValueChange={(val) =>
                      updateField("noticePeriod", val ?? "")
                    }
                  >
                    <SelectTrigger className="mt-1.5 border-white/10 bg-white/5 text-white">
                      <SelectValue placeholder="Select notice period" />
                    </SelectTrigger>
                    <SelectContent>
                      {NOTICE_PERIODS.map((np) => (
                        <SelectItem key={np.value} value={np.value}>
                          {np.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-gray-300">Available From</Label>
                  <Input
                    type="date"
                    value={form.availableFrom}
                    onChange={(e) =>
                      updateField("availableFrom", e.target.value)
                    }
                    className="mt-1.5 border-white/10 bg-white/5 text-white focus:border-[#00D4FF] focus:ring-[#00D4FF]/20"
                  />
                </div>

                <div className="flex items-center gap-3">
                  <Checkbox
                    checked={form.rightToWork}
                    onCheckedChange={(checked) =>
                      updateField("rightToWork", checked === true)
                    }
                    className="border-white/30 data-checked:border-[#00D4FF] data-checked:bg-[#00D4FF]"
                  />
                  <Label className="text-gray-300 cursor-pointer">
                    I have the right to work in the UK
                  </Label>
                </div>
              </div>
            )}

            {/* Step 5: GDPR Consent + Submit */}
            {step === 5 && (
              <div className="space-y-5">
                <h2 className="text-xl font-semibold text-white">
                  GDPR Consent &amp; Submit
                </h2>
                <p className="text-sm text-gray-400">
                  Please review and accept our data processing terms before
                  submitting your registration.
                </p>

                <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                  <h3 className="text-sm font-semibold text-white mb-2">
                    How we use your data
                  </h3>
                  <ul className="space-y-1.5 text-xs text-gray-400">
                    <li>
                      We will store your personal data to match you with relevant
                      job opportunities.
                    </li>
                    <li>
                      Your CV and profile may be shared with potential employers
                      with your consent.
                    </li>
                    <li>
                      We may contact you about suitable vacancies via email or
                      phone.
                    </li>
                    <li>
                      You can request deletion of your data at any time.
                    </li>
                  </ul>
                </div>

                <div className="flex items-start gap-3">
                  <Checkbox
                    checked={form.gdprConsent}
                    onCheckedChange={(checked) =>
                      updateField("gdprConsent", checked === true)
                    }
                    className="mt-0.5 border-white/30 data-checked:border-[#00D4FF] data-checked:bg-[#00D4FF]"
                  />
                  <Label className="text-gray-300 text-sm cursor-pointer leading-relaxed">
                    I consent to {APP_NAME} processing my personal data as
                    described above and in the{" "}
                    <Link
                      href="/privacy"
                      className="text-[#00D4FF] underline hover:text-[#00D4FF]/80"
                      target="_blank"
                    >
                      Privacy Policy
                    </Link>
                    . <span className="text-[#00D4FF]">*</span>
                  </Label>
                </div>

                {/* Summary preview */}
                <div className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-2">
                  <h3 className="text-sm font-semibold text-white">
                    Registration Summary
                  </h3>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                    <span className="text-gray-500">Name</span>
                    <span className="text-gray-300">
                      {form.firstName} {form.lastName}
                    </span>
                    <span className="text-gray-500">Email</span>
                    <span className="text-gray-300">{form.email}</span>
                    {form.headline && (
                      <>
                        <span className="text-gray-500">Headline</span>
                        <span className="text-gray-300">{form.headline}</span>
                      </>
                    )}
                    <span className="text-gray-500">Skills</span>
                    <span className="text-gray-300">
                      {form.skills.length > 0
                        ? form.skills.map((s) => s.name).join(", ")
                        : "None selected"}
                    </span>
                    <span className="text-gray-500">Contract</span>
                    <span className="text-gray-300">{form.contractType}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="mt-8 flex items-center justify-between">
              {step > 1 ? (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep(step - 1)}
                  className="border-white/20 text-gray-300 hover:bg-white/5 hover:text-white"
                >
                  <ChevronLeft className="mr-1 h-4 w-4" />
                  Back
                </Button>
              ) : (
                <div />
              )}

              {step < 5 ? (
                <Button
                  type="button"
                  onClick={() => setStep(step + 1)}
                  disabled={!canProceed()}
                  className="text-white font-semibold disabled:opacity-40"
                  style={{
                    background: "#00D4FF",
                    boxShadow: "0 4px 14px rgba(0, 212, 255, 0.4)",
                  }}
                >
                  Next
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              ) : (
                <Button
                  type="submit"
                  disabled={!canProceed() || submitting}
                  className="text-white font-semibold disabled:opacity-40"
                  style={{
                    background: "#00D4FF",
                    boxShadow: "0 4px 14px rgba(0, 212, 255, 0.4)",
                  }}
                >
                  {submitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    "Submit Registration"
                  )}
                </Button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
