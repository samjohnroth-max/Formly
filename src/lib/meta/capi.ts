import { createHash } from "crypto";
import { db } from "@/lib/db";
import { META_API_BASE } from "./index";

// ─── Hashing helpers ──────────────────────────────────────────────────────────

function hash(value: string): string {
  return createHash("sha256").update(value.toLowerCase().trim()).digest("hex");
}

function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 10) return `1${digits}`;
  return digits;
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface CAPIUserData {
  email?: string | null;
  phone?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  zip?: string | null;
  city?: string | null;
  state?: string | null;
  /** Raw Meta Lead ID — stored as `lead_id` for direct ad attribution (not hashed) */
  metaLeadId: string;
}

export interface CAPICustomData {
  value?: number | null;
  currency?: string;
  /** Maps to Meta's content_category — use job type name */
  contentCategory?: string | null;
}

export interface FireCAPIParams {
  leadId: string;
  eventName: string;
  /** Globally unique event ID for Meta deduplication */
  eventId: string;
  eventTime: number;
  pixelId: string;
  accessToken: string;
  userData: CAPIUserData;
  customData?: CAPICustomData;
  /** Original Meta ad ID for ad-level attribution tracking */
  metaAdId?: string | null;
  metaAdSetId?: string | null;
}

interface MetaCAPIResponse {
  events_received?: number;
  fbtrace_id?: string;
  error?: { message: string; type: string; code: number };
}

// ─── Main fire function ───────────────────────────────────────────────────────

/**
 * Fires a single event to the Meta Conversions API, persists a CAPIEvent row,
 * and returns the Meta fbtrace_id on success.
 *
 * Never throws — failure is recorded in the CAPIEvent row and returned as error.
 */
export async function fireCAPIEvent(
  params: FireCAPIParams
): Promise<{ success: boolean; metaEventId: string | null; error?: string }> {
  const { leadId, eventName, eventId, eventTime, pixelId, accessToken } = params;
  const { userData, customData, metaAdId, metaAdSetId } = params;

  // Build hashed user_data
  const ud: Record<string, string | string[]> = {};
  if (userData.email) ud.em = [hash(userData.email)];
  if (userData.phone) ud.ph = [hash(normalizePhone(userData.phone))];
  if (userData.firstName) ud.fn = [hash(userData.firstName)];
  if (userData.lastName) ud.ln = [hash(userData.lastName)];
  if (userData.zip) ud.zp = [hash(userData.zip)];
  if (userData.city) ud.ct = [hash(userData.city)];
  if (userData.state) ud.st = [hash(userData.state)];
  // external_id for cross-channel dedup (hashed metaLeadId)
  ud.external_id = [hash(userData.metaLeadId)];
  // lead_id: raw Meta Lead ID — ties revenue events directly to the ad click
  ud.lead_id = userData.metaLeadId;

  const event: Record<string, unknown> = {
    event_name: eventName,
    event_time: eventTime,
    event_id: eventId,
    action_source: "website",
    user_data: ud,
  };

  if (customData) {
    const cd: Record<string, unknown> = {};
    if (customData.value != null) {
      cd.value = customData.value;
      cd.currency = customData.currency ?? "USD";
    }
    if (customData.contentCategory) cd.content_category = customData.contentCategory;
    if (Object.keys(cd).length) event.custom_data = cd;
  }

  const body = { data: [event], access_token: accessToken };

  try {
    const url = `${META_API_BASE}/${pixelId}/events`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data: MetaCAPIResponse = await res.json();

    if (!res.ok || data.error) {
      throw new Error(data.error?.message ?? `CAPI returned ${res.status}`);
    }

    const metaEventId = data.fbtrace_id ?? null;

    await db.cAPIEvent.create({
      data: {
        leadId,
        eventName,
        eventTime: new Date(eventTime * 1000),
        value: customData?.value ?? null,
        currency: customData?.currency ?? "USD",
        status: "SENT",
        metaEventId,
        metaAdId: metaAdId ?? null,
        metaAdSetId: metaAdSetId ?? null,
        sentAt: new Date(),
      },
    });

    return { success: true, metaEventId };
  } catch (err) {
    const error = err instanceof Error ? err.message : "CAPI fire failed";

    await db.cAPIEvent.create({
      data: {
        leadId,
        eventName,
        eventTime: new Date(eventTime * 1000),
        value: customData?.value ?? null,
        currency: customData?.currency ?? "USD",
        status: "FAILED",
        metaAdId: metaAdId ?? null,
        metaAdSetId: metaAdSetId ?? null,
        error,
      },
    });

    return { success: false, metaEventId: null, error };
  }
}
