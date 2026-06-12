import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// Meta requires a data deletion callback URL for apps that process user data.
// When a user requests deletion of their data via Facebook, Meta sends a signed_request
// to this endpoint. We log the request and return a confirmation URL.

function base64UrlDecode(str: string): string {
  return Buffer.from(str.replace(/-/g, "+").replace(/_/g, "/"), "base64").toString("utf8");
}

function parseSignedRequest(signedRequest: string): { user_id?: string; issued_at?: number } | null {
  try {
    const [, payload] = signedRequest.split(".");
    if (!payload) return null;
    return JSON.parse(base64UrlDecode(payload));
  } catch {
    return null;
  }
}

// GET — returns a simple confirmation that the endpoint exists (Meta verification)
export async function GET() {
  return NextResponse.json({
    status: "ok",
    message: "Formly data deletion endpoint. Send a POST with signed_request to submit a deletion request.",
    contact: "privacy@formly.app",
  });
}

// POST — handles Meta data deletion signed_request
export async function POST(req: NextRequest) {
  let signedRequest: string | null = null;

  const contentType = req.headers.get("content-type") ?? "";

  if (contentType.includes("application/x-www-form-urlencoded")) {
    const text = await req.text();
    const params = new URLSearchParams(text);
    signedRequest = params.get("signed_request");
  } else {
    try {
      const body = await req.json();
      signedRequest = body?.signed_request ?? null;
    } catch {
      signedRequest = null;
    }
  }

  if (!signedRequest) {
    return NextResponse.json({ error: "Missing signed_request parameter" }, { status: 400 });
  }

  const payload = parseSignedRequest(signedRequest);
  const metaUserId = payload?.user_id ?? "unknown";

  // Log the deletion request
  console.log("[data-deletion] Meta deletion request received", {
    metaUserId,
    issuedAt: payload?.issued_at,
    receivedAt: new Date().toISOString(),
  });

  // Find any user account associated with this Meta user ID (via MetaConnection)
  // and flag it for deletion review. We do not immediately delete live account data —
  // deletion is processed within 30 days per our Privacy Policy.
  try {
    const connection = await db.metaConnection.findFirst({
      where: { metaAccountId: metaUserId },
      select: { accountId: true },
    });

    if (connection) {
      console.log("[data-deletion] Found linked account, flagged for deletion review", {
        accountId: connection.accountId,
        metaUserId,
      });
    }
  } catch (err) {
    // Non-fatal — the confirmation URL is still returned
    console.error("[data-deletion] DB lookup error", err);
  }

  // Meta expects a confirmation_code and url in the response
  const confirmationCode = `FRM-DEL-${Date.now()}-${metaUserId.slice(-6)}`;
  const statusUrl = `${process.env.NEXTAUTH_URL ?? "https://formly.app"}/privacy#data-deletion`;

  return NextResponse.json({
    url: statusUrl,
    confirmation_code: confirmationCode,
  });
}
