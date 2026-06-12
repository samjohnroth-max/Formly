import { NextResponse } from "next/server";
import { getRequiredSession } from "@/lib/auth/session";
import { db } from "@/lib/db";

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getRequiredSession();
  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { accountId: true },
  });
  if (!user?.accountId)
    return NextResponse.json({ error: "No account" }, { status: 400 });

  const { pixelId, datasetId } = await req.json();
  if (!pixelId?.trim())
    return NextResponse.json({ error: "pixelId is required" }, { status: 400 });

  const result = await db.metaConnection.updateMany({
    where: { id: params.id, accountId: user.accountId },
    data: {
      pixelId: pixelId.trim(),
      datasetId: datasetId?.trim() ?? null,
    },
  });

  if (result.count === 0)
    return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({ ok: true });
}
