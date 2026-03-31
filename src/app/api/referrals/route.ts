import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { z } from "zod/v4";
import { sendEmail } from "@/lib/resend";

const createReferralSchema = z.object({
  referrerName: z.string().min(1, "Your name is required"),
  referrerEmail: z.string().email("Valid email is required"),
  referrerPhone: z.string().optional(),
  candidateName: z.string().min(1, "Candidate name is required"),
  candidateEmail: z.string().email("Valid candidate email is required"),
  candidatePhone: z.string().optional(),
  candidateRole: z.string().optional(),
  notes: z.string().optional(),
});

function generateReferralCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const part = () =>
    Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
  return `REF-${part()}-${part()}`;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = createReferralSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: z.flattenError(parsed.error) },
        { status: 400 }
      );
    }

    const data = parsed.data;

    // Generate unique referral code
    let referralCode = generateReferralCode();
    let codeExists = true;
    while (codeExists) {
      const existing = await prisma.referral.findUnique({
        where: { referralCode },
      });
      if (!existing) {
        codeExists = false;
      } else {
        referralCode = generateReferralCode();
      }
    }

    // Check if user is authenticated and link referral
    let referrerUserId: string | null = null;
    try {
      const session = await auth();
      if (session?.user?.id) {
        const user = await prisma.user.findUnique({
          where: { id: session.user.id },
        });
        if (user) {
          referrerUserId = user.id;
        }
      }
    } catch {
      // Not authenticated — that's fine for public submissions
    }

    const referral = await prisma.referral.create({
      data: {
        referrerName: data.referrerName,
        referrerEmail: data.referrerEmail,
        referrerPhone: data.referrerPhone || null,
        candidateName: data.candidateName,
        candidateEmail: data.candidateEmail,
        candidatePhone: data.candidatePhone || null,
        candidateRole: data.candidateRole || null,
        candidateSkills: data.candidateRole || null,
        notes: data.notes || null,
        referralCode,
        referrerUserId,
      },
    });

    // Log activity
    await prisma.activity.create({
      data: {
        type: "REFERRAL_SUBMITTED",
        title: `Referral submitted: ${data.candidateName}`,
        content: `${data.referrerName} referred ${data.candidateName} (${data.candidateEmail})`,
        userId: referrerUserId,
        metadata: JSON.stringify({
          referralId: referral.id,
          referralCode,
          candidateEmail: data.candidateEmail,
        }),
      },
    });

    // Send confirmation email to referrer
    await sendEmail({
      to: data.referrerEmail,
      subject: "Your OSCABE Referral Has Been Received",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #22C55E;">Thank You for Your Referral!</h2>
          <p>Hi ${data.referrerName},</p>
          <p>We've received your referral for <strong>${data.candidateName}</strong>. Our team will review and reach out to them shortly.</p>
          <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 16px; margin: 24px 0;">
            <p style="margin: 0; font-size: 14px; color: #666;">Your Referral Code</p>
            <p style="margin: 8px 0 0; font-size: 24px; font-weight: bold; color: #22C55E; letter-spacing: 2px;">${referralCode}</p>
          </div>
          <p>You'll earn <strong>£200</strong> once ${data.candidateName} is successfully placed.</p>
          <p style="color: #666; font-size: 14px;">Track your referral status at <a href="https://oscabe.com/portal/candidate/referrals" style="color: #22C55E;">your portal</a>.</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />
          <p style="color: #999; font-size: 12px;">OSCABE - Engineering Recruitment</p>
        </div>
      `,
    });

    return NextResponse.json({
      id: referral.id,
      referralCode: referral.referralCode,
      status: referral.status,
    });
  } catch (error) {
    console.error("Failed to create referral:", error);
    return NextResponse.json({ error: "Failed to submit referral" }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const search = searchParams.get("search");

    const isAdminOrRecruiter = user.role === "ADMIN" || user.role === "RECRUITER";

    // Build where clause
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {};

    if (!isAdminOrRecruiter) {
      // Regular users can only see their own referrals
      where.referrerUserId = user.id;
    }

    if (status && status !== "ALL") {
      where.status = status;
    }

    if (search) {
      const term = search.toLowerCase();
      where.OR = [
        { candidateName: { contains: term } },
        { candidateEmail: { contains: term } },
        { referrerName: { contains: term } },
        { referrerEmail: { contains: term } },
        { referralCode: { contains: term } },
      ];
    }

    const referrals = await prisma.referral.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        referrer: {
          select: { firstName: true, lastName: true, email: true },
        },
      },
    });

    // Calculate stats
    const total = referrals.length;
    const placed = referrals.filter((r) => r.status === "PLACED").length;
    const totalEarnings = referrals
      .filter((r) => r.status === "PLACED")
      .reduce((sum, r) => sum + r.rewardAmount, 0);

    return NextResponse.json({
      referrals,
      stats: {
        total,
        placed,
        totalEarnings,
        pending: referrals.filter((r) => r.status === "PENDING").length,
        contacted: referrals.filter((r) => r.status === "CONTACTED").length,
        interviewing: referrals.filter((r) => r.status === "INTERVIEWING").length,
        rejected: referrals.filter((r) => r.status === "REJECTED").length,
      },
    });
  } catch (error) {
    console.error("Failed to fetch referrals:", error);
    return NextResponse.json({ error: "Failed to fetch referrals" }, { status: 500 });
  }
}
