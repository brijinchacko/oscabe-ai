import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-helpers";
import { sendEmail } from "@/lib/resend";

const CONTRACT_TEMPLATES: Record<string, { subject: string; body: string }> = {
  TERMS_CONDITIONS: {
    subject: "OSCABE - Terms & Conditions",
    body: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #4F46E5;">Terms & Conditions</h2>
        <p>Dear {{recipientName}},</p>
        <p>Please find attached our Terms & Conditions for recruitment services between OSCABE and {{clientName}}.</p>
        <p>We kindly request that you review the document and return a signed copy at your earliest convenience.</p>
        <p>If you have any questions or require amendments, please do not hesitate to contact us.</p>
        <br/>
        <p>Best regards,<br/>OSCABE Recruitment Team</p>
      </div>
    `,
  },
  SERVICE_AGREEMENT: {
    subject: "OSCABE - Service Agreement",
    body: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #4F46E5;">Service Agreement</h2>
        <p>Dear {{recipientName}},</p>
        <p>Please find attached the Service Agreement outlining our recruitment partnership with {{clientName}}.</p>
        <p>This agreement covers the scope of services, fee structure, guarantees, and payment terms.</p>
        <p>Please review and sign at your convenience. We look forward to a successful collaboration.</p>
        <br/>
        <p>Best regards,<br/>OSCABE Recruitment Team</p>
      </div>
    `,
  },
  NDA: {
    subject: "OSCABE - Non-Disclosure Agreement",
    body: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #4F46E5;">Non-Disclosure Agreement</h2>
        <p>Dear {{recipientName}},</p>
        <p>As part of our recruitment engagement with {{clientName}}, please find attached a Non-Disclosure Agreement (NDA).</p>
        <p>This NDA ensures the confidentiality of all candidate and business information shared between our organisations.</p>
        <p>Please review, sign, and return the document.</p>
        <br/>
        <p>Best regards,<br/>OSCABE Recruitment Team</p>
      </div>
    `,
  },
};

export async function POST(request: NextRequest) {
  try {
    const { user, error } = await requireAuth();
    if (error) return error;

    const body = await request.json();
    const { contractType, clientId, recipientEmail, recipientName } = body;

    if (!contractType || !clientId || !recipientEmail || !recipientName) {
      return NextResponse.json(
        { error: "contractType, clientId, recipientEmail, and recipientName are required" },
        { status: 400 }
      );
    }

    const template = CONTRACT_TEMPLATES[contractType];
    if (!template) {
      return NextResponse.json(
        { error: `Invalid contract type. Valid: ${Object.keys(CONTRACT_TEMPLATES).join(", ")}` },
        { status: 400 }
      );
    }

    // Get client
    const client = await prisma.client.findUnique({ where: { id: clientId } });
    if (!client) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    // Build email
    const subject = template.subject.replace("{{clientName}}", client.companyName);
    const html = template.body
      .replace(/\{\{recipientName\}\}/g, recipientName)
      .replace(/\{\{clientName\}\}/g, client.companyName);

    // Send email
    const result = await sendEmail({
      to: recipientEmail,
      subject,
      html,
    });

    // Create activity
    await prisma.activity.create({
      data: {
        type: "CONTRACT_SENT",
        title: `${contractType.replace(/_/g, " ")} sent to ${recipientName}`,
        content: `Contract type: ${contractType}\nRecipient: ${recipientName} (${recipientEmail})\nClient: ${client.companyName}\nEmail ID: ${result.id || "N/A"}`,
        userId: user!.id,
        clientId: client.id,
      },
    });

    return NextResponse.json({
      success: true,
      emailId: result.id,
      message: `Contract sent to ${recipientEmail}`,
    });
  } catch (err) {
    console.error("POST /api/contracts/send error:", err);
    return NextResponse.json({ error: "Failed to send contract" }, { status: 500 });
  }
}
