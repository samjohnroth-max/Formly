import Link from "next/link";
import { Plus } from "lucide-react";
import { getRequiredSession } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { CampaignRow } from "@/components/campaigns/CampaignRow";
import type { CampaignStatus, DestinationType } from "@/types/db";

interface CampaignWithMeta {
  id: string;
  name: string;
  metaFormName: string;
  destinationType: DestinationType;
  status: CampaignStatus;
  createdAt: Date;
  _count: { leads: number };
  metaConnection: { metaAccountName: string };
  stConnection: { tenantName: string };
}

export const revalidate = 0;

export default async function CampaignsPage({
  searchParams,
}: {
  searchParams: { created?: string };
}) {
  const session = await getRequiredSession();

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { accountId: true },
  });

  const campaigns: CampaignWithMeta[] = user?.accountId
    ? await db.campaign.findMany({
        where: { accountId: user.accountId, status: { not: "ARCHIVED" } },
        include: {
          _count: { select: { leads: true } },
          metaConnection: { select: { metaAccountName: true } },
          stConnection: { select: { tenantName: true } },
        },
        orderBy: { createdAt: "desc" },
      })
    : [];

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Campaigns</h1>
          <p className="mt-1 text-sm text-gray-500">
            Each campaign links a Meta Instant Form to a ServiceTitan destination.
          </p>
        </div>
        <Link
          href="/campaigns/new"
          className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          <Plus className="size-4" />
          New Campaign
        </Link>
      </div>

      {searchParams.created && (
        <div className="mb-4 rounded-lg bg-green-50 px-4 py-3 text-sm text-green-800">
          Campaign created successfully and is now active.
        </div>
      )}

      {campaigns.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 py-16 text-center">
          <p className="text-sm font-medium text-gray-900">No campaigns yet</p>
          <p className="mt-1 text-sm text-gray-500">Create your first campaign to start routing leads.</p>
          <Link
            href="/campaigns/new"
            className="mt-4 inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            <Plus className="size-4" />
            New Campaign
          </Link>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="py-3 pl-6 pr-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">Campaign</th>
                <th className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">Type</th>
                <th className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">ST Tenant</th>
                <th className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">Status</th>
                <th className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">Leads</th>
                <th className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">Created</th>
                <th className="py-3 pl-3 pr-6" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {campaigns.map((c) => (
                <CampaignRow
                  key={c.id}
                  id={c.id}
                  name={c.name}
                  metaFormName={c.metaFormName}
                  metaAccountName={c.metaConnection.metaAccountName}
                  tenantName={c.stConnection.tenantName}
                  destinationType={c.destinationType}
                  status={c.status}
                  leadCount={c._count.leads}
                  createdAt={c.createdAt}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
