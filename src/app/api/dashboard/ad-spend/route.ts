import { NextRequest, NextResponse } from "next/server";
import { getRequiredSession } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { z } from "zod";

const schema = z.object({
  campaignId: z.string().min(1),
  month: z.string().regex(/^\d{4}-\d{2}$/, "Month must be YYYY-MM"),
  spend: z.number().min(0),
});

export async function POST(req: NextRequest) {
  const session = await getRequiredSession();
  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { accountId: true },
  });
  if (!user?.accountId) return NextResponse.json({ error: "No account" }, { status: 403 });

  const body = await req.json();
  const result = schema.safeParse(body);
  if (!result.success) {
    return NextResponse.json({ error: result.error.errors[0].message }, { status: 400 });
  }

  const { campaignId, month, spend } = result.data;

  // Verify campaign belongs to this account
  const campaign = await db.campaign.findFirst({
    where: { id: campaignId, accountId: user.accountId },
    select: { id: true },
  });
  if (!campaign) return NextResponse.json({ error: "Campaign not found" }, { status: 404 });

  const [year, mon] = month.split("-").map(Number);
  const monthDate = new Date(Date.UTC(year, mon - 1, 1));

  const record = await db.monthlyAdSpend.upsert({
    where: { campaignId_month: { campaignId, month: monthDate } },
    update: { spend },
    create: { campaignId, month: monthDate, spend },
  });

  return NextResponse.json({ success: true, record });
}
