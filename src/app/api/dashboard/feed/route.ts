import { NextResponse } from "next/server";
import { getRequiredSession } from "@/lib/auth/session";
import { db } from "@/lib/db";

export async function GET() {
  const session = await getRequiredSession();
  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { accountId: true },
  });
  if (!user?.accountId) return NextResponse.json({ leads: [] });

  const leads = await db.lead.findMany({
    where: { accountId: user.accountId },
    orderBy: { createdAt: "desc" },
    take: 50,
    select: {
      id: true,
      firstName: true,
      lastName: true,
      createdAt: true,
      routingStatus: true,
      lat: true,
      lng: true,
      stJobId: true,
      stLeadId: true,
      campaign: {
        select: { name: true, destinationType: true },
      },
    },
  });

  return NextResponse.json({ leads });
}
