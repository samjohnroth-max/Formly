import { NextResponse } from "next/server";
import { getRequiredSession } from "@/lib/auth/session";
import { db } from "@/lib/db";

export async function GET() {
  const session = await getRequiredSession();
  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { accountId: true },
  });
  if (!user?.accountId)
    return NextResponse.json({
      totalInvoiced: 0,
      totalLeads: 0,
      avgJobValue: 0,
      byCampaign: [],
      purchaseEventsThisMonth: 0,
    });

  const { accountId } = user;
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);

  // Leads with invoice values (actual revenue)
  const invoicedLeads = await db.lead.findMany({
    where: {
      accountId,
      invoiceValue: { not: null, gt: 0 },
      createdAt: { gte: thirtyDaysAgo },
    },
    select: {
      invoiceValue: true,
      campaign: { select: { id: true, name: true } },
    },
  });

  const totalInvoiced = invoicedLeads.reduce(
    (sum: number, l: { invoiceValue: number | null }) => sum + (l.invoiceValue ?? 0),
    0
  );
  const totalLeads = invoicedLeads.length;
  const avgJobValue = totalLeads > 0 ? totalInvoiced / totalLeads : 0;

  // Group by campaign
  const campaignMap = new Map<string, { name: string; revenue: number; count: number }>();
  for (const lead of invoicedLeads as Array<{ invoiceValue: number | null; campaign: { id: string; name: string } | null }>) {
    if (!lead.campaign) continue;
    const existing = campaignMap.get(lead.campaign.id) ?? {
      name: lead.campaign.name,
      revenue: 0,
      count: 0,
    };
    existing.revenue += lead.invoiceValue ?? 0;
    existing.count += 1;
    campaignMap.set(lead.campaign.id, existing);
  }
  const byCampaign = Array.from(campaignMap.values())
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  // Purchase CAPI events this month for value optimization indicator
  const purchaseEvents = await db.cAPIEvent.count({
    where: {
      eventName: "Purchase",
      status: "SENT",
      createdAt: { gte: monthStart },
      lead: { accountId },
    },
  });

  return NextResponse.json({
    totalInvoiced,
    totalLeads,
    avgJobValue,
    byCampaign,
    purchaseEventsThisMonth: purchaseEvents,
  });
}
