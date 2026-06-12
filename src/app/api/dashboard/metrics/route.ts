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
    return NextResponse.json(
      { leadsToday: 0, successToday: 0, successRate: 0, avgRoutingSec: 0 }
    );

  const { accountId } = user;
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const [leadsToday, successToday, leadsThirty, successThirty, routingTimes] =
    await Promise.all([
      db.lead.count({ where: { accountId, createdAt: { gte: todayStart } } }),
      db.lead.count({
        where: { accountId, routingStatus: "SUCCESS", createdAt: { gte: todayStart } },
      }),
      db.lead.count({ where: { accountId, createdAt: { gte: thirtyDaysAgo } } }),
      db.lead.count({
        where: { accountId, routingStatus: "SUCCESS", createdAt: { gte: thirtyDaysAgo } },
      }),
      db.lead.findMany({
        where: { accountId, routingStatus: "SUCCESS", createdAt: { gte: thirtyDaysAgo } },
        select: { createdAt: true, updatedAt: true },
      }),
    ]);

  const successRate =
    leadsThirty > 0 ? Math.round((successThirty / leadsThirty) * 100) : 0;

  const avgMs =
    routingTimes.length > 0
      ? routingTimes.reduce(
          (sum: number, l: { createdAt: Date; updatedAt: Date }) =>
            sum + (l.updatedAt.getTime() - l.createdAt.getTime()),
          0
        ) / routingTimes.length
      : 0;

  return NextResponse.json({
    leadsToday,
    successToday,
    successRate,
    avgRoutingSec: Math.round(avgMs / 1000),
  });
}
