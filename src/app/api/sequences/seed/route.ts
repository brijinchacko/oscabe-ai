import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-helpers";

// ---------------------------------------------------------------------------
// Persona sequence templates from the automation repo
// ---------------------------------------------------------------------------

const ENGINEERING_SEQUENCE = {
  name: "Engineering Manager Sequence",
  description:
    "4-step outreach for Engineering/Controls/Technical Directors. Problem-led intro, social proof, value offer, graceful close.",
  steps: [
    {
      dayDelay: 0,
      stepOrder: 1,
      action: "EMAIL",
      subject: "PLC engineers in {{location}} — quick question",
      body: `Hi {{firstName}},

Finding verified PLC and SCADA engineers in the UK right now is genuinely difficult — most agencies send CVs without any technical validation, wasting your team's time.

We're Oscabe. Our team includes chartered engineers who technically screen every candidate before you see them. We deliver shortlists in 72 hours, with no upfront fees.

Are you currently looking to add to your automation team at {{company}}, or is this something on the horizon?

Best,
{{senderName}}
Oscabe | oscabe.com`,
    },
    {
      dayDelay: 4,
      stepOrder: 2,
      action: "EMAIL",
      subject: "Re: PLC engineers in {{location}}",
      body: `Hi {{firstName}},

Just following up on my last note.

To give you a sense of what we do: we recently helped a manufacturing firm fill two specialist PLC engineer roles in under 10 days — after their previous agency had spent 6 weeks delivering unsuitable candidates.

No upfront fees. No retainers. You only pay when we make a successful placement.

Happy to share more details if it's relevant to {{company}}?

Best,
{{senderName}}
Oscabe | oscabe.com`,
    },
    {
      dayDelay: 8,
      stepOrder: 3,
      action: "EMAIL",
      subject: "How we cut engineering hiring time by 40%",
      body: `Hi {{firstName}},

One more thought — we recently helped a client in {{industry}} reduce their engineering hiring time by 40% while cutting costs versus their previous agency.

If you're dealing with similar challenges at {{company}}, I'd be happy to walk you through how we approached it. Takes 15 minutes.

Would Thursday or Friday afternoon work for a quick call?

Best,
{{senderName}}
Oscabe | oscabe.com`,
    },
    {
      dayDelay: 12,
      stepOrder: 4,
      action: "EMAIL",
      subject: "Closing the loop, {{firstName}}",
      body: `Hi {{firstName}},

I don't want to keep filling your inbox if the timing isn't right. I'll leave it here for now.

If you ever need to move quickly on an automation or engineering hire, we'd love to be your first call. Our details are always at oscabe.com.

Wishing you and the team at {{company}} all the best.

{{senderName}}
Oscabe | oscabe.com`,
    },
  ],
};

const OPERATIONS_SEQUENCE = {
  name: "Operations Manager Sequence",
  description:
    "4-step outreach for Plant/Ops/Manufacturing Directors. Focused on commissioning engineers and production timelines.",
  steps: [
    {
      dayDelay: 0,
      stepOrder: 1,
      action: "EMAIL",
      subject: "Commissioning engineers for {{company}} — a thought",
      body: `Hi {{firstName}},

Backfilling commissioning and controls engineers quickly is one of the hardest challenges in {{industry}} right now — especially when production timelines can't slip.

We're Oscabe, a specialist automation recruitment agency. We've placed commissioning engineers for manufacturers and integrators across the UK, typically within 10 days.

No upfront fees, no retainers — you only pay on a successful placement.

Is this the sort of challenge you're facing at {{company}}?

Best,
{{senderName}}
Oscabe | oscabe.com`,
    },
    {
      dayDelay: 4,
      stepOrder: 2,
      action: "EMAIL",
      subject: "Re: Commissioning engineers for {{company}}",
      body: `Hi {{firstName}},

Following up briefly — our team is made up of chartered engineers, so we technically screen every candidate before you see them. No irrelevant CVs.

We currently have a strong pipeline of verified PLC, SCADA, and commissioning engineers across the UK, available for both permanent and contract roles.

Would it be worth a 15-minute call to see if we could be useful to {{company}}?

Best,
{{senderName}}
Oscabe | oscabe.com`,
    },
    {
      dayDelay: 8,
      stepOrder: 3,
      action: "EMAIL",
      subject: "Quick question about your engineering team",
      body: `Hi {{firstName}},

I'll keep this brief — do you have any plans to grow your engineering or automation team over the next 6 months?

Even if it's not urgent right now, it's worth having a specialist agency on standby. We've helped operations teams across {{industry}} avoid costly delays when urgent roles come up.

Happy to have a quick chat if useful.

Best,
{{senderName}}
Oscabe | oscabe.com`,
    },
    {
      dayDelay: 12,
      stepOrder: 4,
      action: "EMAIL",
      subject: "Last note from Oscabe",
      body: `Hi {{firstName}},

I'll stop here — clearly the timing isn't right, and I don't want to be a nuisance.

If you ever need to move quickly on an engineering hire, please do reach out. We're at oscabe.com.

All the best to you and the team.

{{senderName}}
Oscabe | oscabe.com`,
    },
  ],
};

