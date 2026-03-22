"use client";

import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import {
  Loader2,
  Send,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Users,
  Zap,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { APP_NAME, INDUSTRIES } from "@/lib/constants";

const CONTRACT_TYPES = [
  "Permanent",
  "Contract",
  "Temp to Perm",
  "Fixed Term",
];

const URGENCY_LEVELS = [
  { value: "Standard", label: "Standard", description: "Within 2 weeks" },
  { value: "Urgent", label: "Urgent", description: "Within 1 week" },
  { value: "Critical", label: "Critical", description: "ASAP" },
];

const BENEFITS = [
  {
    icon: Clock,
    title: "48-Hour Shortlists",
    description: "Receive your first shortlist of verified candidates within 48 hours.",
  },
  {
    icon: ShieldCheck,
    title: "Technically Verified",
    description: "Every candidate is assessed by chartered engineers who understand the domain.",
  },
  {
    icon: Users,
    title: "AI-Matched Talent",
    description: "Our AI matches candidates by skills, experience, and cultural fit.",
  },
  {
    icon: Zap,
    title: "No Upfront Cost",
    description: "Percentage-based fee, payable only on successful placement.",
  },
];

export default function PostARolePage() {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [contractType, setContractType] = useState("");
  const [industry, setIndustry] = useState("");
  const [urgency, setUrgency] = useState("");
  const [remote, setRemote] = useState(false);
  const [gdprConsent, setGdprConsent] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!gdprConsent) {
      toast.error("Please agree to the data processing consent to continue.");
      return;
    }

    if (!contractType) {
      toast.error("Please select a contract type.");
      return;
    }

    if (!industry) {
      toast.error("Please select an industry.");
      return;
    }

    setLoading(true);

    const form = e.currentTarget;
    const formData = new FormData(form);

    const payload = {
      companyName: formData.get("companyName") as string,
      contactName: formData.get("contactName") as string,
      email: formData.get("email") as string,
      phone: formData.get("phone") as string,
      roleTitle: formData.get("roleTitle") as string,
      description: formData.get("description") as string,
      location: formData.get("location") as string,
      remote,
      salaryMin: formData.get("salaryMin") as string,
      salaryMax: formData.get("salaryMax") as string,
      contractType,
      requiredSkills: formData.get("requiredSkills") as string,
      industry,
      urgency: urgency || "Standard",
      gdprConsent,
    };

    try {
      const response = await fetch("/api/post-role", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Failed to submit role");
      }

      setSubmitted(true);
      toast.success("Role submitted successfully!");
    } catch {
      toast.error("Something went wrong. Please try again or contact us directly.");
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <div className="bg-[#02012B]">
        <section className="relative overflow-hidden py-16 sm:py-20">
          <div className="pointer-events-none absolute -left-40 -top-40 h-[500px] w-[500px] rounded-full bg-[#4540DB]/20 blur-[120px]" />
          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Post a Role
            </h1>
          </div>
        </section>
        <section className="py-20">
          <div className="mx-auto max-w-lg text-center">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-500/15">
              <CheckCircle2 className="h-10 w-10 text-green-400" />
            </div>
            <h2 className="mt-6 text-2xl font-bold text-white">
              Role Submitted Successfully
            </h2>
            <p className="mt-3 text-gray-400">
              Thank you for submitting your role. Our team will review the
              details and get back to you within one working day with an initial
              shortlist plan.
            </p>
            <Button
              className="mt-8 bg-[#4540DB] hover:bg-[#4540DB]/80 text-white shadow-lg shadow-[#4540DB]/25"
              onClick={() => setSubmitted(false)}
            >
              Post Another Role
            </Button>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="bg-[#02012B]">
      {/* Hero */}
      <section className="relative overflow-hidden py-16 sm:py-20">
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
            Post a Role
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-400">
            Tell us about the role you need to fill and we will deliver a
            shortlist of verified automation engineers.
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-[1fr_360px]">
            {/* Form */}
            <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-6 backdrop-blur-sm sm:p-8">
              <h2 className="text-xl font-semibold text-white">
                Role Details
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Provide as much detail as possible so we can match the right
                candidates.
              </p>

              <form onSubmit={handleSubmit} className="mt-6 space-y-6">
                {/* Company Info */}
                <div>
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-500">
                    Your Details
                  </h3>
                  <Separator className="my-3 bg-white/[0.08]" />
                  <div className="grid gap-5 sm:grid-cols-2">
                    <div>
                      <Label htmlFor="companyName" className="text-gray-300">
                        Company Name <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="companyName"
                        name="companyName"
                        required
                        placeholder="Acme Engineering"
                        className="mt-1.5 bg-white/[0.05] border-white/[0.1] text-white placeholder:text-gray-500 focus:border-[#4540DB] focus:ring-[#4540DB]/20"
                      />
                    </div>
                    <div>
                      <Label htmlFor="contactName" className="text-gray-300">
                        Contact Name <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="contactName"
                        name="contactName"
                        required
                        placeholder="John Smith"
                        className="mt-1.5 bg-white/[0.05] border-white/[0.1] text-white placeholder:text-gray-500 focus:border-[#4540DB] focus:ring-[#4540DB]/20"
                      />
                    </div>
                    <div>
                      <Label htmlFor="email" className="text-gray-300">
                        Email <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        required
                        placeholder="john@acme.com"
                        className="mt-1.5 bg-white/[0.05] border-white/[0.1] text-white placeholder:text-gray-500 focus:border-[#4540DB] focus:ring-[#4540DB]/20"
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone" className="text-gray-300">
                        Phone <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        required
                        placeholder="+44 7xxx xxxxxx"
                        className="mt-1.5 bg-white/[0.05] border-white/[0.1] text-white placeholder:text-gray-500 focus:border-[#4540DB] focus:ring-[#4540DB]/20"
                      />
                    </div>
                  </div>
                </div>

                {/* Role Info */}
                <div>
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-500">
                    Role Information
                  </h3>
                  <Separator className="my-3 bg-white/[0.08]" />
                  <div className="space-y-5">
                    <div>
                      <Label htmlFor="roleTitle" className="text-gray-300">
                        Role Title <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="roleTitle"
                        name="roleTitle"
                        required
                        placeholder="e.g. Senior PLC Programmer"
                        className="mt-1.5 bg-white/[0.05] border-white/[0.1] text-white placeholder:text-gray-500 focus:border-[#4540DB] focus:ring-[#4540DB]/20"
                      />
                    </div>

                    <div>
                      <Label htmlFor="description" className="text-gray-300">
                        Role Description <span className="text-red-500">*</span>
                      </Label>
                      <Textarea
                        id="description"
                        name="description"
                        required
                        rows={5}
                        placeholder="Describe the role, responsibilities, and any key requirements..."
                        className="mt-1.5 bg-white/[0.05] border-white/[0.1] text-white placeholder:text-gray-500 focus:border-[#4540DB] focus:ring-[#4540DB]/20"
                      />
                    </div>

                    <div className="grid gap-5 sm:grid-cols-2">
                      <div>
                        <Label htmlFor="location" className="text-gray-300">
                          Location <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="location"
                          name="location"
                          required
                          placeholder="e.g. Milton Keynes, UK"
                          className="mt-1.5 bg-white/[0.05] border-white/[0.1] text-white placeholder:text-gray-500 focus:border-[#4540DB] focus:ring-[#4540DB]/20"
                        />
                      </div>
                      <div className="flex items-end gap-3">
                        <div className="flex items-center gap-2.5 pb-1">
                          <Switch
                            id="remote-toggle"
                            checked={remote}
                            onCheckedChange={setRemote}
                          />
                          <Label htmlFor="remote-toggle" className="text-gray-300">Remote / Hybrid</Label>
                        </div>
                      </div>
                    </div>

                    <div className="grid gap-5 sm:grid-cols-2">
                      <div>
                        <Label htmlFor="salaryMin" className="text-gray-300">Salary Min (GBP)</Label>
                        <Input
                          id="salaryMin"
                          name="salaryMin"
                          type="number"
                          placeholder="35000"
                          className="mt-1.5 bg-white/[0.05] border-white/[0.1] text-white placeholder:text-gray-500 focus:border-[#4540DB] focus:ring-[#4540DB]/20"
                        />
                      </div>
                      <div>
                        <Label htmlFor="salaryMax" className="text-gray-300">Salary Max (GBP)</Label>
                        <Input
                          id="salaryMax"
                          name="salaryMax"
                          type="number"
                          placeholder="55000"
                          className="mt-1.5 bg-white/[0.05] border-white/[0.1] text-white placeholder:text-gray-500 focus:border-[#4540DB] focus:ring-[#4540DB]/20"
                        />
                      </div>
                    </div>

                    <div className="grid gap-5 sm:grid-cols-2">
                      <div>
                        <Label className="text-gray-300">
                          Contract Type <span className="text-red-500">*</span>
                        </Label>
                        <Select value={contractType} onValueChange={(v) => setContractType(v ?? "")}>
                          <SelectTrigger className="mt-1.5 w-full bg-white/[0.05] border-white/[0.1] text-white focus:border-[#4540DB] focus:ring-[#4540DB]/20">
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent className="bg-[#0a0a2e] border-white/[0.1] text-white">
                            {CONTRACT_TYPES.map((type) => (
                              <SelectItem key={type} value={type} className="text-gray-300 focus:bg-white/[0.08] focus:text-white">
                                {type}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label className="text-gray-300">Industry <span className="text-red-500">*</span></Label>
                        <Select value={industry} onValueChange={(v) => setIndustry(v ?? "")}>
                          <SelectTrigger className="mt-1.5 w-full bg-white/[0.05] border-white/[0.1] text-white focus:border-[#4540DB] focus:ring-[#4540DB]/20">
                            <SelectValue placeholder="Select industry" />
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
                    </div>

                    <div>
                      <Label htmlFor="requiredSkills" className="text-gray-300">
                        Required Skills
                      </Label>
                      <Input
                        id="requiredSkills"
                        name="requiredSkills"
                        placeholder="e.g. Siemens TIA Portal, SCADA, HMI, Structured Text"
                        className="mt-1.5 bg-white/[0.05] border-white/[0.1] text-white placeholder:text-gray-500 focus:border-[#4540DB] focus:ring-[#4540DB]/20"
                      />
                      <p className="mt-1 text-xs text-gray-500">
                        Comma-separated list of key skills
                      </p>
                    </div>

                    <div>
                      <Label className="text-gray-300">Urgency</Label>
                      <Select value={urgency} onValueChange={(v) => setUrgency(v ?? "")}>
                        <SelectTrigger className="mt-1.5 w-full bg-white/[0.05] border-white/[0.1] text-white focus:border-[#4540DB] focus:ring-[#4540DB]/20">
                          <SelectValue placeholder="Standard" />
                        </SelectTrigger>
                        <SelectContent className="bg-[#0a0a2e] border-white/[0.1] text-white">
                          {URGENCY_LEVELS.map((level) => (
                            <SelectItem key={level.value} value={level.value} className="text-gray-300 focus:bg-white/[0.08] focus:text-white">
                              {level.label}, {level.description}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Consent */}
                <div>
                  <Separator className="mb-5 bg-white/[0.08]" />
                  <div className="flex items-start gap-2.5">
                    <Checkbox
                      id="gdpr"
                      checked={gdprConsent}
                      onCheckedChange={(checked) => setGdprConsent(checked === true)}
                      className="mt-0.5 border-white/[0.2] data-[state=checked]:bg-[#4540DB] data-[state=checked]:border-[#4540DB]"
                    />
                    <label htmlFor="gdpr" className="cursor-pointer text-sm text-gray-400 leading-snug">
                      I agree to {APP_NAME} processing my data in accordance
                      with the privacy policy. This information will be used to
                      match candidates and fulfil this recruitment request.
                    </label>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#4540DB] hover:bg-[#4540DB]/80 text-white shadow-lg shadow-[#4540DB]/25 sm:w-auto"
                  size="lg"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Submit Role
                    </>
                  )}
                </Button>
              </form>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <div className="sticky top-24 rounded-xl border border-white/[0.08] bg-white/[0.03] p-6 backdrop-blur-sm">
                <h3 className="font-semibold text-white">
                  Why Post With OSCABE?
                </h3>
                <Separator className="my-4 bg-white/[0.08]" />
                <div className="space-y-5">
                  {BENEFITS.map((benefit) => (
                    <div key={benefit.title} className="flex gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#4540DB]/15">
                        <benefit.icon className="h-4 w-4 text-[#4540DB]" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">
                          {benefit.title}
                        </p>
                        <p className="mt-0.5 text-xs text-gray-500">
                          {benefit.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
