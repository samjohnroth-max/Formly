import { db } from "@/lib/db";
import type { ProcessingContext } from "../types";

/** Final step: mark lead as SUCCESS and clear any prior error message. */
export async function updateLeadStatus(ctx: ProcessingContext): Promise<void> {
  if (!ctx.leadId) return;

  await db.lead.update({
    where: { id: ctx.leadId },
    data: {
      routingStatus: "SUCCESS",
      routingError: null,
    },
  });
}
