import { NextResponse } from "next/server";
import { getRequiredSession } from "@/lib/auth/session";
import { db } from "@/lib/db";

const DEFAULTS = {
  companyName: "",
  primaryColor: "#2563eb",
  secondaryColor: "#f3f4f6",
  logoUrl: "",
  fontFamily: "Inter",
  buttonStyle: "rounded",
  footerText: "",
  replyToEmail: null as string | null,
};

async function getAccountId() {
  const session = await getRequiredSession();
  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { accountId: true },
  });
  return user?.accountId ?? null;
}

// GET /api/brand?clientId=<id>   — returns brand settings for the given client (or account default if no clientId)
export async function GET(req: Request) {
  const accountId = await getAccountId();
  if (!accountId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const rawClientId = searchParams.get("clientId");
  const clientId = rawClientId === "default" || !rawClientId ? null : rawClientId;

  let brand = await db.brandSettings.findFirst({ where: { accountId, clientId } });

  // Fall back to account default if client-specific record doesn't exist
  if (!brand && clientId !== null) {
    brand = await db.brandSettings.findFirst({ where: { accountId, clientId: null } });
  }

  return NextResponse.json(brand ?? { ...DEFAULTS, id: null, accountId, clientId });
}

// PATCH /api/brand   — upserts brand settings for the given accountId + clientId
export async function PATCH(req: Request) {
  const accountId = await getAccountId();
  if (!accountId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const allowed = [
    "companyName", "primaryColor", "secondaryColor", "logoUrl",
    "fontFamily", "buttonStyle", "footerText", "replyToEmail",
  ];
  const data = Object.fromEntries(
    Object.entries(body).filter(([k]) => allowed.includes(k))
  ) as Record<string, string>;

  const rawClientId = body.clientId;
  const clientId = rawClientId === "default" || !rawClientId ? null : (rawClientId as string);

  const existing = await db.brandSettings.findFirst({ where: { accountId, clientId } });

  let brand;
  if (existing) {
    brand = await db.brandSettings.update({
      where: { id: existing.id },
      data: { ...data, updatedAt: new Date() },
    });
  } else {
    brand = await db.brandSettings.create({
      data: { accountId, clientId, ...DEFAULTS, ...data },
    });
  }

  return NextResponse.json(brand);
}
