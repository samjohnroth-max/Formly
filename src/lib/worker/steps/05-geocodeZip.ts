import { db } from "@/lib/db";
import type { ProcessingContext } from "../types";

interface ZippopotamPlace {
  "place name": string;
  longitude: string;
  latitude: string;
  state: string;
  "state abbreviation": string;
}

interface ZippopotamResponse {
  places?: ZippopotamPlace[];
}

/**
 * Geocodes the lead's zip code using the free Zippopotam.us API.
 * Non-blocking: failures are silently ignored — routing proceeds regardless.
 */
export async function geocodeZip(ctx: ProcessingContext): Promise<void> {
  if (!ctx.zip || !ctx.leadId) return;

  // Normalize: strip +4 suffix if present
  const zip = ctx.zip.slice(0, 5).replace(/\D/g, "");
  if (zip.length !== 5) return;

  try {
    const res = await fetch(`https://api.zippopotam.us/us/${zip}`, {
      signal: AbortSignal.timeout(3000),
    });
    if (!res.ok) return;

    const data: ZippopotamResponse = await res.json();
    const place = data.places?.[0];
    if (!place) return;

    ctx.lat = parseFloat(place.latitude);
    ctx.lng = parseFloat(place.longitude);

    // Backfill city/state if not already mapped
    if (!ctx.city) ctx.city = place["place name"];
    if (!ctx.state) ctx.state = place["state abbreviation"];

    await db.lead.update({
      where: { id: ctx.leadId },
      data: {
        lat: ctx.lat,
        lng: ctx.lng,
        city: ctx.city,
        state: ctx.state,
      },
    });
  } catch {
    // Silently ignore all geocoding failures
  }
}
