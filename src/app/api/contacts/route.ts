import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { z } from "zod";

const createContactSchema = z.object({
  clientId: z.string().min(1, "Client ID is required"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional(),
  jobTitle: z.string().optional(),
  linkedIn: z.string().optional(),
  isPrimary: z.boolean().optional(),
  notes: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;

    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get("clientId");

    if (!clientId) {
      return NextResponse.json({ error: "clientId is required" }, { status: 400 });
    }

    const contacts = await prisma.contact.findMany({
      where: { clientId },
      orderBy: [{ isPrimary: "desc" }, { createdAt: "asc" }],
    });

    return NextResponse.json(contacts);
  } catch (error) {
    console.error("List contacts error:", error);
    return NextResponse.json({ error: "Failed to fetch contacts" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;

    const body = await request.json();
    const parsed = createContactSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Validation failed", details: parsed.error.flatten() }, { status: 400 });
    }

    const client = await prisma.client.findUnique({ where: { id: parsed.data.clientId } });
    if (!client) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    const data = { ...parsed.data };
    if (data.email === "") {
      data.email = undefined;
    }

    const contact = await prisma.contact.create({
      data: data as typeof parsed.data,
    });

    return NextResponse.json(contact, { status: 201 });
  } catch (error) {
    console.error("Create contact error:", error);
    return NextResponse.json({ error: "Failed to create contact" }, { status: 500 });
  }
}
