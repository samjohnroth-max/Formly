import { NextResponse } from "next/server";
import { getRequiredSession } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { SEQUENCE_DEFAULTS } from "@/lib/email-sequence";

async function getAccountId(userId: string) {
  const user = await db.user.findUnique({ where: { id: userId }, select: { accountId: true } });
  return user?.accountId ?? null;
}

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const session = await getRequiredSession();
  const accountId = await getAccountId(session.user.id);
  if (!accountId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const campaign = await db.campaign.findFirst({ where: { id: params.id, accountId } });
  if (!campaign) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const saved = await db.campaignEmailSequence.findMany({
    where: { campaignId: params.id },
    include: { emailTemplate: { select: { id: true, name: true, subject: true } } },
    orderBy: { stepNumber: "asc" },
  });

  const savedMap = Object.fromEntries(saved.map((s) => [s.stepNumber, s]));

  const steps = SEQUENCE_DEFAULTS.map((def) => {
    const s = savedMap[def.stepNumber];
    return {
      stepNumber: def.stepNumber,
      triggerType: def.triggerType as string,
      triggerDelay: def.triggerDelay,
      label: def.label,
      enabled: s?.enabled ?? false,
      emailTemplateId: s?.emailTemplateId ?? null,
      emailTemplate: s?.emailTemplate ?? null,
    };
  });

  return NextResponse.json({ steps });
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await getRequiredSession();
  const accountId = await getAccountId(session.user.id);
  if (!accountId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const campaign = await db.campaign.findFirst({ where: { id: params.id, accountId } });
  if (!campaign) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { steps } = await req.json() as {
    steps: { stepNumber: number; enabled: boolean; emailTemplateId: string | null }[];
  };

  await Promise.all(
    steps.map((step) => {
      const def = SEQUENCE_DEFAULTS.find((d) => d.stepNumber === step.stepNumber);
      if (!def) return Promise.resolve();
      return db.campaignEmailSequence.upsert({
        where: { campaignId_stepNumber: { campaignId: params.id, stepNumber: step.stepNumber } },
        update: { enabled: step.enabled, emailTemplateId: step.emailTemplateId, updatedAt: new Date() },
        create: {
          campaignId: params.id,
          stepNumber: step.stepNumber,
          triggerType: def.triggerType,
          triggerDelay: def.triggerDelay,
          enabled: step.enabled,
          emailTemplateId: step.emailTemplateId,
        },
      });
    })
  );

  return NextResponse.json({ success: true });
}
