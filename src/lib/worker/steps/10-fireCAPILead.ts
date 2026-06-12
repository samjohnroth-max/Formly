import { decrypt } from "@/lib/crypto";
import { fireCAPIEvent } from "@/lib/meta/capi";
import { db } from "@/lib/db";
import { haversineDistance } from "@/lib/geo";
import type { ProcessingContext } from "../types";

/**
 * Fires a "Lead" event to Meta Conversions API with hashed user data.
 * Includes in_service_area custom parameter when service area is configured.
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

  // Compute in-service-area flag if we have coordinates
  let inServiceArea: boolean | null = null;
  if (ctx.lat != null && ctx.lng != null) {
    const serviceArea = await db.serviceArea.findUnique({
      where: { accountId: campaign.accountId },
    });
    if (serviceArea) {
      const dist = haversineDistance(serviceArea.lat, serviceArea.lng, ctx.lat, ctx.lng);
      inServiceArea = dist <= serviceArea.radiusMiles;
    }
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
    customData: { inServiceArea },
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
