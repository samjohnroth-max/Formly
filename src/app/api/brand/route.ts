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
};

async function getAccountId() {
  const session = await getRequiredSession();
  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { accountId: true },
  });
  return user?.accountId ?? null;
}

export async function GET() {
  const accountId = await getAccountId();
  if (!accountId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const brand = await db.brandSettings.findUnique({ where: { accountId } });
  return NextResponse.json(brand ?? { ...DEFAULTS, id: null, accountId });
}

export async function PATCH(req: Request) {
  const accountId = await getAccountId();
  if (!accountId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const allowed = ["companyName", "primaryColor", "secondaryColor", "logoUrl", "fontFamily", "buttonStyle", "footerText"];
  const data = Object.fromEntries(
    Object.entries(body).filter(([k]) => allowed.includes(k))
  ) as Record<string, string>;

  const brand = await db.brandSettings.upsert({
    where: { accountId },
    update: { ...data, updatedAt: new Date() },
    create: { accountId, ...DEFAULTS, ...data },
  });

  return NextResponse.json(brand);
}
