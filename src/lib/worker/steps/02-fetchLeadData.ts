import { META_API_BASE } from "@/lib/meta/index";
import { db } from "@/lib/db";
import { decrypt } from "@/lib/crypto";
import type { ProcessingContext } from "../types";

interface FieldData {
  name: string;
  values: string[];
}

interface MetaLeadResponse {
  id: string;
  created_time?: string;
  ad_id?: string;
  adgroup_id?: string;
  campaign_id?: string;
  form_id?: string;
  field_data?: FieldData[];
  error?: { message: string; code: number };
}

/**
 * Fetches full lead field_data from the Meta Graph API using the page access
 * token stored on the MetaConnection that owns this lead's form/page.
 */
export async function fetchLeadData(ctx: ProcessingContext): Promise<void> {
  // Find the MetaConnection that owns an active campaign for this form ID.
  // This scopes the token lookup to the correct account that configured the form.
  // Fallback: any active connection (used when the form has no campaign yet — step 3
  // will then throw and the lead will be DLQ'd without creating any records).
  const connection =
    (await db.metaConnection.findFirst({
      where: {
        status: "ACTIVE",
        campaigns: { some: { metaFormId: ctx.metaFormId, status: "ACTIVE" } },
      },
      orderBy: { createdAt: "desc" },
    })) ??
    (await db.metaConnection.findFirst({
      where: { status: "ACTIVE" },
      orderBy: { createdAt: "desc" },
    }));

  if (!connection) {
    throw new Error("No active Meta connection found to fetch lead data");
  }

  const accessToken = decrypt(connection.accessToken);
  const fields = "id,created_time,ad_id,adgroup_id,campaign_id,form_id,field_data";
  const url = `${META_API_BASE}/${ctx.metaLeadId}?fields=${fields}&access_token=${encodeURIComponent(accessToken)}`;

  const res = await fetch(url);
  const data: MetaLeadResponse = await res.json();

  if (!res.ok || data.error) {
    throw new Error(
      `Meta Graph API error fetching lead ${ctx.metaLeadId}: ${data.error?.message ?? res.statusText}`
    );
  }

  ctx.rawData = data as unknown as Record<string, unknown>;
  ctx.fieldData = data.field_data ?? [];
  ctx.metaCreatedTime = data.created_time;

  // Override job-level IDs with what Meta returns (more authoritative)
  if (data.ad_id) ctx.metaAdId = data.ad_id;
  if (data.adgroup_id) ctx.metaAdSetId = data.adgroup_id;
  if (data.campaign_id) ctx.metaCampaignId = data.campaign_id;

  // Fetch Meta campaign name for ST campaign tagging — non-blocking, best-effort
  if (data.campaign_id) {
    try {
      const campaignUrl = `${META_API_BASE}/${data.campaign_id}?fields=name&access_token=${encodeURIComponent(decrypt(connection.accessToken))}`;
      const campaignRes = await fetch(campaignUrl);
      if (campaignRes.ok) {
        const campaignData = (await campaignRes.json()) as { name?: string };
        if (campaignData.name) ctx.metaCampaignName = campaignData.name;
      }
    } catch {
      // Non-critical — routing continues without campaign name
    }
  }
}
