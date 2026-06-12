import { Suspense } from "react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { getRequiredSession } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { RoutingStatusBadge } from "@/components/leads/RoutingStatusBadge";
import { ExportButton } from "@/components/leads/ExportButton";
import type { RoutingStatus, DestinationType } from "@/types/db";
import { cn } from "@/lib/utils";

export const revalidate = 0;

const DEST_BADGE: Record<DestinationType, { label: string; className: string }> = {
  BOOKING:  { label: "Booking",   className: "bg-blue-50 text-blue-700" },
  LEAD:     { label: "Lead",      className: "bg-purple-50 text-purple-700" },
  FOLLOWUP: { label: "Follow-up", className: "bg-orange-50 text-orange-700" },
};

interface LeadRow {
  id: string;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  phone: string | null;
  routingStatus: RoutingStatus;
  createdAt: Date;
  campaign: { name: string; destinationType: DestinationType } | null;
}

export default async function LeadsPage({
  searchParams,
}: {
  searchParams: { status?: string; page?: string };
}) {
  const session = await getRequiredSession();
  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { accountId: true },
  });

  const page = Math.max(1, parseInt(searchParams.page ?? "1", 10));
  const pageSize = 50;
  const statusFilter = searchParams.status;

  const where = {
    accountId: user?.accountId ?? "none",
    ...(statusFilter ? { routingStatus: statusFilter as never } : {}),
  };

  const [leads, total] = user?.accountId
    ? await Promise.all([
        db.lead.findMany({
          where,
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            routingStatus: true,
            createdAt: true,
            campaign: { select: { name: true, destinationType: true } },
          },
          orderBy: { createdAt: "desc" },
          skip: (page - 1) * pageSize,
          take: pageSize,
        }) as Promise<LeadRow[]>,
        db.lead.count({ where }),
      ])
    : [[], 0];

  const statuses: Array<{ value: string; label: string }> = [
    { value: "", label: "All" },
    { value: "SUCCESS", label: "Success" },
    { value: "PROCESSING", label: "Processing" },
    { value: "RETRY", label: "Retrying" },
    { value: "FAILED", label: "Failed" },
    { value: "PENDING", label: "Pending" },
  ];

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Leads</h1>
          <p className="mt-1 text-sm text-gray-500">{total.toLocaleString()} total leads</p>
        </div>
        <div className="flex items-center gap-3">
          <Suspense>
            <ExportButton />
          </Suspense>
          {/* Status filter */}
          <div className="flex items-center gap-1 rounded-lg bg-gray-100 p-1">
          {statuses.map((s) => (
            <Link
              key={s.value}
              href={s.value ? `/dashboard/leads?status=${s.value}` : "/dashboard/leads"}
              className={cn(
                "rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
                (statusFilter ?? "") === s.value
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              )}
            >
              {s.label}
            </Link>
          ))}
          </div>
        </div>
      </div>

      {leads.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 py-16 text-center">
          <p className="text-sm font-medium text-gray-900">No leads yet</p>
          <p className="mt-1 text-sm text-gray-500">
            Leads appear here when Meta sends webhook events for your active campaigns.
          </p>
        </div>
      ) : (
        <>
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="py-3 pl-6 pr-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">Lead</th>
                  <th className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">Campaign</th>
                  <th className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">Type</th>
                  <th className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">Status</th>
                  <th className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">Received</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {leads.map((lead) => {
                  const name = [lead.firstName, lead.lastName].filter(Boolean).join(" ") || "Unknown";
                  const dest = lead.campaign?.destinationType
                    ? DEST_BADGE[lead.campaign.destinationType]
                    : null;
                  return (
                    <tr key={lead.id} className="hover:bg-gray-50">
                      <td className="py-3.5 pl-6 pr-3">
                        <Link href={`/dashboard/leads/${lead.id}`} className="group">
                          <p className="font-medium text-gray-900 group-hover:text-blue-600">{name}</p>
                          <p className="text-xs text-gray-500 mt-0.5">
                            {lead.email ?? lead.phone ?? "No contact"}
                          </p>
                        </Link>
                      </td>
                      <td className="px-3 py-3.5 text-sm text-gray-600">
                        {lead.campaign?.name ?? <span className="text-gray-400 italic">Unknown</span>}
                      </td>
                      <td className="px-3 py-3.5">
                        {dest && (
                          <span className={cn("inline-flex rounded-full px-2 py-0.5 text-xs font-medium", dest.className)}>
                            {dest.label}
                          </span>
                        )}
                      </td>
                      <td className="px-3 py-3.5">
                        <RoutingStatusBadge status={lead.routingStatus} />
                      </td>
                      <td className="px-3 py-3.5 text-xs text-gray-400">
                        {formatDistanceToNow(lead.createdAt, { addSuffix: true })}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {total > pageSize && (
            <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
              <p>Showing {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, total)} of {total}</p>
              <div className="flex gap-2">
                {page > 1 && (
                  <Link
                    href={`/dashboard/leads?${new URLSearchParams({ ...(statusFilter ? { status: statusFilter } : {}), page: String(page - 1) })}`}
                    className="rounded-md border border-gray-300 px-3 py-1.5 hover:bg-gray-50"
                  >
                    Previous
                  </Link>
                )}
                {page * pageSize < total && (
                  <Link
                    href={`/dashboard/leads?${new URLSearchParams({ ...(statusFilter ? { status: statusFilter } : {}), page: String(page + 1) })}`}
                    className="rounded-md border border-gray-300 px-3 py-1.5 hover:bg-gray-50"
                  >
                    Next
                  </Link>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
