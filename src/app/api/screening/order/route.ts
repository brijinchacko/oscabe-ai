import { NextRequest, NextResponse } from "next/server";
import { z } from "zod/v4";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { sendEmail } from "@/lib/resend";

const orderSchema = z.object({
  candidateName: z.string().min(1, "Candidate name is required"),
  candidateEmail: z.email("Valid email is required"),
  candidatePhone: z.string().optional(),
  roleTitle: z.string().min(1, "Role title is required"),
  screeningType: z.enum(["standard", "advanced"]),
  notes: z.string().optional(),
  gdprConsent: z.literal(true, { message: "GDPR consent is required" }),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = orderSchema.safeParse(body);

    if (!parsed.success) {
      const firstError = parsed.error.issues[0]?.message || "Validation failed";
      return NextResponse.json({ error: firstError }, { status: 400 });
    }

    const data = parsed.data;
    const price = data.screeningType === "advanced" ? 250 : 150;

    // Check if user is authenticated (optional for public form)
    let userId: string | undefined;
    let employerId: string | undefined;
    try {
      const session = await auth();
      if (session?.user?.id) {
        const user = await prisma.user.findUnique({
          where: { id: session.user.id },
          include: { employer: true },
        });
        if (user) {
          userId = user.id;
          employerId = user.employer?.id;
        }
      }
    } catch {
      // Not authenticated - that is fine for public form
    }

    // Store GDPR consent
    await prisma.gdprConsent.create({
      data: {
        email: data.candidateEmail,
        consentType: "screening_order",
        consented: true,
        ipAddress:
          req.headers.get("x-forwarded-for") ||
          req.headers.get("x-real-ip") ||
          undefined,
        userAgent: req.headers.get("user-agent") || undefined,
      },
    });

    // Create activity record
    const activity = await prisma.activity.create({
      data: {
        type: "SCREENING_ORDER",
        title: `Screening order: ${data.candidateName} - ${data.roleTitle}`,
        content: JSON.stringify({
          candidateName: data.candidateName,
          candidateEmail: data.candidateEmail,
          candidatePhone: data.candidatePhone,
          roleTitle: data.roleTitle,
          screeningType: data.screeningType,
          price,
          notes: data.notes,
          status: "ORDERED",
        }),
        userId: userId || undefined,
        metadata: JSON.stringify({
          screeningType: data.screeningType,
          price,
          employerId: employerId || null,
        }),
      },
    });

    // Send confirmation email
    await sendEmail({
      to: data.candidateEmail,
      subject: "Screening Order Received",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #4540DB;">Screening Order Confirmed</h2>
          <p>Hello ${data.candidateName},</p>
          <p>A technical screening has been requested for the role of <strong>${data.roleTitle}</strong>.</p>
          <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #eee; color: #666;">Screening Type</td>
              <td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;">${data.screeningType === "advanced" ? "Advanced" : "Standard"}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #eee; color: #666;">Role</td>
              <td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;">${data.roleTitle}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #eee; color: #666;">Reference</td>
              <td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;">${activity.id}</td>
            </tr>
          </table>
          <p>Our team will be in touch within one working day to schedule your assessment.</p>
          <p style="color: #666; font-size: 12px; margin-top: 30px;">
            OSCABE &mdash; Technical Recruitment for Automation &amp; Controls
          </p>
        </div>
      `,
    });

    // Notify all ADMIN users
    const admins = await prisma.user.findMany({ where: { role: "ADMIN" }, select: { id: true } });
    await Promise.all(
      admins.map((admin) =>
        prisma.notification.create({
          data: {
            userId: admin.id,
            title: "New Screening Order",
            message: `Screening order for ${data.candidateName} - ${data.roleTitle} (${data.screeningType}).`,
            type: "LEAD",
            link: "/crm/leads",
          },
        })
      )
    ).catch(() => {});

    // Also notify OSCABE team
    await sendEmail({
      to: ["info@oscabe.com", "info@wartens.com"],
      subject: `New Screening Order: ${data.candidateName} - ${data.screeningType}`,
      html: `
        <h2>New Screening Order</h2>
        <p><strong>Candidate:</strong> ${data.candidateName} (${data.candidateEmail})</p>
        <p><strong>Phone:</strong> ${data.candidatePhone || "Not provided"}</p>
        <p><strong>Role:</strong> ${data.roleTitle}</p>
        <p><strong>Type:</strong> ${data.screeningType} (&pound;${price})</p>
        <p><strong>Notes:</strong> ${data.notes || "None"}</p>
        <p><strong>Order ID:</strong> ${activity.id}</p>
        ${employerId ? `<p><strong>Employer ID:</strong> ${employerId}</p>` : ""}
      `,
    });

    return NextResponse.json({ success: true, orderId: activity.id });
  } catch (error) {
    console.error("Screening order error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
