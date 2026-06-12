export const META_API_VERSION = "v21.0";
export const META_API_BASE = `https://graph.facebook.com/${META_API_VERSION}`;

export interface MetaLeadField {
  name: string;
  values: string[];
}

export interface MetaLeadData {
  id: string;
  created_time: string;
  field_data: MetaLeadField[];
  ad_id?: string;
  adgroup_id?: string;
  campaign_id?: string;
  form_id?: string;
  page_id?: string;
}

/** Fetches full lead field data from the Graph API */
export async function fetchLeadData(
  leadId: string,
  accessToken: string
): Promise<MetaLeadData> {
  const res = await fetch(
    `${META_API_BASE}/${leadId}?fields=id,created_time,field_data,ad_id,adgroup_id,campaign_id,form_id,page_id&access_token=${encodeURIComponent(accessToken)}`
  );
  const data = await res.json();
  if (!res.ok) throw new Error(data.error?.message ?? `Failed to fetch lead ${leadId}`);
  return data;
}

/** Converts Meta field_data array to a flat key→value map */
export function flattenLeadFields(fields: MetaLeadField[]): Record<string, string> {
  return Object.fromEntries(fields.map((f) => [f.name, f.values[0] ?? ""]));
}
