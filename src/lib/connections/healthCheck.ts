import { db } from "@/lib/db";
import { decrypt } from "@/lib/crypto";
import { getMetaMe } from "@/lib/meta/oauth";
import { getSTAccessToken } from "@/lib/servicetitan/auth";
import type { STConnectionShape } from "@/types/db";

export async function runConnectionHealthChecks(): Promise<{ checked: number; updated: number }> {
  const [metaConns, stConns] = await Promise.all([
    db.metaConnection.findMany({
      where: { status: { not: "DISCONNECTED" } },
      select: { id: true, accessToken: true, tokenExpiresAt: true },
    }),
    db.sTConnection.findMany({
      where: { status: { not: "DISCONNECTED" } },
      select: {
        id: true,
        tenantId: true,
        clientId: true,
        clientSecret: true,
        appKey: true,
        accessToken: true,
        tokenExpiresAt: true,
      },
    }),
  ]);

  let updated = 0;

  await Promise.allSettled(
    metaConns.map(async (conn) => {
      try {
        const plainToken = decrypt(conn.accessToken);
        await getMetaMe(plainToken);
        const now = new Date();
        const newStatus = conn.tokenExpiresAt && conn.tokenExpiresAt < now ? "EXPIRED" : "ACTIVE";
        await db.metaConnection.update({ where: { id: conn.id }, data: { status: newStatus } });
      } catch {
        await db.metaConnection.update({ where: { id: conn.id }, data: { status: "EXPIRED" } });
      }
      updated++;
    })
  );

  await Promise.allSettled(
    stConns.map(async (conn) => {
      try {
        // getSTAccessToken updates status to ACTIVE on success
        await getSTAccessToken(conn as STConnectionShape);
      } catch {
        await db.sTConnection.update({ where: { id: conn.id }, data: { status: "ERROR" } });
      }
      updated++;
    })
  );

  return { checked: metaConns.length + stConns.length, updated };
}
