"use client";

import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import {
  Mail,
  Phone,
  MapPin,
  Send,
  Linkedin,
  Twitter,
  Globe,
  Youtube,
  Loader2,
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
import { Separator } from "@/components/ui/separator";
import {
  APP_NAME,
  COMPANY_ADDRESS,
  COMPANY_EMAIL,
  COMPANY_PHONE,
  SOCIAL_LINKS,
} from "@/lib/constants";

const ENQUIRY_TYPES = ["Employer", "Candidate", "Agency", "Other"];

export default function ContactPage() {
  const [loading, setLoading] = useState(false);
  const [enquiryType, setEnquiryType] = useState("");
  const [gdprConsent, setGdprConsent] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!gdprConsent) {
      toast.error("Please agree to the data processing consent to continue.");
      return;
    }

    if (!enquiryType) {
      toast.error("Please select an enquiry type.");
      return;
    }

    setLoading(true);

    const form = e.currentTarget;
    const formData = new FormData(form);

    const payload = {
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      phone: formData.get("phone") as string,
      company: formData.get("company") as string,
      enquiryType,
      message: formData.get("message") as string,
      gdprConsent,
    };

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Failed to send message");
      }

      toast.success("Message sent successfully! We will be in touch soon.");
      form.reset();
      setEnquiryType("");
      setGdprConsent(false);
    } catch {
      toast.error("Something went wrong. Please try again or email us directly.");
    } finally {
      setLoading(false);
    }
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
            Get in Touch
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-400">
            Have a question, want to post a role, or interested in partnering
            with us? We would love to hear from you.
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-[1fr_380px]">
            {/* Form */}
            <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-6 backdrop-blur-sm sm:p-8">
              <h2 className="text-xl font-semibold text-white">
                Send Us a Message
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Fill in the form below and we will get back to you within one
                working day.
              </p>

              <form onSubmit={handleSubmit} className="mt-6 space-y-5">
                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="name" className="text-gray-300">
                      Full Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="name"
                      name="name"
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
                      placeholder="john@example.com"
                      className="mt-1.5 bg-white/[0.05] border-white/[0.1] text-white placeholder:text-gray-500 focus:border-[#4540DB] focus:ring-[#4540DB]/20"
                    />
                  </div>
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="phone" className="text-gray-300">Phone</Label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      placeholder="+44 7xxx xxxxxx"
                      className="mt-1.5 bg-white/[0.05] border-white/[0.1] text-white placeholder:text-gray-500 focus:border-[#4540DB] focus:ring-[#4540DB]/20"
                    />
                  </div>
                  <div>
                    <Label htmlFor="company" className="text-gray-300">Company</Label>
                    <Input
                      id="company"
                      name="company"
                      placeholder="Company name"
                      className="mt-1.5 bg-white/[0.05] border-white/[0.1] text-white placeholder:text-gray-500 focus:border-[#4540DB] focus:ring-[#4540DB]/20"
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-gray-300">
                    Enquiry Type <span className="text-red-500">*</span>
                  </Label>
                  <Select value={enquiryType} onValueChange={(v) => setEnquiryType(v ?? "")}>
                    <SelectTrigger className="mt-1.5 w-full bg-white/[0.05] border-white/[0.1] text-white focus:border-[#4540DB] focus:ring-[#4540DB]/20">
                      <SelectValue placeholder="Select enquiry type" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#0a0a2e] border-white/[0.1] text-white">
                      {ENQUIRY_TYPES.map((type) => (
                        <SelectItem key={type} value={type} className="text-gray-300 focus:bg-white/[0.08] focus:text-white">
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="message" className="text-gray-300">
                    Message <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    id="message"
                    name="message"
                    required
                    rows={5}
                    placeholder="Tell us how we can help..."
                    className="mt-1.5 bg-white/[0.05] border-white/[0.1] text-white placeholder:text-gray-500 focus:border-[#4540DB] focus:ring-[#4540DB]/20"
                  />
                </div>

                <div className="flex items-start gap-2.5">
                  <Checkbox
                    id="gdpr"
                    checked={gdprConsent}
                    onCheckedChange={(checked) => setGdprConsent(checked === true)}
                    className="mt-0.5 border-white/[0.2] data-[state=checked]:bg-[#4540DB] data-[state=checked]:border-[#4540DB]"
                  />
                  <label htmlFor="gdpr" className="cursor-pointer text-sm text-gray-400 leading-snug">
                    I agree to {APP_NAME} processing my data in accordance with
                    the privacy policy. My information will only be used to
                    respond to this enquiry.
                  </label>
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
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Send Message
                    </>
                  )}
                </Button>
              </form>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-6 backdrop-blur-sm">
                <h3 className="font-semibold text-white">Contact Details</h3>
                <Separator className="my-4 bg-white/[0.08]" />
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#4540DB]/15">
                      <MapPin className="h-4 w-4 text-[#4540DB]" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">Address</p>
                      <p className="mt-0.5 text-sm text-gray-500">
                        {COMPANY_ADDRESS}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#4540DB]/15">
                      <Mail className="h-4 w-4 text-[#4540DB]" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">Email</p>
                      <a
                        href={`mailto:${COMPANY_EMAIL}`}
                        className="mt-0.5 text-sm text-[#00D4FF] hover:underline"
                      >
                        {COMPANY_EMAIL}
                      </a>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#4540DB]/15">
                      <Phone className="h-4 w-4 text-[#4540DB]" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">Phone</p>
                      <a
                        href={`tel:${COMPANY_PHONE.replace(/\s/g, "")}`}
                        className="mt-0.5 text-sm text-[#00D4FF] hover:underline"
                      >
                        {COMPANY_PHONE}
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-6 backdrop-blur-sm">
                <h3 className="font-semibold text-white">Follow Us</h3>
                <Separator className="my-4 bg-white/[0.08]" />
                <div className="flex gap-3">
                  <a
                    href={SOCIAL_LINKS.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.03] text-gray-400 transition-all hover:border-[#4540DB] hover:bg-[#4540DB]/15 hover:text-[#4540DB]"
                    aria-label="LinkedIn"
                  >
                    <Linkedin className="h-4 w-4" />
                  </a>
                  <a
                    href={SOCIAL_LINKS.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.03] text-gray-400 transition-all hover:border-[#4540DB] hover:bg-[#4540DB]/15 hover:text-[#4540DB]"
                    aria-label="Instagram"
                  >
                    <Globe className="h-4 w-4" />
                  </a>
                  <a
                    href={SOCIAL_LINKS.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.03] text-gray-400 transition-all hover:border-[#4540DB] hover:bg-[#4540DB]/15 hover:text-[#4540DB]"
                    aria-label="Facebook"
                  >
                    <Globe className="h-4 w-4" />
                  </a>
                  <a
                    href={SOCIAL_LINKS.youtube}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.03] text-gray-400 transition-all hover:border-[#4540DB] hover:bg-[#4540DB]/15 hover:text-[#4540DB]"
                    aria-label="YouTube"
                  >
                    <Youtube className="h-4 w-4" />
                  </a>
                </div>
              </div>

              {/* Google Maps Embed */}
              <div className="overflow-hidden rounded-xl border border-white/[0.08]">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2443.1!2d-0.7584!3d52.0406!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x4877a3b0e5e8c6b7%3A0x1234567890abcdef!2sUnit%208%2C%20Lyon%20Road%2C%20Milton%20Keynes%20MK1%201EX!5e0!3m2!1sen!2suk!4v1234567890"
                  width="100%"
                  height="200"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="OSCABE Office Location"
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
