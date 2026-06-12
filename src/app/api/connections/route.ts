import { NextResponse } from "next/server";
import { getRequiredSession } from "@/lib/auth/session";
import { db } from "@/lib/db";

export async function GET() {
  const session = await getRequiredSession();

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { accountId: true },
  });

  if (!user?.accountId) {
    return NextResponse.json({ metaConnections: [], stConnections: [] });
  }

  const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1);

  const [metaConnections, stConnections, campaigns] = await Promise.all([
    db.metaConnection.findMany({
      where: { accountId: user.accountId },
      select: {
        id: true,
        metaAccountName: true,
        metaAccountId: true,
        pixelId: true,
        status: true,
        createdAt: true,
        _count: { select: { campaigns: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    db.sTConnection.findMany({
      where: { accountId: user.accountId },
      select: {
        id: true,
        tenantName: true,
        tenantId: true,
        status: true,
        createdAt: true,
        _count: { select: { campaigns: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    db.campaign.findMany({
      where: { accountId: user.accountId },
      select: { id: true, metaConnectionId: true, stConnectionId: true },
    }),
  ]);

  const leadRows =
    campaigns.length > 0
      ? await db.lead.groupBy({
          by: ["campaignId"],
          where: { accountId: user.accountId, createdAt: { gte: monthStart } },
          _count: { _all: true },
        })
      : [];

  function leadsForMeta(connId: string) {
    const ids = campaigns.filter((c) => c.metaConnectionId === connId).map((c) => c.id);
    return leadRows.filter((r) => ids.includes(r.campaignId)).reduce((s, r) => s + r._count._all, 0);
  }

  function leadsForST(connId: string) {
    const ids = campaigns.filter((c) => c.stConnectionId === connId).map((c) => c.id);
    return leadRows.filter((r) => ids.includes(r.campaignId)).reduce((s, r) => s + r._count._all, 0);
  }

  return NextResponse.json({
    metaConnections: metaConnections.map((c) => ({
      id: c.id,
      metaAccountName: c.metaAccountName,
      metaAccountId: c.metaAccountId,
      pixelId: c.pixelId,
      status: c.status,
      createdAt: c.createdAt,
      campaignCount: c._count.campaigns,
      leadsThisMonth: leadsForMeta(c.id),
    })),
    stConnections: stConnections.map((c) => ({
      id: c.id,
      tenantName: c.tenantName,
      tenantId: c.tenantId,
      status: c.status,
      createdAt: c.createdAt,
      campaignCount: c._count.campaigns,
      leadsThisMonth: leadsForST(c.id),
    })),
  });
}
