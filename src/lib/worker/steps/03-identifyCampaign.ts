import { UnrecoverableError } from "bullmq";
import { db } from "@/lib/db";
import { sendDLQAlert } from "../alerts";
import type { ProcessingContext } from "../types";

/**
 * Matches the Meta form ID to a Campaign record.
 * If no campaign is found, creates a failed Lead for traceability and alerts
 * the account owner. Throws so the job moves to DLQ without retrying.
 */
export async function identifyCampaign(ctx: ProcessingContext): Promise<void> {
  const campaign = await db.campaign.findFirst({
    where: { metaFormId: ctx.metaFormId, status: "ACTIVE" },
    include: {
      metaConnection: true,
      stConnection: true,
      fieldMappings: true,
      emailTemplate: { select: { id: true, subject: true, body: true } },
    },
  });

  if (!campaign) {
    // Find the account that owns a MetaConnection with a campaign for this form
    // (even inactive campaigns), so the alert goes to the right customer.
    const ownerAccount = await db.account.findFirst({
      where: {
        metaConnections: {
          some: { campaigns: { some: { metaFormId: ctx.metaFormId } } },
        },
      },
      select: { email: true },
    });

    if (ownerAccount) {
      await sendDLQAlert({
        to: ownerAccount.email,
        subject: "Formly: Unrouted Meta Lead",
        body: `A lead arrived for Meta form ID "${ctx.metaFormId}" but no active campaign is configured for that form. Lead ID: ${ctx.metaLeadId}.`,
      });
    }

    // UnrecoverableError tells BullMQ to move the job to failed immediately
    // without retrying — there is nothing to gain from retrying a missing campaign.
    throw new UnrecoverableError(
      `No active campaign found for Meta form ID: ${ctx.metaFormId}`
    );
  }

  ctx.campaign = {
    id: campaign.id,
    accountId: campaign.accountId,
    metaConnectionId: campaign.metaConnectionId,
    stConnectionId: campaign.stConnectionId,
    destinationType: campaign.destinationType as "BOOKING" | "LEAD" | "FOLLOWUP",
    jobType: campaign.jobType,
    businessUnit: campaign.businessUnit,
    priority: campaign.priority,
    assignedTo: campaign.assignedTo,
    followupDays: campaign.followupDays,
    capiEnabled: campaign.capiEnabled,
    campaignTag: campaign.campaignTag,
    emailTemplateId: campaign.emailTemplateId,
    metaConnection: {
      id: campaign.metaConnection.id,
      accountId: campaign.metaConnection.accountId,
      accessToken: campaign.metaConnection.accessToken,
      pixelId: campaign.metaConnection.pixelId,
      datasetId: campaign.metaConnection.datasetId,
    },
    stConnection: {
      id: campaign.stConnection.id,
      tenantId: campaign.stConnection.tenantId,
      clientId: campaign.stConnection.clientId,
      clientSecret: campaign.stConnection.clientSecret,
      appKey: campaign.stConnection.appKey,
      accessToken: campaign.stConnection.accessToken,
      tokenExpiresAt: campaign.stConnection.tokenExpiresAt,
    },
    fieldMappings: campaign.fieldMappings.map((fm: { metaField: string; stField: string; transform: string | null }) => ({
      metaField: fm.metaField,
      stField: fm.stField,
      transform: fm.transform,
    })),
    emailTemplate: campaign.emailTemplate,
  };

  // Create or update the Lead record now that we have accountId + campaignId
  const leadData = {
    accountId: campaign.accountId,
    campaignId: campaign.id,
    metaLeadId: ctx.metaLeadId,
    metaAdId: ctx.metaAdId ?? null,
    metaAdSetId: ctx.metaAdSetId ?? null,
    metaCampaignId: ctx.metaCampaignId ?? null,
    rawData: (ctx.rawData ?? {}) as object,
    routingStatus: "PROCESSING" as const,
    routingAttempts: { increment: 1 },
  };

  if (ctx.leadId) {
    await db.lead.update({ where: { id: ctx.leadId }, data: leadData });
  } else {
    const lead = await db.lead.create({
      data: {
        accountId: campaign.accountId,
        campaignId: campaign.id,
        metaLeadId: ctx.metaLeadId,
        metaAdId: ctx.metaAdId ?? null,
        metaAdSetId: ctx.metaAdSetId ?? null,
        metaCampaignId: ctx.metaCampaignId ?? null,
        rawData: (ctx.rawData ?? {}) as object,
        routingStatus: "PROCESSING",
        routingAttempts: 1,
      },
    });
    ctx.leadId = lead.id;
  }
}