const HR_SEQUENCE = {
  name: "HR Manager Sequence",
  description:
    "4-step outreach for HR/Talent Acquisition. Emphasises speed vs generic agencies and technical screening.",
  steps: [
    {
      dayDelay: 0,
      stepOrder: 1,
      action: "EMAIL",
      subject:
        "Specialist automation engineers — faster than your current agency?",
      body: `Hi {{firstName}},

I know talent teams in {{industry}} are under pressure to fill engineering roles faster — especially for specialist skills like PLC and SCADA where generic agencies consistently underdeliver.

Oscabe is a specialist automation recruitment agency. We're led by chartered engineers who technically screen every candidate, and we deliver shortlists within 72 hours.

No upfront fees. No retainers. Just results.

Would it be worth a quick conversation about {{company}}'s engineering hiring challenges?

Best,
{{senderName}}
Oscabe | oscabe.com`,
    },
    {
      dayDelay: 4,
      stepOrder: 2,
      action: "EMAIL",
      subject: "Re: Specialist automation engineers",
      body: `Hi {{firstName}},

Just a quick follow-up. The main thing that sets us apart: our candidates are technically screened by engineers, not just keyword-matched by an algorithm.

This means your hiring managers only interview candidates who are genuinely qualified — saving significant time and frustration.

Happy to send over a sample shortlist for a live role if that would be useful?

Best,
{{senderName}}
Oscabe | oscabe.com`,
    },
    {
      dayDelay: 8,
      stepOrder: 3,
      action: "EMAIL",
      subject: "Sample shortlist for your next engineering role?",
      body: `Hi {{firstName}},

One last thought — if {{company}} has any open automation or engineering roles right now, I'd be happy to put together a complimentary sample shortlist to demonstrate our quality.

No commitment required. It's the best way to see whether we're a good fit.

Interested?

Best,
{{senderName}}
Oscabe | oscabe.com`,
    },
    {
      dayDelay: 12,
      stepOrder: 4,
      action: "EMAIL",
      subject: "Signing off, {{firstName}}",
      body: `Hi {{firstName}},

I'll leave it here — clearly not the right moment.

If {{company}}'s engineering hiring needs change, we'd love to help. You can always find us at oscabe.com.

Best of luck with everything.

{{senderName}}
Oscabe | oscabe.com`,
    },
  ],
};

const PERSONA_SEQUENCES = [
  ENGINEERING_SEQUENCE,
  OPERATIONS_SEQUENCE,
  HR_SEQUENCE,
];

// POST: Seed the database with 3 pre-built persona sequences
export async function POST() {
  const { user, error } = await requireAuth();
  if (error) return error;

  const created: { id: string; name: string; steps: number }[] = [];
  const skipped: string[] = [];

  for (const seq of PERSONA_SEQUENCES) {
    // Check if a sequence with this name already exists
    const existing = await prisma.followUpSequence.findFirst({
      where: { name: seq.name },
    });

    if (existing) {
      skipped.push(seq.name);
      continue;
    }

    const record = await prisma.followUpSequence.create({
      data: {
        name: seq.name,
        description: seq.description,
        isActive: true,
        createdBy: user!.id,
        steps: {
          create: seq.steps.map((step) => ({
            dayDelay: step.dayDelay,
            action: step.action,
            subject: step.subject,
            body: step.body,
            stepOrder: step.stepOrder,
          })),
        },
      },
      include: { steps: true },
    });

    created.push({
      id: record.id,
      name: record.name,
      steps: record.steps.length,
    });
  }

  // Log the seed activity
  if (created.length > 0) {
    await prisma.activity.create({
      data: {
        type: "AUTOMATION",
        title: "Persona sequences seeded",
        content: `Seeded ${created.length} persona email sequences: ${created.map((c) => c.name).join(", ")}`,
        userId: user!.id,
      },
    });
  }

  return NextResponse.json({
    success: true,
    created,
    skipped,
    message:
      created.length > 0
        ? `Seeded ${created.length} sequences successfully`
        : "All sequences already exist",
  });
}
