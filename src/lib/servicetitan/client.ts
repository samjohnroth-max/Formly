import { getSTAccessToken } from "./auth";
import { decrypt } from "@/lib/crypto";
import type { STConnectionShape } from "@/types/db";

export { ST_API_BASE } from "./index";

/** Makes an authenticated request to the ServiceTitan API */
export async function stFetch(
  connection: STConnectionShape,
  path: string,
  options: RequestInit = {}
): Promise<Response> {
  const accessToken = await getSTAccessToken(connection);
  const appKey = decrypt(connection.appKey);

  const headers = new Headers(options.headers);
  headers.set("Authorization", `Bearer ${accessToken}`);
  headers.set("ST-App-Key", appKey);
  headers.set("Content-Type", "application/json");

  const { ST_API_BASE } = await import("./index");
  return fetch(`${ST_API_BASE}${path}`, { ...options, headers });
}

/** Convenience wrapper that parses JSON and throws on error */
export async function stFetchJson<T = unknown>(
  connection: STConnectionShape,
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const res = await stFetch(connection, path, options);
  const data = await res.json();
  if (!res.ok) {
    throw new Error(
      data.message ?? data.title ?? `ServiceTitan API error ${res.status}: ${path}`
    );
  }
  return data as T;
}
