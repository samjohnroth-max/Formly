import { NextResponse } from "next/server";
import { runConnectionHealthChecks } from "@/lib/connections/healthCheck";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  const auth = req.headers.get("authorization");

  if (!secret) {
    // CRON_SECRET must always be set — refuse requests when unconfigured rather than
    // leaving the endpoint open. Set CRON_SECRET in your Railway environment variables.
    return NextResponse.json(
      { error: "CRON_SECRET is not configured on this server" },
      { status: 503 }
    );
  }

  if (auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await runConnectionHealthChecks();
    return NextResponse.json({ ok: true, ...result, checkedAt: new Date().toISOString() });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
