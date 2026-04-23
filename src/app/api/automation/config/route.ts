import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-helpers";

// ---------------------------------------------------------------------------
// Default ICP configuration (from automation repo settings.py)
// ---------------------------------------------------------------------------

const DEFAULT_ICP_CONFIG = {
  jobTitles: [
    "Engineering Manager",
    "Engineering Director",
    "Head of Engineering",
    "Controls Manager",
    "Automation Manager",
    "Operations Director",
    "Operations Manager",
    "Plant Manager",
    "Manufacturing Director",
    "HR Manager",
    "Talent Acquisition Manager",
    "Head of Talent",
    "CTO",
    "Technical Director",
  ],
  industries: [
    "Manufacturing",
    "Energy",
    "Oil & Gas",
    "Pharmaceuticals",
    "Automotive",
    "Food & Beverage",
    "Water & Utilities",
    "Industrial Automation",
    "Logistics",
  ],
  companySizeMin: 50,
  companySizeMax: 1000,
  locations: ["United Kingdom"],
  dailyEmailLimit: 50,
  followUpIntervalDays: 4,
};

const CONFIG_TYPE = "SYSTEM_CONFIG";
const CONFIG_TITLE = "ICP_CONFIG";

// GET: Return current ICP config (or defaults)
export async function GET() {
  const { user, error } = await requireAuth();
  if (error) return error;

  const configRecord = await prisma.activity.findFirst({
    where: { type: CONFIG_TYPE, title: CONFIG_TITLE },
    orderBy: { createdAt: "desc" },
  });

  if (configRecord?.content) {
    try {
      const config = JSON.parse(configRecord.content);
      return NextResponse.json({
        config,
        updatedAt: configRecord.createdAt,
        isDefault: false,
      });
    } catch {
      // Corrupt JSON — fall through to defaults
    }
  }

  return NextResponse.json({
    config: DEFAULT_ICP_CONFIG,
    updatedAt: null,
    isDefault: true,
  });
}

// PUT: Update ICP config (admin only)
export async function PUT(req: NextRequest) {
  const { user, error } = await requireAuth();
  if (error) return error;

  if (user!.role !== "ADMIN") {
    return NextResponse.json(
      { error: "Only admins can update ICP configuration" },
      { status: 403 }
    );
  }

  const body = await req.json();
  const {
    jobTitles,
    industries,
    companySizeMin,
    companySizeMax,
    locations,
    dailyEmailLimit,
    followUpIntervalDays,
  } = body;

  // Validate required fields
  if (!jobTitles || !Array.isArray(jobTitles) || jobTitles.length === 0) {
    return NextResponse.json(
      { error: "jobTitles must be a non-empty array" },
      { status: 400 }
    );
  }
  if (!industries || !Array.isArray(industries) || industries.length === 0) {
    return NextResponse.json(
      { error: "industries must be a non-empty array" },
      { status: 400 }
    );
  }

  const config = {
    jobTitles,
    industries,
    companySizeMin: companySizeMin ?? DEFAULT_ICP_CONFIG.companySizeMin,
    companySizeMax: companySizeMax ?? DEFAULT_ICP_CONFIG.companySizeMax,
    locations: locations ?? DEFAULT_ICP_CONFIG.locations,
    dailyEmailLimit: dailyEmailLimit ?? DEFAULT_ICP_CONFIG.dailyEmailLimit,
    followUpIntervalDays:
      followUpIntervalDays ?? DEFAULT_ICP_CONFIG.followUpIntervalDays,
  };

  // Store as a new Activity record (latest wins)
  await prisma.activity.create({
    data: {
      type: CONFIG_TYPE,
      title: CONFIG_TITLE,
      content: JSON.stringify(config),
      userId: user!.id,
      metadata: JSON.stringify({
        updatedBy: user!.email,
        updatedAt: new Date().toISOString(),
      }),
    },
  });

  return NextResponse.json({
    success: true,
    config,
    message: "ICP configuration updated",
  });
}
