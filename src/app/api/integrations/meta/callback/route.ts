import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getRequiredSession } from "@/lib/auth/session";
import {
  exchangeCodeForToken,
  getLongLivedToken,
  getMetaMe,
  getAdAccounts,
} from "@/lib/meta/oauth";
import { encrypt } from "@/lib/crypto";
import { db } from "@/lib/db";

function connectionsUrl(params?: string) {
  const base = process.env.NEXTAUTH_URL ?? "http://localhost:3000";
  return `${base}/connections${params ? `?${params}` : ""}`;
}

export async function GET(req: NextRequest) {
  const session = await getRequiredSession();
  const { searchParams } = req.nextUrl;

  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");

  if (error) {
    return NextResponse.redirect(connectionsUrl(`error=${encodeURIComponent(error)}`));
  }

  if (!code || !state) {
    return NextResponse.redirect(connectionsUrl("error=missing_params"));
  }

  // Verify CSRF state and extract groupId
  const cookieStore = cookies();
  const rawCookie = cookieStore.get("meta_oauth_state")?.value;
  cookieStore.delete("meta_oauth_state");

  let storedCsrf: string | undefined;
  let groupId: string | null = null;
  try {
    const payload = JSON.parse(rawCookie ?? "{}");
    storedCsrf = payload.csrf;
    groupId = payload.groupId ?? null;
  } catch {
    return NextResponse.redirect(connectionsUrl("error=invalid_state"));
  }

  if (!storedCsrf || storedCsrf !== state) {
    return NextResponse.redirect(connectionsUrl("error=invalid_state"));
  }

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { accountId: true },
  });

  if (!user?.accountId) {
    return NextResponse.redirect(connectionsUrl("error=no_account"));
  }

  // Verify groupId belongs to this account if provided
  if (groupId) {
    const client = await db.client.findFirst({ where: { id: groupId, accountId: user.accountId } });
    if (!client) groupId = null;
  }

  try {
    const shortToken = await exchangeCodeForToken(code);
    const longToken = await getLongLivedToken(shortToken.access_token);

    const tokenExpiresAt = longToken.expires_in
      ? new Date(Date.now() + longToken.expires_in * 1000)
      : null;

    const me = await getMetaMe(longToken.access_token);
    const adAccounts = await getAdAccounts(longToken.access_token);
    const primaryAccount = adAccounts[0];

    const existing = await db.metaConnection.findFirst({
      where: { accountId: user.accountId, metaAccountId: primaryAccount?.id ?? me.id },
      select: { id: true },
    });

    await db.metaConnection.upsert({
      where: { id: existing?.id ?? "new" },
      create: {
        accountId: user.accountId,
        groupId,
        metaAccountId: primaryAccount?.id ?? me.id,
        metaAccountName: primaryAccount?.name ?? me.name,
        accessToken: encrypt(longToken.access_token),
        tokenExpiresAt,
        status: "ACTIVE",
      },
      update: {
        accessToken: encrypt(longToken.access_token),
        tokenExpiresAt,
        status: "ACTIVE",
        // Only set groupId on reconnect if it was specified; don't clear an existing assignment
        ...(groupId ? { groupId } : {}),
      },
    });

    const successParams = groupId
      ? `success=meta_connected&clientId=${groupId}`
      : "success=meta_connected";
    return NextResponse.redirect(connectionsUrl(successParams));
  } catch (err) {
    const message = err instanceof Error ? err.message : "unknown_error";
    return NextResponse.redirect(connectionsUrl(`error=${encodeURIComponent(message)}`));
  }
}
