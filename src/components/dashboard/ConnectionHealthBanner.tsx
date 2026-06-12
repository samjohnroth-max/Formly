import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { db } from "@/lib/db";
import { getRequiredSession } from "@/lib/auth/session";

export async function ConnectionHealthBanner() {
  let session: Awaited<ReturnType<typeof getRequiredSession>>;
  try {
    session = await getRequiredSession();
  } catch {
    return null;
  }

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { accountId: true },
  });
  if (!user?.accountId) return null;

  const [staleMeta, staleST] = await Promise.all([
    db.metaConnection.count({
      where: { accountId: user.accountId, status: { in: ["EXPIRED", "ERROR"] } },
    }),
    db.sTConnection.count({
      where: { accountId: user.accountId, status: { in: ["EXPIRED", "ERROR"] } },
    }),
  ]);

  const total = staleMeta + staleST;
  if (total === 0) return null;

  const parts: string[] = [];
  if (staleMeta > 0) parts.push(`${staleMeta} Meta ${staleMeta === 1 ? "connection" : "connections"}`);
  if (staleST > 0) parts.push(`${staleST} ServiceTitan ${staleST === 1 ? "tenant" : "tenants"}`);

  return (
    <div className="flex items-center justify-between rounded-lg border border-amber-200 bg-amber-50 px-4 py-3">
      <div className="flex items-center gap-2">
        <AlertTriangle className="size-4 shrink-0 text-amber-600" />
        <p className="text-sm text-amber-800">
          <span className="font-semibold">{parts.join(" and ")}</span>{" "}
          {total === 1 ? "has" : "have"} gone stale — lead routing may be affected.
        </p>
      </div>
      <Link
        href="/connections"
        className="shrink-0 rounded-md bg-amber-100 px-3 py-1.5 text-xs font-semibold text-amber-800 hover:bg-amber-200"
      >
        Fix connections →
      </Link>
    </div>
  );
}
