import { stFetchJson } from "@/lib/servicetitan/client";
import { resolveOrCreateSTCampaign } from "@/lib/servicetitan/campaigns";
import { db } from "@/lib/db";
import type { ProcessingContext } from "../types";

interface STCreatedRecord {
  id: number;
}

async function createBooking(
  ctx: ProcessingContext,
  stCampaignId: number | null
): Promise<string> {
  const { campaign } = ctx;
  if (!campaign) throw new Error("No campaign in context");
  const conn = campaign.stConnection;

  // Build job summary — prepend address warning when street is missing
  let summary = ctx.serviceInterest ?? "Web Lead";
  if (ctx.addressComplete === false) {
    summary = `⚠️ Address not confirmed — please verify with customer before dispatching.\n\n${summary}`;
  }

  // Append full form Q&A block so dispatchers can see every answer
  if (ctx.formData && Object.keys(ctx.formData).length > 0) {
    const formBlock = Object.entries(ctx.formData)
      .map(([k, v]) => `${k.replace(/_/g, " ")}: ${v}`)
      .join("\n");
    summary = `${summary}\n\n--- Form Responses ---\n${formBlock}`;
  }

  const payload: Record<string, unknown> = {
    customerId: Number(ctx.stCustomerId),
    summary,
    jobGeneratedLeadSource: "Advertising",
  };

  if (ctx.stLocationId) payload.locationId = Number(ctx.stLocationId);
  if (stCampaignId) payload.campaignId = stCampaignId;
  if (campaign.jobType) payload.jobTypeId = Number(campaign.jobType);
  if (campaign.businessUnit) payload.businessUnitId = Number(campaign.businessUnit);
  if (campaign.priority) payload.priority = campaign.priority;
  if (campaign.assignedTo) payload.tagTypeIds = [];

  const job = await stFetchJson<STCreatedRecord>(
    conn,
    `/jpm/v2/tenant/${conn.tenantId}/jobs`,
    { method: "POST", body: JSON.stringify(payload) }
  );

  return String(job.id);
}

async function createLead(
  ctx: ProcessingContext,
  stCampaignId: number | null
): Promise<string> {
  const { campaign } = ctx;
  if (!campaign) throw new Error("No campaign in context");
  const conn = campaign.stConnection;

  let note = ctx.serviceInterest ?? "Lead from Meta Instant Form";
  if (ctx.formData && Object.keys(ctx.formData).length > 0) {
    const formBlock = Object.entries(ctx.formData)
      .map(([k, v]) => `${k.replace(/_/g, " ")}: ${v}`)
      .join("\n");
    note = `${note}\n\n--- Form Responses ---\n${formBlock}`;
  }

  const payload: Record<string, unknown> = {
    customerId: Number(ctx.stCustomerId),
    note,
    status: { name: "New" },
  };

  if (stCampaignId) payload.campaignId = stCampaignId;
  if (campaign.assignedTo) payload.ownerId = Number(campaign.assignedTo);

  const lead = await stFetchJson<STCreatedRecord>(
    conn,
    `/crm/v2/tenant/${conn.tenantId}/leads`,
    { method: "POST", body: JSON.stringify(payload) }
  );

  return String(lead.id);
}

async function createFollowup(
  ctx: ProcessingContext,
  stCampaignId: number | null
): Promise<{ taskId?: string; leadId?: string }> {
  const { campaign } = ctx;
  if (!campaign) throw new Error("No campaign in context");
  const conn = campaign.stConnection;

  // If we matched an existing customer, add a note to them
  if (ctx.stMatchedCustomer && ctx.stCustomerId) {
    const followupDate = new Date();
    followupDate.setDate(followupDate.getDate() + campaign.followupDays);

    let noteText = `Follow-up from Meta Instant Form. Requested service: ${ctx.serviceInterest ?? "N/A"}. Follow up by: ${followupDate.toLocaleDateString()}.`;
    if (ctx.formData && Object.keys(ctx.formData).length > 0) {
      const formBlock = Object.entries(ctx.formData)
        .map(([k, v]) => `${k.replace(/_/g, " ")}: ${v}`)
        .join("\n");
      noteText = `${noteText}\n\n--- Form Responses ---\n${formBlock}`;
    }

    const payload: Record<string, unknown> = {
      text: noteText,
      isPinned: true,
    };
    if (stCampaignId) payload.campaignId = stCampaignId;

    const note = await stFetchJson<STCreatedRecord>(
      conn,
      `/crm/v2/tenant/${conn.tenantId}/customers/${ctx.stCustomerId}/notes`,
      { method: "POST", body: JSON.stringify(payload) }
    ).catch(() => null);

    return { taskId: note ? String(note.id) : undefined };
  }

  // No customer match — fall back to creating a lead record
  const leadId = await createLead(ctx, stCampaignId);
  return { leadId };
}

/**
 * Resolves (or creates) the ST campaign matching the campaign tag, then creates
 * the appropriate record in ServiceTitan with full campaign attribution.
 *
 * Campaign name priority: campaignTag > metaCampaignName > Formly campaign name
 */
export async function createSTRecord(ctx: ProcessingContext): Promise<void> {
  const { campaign, leadId } = ctx;
  if (!campaign || !leadId) return;

  // Resolve ST campaign for attribution tagging
  const stCampaignName =
    campaign.campaignTag ?? ctx.metaCampaignName ?? undefined;

  let stCampaignId: number | null = null;
  if (stCampaignName) {
    stCampaignId = await resolveOrCreateSTCampaign(
      campaign.stConnection,
      stCampaignName
    );
    if (stCampaignId) ctx.stCampaignId = String(stCampaignId);
  }

  const update: Partial<{
    stJobId: string;
    stLeadId: string;
    stTaskId: string;
  }> = {};

  switch (campaign.destinationType) {
    case "BOOKING": {
      const jobId = await createBooking(ctx, stCampaignId);
      ctx.stJobId = jobId;
      update.stJobId = jobId;
      break;
    }
    case "LEAD": {
      const stLeadId = await createLead(ctx, stCampaignId);
      ctx.stLeadId = stLeadId;
      update.stLeadId = stLeadId;
      break;
    }
    case "FOLLOWUP": {
      const { taskId, leadId: stLeadIdFallback } = await createFollowup(
        ctx,
        stCampaignId
      );
      if (taskId) {
        ctx.stTaskId = taskId;
        update.stTaskId = taskId;
      }
      if (stLeadIdFallback) {
        ctx.stLeadId = stLeadIdFallback;
        update.stLeadId = stLeadIdFallback;
      }
      break;
    }
  }

  await db.lead.update({ where: { id: leadId }, data: update });
}
