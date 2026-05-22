/**
 * POST /api/engagement-request
 *
 * Submission endpoint for the new Remote Engineer Portal (employer-facing).
 * Saves an EngagementRequest row and emails info@oscabe.com so the team
 * can pick it up like any other inbound enquiry.
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { sendEmail } from "@/lib/resend";

const EngagementRequestSchema = z.object({
  type: z.enum(["engineer-request", "general-requirement", "call-request"]).default("engineer-request"),
  engineerSlug: z.string().min(1).max(120).optional(),
  companyName: z.string().min(1).max(200),
  contactName: z.string().min(1).max(200),
  contactEmail: z.string().email(),
  contactPhone: z.string().max(40).optional(),
  roleTitle: z.string().max(200).optional(),
  platforms: z.string().max(2000).optional(),
  startDate: z.string().max(40).optional(),
  duration: z.enum(["short-term", "long-term", "part-time"]).optional(),
  message: z.string().max(4000).optional(),
  source: z.string().max(200).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = EngagementRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const data = parsed.data;

    const created = await prisma.engagementRequest.create({
      data: {
        type: data.type,
        engineerSlug: data.engineerSlug,
        companyName: data.companyName,
        contactName: data.contactName,
        contactEmail: data.contactEmail,
        contactPhone: data.contactPhone,
        roleTitle: data.roleTitle,
        platforms: data.platforms,
        startDate: data.startDate,
        duration: data.duration,
        message: data.message,
        source: data.source ?? req.headers.get("referer") ?? undefined,
        status: "new",
      },
    });

    // Activity row so it appears in CRM activity feed
    await prisma.activity.create({
      data: {
        type: "ENGAGEMENT_REQUEST",
        title: `Portal request: ${data.companyName} (${data.contactName})`,
        content: JSON.stringify({
          id: created.id,
          type: data.type,
          engineerSlug: data.engineerSlug,
          companyName: data.companyName,
          contactName: data.contactName,
          contactEmail: data.contactEmail,
          contactPhone: data.contactPhone ?? null,
          roleTitle: data.roleTitle ?? null,
          platforms: data.platforms ?? null,
          duration: data.duration ?? null,
          startDate: data.startDate ?? null,
          message: data.message ?? null,
          source: data.source ?? null,
        }),
      },
    });

    // Notify internal team
    const lines = [
      `Type: ${data.type}`,
      data.engineerSlug ? `Engineer: ${data.engineerSlug}` : "Engineer: (not specified)",
      `Company: ${data.companyName}`,
      `Contact: ${data.contactName} <${data.contactEmail}>`,
      data.contactPhone ? `Phone: ${data.contactPhone}` : "",
      data.roleTitle ? `Role: ${data.roleTitle}` : "",
      data.platforms ? `Platforms: ${data.platforms}` : "",
      data.duration ? `Duration: ${data.duration}` : "",
      data.startDate ? `Start date: ${data.startDate}` : "",
      data.source ? `Source: ${data.source}` : "",
      "",
      data.message ? `Message:\n${data.message}` : "(no additional message)",
    ]
      .filter(Boolean)
      .join("\n");

    await sendEmail({
      to: "info@oscabe.com",
      subject: `OSCABE Portal: ${data.type} from ${data.companyName}`,
      html: `<pre style="font-family:ui-monospace,Menlo,monospace;font-size:13px;white-space:pre-wrap">${escapeHtml(lines)}</pre>`,
      replyTo: data.contactEmail,
    }).catch((e) => {
      console.error("[engagement-request] email notify failed", e);
    });

    return NextResponse.json({ success: true, id: created.id });
  } catch (e) {
    console.error("[engagement-request] error", e);
    return NextResponse.json({ error: "Submission failed" }, { status: 500 });
  }
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
