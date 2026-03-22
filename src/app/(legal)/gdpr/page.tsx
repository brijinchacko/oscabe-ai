"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ShieldCheck, CheckCircle2 } from "lucide-react";

export default function GDPRPage() {
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate submission - replace with POST to /api/gdpr/consent when ready
    await new Promise((resolve) => setTimeout(resolve, 1000));

    setSubmitted(true);
    setIsSubmitting(false);
  }

  return (
    <article className="max-w-none">
      <div className="flex items-center gap-3 mb-2">
        <ShieldCheck className="size-8 text-indigo-600" />
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Your GDPR Rights</h1>
      </div>
      <p className="text-sm text-gray-500 mb-8">
        Under the UK General Data Protection Regulation (UK GDPR)
      </p>

      <p className="text-gray-700 mb-8">
        Oscabe Ltd is committed to protecting your personal data and upholding your rights under the
        UK GDPR. Below is an explanation of your rights and a form to submit a Subject Access
        Request or other data rights request.
      </p>

      <h2 className="mt-10 text-xl font-semibold text-gray-900">Your Rights Explained</h2>

      <div className="mt-6 space-y-6">
        <div className="rounded-lg border border-gray-200 p-5">
          <h3 className="text-base font-semibold text-gray-900">Right of Access</h3>
          <p className="mt-1 text-sm text-gray-600">
            You have the right to request a copy of the personal data we hold about you. This is
            commonly known as a &quot;Subject Access Request&quot; (SAR). We will provide this
            information free of charge within one month.
          </p>
        </div>

        <div className="rounded-lg border border-gray-200 p-5">
          <h3 className="text-base font-semibold text-gray-900">Right to Rectification</h3>
          <p className="mt-1 text-sm text-gray-600">
            You have the right to request that we correct any inaccurate personal data we hold about
            you, or complete any incomplete data.
          </p>
        </div>

        <div className="rounded-lg border border-gray-200 p-5">
          <h3 className="text-base font-semibold text-gray-900">
            Right to Erasure (&quot;Right to be Forgotten&quot;)
          </h3>
          <p className="mt-1 text-sm text-gray-600">
            You have the right to request that we delete your personal data in certain circumstances,
            such as when the data is no longer necessary for the purpose for which it was collected,
            or where you withdraw consent.
          </p>
        </div>

        <div className="rounded-lg border border-gray-200 p-5">
          <h3 className="text-base font-semibold text-gray-900">Right to Restrict Processing</h3>
          <p className="mt-1 text-sm text-gray-600">
            You have the right to request that we limit the way we use your personal data. This
            means we can store the data but not process it further, for example while we verify its
            accuracy.
          </p>
        </div>

        <div className="rounded-lg border border-gray-200 p-5">
          <h3 className="text-base font-semibold text-gray-900">Right to Data Portability</h3>
          <p className="mt-1 text-sm text-gray-600">
            You have the right to receive your personal data in a structured, commonly used, and
            machine-readable format. You can also request that we transfer your data directly to
            another controller where technically feasible.
          </p>
        </div>

        <div className="rounded-lg border border-gray-200 p-5">
          <h3 className="text-base font-semibold text-gray-900">Right to Object</h3>
          <p className="mt-1 text-sm text-gray-600">
            You have the right to object to the processing of your personal data where we are
            relying on a legitimate interest, or where we are processing your data for direct
            marketing purposes.
          </p>
        </div>
      </div>

      <h2 className="mt-12 text-xl font-semibold text-gray-900">Submit a Data Rights Request</h2>
      <p className="mt-2 text-sm text-gray-600 mb-6">
        Use the form below to exercise any of the rights described above. We will respond to your
        request within one month. For complex requests, we may extend this by a further two months,
        in which case we will notify you.
      </p>

      {submitted ? (
        <div className="rounded-lg border border-green-200 bg-green-50 p-8 text-center">
          <CheckCircle2 className="mx-auto size-12 text-green-600 mb-4" />
          <h3 className="text-lg font-semibold text-green-900">Request Submitted Successfully</h3>
          <p className="mt-2 text-sm text-green-700">
            Thank you. We have received your data rights request and will respond within one month.
            You will receive a confirmation email at the address you provided.
          </p>
          <Button
            className="mt-6"
            variant="outline"
            onClick={() => setSubmitted(false)}
          >
            Submit Another Request
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5 rounded-lg border border-gray-200 p-6">
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                name="name"
                required
                placeholder="Your full name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                name="email"
                type="email"
                required
                placeholder="you@example.com"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="requestType">Type of Request</Label>
            <Select name="requestType" required>
              <SelectTrigger id="requestType">
                <SelectValue placeholder="Select request type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="access">Subject Access Request (Right of Access)</SelectItem>
                <SelectItem value="rectification">Right to Rectification</SelectItem>
                <SelectItem value="erasure">Right to Erasure</SelectItem>
                <SelectItem value="restrict">Right to Restrict Processing</SelectItem>
                <SelectItem value="portability">Right to Data Portability</SelectItem>
                <SelectItem value="object">Right to Object</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="details">Details of Your Request</Label>
            <Textarea
              id="details"
              name="details"
              required
              rows={5}
              placeholder="Please describe your request in detail. Include any relevant information that will help us identify and process your request."
            />
          </div>

          <p className="text-xs text-gray-500">
            By submitting this form, you confirm that the information provided is accurate. We may
            need to verify your identity before processing your request. Your data will be handled in
            accordance with our{" "}
            <a href="/privacy" className="text-indigo-600 hover:text-indigo-500">
              Privacy Policy
            </a>
            .
          </p>

          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Submitting..." : "Submit Request"}
          </Button>
        </form>
      )}

      <div className="mt-10 rounded-lg bg-gray-50 p-6">
        <h3 className="text-base font-semibold text-gray-900">Contact Us Directly</h3>
        <p className="mt-2 text-sm text-gray-600">
          If you prefer, you can exercise your rights by contacting us directly:
        </p>
        <ul className="mt-3 space-y-1 text-sm text-gray-600">
          <li>
            <strong>Email:</strong>{" "}
            <a href="mailto:info@oscabe.com" className="text-indigo-600 hover:text-indigo-500">
              info@oscabe.com
            </a>
          </li>
          <li>
            <strong>Post:</strong> Oscabe Ltd, Unit 8, Lyon Road, Milton Keynes, MK1 1EX
          </li>
        </ul>
        <p className="mt-3 text-sm text-gray-600">
          You also have the right to lodge a complaint with the Information Commissioner&apos;s
          Office (ICO) at{" "}
          <a
            href="https://ico.org.uk"
            target="_blank"
            rel="noopener noreferrer"
            className="text-indigo-600 hover:text-indigo-500"
          >
            ico.org.uk
          </a>
          .
        </p>
      </div>
    </article>
  );
}
