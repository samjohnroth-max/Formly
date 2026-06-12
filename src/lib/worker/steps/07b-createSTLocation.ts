import { db } from "@/lib/db";
import { findCustomerLocation, createSTLocation } from "@/lib/servicetitan/locations";
import type { ProcessingContext } from "../types";

const UNCONFIRMED_NAME = "Service Address TBD — verify with customer";
const UNKNOWN_NAME = "Address Unknown — confirm with customer";

/**
 * Creates (or finds) a ServiceTitan location for the lead and sets
 * ctx.stLocationId and ctx.addressComplete.
 *
 * Three scenarios:
 *   1. Full street address captured → create with complete address (addressComplete = true)
 *   2. Zip-only (± geocoded city/state) → create with zip/city/state, TBD name (addressComplete = false)
 *   3. No address at all → create with whatever geographic data exists (addressComplete = false)
 *
 * For matched existing customers, we reuse their first active location rather than
 * creating a duplicate — unless they have none, in which case we create one.
 */
export async function createSTLocation_step(ctx: ProcessingContext): Promise<void> {
  const { campaign, stCustomerId, leadId } = ctx;
  if (!campaign || !stCustomerId || !leadId) return;

  const conn = campaign.stConnection;
  const hasStreet = Boolean(ctx.street?.trim());
  const hasZip = Boolean(ctx.zip?.trim());
  const hasCity = Boolean(ctx.city?.trim());

  // ── Existing customer: reuse their location if available ─────────────────────
  if (ctx.stMatchedCustomer) {
    const existingLocationId = await findCustomerLocation(conn, stCustomerId);
    if (existingLocationId) {
      ctx.stLocationId = existingLocationId;
      // Mark address complete if the lead provided a full street address,
      // even if we're reusing a saved location.
      ctx.addressComplete = hasStreet;
      await persistLocationFields(leadId, ctx.stLocationId, ctx.addressComplete);
      return;
    }
    // No saved location — fall through to create one
  }

  // ── Determine address data and location name ──────────────────────────────────
  let locationName: string;
  let addressComplete: boolean;

  if (hasStreet) {
    // Scenario 1: Full address
    const parts = [ctx.street, ctx.city, ctx.state, ctx.zip].filter(Boolean);
    locationName = parts.join(", ");
    addressComplete = true;
  } else if (hasZip || hasCity) {
    // Scenario 2: Partial geographic data
    locationName = UNCONFIRMED_NAME;
    addressComplete = false;
  } else {
    // Scenario 3: Nothing at all
    locationName = UNKNOWN_NAME;
    addressComplete = false;
  }

  const address = {
    street: ctx.street ?? "",
    city: ctx.city ?? "",
    state: ctx.state ?? "",
    zip: ctx.zip ?? "",
    country: "USA",
  };

  try {
    const locationId = await createSTLocation(conn, stCustomerId, address, locationName);
    ctx.stLocationId = locationId;
    ctx.addressComplete = addressComplete;
    await persistLocationFields(leadId, locationId, addressComplete);
  } catch (err) {
    // Location creation is best-effort — routing continues without it.
    // The booking will be created without a locationId (ST allows this).
    console.error(`[07b] Failed to create ST location for lead ${leadId}:`, err);
    ctx.addressComplete = addressComplete;
    await persistLocationFields(leadId, null, addressComplete);
  }
}

async function persistLocationFields(
  leadId: string,
  locationId: string | null,
  addressComplete: boolean
): Promise<void> {
  await db.lead
    .update({
      where: { id: leadId },
      data: {
        stLocationId: locationId,
        addressComplete,
      },
    })
    .catch(() => {});
}
