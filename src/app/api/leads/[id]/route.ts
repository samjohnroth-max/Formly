import { NextRequest, NextResponse } from "next/server";
import { getRequiredSession } from "@/lib/auth/session";
import { db } from "@/lib/db";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getRequiredSession();
  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { accountId: true },
  });
  if (!user?.accountId) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const lead = await db.lead.findFirst({
    where: { id: params.id, accountId: user.accountId },
    include: {
      campaign: {
        select: {
          name: true,
          destinationType: true,
          metaFormName: true,
          metaConnection: { select: { metaAccountName: true } },
          stConnection: { select: { tenantName: true, tenantId: true } },
        },
      },
      capiEvents: {
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!lead) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ lead });
}
