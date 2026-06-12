import { stFetchJson } from "@/lib/servicetitan/client";
import { db } from "@/lib/db";
import type { ProcessingContext } from "../types";

interface STCreateCustomerResponse {
  id: number;
}

/**
 * Creates a new ServiceTitan customer if no existing match was found in step 6.
 * Skips if ctx.stCustomerId is already set (matched customer).
 */
export async function createSTCustomer(ctx: ProcessingContext): Promise<void> {
  const { campaign, leadId } = ctx;
  if (!campaign || !leadId) return;
  if (ctx.stCustomerId) return; // Already matched

  const conn = campaign.stConnection;
  const fullName = [ctx.firstName, ctx.lastName].filter(Boolean).join(" ") || "Unknown";

  const payload: Record<string, unknown> = {
    name: fullName,
    type: "Residential",
    doNotMail: false,
    doNotService: false,
  };

  if (ctx.phone) {
    payload.phone = [{ value: ctx.phone, type: "Main" }];
  }
  if (ctx.email) {
    payload.email = [{ address: ctx.email, type: "Main" }];
  }
  if (ctx.street || ctx.zip || ctx.city || ctx.state) {
    payload.address = {
      street: ctx.street ?? "",
      city: ctx.city ?? "",
      state: ctx.state ?? "",
      zip: ctx.zip ?? "",
      country: "USA",
    };
  }

  // Tag the lead source for reporting in ST
  payload.customFields = [];
  payload.leadSource = "Meta Instant Form";

  const customer = await stFetchJson<STCreateCustomerResponse>(
    conn,
    `/crm/v2/tenant/${conn.tenantId}/customers`,
    { method: "POST", body: JSON.stringify(payload) }
  );

  ctx.stCustomerId = String(customer.id);
  ctx.stMatchedCustomer = false;

  await db.lead.update({
    where: { id: leadId },
    data: { stCustomerId: ctx.stCustomerId },
  });
}
