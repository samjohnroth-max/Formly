import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getRequiredSession } from "@/lib/auth/session";
import { db } from "@/lib/db";

async function getAccountId(userId: string) {
  const user = await db.user.findUnique({ where: { id: userId }, select: { accountId: true } });
  return user?.accountId ?? null;
}

// ─── PATCH /api/clients/[id] — rename ────────────────────────────────────────

const patchSchema = z.object({ name: z.string().min(1).max(100) });

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getRequiredSession();
  const accountId = await getAccountId(session.user.id);
  if (!accountId) return NextResponse.json({ error: "No account" }, { status: 403 });

  const body = await req.json().catch(() => null);
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Name is required" }, { status: 400 });

  const result = await db.client.updateMany({
    where: { id: params.id, accountId },
    data: { name: parsed.data.name.trim() },
  });

  if (result.count === 0) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ ok: true });
}

// ─── DELETE /api/clients/[id] ─────────────────────────────────────────────────

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getRequiredSession();
  const accountId = await getAccountId(session.user.id);
  if (!accountId) return NextResponse.json({ error: "No account" }, { status: 403 });

  // Unlink connections before deleting so they become unassigned
  await Promise.all([
    db.metaConnection.updateMany({ where: { groupId: params.id, accountId }, data: { groupId: null } }),
    db.sTConnection.updateMany({ where: { groupId: params.id, accountId }, data: { groupId: null } }),
  ]);

  const result = await db.client.deleteMany({ where: { id: params.id, accountId } });
  if (result.count === 0) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({ ok: true });
}
