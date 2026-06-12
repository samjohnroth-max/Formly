import { NextRequest, NextResponse } from "next/server";
import { getRequiredSession } from "@/lib/auth/session";
import { fetchBusinessUnits } from "@/lib/servicetitan/catalog";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  const session = await getRequiredSession();
  const stConnectionId = req.nextUrl.searchParams.get("stConnectionId");
  if (!stConnectionId) return NextResponse.json({ error: "stConnectionId required" }, { status: 400 });

  const user = await db.user.findUnique({ where: { id: session.user.id }, select: { accountId: true } });
  if (!user?.accountId) return NextResponse.json({ error: "No account" }, { status: 403 });

  const conn = await db.sTConnection.findFirst({
    where: { id: stConnectionId, accountId: user.accountId },
  });
  if (!conn) return NextResponse.json({ error: "Connection not found" }, { status: 404 });

  try {
    const businessUnits = await fetchBusinessUnits(conn);
    return NextResponse.json({ businessUnits });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to fetch business units";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
