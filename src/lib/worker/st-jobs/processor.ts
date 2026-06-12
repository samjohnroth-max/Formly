import { db } from "@/lib/db";
import { decrypt } from "@/lib/crypto";
import { fireCAPIEvent } from "@/lib/meta/capi";
import { fetchSTJob, fetchJobInvoices } from "@/lib/servicetitan/jobs";
import type { Job } from "bullmq";

const POLL_CUTOFF_DAYS = 90;

interface LeadForPolling {
  id: string;
  metaLeadId: string;
  metaAdId: string | null;
  metaAdSetId: string | null;
  stJobId: string;
  capiBookingEventId: string | null;
  capiInvoiceEventId: string | null;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  phone: string | null;
  zip: string | null;
  city: string | null;
  state: string | null;
  createdAt: Date;
  campaign: {
    metaConnection: {
      pixelId: string | null;
      accessToken: string;
    };
    stConnection: {
      id: string;
      tenantId: string;
      clientId: string;
      clientSecret: string;
      appKey: string;
      accessToken: string | null;
      tokenExpiresAt: Date | null;
    };
  } | null;
}

// ─── Main processor ───────────────────────────────────────────────────────────

export async function processPollJob(_job: Job): Promise<void> {
  const cutoff = new Date(Date.now() - POLL_CUTOFF_DAYS * 24 * 60 * 60 * 1000);

  // Find all BOOKING leads that still need revenue CAPI events
  const leads = await db.lead.findMany({
    where: {
      stJobId: { not: null },
      routingStatus: "SUCCESS",
      createdAt: { gte: cutoff },
      OR: [
        { capiBookingEventId: null },
        { capiBookingEventId: { not: null }, capiInvoiceEventId: null },
      ],
    },
    select: {
      id: true,
      metaLeadId: true,
      metaAdId: true,
      metaAdSetId: true,
      stJobId: true,
      capiBookingEventId: true,
      capiInvoiceEventId: true,
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
      zip: true,
      city: true,
      state: true,
      createdAt: true,
      campaign: {
        select: {
          metaConnection: {
            select: { pixelId: true, accessToken: true },
          },
          stConnection: {
            select: {
              id: true,
              tenantId: true,
              clientId: true,
              clientSecret: true,
              appKey: true,
              accessToken: true,
              tokenExpiresAt: true,
            },
          },
        },
      },
    },
    take: 200,
  }) as unknown as LeadForPolling[];

  console.log(`[st-jobs] Polling ${leads.length} leads for job updates`);

  const results = await Promise.allSettled(
    leads.map((lead) => processLead(lead))
  );

  const failed = results.filter((r) => r.status === "rejected").length;
  if (failed > 0) {
    console.error(`[st-jobs] ${failed}/${leads.length} leads failed to process`);
  }
}

// ─── Per-lead processor ───────────────────────────────────────────────────────

async function processLead(lead: LeadForPolling): Promise<void> {
  const campaign = lead.campaign;
  if (!campaign?.metaConnection.pixelId || !lead.stJobId) return;

  const conn = {
    id: campaign.stConnection.id,
    tenantId: campaign.stConnection.tenantId,
    clientId: campaign.stConnection.clientId,
    clientSecret: campaign.stConnection.clientSecret,
    appKey: campaign.stConnection.appKey,
    accessToken: campaign.stConnection.accessToken,
    tokenExpiresAt: campaign.stConnection.tokenExpiresAt,
  };

  const pixelId = campaign.metaConnection.pixelId;
  const accessToken = decrypt(campaign.metaConnection.accessToken);

  const userData = {
    email: lead.email,
    phone: lead.phone,
    firstName: lead.firstName,
    lastName: lead.lastName,
    zip: lead.zip,
    city: lead.city,
    state: lead.state,
    metaLeadId: lead.metaLeadId,
  };

  const now = Math.floor(Date.now() / 1000);

  // ── Step A: Fire booking Purchase on job completion ──────────────────────
  if (!lead.capiBookingEventId) {
    const job = await fetchSTJob(conn, lead.stJobId);
    if (!job) return;

    if (job.status.name === "Completed") {
      const eventId = `formly_purchase_booking_${lead.metaLeadId}`;
      const result = await fireCAPIEvent({
        leadId: lead.id,
        eventName: "Purchase",
        eventId,
        eventTime: now,
        pixelId,
        accessToken,
        userData,
        customData: {
          value: job.total > 0 ? job.total : null,
          currency: "USD",
          contentCategory: job.jobType?.name ?? null,
        },
        metaAdId: lead.metaAdId,
        metaAdSetId: lead.metaAdSetId,
      });

      if (result.success) {
        await db.lead.update({
          where: { id: lead.id },
          data: {
            capiBookingEventId: eventId,
            bookingValue: job.total > 0 ? job.total : null,
          },
        });
        console.log(
          `[st-jobs] Fired booking Purchase for lead ${lead.id} (job ${lead.stJobId}, $${job.total})`
        );
      }
    }
    // Job not completed yet — skip invoice check too
    if (job.status.name !== "Completed") return;
  }

  // ── Step B: Fire invoice Purchase on finalized invoice ───────────────────
  if (!lead.capiInvoiceEventId) {
    const invoices = await fetchJobInvoices(conn, lead.stJobId);
    const finalized = invoices.find((inv) =>
      ["Posted", "Exported", "Paid"].includes(inv.status)
    );

    if (finalized && finalized.total > 0) {
      const eventId = `formly_purchase_invoice_${lead.metaLeadId}`;
      const result = await fireCAPIEvent({
        leadId: lead.id,
        eventName: "Purchase",
        eventId,
        eventTime: now,
        pixelId,
        accessToken,
        userData,
        customData: {
          value: finalized.total,
          currency: "USD",
        },
        metaAdId: lead.metaAdId,
        metaAdSetId: lead.metaAdSetId,
      });

      if (result.success) {
        await db.lead.update({
          where: { id: lead.id },
          data: {
            capiInvoiceEventId: eventId,
            invoiceValue: finalized.total,
          },
        });
        console.log(
          `[st-jobs] Fired invoice Purchase for lead ${lead.id} (invoice ${finalized.id}, $${finalized.total})`
        );
      }
    }
  }
}
