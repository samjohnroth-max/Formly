import { NextRequest, NextResponse } from "next/server";
import { verifyTrackingToken } from "@/lib/tracking/token";
import { db } from "@/lib/db";

// 1×1 transparent GIF
const PIXEL = Buffer.from(
  "R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7",
  "base64"
);

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");
  const payload = token ? verifyTrackingToken(token) : null;

  if (payload) {
    // Record at most one OPENED event per lead (idempotent)
    const existing = await db.emailEvent.findFirst({
      where: { leadId: payload.leadId, eventType: "OPENED" },
      select: { id: true },
    });

    if (!existing) {
      await db.emailEvent.create({
        data: {
          accountId: payload.accountId,
          leadId: payload.leadId,
          templateId: payload.templateId,
          eventType: "OPENED",
          metadata: { userAgent: req.headers.get("user-agent") ?? null },
        },
      });
    }
  }

  return new NextResponse(PIXEL, {
    status: 200,
    headers: {
      "Content-Type": "image/gif",
      "Cache-Control": "no-store, no-cache, must-revalidate, private",
      "Pragma": "no-cache",
    },
  });
}
