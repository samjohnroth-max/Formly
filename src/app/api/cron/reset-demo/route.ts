import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { generateDemoLeads } from "@/lib/demo/generateLeads";

export const runtime = "nodejs";
export const maxDuration = 60;

const DEMO_EMAIL = "demo@formly.io";

export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  const auth = req.headers.get("authorization");

  if (!secret) {
    return NextResponse.json({ error: "CRON_SECRET is not configured" }, { status: 503 });
  }
  if (auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Look up demo account
    const account = await db.account.findUnique({ where: { email: DEMO_EMAIL } });
    if (!account) {
      return NextResponse.json({ ok: false, error: "Demo account not found — run the seed first" }, { status: 404 });
    }

    // Find demo campaigns
    const campaigns = await db.campaign.findMany({
      where: { accountId: account.id },
      select: { id: true, name: true },
    });

    const hvac     = campaigns.find((c) => c.name === "HVAC Summer Deals");
    const plumbing = campaigns.find((c) => c.name === "Plumbing Emergency");
    const roofing  = campaigns.find((c) => c.name === "Roofing Estimate");

    if (!hvac || !plumbing || !roofing) {
      return NextResponse.json({ ok: false, error: "Demo campaigns not found — run the seed first" }, { status: 404 });
    }

    await generateDemoLeads(db, account.id, hvac.id, plumbing.id, roofing.id);

    return NextResponse.json({
      ok: true,
      message: "Demo leads reset successfully",
      leadsGenerated: 47,
      resetAt: new Date().toISOString(),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
