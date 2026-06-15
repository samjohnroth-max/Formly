import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getRequiredSession } from "@/lib/auth/session";
import { db } from "@/lib/db";

// ─── Shared helpers ───────────────────────────────────────────────────────────

async function getAccountId(userId: string) {
  const user = await db.user.findUnique({ where: { id: userId }, select: { accountId: true } });
  return user?.accountId ?? null;
}

function buildStats(
  allCampaigns: { id: string; metaConnectionId: string; stConnectionId: string }[],
  leadRows: { campaignId: string; _count: { _all: number } }[]
) {
  return {
    leadsForConn: (connId: string, type: "meta" | "st") => {
      const ids = allCampaigns
        .filter((c) => (type === "meta" ? c.metaConnectionId : c.stConnectionId) === connId)
        .map((c) => c.id);
      return leadRows.filter((r) => ids.includes(r.campaignId)).reduce((s, r) => s + r._count._all, 0);
    },
  };
}

// ─── GET /api/clients ─────────────────────────────────────────────────────────

export async function GET() {
  const session = await getRequiredSession();
  const accountId = await getAccountId(session.user.id);
  if (!accountId) return NextResponse.json({ clients: [], unassigned: { metaConnections: [], stConnections: [] } });

  const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1);

  const [clients, unassignedMeta, unassignedST, allCampaigns, leadRows] = await Promise.all([
    db.client.findMany({
      where: { accountId },
      select: {
        id: true,
        name: true,
        createdAt: true,
        metaConnections: {
          select: { id: true, metaAccountName: true, pixelId: true, datasetId: true, status: true, createdAt: true, _count: { select: { campaigns: true } } },
          orderBy: { createdAt: "asc" },
        },
        stConnections: {
          select: { id: true, tenantName: true, tenantId: true, status: true, createdAt: true, _count: { select: { campaigns: true } } },
          orderBy: { createdAt: "asc" },
        },
      },
      orderBy: { createdAt: "asc" },
    }),
    db.metaConnection.findMany({
      where: { accountId, groupId: null },
      select: { id: true, metaAccountName: true, pixelId: true, datasetId: true, status: true, createdAt: true, _count: { select: { campaigns: true } } },
      orderBy: { createdAt: "desc" },
    }),
    db.sTConnection.findMany({
      where: { accountId, groupId: null },
      select: { id: true, tenantName: true, tenantId: true, status: true, createdAt: true, _count: { select: { campaigns: true } } },
      orderBy: { createdAt: "desc" },
    }),
    db.campaign.findMany({
      where: { accountId },
      select: { id: true, metaConnectionId: true, stConnectionId: true },
    }),
    db.lead.groupBy({
      by: ["campaignId"],
      where: { accountId, createdAt: { gte: monthStart } },
      _count: { _all: true },
    }),
  ]);

  const { leadsForConn } = buildStats(allCampaigns, leadRows);

  const mapMeta = (c: (typeof unassignedMeta)[0]) => ({
    id: c.id,
    metaAccountName: c.metaAccountName,
    pixelId: c.pixelId,
    datasetId: c.datasetId,
    status: c.status,
    createdAt: c.createdAt,
    campaignCount: c._count.campaigns,
    leadsThisMonth: leadsForConn(c.id, "meta"),
  });

  const mapST = (c: (typeof unassignedST)[0]) => ({
    id: c.id,
    tenantName: c.tenantName,
    tenantId: c.tenantId,
    status: c.status,
    createdAt: c.createdAt,
    campaignCount: c._count.campaigns,
    leadsThisMonth: leadsForConn(c.id, "st"),
  });

  return NextResponse.json({
    clients: clients.map((cl) => ({
      id: cl.id,
      name: cl.name,
      createdAt: cl.createdAt,
      metaConnections: cl.metaConnections.map(mapMeta),
      stConnections: cl.stConnections.map(mapST),
    })),
    unassigned: {
      metaConnections: unassignedMeta.map(mapMeta),
      stConnections: unassignedST.map(mapST),
    },
  });
}

// ─── POST /api/clients ────────────────────────────────────────────────────────

const createSchema = z.object({ name: z.string().min(1).max(100) });

export async function POST(req: NextRequest) {
  const session = await getRequiredSession();
  const accountId = await getAccountId(session.user.id);
  if (!accountId) return NextResponse.json({ error: "No account" }, { status: 403 });

  const body = await req.json().catch(() => null);
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Name is required" }, { status: 400 });

  const client = await db.client.create({
    data: { accountId, name: parsed.data.name.trim() },
    select: { id: true, name: true, createdAt: true },
  });

  return NextResponse.json(client, { status: 201 });
}
