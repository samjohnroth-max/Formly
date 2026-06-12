import { decrypt } from "@/lib/crypto";
import { fireCAPIEvent } from "@/lib/meta/capi";
import { db } from "@/lib/db";
import type { ProcessingContext } from "../types";

/**
 * Fires a "Lead" event to Meta Conversions API with hashed user data.
 * Non-blocking: failure updates capiStatus=FAILED but does not throw.
 * Skips if campaign.capiEnabled=false or MetaConnection has no pixelId.
 */
export async function fireCAPILead(ctx: ProcessingContext): Promise<void> {
  const { campaign, leadId } = ctx;
  if (!campaign || !leadId) return;

  if (!campaign.capiEnabled) {
    await db.lead.update({ where: { id: leadId }, data: { capiStatus: "SKIPPED" } });
    return;
  }
  if (!campaign.metaConnection.pixelId) {
    await db.lead.update({ where: { id: leadId }, data: { capiStatus: "SKIPPED" } });
    return;
  }

  const eventTime = Math.floor(
    ctx.metaCreatedTime
      ? new Date(ctx.metaCreatedTime).getTime() / 1000
      : Date.now() / 1000
  );
  const eventId = `formly_lead_${ctx.metaLeadId}`;

  const result = await fireCAPIEvent({
    leadId,
    eventName: "Lead",
    eventId,
    eventTime,
    pixelId: campaign.metaConnection.pixelId,
    accessToken: decrypt(campaign.metaConnection.accessToken),
    userData: {
      email: ctx.email,
      phone: ctx.phone,
      firstName: ctx.firstName,
      lastName: ctx.lastName,
      zip: ctx.zip,
      city: ctx.city,
      state: ctx.state,
      metaLeadId: ctx.metaLeadId,
    },
    metaAdId: ctx.metaAdId,
    metaAdSetId: ctx.metaAdSetId,
  });

  await db.lead.update({
    where: { id: leadId },
    data: {
      capiStatus: result.success ? "SENT" : "FAILED",
      capiEventId: result.success ? eventId : null,
    },
  });
}
