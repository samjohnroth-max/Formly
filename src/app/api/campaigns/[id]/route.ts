import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getRequiredSession } from "@/lib/auth/session";
import { db } from "@/lib/db";

const patchSchema = z.object({
  status: z.enum(["ACTIVE", "PAUSED", "ARCHIVED"]).optional(),
  name: z.string().min(1).optional(),
});

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getRequiredSession();
  const user = await db.user.findUnique({ where: { id: session.user.id }, select: { accountId: true } });
  if (!user?.accountId) return NextResponse.json({ error: "No account" }, { status: 403 });

  const body = await req.json().catch(() => null);
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const campaign = await db.campaign.updateMany({
    where: { id: params.id, accountId: user.accountId },
    data: parsed.data,
  });

  if (campaign.count === 0) {
    return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
