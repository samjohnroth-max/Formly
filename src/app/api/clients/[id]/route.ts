import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getRequiredSession } from "@/lib/auth/session";
import { db } from "@/lib/db";

async function getAccountId(userId: string) {
  const user = await db.user.findUnique({ where: { id: userId }, select: { accountId: true } });
  return user?.accountId ?? null;
}

// ─── PATCH /api/clients/[id] — rename or change status ───────────────────────

const patchSchema = z
  .object({
    name: z.string().min(1).max(100).optional(),
    status: z.enum(["ACTIVE", "DISABLED"]).optional(),
  })
  .refine((d) => d.name !== undefined || d.status !== undefined, "Must provide name or status");

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getRequiredSession();
  const accountId = await getAccountId(session.user.id);
  if (!accountId) return NextResponse.json({ error: "No account" }, { status: 403 });

  const body = await req.json().catch(() => null);
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });

  const { name, status } = parsed.data;
  const data: Record<string, unknown> = {};
  if (name !== undefined) data.name = name.trim();
  if (status !== undefined) data.status = status;

  const result = await db.client.updateMany({
    where: { id: params.id, accountId },
    data,
  });
  if (result.count === 0) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // When disabling: pause all active campaigns on this client's Meta connections
  if (status === "DISABLED") {
    const metaConns = await db.metaConnection.findMany({
      where: { groupId: params.id, accountId },
      select: { id: true },
    });
    if (metaConns.length > 0) {
      await db.campaign.updateMany({
        where: { metaConnectionId: { in: metaConns.map((c) => c.id) }, status: "ACTIVE" },
        data: { status: "PAUSED" },
      });
    }
  }

  return NextResponse.json({ ok: true });
}

// ─── DELETE /api/clients/[id] — archive campaigns, unlink, delete ─────────────

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getRequiredSession();
  const accountId = await getAccountId(session.user.id);
  if (!accountId) return NextResponse.json({ error: "No account" }, { status: 403 });

  // Verify client belongs to this account
  const client = await db.client.findFirst({ where: { id: params.id, accountId }, select: { id: true } });
  if (!client) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Archive campaigns for this client's connections, then unlink connections, then delete client
  const metaConns = await db.metaConnection.findMany({
    where: { groupId: params.id, accountId },
    select: { id: true },
  });

  await Promise.all([
    metaConns.length > 0
      ? db.campaign.updateMany({
          where: { metaConnectionId: { in: metaConns.map((c) => c.id) }, status: { not: "ARCHIVED" } },
          data: { status: "ARCHIVED" },
        })
      : Promise.resolve(),
    db.metaConnection.updateMany({ where: { groupId: params.id, accountId }, data: { groupId: null } }),
    db.sTConnection.updateMany({ where: { groupId: params.id, accountId }, data: { groupId: null } }),
  ]);

  await db.client.deleteMany({ where: { id: params.id, accountId } });

  return NextResponse.json({ ok: true });
}
