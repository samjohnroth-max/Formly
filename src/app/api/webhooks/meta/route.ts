import { NextRequest, NextResponse } from "next/server";
import { verifyHmacSha256 } from "@/lib/crypto";
import { leadQueue, type LeadJob } from "@/lib/queue";
import { db } from "@/lib/db";

// Meta sends a GET to verify the webhook subscription
export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  if (mode === "subscribe" && token === process.env.META_WEBHOOK_VERIFY_TOKEN) {
    return new NextResponse(challenge, { status: 200 });
  }

  return new NextResponse("Forbidden", { status: 403 });
}

interface LeadgenChange {
  field: "leadgen";
  value: {
    leadgen_id: string;
    form_id: string;
    page_id: string;
    ad_id?: string;
    adgroup_id?: string;
    campaign_id?: string;
    created_time: number;
  };
}

interface WebhookEntry {
  id: string;
  time: number;
  changes: LeadgenChange[];
}

interface WebhookPayload {
  object: string;
  entry: WebhookEntry[];
}

export async function POST(req: NextRequest) {
  // Must read raw body before any parsing to verify HMAC
  const rawBody = await req.text();

  const signature = req.headers.get("x-hub-signature-256");
  if (!verifyHmacSha256(rawBody, signature, process.env.META_APP_SECRET!)) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  // Return 200 immediately — Meta will retry if we take too long
  const response = new NextResponse("OK", { status: 200 });

  // Process asynchronously (fire-and-forget; errors logged, not surfaced)
  processWebhook(rawBody).catch((err) =>
    console.error("[meta-webhook] processing error:", err)
  );

  return response;
}

async function processWebhook(rawBody: string): Promise<void> {
  const payload: WebhookPayload = JSON.parse(rawBody);

  if (payload.object !== "page") return;

  const jobs: Array<{ name: string; data: LeadJob }> = [];

  for (const entry of payload.entry) {
    for (const change of entry.changes) {
      if (change.field !== "leadgen") continue;

      const { leadgen_id, form_id, page_id, ad_id, adgroup_id, campaign_id } = change.value;

      // Deduplication: skip if we already have this lead in the DB
      const existing = await db.lead.findUnique({
        where: { metaLeadId: leadgen_id },
        select: { id: true },
      });
      if (existing) continue;

      jobs.push({
        name: "process-lead",
        data: {
          metaLeadId: leadgen_id,
          metaFormId: form_id,
          metaPageId: page_id,
          metaAdId: ad_id,
          metaAdSetId: adgroup_id,
          metaCampaignId: campaign_id,
          webhookReceivedAt: new Date().toISOString(),
        },
      });
    }
  }

  if (jobs.length > 0) {
    await leadQueue.addBulk(jobs);
  }
}
