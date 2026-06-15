import { createHmac } from "crypto";

function secret() {
  return process.env.AUTH_SECRET ?? "dev-tracking-secret";
}

function b64url(buf: Buffer): string {
  return buf.toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}

export interface TrackingPayload {
  leadId: string;
  templateId: string;
  accountId: string;
}

export function signTrackingToken(payload: TrackingPayload): string {
  const data = b64url(Buffer.from(JSON.stringify(payload)));
  const sig = b64url(createHmac("sha256", secret()).update(data).digest());
  return `${data}.${sig}`;
}

export function verifyTrackingToken(token: string): TrackingPayload | null {
  try {
    const dot = token.lastIndexOf(".");
    if (dot === -1) return null;
    const data = token.slice(0, dot);
    const sig = token.slice(dot + 1);
    const expected = b64url(createHmac("sha256", secret()).update(data).digest());
    if (sig !== expected) return null;
    return JSON.parse(Buffer.from(data, "base64url").toString("utf-8")) as TrackingPayload;
  } catch {
    return null;
  }
}
