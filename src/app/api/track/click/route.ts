import { NextRequest, NextResponse } from "next/server";
import { verifyTrackingToken } from "@/lib/tracking/token";
import { db } from "@/lib/db";

const BOOKING_URL_RE = /\b(book|booking|schedule|appointment|calendly|cal\.com)\b/i;

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");
  const url = req.nextUrl.searchParams.get("url");
  const destination = url ? decodeURIComponent(url) : null;

  if (!destination) {
    return NextResponse.json({ error: "Missing url" }, { status: 400 });
  }

  const payload = token ? verifyTrackingToken(token) : null;

  if (payload) {
    const isBooking = BOOKING_URL_RE.test(destination);
    await db.emailEvent.create({
      data: {
        accountId: payload.accountId,
        leadId: payload.leadId,
        templateId: payload.templateId,
        eventType: isBooking ? "BOOKING_CLICKED" : "CLICKED",
        metadata: {
          url: destination,
          userAgent: req.headers.get("user-agent") ?? null,
        },
      },
    });
  }

  return NextResponse.redirect(destination, 302);
}
