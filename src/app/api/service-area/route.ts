import { NextResponse } from "next/server";
import { getRequiredSession } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { geocodeAddress } from "@/lib/geocode";

async function getAccountId(userId: string) {
  const user = await db.user.findUnique({ where: { id: userId }, select: { accountId: true } });
  return user?.accountId ?? null;
}

export async function GET() {
  const session = await getRequiredSession();
  const accountId = await getAccountId(session.user.id);
  if (!accountId) return NextResponse.json({ serviceArea: null });

  const serviceArea = await db.serviceArea.findUnique({ where: { accountId } });
  return NextResponse.json({ serviceArea });
}

export async function PUT(req: Request) {
  const session = await getRequiredSession();
  const accountId = await getAccountId(session.user.id);
  if (!accountId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { address, radiusMiles } = await req.json() as { address: string; radiusMiles: number };

  if (!address?.trim()) {
    return NextResponse.json({ error: "Address is required" }, { status: 400 });
  }

  const geo = await geocodeAddress(address.trim());
  if (!geo) {
    return NextResponse.json({ error: "Could not geocode that address. Try a more specific address." }, { status: 422 });
  }

  const serviceArea = await db.serviceArea.upsert({
    where: { accountId },
    update: { address: address.trim(), lat: geo.lat, lng: geo.lng, radiusMiles },
    create: { accountId, address: address.trim(), lat: geo.lat, lng: geo.lng, radiusMiles },
  });

  return NextResponse.json({ serviceArea });
}
