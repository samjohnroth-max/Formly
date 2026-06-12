import { stFetchJson } from "./client";
import type { STConnectionShape } from "@/types/db";

interface STCampaign {
  id: number;
  name: string;
  active: boolean;
}

interface STPagedResponse<T> {
  data: T[];
  page: number;
  pageSize: number;
  hasMore: boolean;
  totalCount: number;
}

/**
 * Resolves an ST campaign ID by name, creating it if none matches.
 * Returns null on any error so routing can continue without tagging.
 */
export async function resolveOrCreateSTCampaign(
  connection: STConnectionShape,
  campaignName: string
): Promise<number | null> {
  try {
    const encoded = encodeURIComponent(campaignName);
    const search = await stFetchJson<STPagedResponse<STCampaign>>(
      connection,
      `/crm/v2/tenant/${connection.tenantId}/campaigns?name=${encoded}&pageSize=5`
    );

    const match = search.data.find(
      (c) => c.name.toLowerCase() === campaignName.toLowerCase()
    );
    if (match) return match.id;

    // Create the campaign
    const created = await stFetchJson<STCampaign>(
      connection,
      `/crm/v2/tenant/${connection.tenantId}/campaigns`,
      {
        method: "POST",
        body: JSON.stringify({ name: campaignName, isActive: true }),
      }
    );
    return created.id;
  } catch {
    return null;
  }
}
