import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getRequiredSession } from "@/lib/auth/session";
import { encrypt } from "@/lib/crypto";
import { testSTCredentials } from "@/lib/servicetitan/auth";
import { db } from "@/lib/db";

const schema = z.object({
  tenantId: z.string().min(1),
  tenantName: z.string().min(1),
  clientId: z.string().min(1),      // ServiceTitan OAuth client_id
  clientSecret: z.string().min(1),
  appKey: z.string().min(1),
  groupId: z.string().optional(),   // Formly client group ID
});

export async function POST(req: NextRequest) {
  const session = await getRequiredSession();

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input", issues: parsed.error.issues }, { status: 400 });
  }

  const { tenantId, tenantName, clientId, clientSecret, appKey, groupId } = parsed.data;

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { accountId: true },
  });

  if (!user?.accountId) {
    return NextResponse.json({ error: "No account found" }, { status: 403 });
  }

  // Verify groupId belongs to this account if provided
  let resolvedGroupId: string | null = null;
  if (groupId) {
    const client = await db.client.findFirst({ where: { id: groupId, accountId: user.accountId } });
    resolvedGroupId = client?.id ?? null;
  }

  const valid = await testSTCredentials(clientId, clientSecret);
  if (!valid) {
    return NextResponse.json(
      { error: "Could not authenticate with ServiceTitan. Check your Client ID and Secret." },
      { status: 422 }
    );
  }

  const existing = await db.sTConnection.findFirst({
    where: { accountId: user.accountId, tenantId },
    select: { id: true },
  });

  const connection = await db.sTConnection.upsert({
    where: { id: existing?.id ?? "new" },
    create: {
      accountId: user.accountId,
      groupId: resolvedGroupId,
      tenantId,
      tenantName,
      clientId: encrypt(clientId),
      clientSecret: encrypt(clientSecret),
      appKey: encrypt(appKey),
      status: "ACTIVE",
    },
    update: {
      tenantName,
      clientId: encrypt(clientId),
      clientSecret: encrypt(clientSecret),
      appKey: encrypt(appKey),
      accessToken: null,
      tokenExpiresAt: null,
      status: "ACTIVE",
      ...(resolvedGroupId ? { groupId: resolvedGroupId } : {}),
    },
  });

  return NextResponse.json({ id: connection.id, status: "ACTIVE" });
}
