import { db } from "@/lib/db";
import { decrypt, encrypt } from "@/lib/crypto";
import type { STConnectionShape } from "@/types/db";

const ST_AUTH_URL = "https://auth.servicetitan.io/connect/token";
const TOKEN_REFRESH_THRESHOLD_S = 300; // refresh if fewer than 5 min remain

interface STTokenResponse {
  access_token: string;
  expires_in: number;
  token_type: string;
}

async function fetchNewToken(connection: STConnectionShape): Promise<STTokenResponse> {
  const clientId = decrypt(connection.clientId);
  const clientSecret = decrypt(connection.clientSecret);

  const body = new URLSearchParams({
    grant_type: "client_credentials",
    client_id: clientId,
    client_secret: clientSecret,
  });

  const res = await fetch(ST_AUTH_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error_description ?? data.error ?? "ServiceTitan auth failed");
  }
  return data;
}

/**
 * Returns a valid access token for the given STConnection.
 * Fetches a new one if missing or within TOKEN_REFRESH_THRESHOLD_S of expiry.
 * Persists the refreshed token back to the database.
 */
export async function getSTAccessToken(connection: STConnectionShape): Promise<string> {
  const now = new Date();

  if (connection.accessToken && connection.tokenExpiresAt) {
    const secsRemaining = (connection.tokenExpiresAt.getTime() - now.getTime()) / 1000;
    if (secsRemaining > TOKEN_REFRESH_THRESHOLD_S) {
      return decrypt(connection.accessToken);
    }
  }

  const token = await fetchNewToken(connection);
  const expiresAt = new Date(now.getTime() + token.expires_in * 1000);

  await db.sTConnection.update({
    where: { id: connection.id },
    data: {
      accessToken: encrypt(token.access_token),
      tokenExpiresAt: expiresAt,
      status: "ACTIVE",
    },
  });

  return token.access_token;
}

/** Tests ST credentials by attempting to fetch a token. Returns true on success. */
export async function testSTCredentials(
  clientId: string,
  clientSecret: string
): Promise<boolean> {
  const body = new URLSearchParams({
    grant_type: "client_credentials",
    client_id: clientId,
    client_secret: clientSecret,
  });
  try {
    const res = await fetch(ST_AUTH_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
    });
    return res.ok;
  } catch {
    return false;
  }
}
