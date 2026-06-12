import { NextRequest, NextResponse } from "next/server";
import { getRequiredSession } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { parseDateRangeParams } from "@/lib/dashboard/dateRange";
import { fetchRevenueMetrics } from "@/app/(dashboard)/dashboard/data";

export async function GET(req: NextRequest) {
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

  const { searchParams } = req.nextUrl;
  const dateRange = parseDateRangeParams({
    range: searchParams.get("range") ?? undefined,
    start: searchParams.get("start") ?? undefined,
    end: searchParams.get("end") ?? undefined,
  });

  const metrics = await fetchRevenueMetrics(user.accountId, dateRange);
  return NextResponse.json({
    totalInvoiced: metrics.totalRevenueThisMonth,
    totalLeads: 0,
    avgJobValue: metrics.avgJobValue,
    byCampaign: [],
    purchaseEventsThisMonth: metrics.purchaseEvents30Days,
  });
}
