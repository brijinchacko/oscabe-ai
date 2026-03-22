import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { z } from "zod/v4";

const convertSchema = z.object({
  prospectId: z.string().min(1, "Prospect ID is required"),
  companyName: z.string().optional(),
  industry: z.string().optional(),
  website: z.string().optional(),
  location: z.string().optional(),
  notes: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = convertSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: z.prettifyError(parsed.error) },
        { status: 400 }
      );
    }

    const prospect = await prisma.prospect.findUnique({
      where: { id: parsed.data.prospectId },
    });

    if (!prospect) {
      return NextResponse.json({ error: "Prospect not found" }, { status: 404 });
    }

    if (prospect.status === "CONVERTED" && prospect.convertedClientId) {
      return NextResponse.json(
        { error: "Prospect has already been converted", clientId: prospect.convertedClientId },
        { status: 409 }
      );
    }

    const user = await prisma.user.findUnique({ where: { clerkId: userId } });

    // Create client from prospect data
    const client = await prisma.client.create({
      data: {
        companyName: parsed.data.companyName || prospect.company || `${prospect.firstName} ${prospect.lastName}`,
        industry: parsed.data.industry || prospect.industry,
        companySize: prospect.companySize,
        website: parsed.data.website,
        location: parsed.data.location || prospect.location,
        source: `Prospect (${prospect.source})`,
        notes: parsed.data.notes || prospect.notes,
        pipelineStage: "LEAD",
      },
    });

    // Create a contact for the client from the prospect
    await prisma.contact.create({
      data: {
        clientId: client.id,
        firstName: prospect.firstName,
        lastName: prospect.lastName,
        email: prospect.email,
        jobTitle: prospect.jobTitle,
        linkedIn: prospect.linkedIn,
        isPrimary: true,
      },
    });

    // Update prospect status and link to client
    await prisma.prospect.update({
      where: { id: prospect.id },
      data: {
        status: "CONVERTED",
        convertedClientId: client.id,
      },
    });

    // Log activity
    await prisma.activity.create({
      data: {
        type: "PROSPECT_CONVERTED",
        title: "Prospect converted to client",
        content: `Prospect "${prospect.firstName} ${prospect.lastName}" (${prospect.company || "N/A"}) was converted to client "${client.companyName}".`,
        clientId: client.id,
        userId: user?.id,
      },
    });

    return NextResponse.json({
      success: true,
      client,
      prospect: { id: prospect.id, status: "CONVERTED" },
    });
  } catch (error) {
    console.error("Convert prospect error:", error);
    return NextResponse.json({ error: "Failed to convert prospect" }, { status: 500 });
  }
}
