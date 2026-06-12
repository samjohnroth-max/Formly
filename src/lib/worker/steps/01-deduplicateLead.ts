import { db } from "@/lib/db";
import type { ProcessingContext } from "../types";

/**
 * Returns "skip" if a successfully-processed lead already exists for this
 * metaLeadId. Allows retries through for failed/pending leads.
 */
export async function deduplicateLead(
  ctx: ProcessingContext
): Promise<"skip" | "continue"> {
  const existing = await db.lead.findUnique({
    where: { metaLeadId: ctx.metaLeadId },
    select: { id: true, routingStatus: true },
  });

  if (!existing) return "continue";
  if (existing.routingStatus === "SUCCESS") return "skip";

  // Rehydrate the lead ID so later steps can update the existing record
  ctx.leadId = existing.id;
  return "continue";
}
