import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// TODO: In production, verify the webhook signature using svix.
// Install @clerk/nextjs webhook utilities or svix package and verify
// the signature from the `svix-id`, `svix-timestamp`, and `svix-signature` headers
// against your CLERK_WEBHOOK_SECRET environment variable.
// See: https://clerk.com/docs/integrations/webhooks/sync-data

interface ClerkWebhookEvent {
  type: string;
  data: {
    id: string;
    email_addresses?: Array<{
      email_address: string;
      id: string;
    }>;
    primary_email_address_id?: string;
    first_name?: string | null;
    last_name?: string | null;
    image_url?: string | null;
    phone_numbers?: Array<{
      phone_number: string;
      id: string;
    }>;
    primary_phone_number_id?: string | null;
  };
}

function getPrimaryEmail(data: ClerkWebhookEvent["data"]): string | null {
  if (!data.email_addresses || !data.primary_email_address_id) return null;
  const primary = data.email_addresses.find(
    (e) => e.id === data.primary_email_address_id
  );
  return primary?.email_address || data.email_addresses[0]?.email_address || null;
}

function getPrimaryPhone(data: ClerkWebhookEvent["data"]): string | null {
  if (!data.phone_numbers || !data.primary_phone_number_id) return null;
  const primary = data.phone_numbers.find(
    (p) => p.id === data.primary_phone_number_id
  );
  return primary?.phone_number || null;
}

export async function POST(req: NextRequest) {
  try {
    const body: ClerkWebhookEvent = await req.json();
    const { type, data } = body;

    switch (type) {
      case "user.created": {
        const email = getPrimaryEmail(data);
        if (!email) {
          console.error("Clerk webhook: user.created missing email", data.id);
          return NextResponse.json({ error: "Missing email" }, { status: 400 });
        }

        await prisma.user.upsert({
          where: { clerkId: data.id },
          update: {
            email,
            firstName: data.first_name || null,
            lastName: data.last_name || null,
            avatarUrl: data.image_url || null,
            phone: getPrimaryPhone(data),
          },
          create: {
            clerkId: data.id,
            email,
            firstName: data.first_name || null,
            lastName: data.last_name || null,
            avatarUrl: data.image_url || null,
            phone: getPrimaryPhone(data),
          },
        });

        console.log(`Clerk webhook: Created user ${data.id} (${email})`);
        break;
      }

      case "user.updated": {
        const email = getPrimaryEmail(data);
        if (!email) {
          console.error("Clerk webhook: user.updated missing email", data.id);
          return NextResponse.json({ error: "Missing email" }, { status: 400 });
        }

        await prisma.user.update({
          where: { clerkId: data.id },
          data: {
            email,
            firstName: data.first_name || null,
            lastName: data.last_name || null,
            avatarUrl: data.image_url || null,
            phone: getPrimaryPhone(data),
          },
        });

        console.log(`Clerk webhook: Updated user ${data.id}`);
        break;
      }

      case "user.deleted": {
        await prisma.user.update({
          where: { clerkId: data.id },
          data: { isActive: false },
        });

        console.log(`Clerk webhook: Deactivated user ${data.id}`);
        break;
      }

      default: {
        console.log(`Clerk webhook: Unhandled event type ${type}`);
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Clerk webhook error:", error);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}
