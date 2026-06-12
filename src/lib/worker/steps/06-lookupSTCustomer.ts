import { stFetchJson } from "@/lib/servicetitan/client";
import { db } from "@/lib/db";
import type { ProcessingContext } from "../types";

interface STCustomerPage {
  data: Array<{ id: number }>;
  totalCount: number;
}

/**
 * Searches ServiceTitan for an existing customer by phone, then email.
 * Sets ctx.stMatchedCustomer=true and ctx.stCustomerId if found.
 */
export async function lookupSTCustomer(ctx: ProcessingContext): Promise<void> {
  const { campaign, leadId } = ctx;
  if (!campaign || !leadId) return;

  const conn = campaign.stConnection;

  // Try phone first (more reliable identifier)
  if (ctx.phone) {
    const phone = ctx.phone.replace(/\D/g, "");
    try {
      const res = await stFetchJson<STCustomerPage>(
        conn,
        `/crm/v2/tenant/${conn.tenantId}/customers?phone=${encodeURIComponent(phone)}&pageSize=1&active=true`
      );
      if (res.data.length > 0) {
        ctx.stCustomerId = String(res.data[0].id);
        ctx.stMatchedCustomer = true;
      }
    } catch {
      // Continue to email fallback
    }
  }

  // Email fallback if no phone match
  if (!ctx.stCustomerId && ctx.email) {
    try {
      const res = await stFetchJson<STCustomerPage>(
        conn,
        `/crm/v2/tenant/${conn.tenantId}/customers?email=${encodeURIComponent(ctx.email)}&pageSize=1&active=true`
      );
      if (res.data.length > 0) {
        ctx.stCustomerId = String(res.data[0].id);
        ctx.stMatchedCustomer = true;
      }
    } catch {
      // No match found
    }
  }

  ctx.stMatchedCustomer = ctx.stMatchedCustomer ?? false;

  await db.lead.update({
    where: { id: leadId },
    data: {
      stCustomerId: ctx.stCustomerId ?? null,
      stMatchedCustomer: ctx.stMatchedCustomer,
    },
  });
}
