import { NextRequest, NextResponse } from "next/server";
import { getRequiredSession } from "@/lib/auth/session";
import { decrypt } from "@/lib/crypto";
import { fetchMetaForms } from "@/lib/meta/forms";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  const session = await getRequiredSession();
  const metaConnectionId = req.nextUrl.searchParams.get("metaConnectionId");
  if (!metaConnectionId) return NextResponse.json({ error: "metaConnectionId required" }, { status: 400 });

  const user = await db.user.findUnique({ where: { id: session.user.id }, select: { accountId: true } });
  if (!user?.accountId) return NextResponse.json({ error: "No account" }, { status: 403 });

  const conn = await db.metaConnection.findFirst({
    where: { id: metaConnectionId, accountId: user.accountId },
    select: { accessToken: true, metaAccountId: true },
  });
  if (!conn) return NextResponse.json({ error: "Connection not found" }, { status: 404 });

  try {
    const forms = await fetchMetaForms(decrypt(conn.accessToken));
    return NextResponse.json({ forms });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to fetch forms";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
