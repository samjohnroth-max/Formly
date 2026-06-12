import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { cookies } from "next/headers";
import { buildMetaAuthUrl } from "@/lib/meta/oauth";
import { getRequiredSession } from "@/lib/auth/session";
import type { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  await getRequiredSession();

  const groupId = req.nextUrl.searchParams.get("groupId") ?? null;
  const csrf = randomBytes(16).toString("hex");

  const isHttps = process.env.NEXTAUTH_URL?.startsWith("https://") ?? false;
  const cookieStore = cookies();
  cookieStore.set("meta_oauth_state", JSON.stringify({ csrf, groupId }), {
    httpOnly: true,
    secure: isHttps,
    sameSite: "lax",
    maxAge: 600,
    path: "/",
  });

  return NextResponse.redirect(buildMetaAuthUrl(csrf));
}
