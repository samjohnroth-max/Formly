import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getRequiredSession } from "@/lib/auth/session";
import { db } from "@/lib/db";

async function getAccountId(userId: string) {
  const user = await db.user.findUnique({ where: { id: userId }, select: { accountId: true } });
  return user?.accountId ?? null;
}

const schema = z.object({
  type: z.enum(["meta", "st"]),
  connectionId: z.string().min(1),
});

// POST /api/clients/[id]/assign
// body: { type: "meta" | "st", connectionId: string }
// Assigns a connection to this client. Pass clientId="" to unassign.
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getRequiredSession();
  const accountId = await getAccountId(session.user.id);
  if (!accountId) return NextResponse.json({ error: "No account" }, { status: 403 });

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const { type, connectionId } = parsed.data;
  const groupId = params.id === "unassign" ? null : params.id;

  // Verify the target client belongs to this account (unless unassigning)
  if (groupId) {
    const client = await db.client.findFirst({ where: { id: groupId, accountId } });
    if (!client) return NextResponse.json({ error: "Client not found" }, { status: 404 });
  }

  if (type === "meta") {
    const result = await db.metaConnection.updateMany({
      where: { id: connectionId, accountId },
      data: { groupId },
    });
    if (result.count === 0) return NextResponse.json({ error: "Connection not found" }, { status: 404 });
  } else {
    const result = await db.sTConnection.updateMany({
      where: { id: connectionId, accountId },
      data: { groupId },
    });
    if (result.count === 0) return NextResponse.json({ error: "Connection not found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
