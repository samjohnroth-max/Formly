"use server";

import { revalidatePath } from "next/cache";
import { getRequiredSession } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { getSTAccessToken } from "@/lib/servicetitan/auth";

async function getAccountId(userId: string): Promise<string> {
  const user = await db.user.findUnique({ where: { id: userId }, select: { accountId: true } });
  if (!user?.accountId) throw new Error("No account");
  return user.accountId;
}

async function assertNotDemo(userId: string): Promise<void> {
  const u = await db.user.findUnique({ where: { id: userId }, select: { email: true } });
  if (u?.email === "demo@formly.io") throw new Error("This action is disabled in demo mode.");
}

export async function disconnectMeta(connectionId: string) {
  const session = await getRequiredSession();
  await assertNotDemo(session.user.id);
  const accountId = await getAccountId(session.user.id);

  await db.metaConnection.updateMany({
    where: { id: connectionId, accountId },
    data: { status: "DISCONNECTED" },
  });

  revalidatePath("/connections");
}

export async function disconnectST(connectionId: string) {
  const session = await getRequiredSession();
  await assertNotDemo(session.user.id);
  const accountId = await getAccountId(session.user.id);

  await db.sTConnection.updateMany({
    where: { id: connectionId, accountId },
    data: { status: "DISCONNECTED" },
  });

  revalidatePath("/connections");
}

export async function testSTConnection(
  connectionId: string
): Promise<{ ok: boolean; error?: string }> {
  const session = await getRequiredSession();
  const accountId = await getAccountId(session.user.id);

  const connection = await db.sTConnection.findFirst({
    where: { id: connectionId, accountId },
  });

  if (!connection) return { ok: false, error: "Connection not found" };

  try {
    await getSTAccessToken(connection);
    await db.sTConnection.update({
      where: { id: connectionId },
      data: { status: "ACTIVE" },
    });
    revalidatePath("/connections");
    return { ok: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Connection test failed";
    await db.sTConnection.update({
      where: { id: connectionId },
      data: { status: "ERROR" },
    });
    revalidatePath("/connections");
    return { ok: false, error: message };
  }
}
