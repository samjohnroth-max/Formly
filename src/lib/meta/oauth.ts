import { META_API_BASE } from "./index";

const META_OAUTH_URL = "https://www.facebook.com/dialog/oauth";
const META_TOKEN_URL = "https://graph.facebook.com/oauth/access_token";

export const META_SCOPES = [
  "ads_read",
  "leads_retrieval",
  "pages_read_engagement",
  "pages_manage_ads",
];

export function buildMetaAuthUrl(state: string): string {
  const params = new URLSearchParams({
    client_id: process.env.META_APP_ID!,
    redirect_uri: process.env.META_REDIRECT_URI!,
    scope: META_SCOPES.join(","),
    response_type: "code",
    state,
  });
  return `${META_OAUTH_URL}?${params}`;
}

interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in?: number;
}

export async function exchangeCodeForToken(code: string): Promise<TokenResponse> {
  const params = new URLSearchParams({
    client_id: process.env.META_APP_ID!,
    client_secret: process.env.META_APP_SECRET!,
    redirect_uri: process.env.META_REDIRECT_URI!,
    code,
  });
  const res = await fetch(`${META_TOKEN_URL}?${params}`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error?.message ?? "Failed to exchange Meta code");
  return data;
}

export async function getLongLivedToken(shortLivedToken: string): Promise<TokenResponse> {
  const params = new URLSearchParams({
    grant_type: "fb_exchange_token",
    client_id: process.env.META_APP_ID!,
    client_secret: process.env.META_APP_SECRET!,
    fb_exchange_token: shortLivedToken,
  });
  const res = await fetch(`${META_TOKEN_URL}?${params}`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error?.message ?? "Failed to get long-lived Meta token");
  return data;
}

export interface MetaMe {
  id: string;
  name: string;
}

export async function getMetaMe(accessToken: string): Promise<MetaMe> {
  const res = await fetch(
    `${META_API_BASE}/me?fields=id,name&access_token=${encodeURIComponent(accessToken)}`
  );
  const data = await res.json();
  if (!res.ok) throw new Error(data.error?.message ?? "Failed to fetch Meta user");
  return data;
}

export interface AdAccount {
  id: string;
  name: string;
}

export async function getAdAccounts(accessToken: string): Promise<AdAccount[]> {
  const res = await fetch(
    `${META_API_BASE}/me/adaccounts?fields=id,name&access_token=${encodeURIComponent(accessToken)}`
  );
  const data = await res.json();
  if (!res.ok) throw new Error(data.error?.message ?? "Failed to fetch ad accounts");
  return data.data ?? [];
}
