import { db } from "@/lib/db";
import { sendLeadFailureAlert } from "./alerts";
import { deduplicateLead } from "./steps/01-deduplicateLead";
import { fetchLeadData } from "./steps/02-fetchLeadData";
import { identifyCampaign } from "./steps/03-identifyCampaign";
import { parseFields } from "./steps/04-parseFields";
import { geocodeZip } from "./steps/05-geocodeZip";
import { lookupSTCustomer } from "./steps/06-lookupSTCustomer";
import { createSTCustomer } from "./steps/07-createSTCustomer";
import { createSTLocation_step } from "./steps/07b-createSTLocation";
import { createSTRecord } from "./steps/08-createSTRecord";
import { sendEmail } from "./steps/09-sendEmail";
import { fireCAPILead } from "./steps/10-fireCAPILead";
import { updateLeadStatus } from "./steps/11-updateLeadStatus";
import type { ProcessingContext } from "./types";
import type { LeadJob } from "@/lib/queue";

/**
 * Orchestrates the 11-step lead processing pipeline.
 * Steps 9 (sendEmail) and 10 (fireCAPILead) are non-blocking and never
 * throw — routing succeeds regardless of email/CAPI failures.
 */
export async function processLeadJob(job: { data: LeadJob; attemptsMade: number }): Promise<void> {
  const ctx: ProcessingContext = {
    metaLeadId: job.data.metaLeadId,
    metaFormId: job.data.metaFormId,
    metaPageId: job.data.metaPageId,
    metaAdId: job.data.metaAdId,
    metaAdSetId: job.data.metaAdSetId,
    metaCampaignId: job.data.metaCampaignId,
  };

  // ── Step 1 ──────────────────────────────────────────────────────────────────
  const dedupResult = await deduplicateLead(ctx);
  if (dedupResult === "skip") return;

  try {
    // ── Step 2 ────────────────────────────────────────────────────────────────
    await fetchLeadData(ctx);

    // ── Step 3 ────────────────────────────────────────────────────────────────
    await identifyCampaign(ctx);

    // ── Step 4 ────────────────────────────────────────────────────────────────
    await parseFields(ctx);

    // ── Step 5 (non-blocking) ─────────────────────────────────────────────────
    await geocodeZip(ctx);

    // ── Step 6 ────────────────────────────────────────────────────────────────
    await lookupSTCustomer(ctx);

    // ── Step 7 ────────────────────────────────────────────────────────────────
    await createSTCustomer(ctx);

    // ── Step 7b ───────────────────────────────────────────────────────────────
    await createSTLocation_step(ctx);

    // ── Step 8 ────────────────────────────────────────────────────────────────
    await createSTRecord(ctx);

    // ── Steps 9 & 10 (non-blocking, run in parallel) ──────────────────────────
    await Promise.allSettled([sendEmail(ctx), fireCAPILead(ctx)]);

    // ── Step 11 ───────────────────────────────────────────────────────────────
    await updateLeadStatus(ctx);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";

    // Mark the lead as failed/retry in the DB
    if (ctx.leadId) {
      await db.lead
        .update({
          where: { id: ctx.leadId },
          data: {
            routingStatus: "RETRY",
            routingError: message,
          },
        })
        .catch(() => {}); // Don't mask the original error
    }

    // Re-throw so BullMQ can apply retry backoff
    throw err;
  }
}

/**
 * Called by the worker after all retries are exhausted.
 * Updates the lead to FAILED and emails the account owner.
 */
export async function handleDeadLetter(
  metaLeadId: string,
  leadId: string | undefined,
  error: string
): Promise<void> {
  // If in-memory map was lost (worker restart during active job), fall back to DB lookup.
  const resolvedLeadId =
    leadId ??
    (await db.lead.findUnique({ where: { metaLeadId }, select: { id: true } }).catch(() => null))
      ?.id;

  if (resolvedLeadId) {
    await db.lead
      .update({
        where: { id: resolvedLeadId },
        data: { routingStatus: "FAILED", routingError: error },
      })
      .catch(() => {});

    const lead = await db.lead
      .findUnique({
        where: { id: resolvedLeadId },
        include: { account: { select: { email: true } } },
      })
      .catch(() => null);

    if (lead?.account?.email) {
      await sendLeadFailureAlert(lead.account.email, metaLeadId, error);
    }
  }
}
