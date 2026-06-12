import { NextRequest, NextResponse } from "next/server";
import { getRequiredSession } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { haversineDistance } from "@/lib/geo";

export async function GET(req: NextRequest) {
  const session = await getRequiredSession();
  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { accountId: true },
  });
  if (!user?.accountId) return NextResponse.json({ leads: [], serviceArea: null });

  const { searchParams } = req.nextUrl;
  const startStr = searchParams.get("start");
  const endStr = searchParams.get("end");

  const dateFilter: { gte?: Date; lte?: Date } = {};
  if (startStr) dateFilter.gte = new Date(startStr);
  if (endStr) dateFilter.lte = new Date(endStr);

  const [leads, serviceArea] = await Promise.all([
    db.lead.findMany({
      where: {
        accountId: user.accountId,
        ...(Object.keys(dateFilter).length > 0 ? { createdAt: dateFilter } : {}),
      },
      orderBy: { createdAt: "desc" },
      take: 50,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        phone: true,
        createdAt: true,
        routingStatus: true,
        lat: true,
        lng: true,
        stJobId: true,
        stLeadId: true,
        campaign: { select: { name: true, destinationType: true } },
      },
    }),
    db.serviceArea.findUnique({ where: { accountId: user.accountId } }),
  ]);

  const leadsWithArea = leads.map((l) => {
    let distanceMiles: number | null = null;
    let inServiceArea: boolean | null = null;
    if (serviceArea && l.lat != null && l.lng != null) {
      distanceMiles = Math.round(
        haversineDistance(serviceArea.lat, serviceArea.lng, l.lat, l.lng) * 10
      ) / 10;
      inServiceArea = distanceMiles <= serviceArea.radiusMiles;
    }
    return { ...l, distanceMiles, inServiceArea };
  });

  return NextResponse.json({ leads: leadsWithArea, serviceArea });
}
