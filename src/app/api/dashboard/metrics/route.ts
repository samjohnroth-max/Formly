import { NextRequest, NextResponse } from "next/server";
import { getRequiredSession } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { parseDateRangeParams } from "@/lib/dashboard/dateRange";
import { fetchRoutingMetrics } from "@/app/(dashboard)/dashboard/data";

export async function GET(req: NextRequest) {
  const session = await getRequiredSession();
  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { accountId: true },
  });
  if (!user?.accountId)
    return NextResponse.json({ leadsToday: 0, successToday: 0, successRate: 0, avgRoutingSec: 0 });

  const { searchParams } = req.nextUrl;
  const dateRange = parseDateRangeParams({
    range: searchParams.get("range") ?? undefined,
    start: searchParams.get("start") ?? undefined,
    end: searchParams.get("end") ?? undefined,
  });

  const metrics = await fetchRoutingMetrics(user.accountId, dateRange);
  return NextResponse.json(metrics);
}
