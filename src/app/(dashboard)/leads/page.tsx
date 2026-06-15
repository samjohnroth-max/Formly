import { Suspense } from "react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { getRequiredSession } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { RoutingStatusBadge } from "@/components/leads/RoutingStatusBadge";
import { ExportButton } from "@/components/leads/ExportButton";
import { haversineDistance } from "@/lib/geo";
import type { RoutingStatus, DestinationType } from "@/types/db";
import { cn } from "@/lib/utils";

export const revalidate = 0;

const DEST_BADGE: Record<DestinationType, { label: string; className: string }> = {
  BOOKING:  { label: "Booking",   className: "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400" },
  LEAD:     { label: "Lead",      className: "bg-purple-50 text-purple-700 dark:bg-purple-500/10 dark:text-purple-400" },
  FOLLOWUP: { label: "Follow-up", className: "bg-orange-50 text-orange-700 dark:bg-orange-500/10 dark:text-orange-400" },
  ESTIMATE: { label: "Estimate",  className: "bg-teal-50 text-teal-700 dark:bg-teal-500/10 dark:text-teal-400" },
};

interface LeadRow {
  id: string;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  phone: string | null;
  routingStatus: RoutingStatus;
  createdAt: Date;
  lat: number | null;
  lng: number | null;
  campaign: { name: string; destinationType: DestinationType } | null;
}

export default async function LeadsPage({
  searchParams,
}: {
  searchParams: { status?: string; page?: string; area?: string };
}) {
  const session = await getRequiredSession();
  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { accountId: true },
  });

  const page = Math.max(1, parseInt(searchParams.page ?? "1", 10));
  const pageSize = 50;
  const statusFilter = searchParams.status;
  const areaFilter = searchParams.area; // "out" | undefined

  const serviceArea = user?.accountId
    ? await db.serviceArea.findUnique({ where: { accountId: user.accountId } })
    : null;

  const where = {
    accountId: user?.accountId ?? "none",
    ...(statusFilter ? { routingStatus: statusFilter as never } : {}),
  };

  const [allLeads, total] = user?.accountId
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
            lat: true,
            lng: true,
            campaign: { select: { name: true, destinationType: true } },
          },
          orderBy: { createdAt: "desc" },
          skip: (page - 1) * pageSize,
          take: pageSize,
        }) as Promise<LeadRow[]>,
        db.lead.count({ where }),
      ])
    : [[], 0];

  // Compute inServiceArea per lead
  const leads = allLeads.map((l) => {
    let inServiceArea: boolean | null = null;
    if (serviceArea && l.lat != null && l.lng != null) {
      const dist = haversineDistance(serviceArea.lat, serviceArea.lng, l.lat, l.lng);
      inServiceArea = dist <= serviceArea.radiusMiles;
    }
    return { ...l, inServiceArea };
  });

  // Apply area filter client-side (already loaded the page)
  const filteredLeads = areaFilter === "out"
    ? leads.filter((l) => l.inServiceArea === false)
    : leads;

  const statuses: Array<{ value: string; label: string; href: string }> = [
    { value: "", label: "All", href: "/leads" },
    { value: "SUCCESS", label: "Success", href: "/leads?status=SUCCESS" },
    { value: "PROCESSING", label: "Processing", href: "/leads?status=PROCESSING" },
    { value: "RETRY", label: "Retrying", href: "/leads?status=RETRY" },
    { value: "FAILED", label: "Failed", href: "/leads?status=FAILED" },
    { value: "PENDING", label: "Pending", href: "/leads?status=PENDING" },
    ...(serviceArea ? [{ value: "out_area", label: "Out of area", href: "/leads?area=out" }] : []),
  ];

  const activeFilter = areaFilter === "out" ? "out_area" : (statusFilter ?? "");

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-[#F0F4FF]">Leads</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-[#8B90A0]">{total.toLocaleString()} total leads</p>
        </div>
        <div className="flex items-center gap-3">
          <Suspense>
            <ExportButton />
          </Suspense>
          <div className="flex items-center gap-1 rounded-lg bg-gray-100 dark:bg-[#1A1D27] p-1">
            {statuses.map((s) => (
              <Link
                key={s.value}
                href={s.href}
                className={cn(
                  "rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
                  activeFilter === s.value
                    ? "bg-white dark:bg-[#2A2D3E] text-gray-900 dark:text-[#F0F4FF] shadow-sm"
                    : s.value === "out_area"
                      ? "text-rose-500 hover:text-rose-700 dark:text-rose-400 dark:hover:text-rose-300"
                      : "text-gray-500 dark:text-[#8B90A0] hover:text-gray-700 dark:hover:text-[#F0F4FF]"
                )}
              >
                {s.label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {filteredLeads.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 dark:border-[#2A2D3E] bg-gray-50 dark:bg-[#1A1D27] py-16 text-center">
          <p className="text-sm font-medium text-gray-900 dark:text-[#F0F4FF]">No leads found</p>
          <p className="mt-1 text-sm text-gray-500 dark:text-[#8B90A0]">
            {areaFilter === "out" ? "No out-of-area leads on this page." : "Leads appear here when Meta sends webhook events for your active campaigns."}
          </p>
        </div>
      ) : (
        <>
          <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-[#2A2D3E] bg-white dark:bg-[#1A1D27] shadow-sm">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-[#2A2D3E] bg-gray-50 dark:bg-white/5">
                  <th className="py-3 pl-6 pr-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-[#8B90A0]">Lead</th>
                  <th className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-[#8B90A0]">Campaign</th>
                  <th className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-[#8B90A0]">Type</th>
                  <th className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-[#8B90A0]">Status</th>
                  {serviceArea && (
                    <th className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-[#8B90A0]">Area</th>
                  )}
                  <th className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-[#8B90A0]">Received</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-[#2A2D3E]">
                {filteredLeads.map((lead) => {
                  const name = [lead.firstName, lead.lastName].filter(Boolean).join(" ") || "Unknown";
                  const dest = lead.campaign?.destinationType
                    ? DEST_BADGE[lead.campaign.destinationType]
                    : null;
                  return (
                    <tr key={lead.id} className="hover:bg-gray-50 dark:hover:bg-white/5">
                      <td className="py-3.5 pl-6 pr-3">
                        <Link href={`/leads/${lead.id}`} className="group">
                          <p className="font-medium text-gray-900 dark:text-[#F0F4FF] group-hover:text-blue-600 dark:group-hover:text-[#3B7DD8]">{name}</p>
                          <p className="text-xs text-gray-500 dark:text-[#8B90A0] mt-0.5">
                            {lead.email ?? lead.phone ?? "No contact"}
                          </p>
                        </Link>
                      </td>
                      <td className="px-3 py-3.5 text-sm text-gray-600 dark:text-[#8B90A0]">
                        {lead.campaign?.name ?? <span className="text-gray-400 dark:text-[#8B90A0] italic">Unknown</span>}
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
                      {serviceArea && (
                        <td className="px-3 py-3.5">
                          {lead.inServiceArea === false && (
                            <span className="inline-flex rounded-full bg-red-50 dark:bg-red-500/10 px-2 py-0.5 text-xs font-medium text-red-700 dark:text-red-400">
                              Out of area
                            </span>
                          )}
                          {lead.inServiceArea === true && (
                            <span className="inline-flex rounded-full bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:text-emerald-400">
                              In area
                            </span>
                          )}
                          {lead.inServiceArea === null && (
                            <span className="text-gray-400 dark:text-[#8B90A0] text-xs">—</span>
                          )}
                        </td>
                      )}
                      <td className="px-3 py-3.5 text-xs text-gray-400 dark:text-[#8B90A0]">
                        {formatDistanceToNow(lead.createdAt, { addSuffix: true })}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {total > pageSize && (
            <div className="mt-4 flex items-center justify-between text-sm text-gray-500 dark:text-[#8B90A0]">
              <p>Showing {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, total)} of {total}</p>
              <div className="flex gap-2">
                {page > 1 && (
                  <Link
                    href={`/leads?${new URLSearchParams({ ...(statusFilter ? { status: statusFilter } : {}), page: String(page - 1) })}`}
                    className="rounded-md border border-gray-300 dark:border-[#2A2D3E] dark:text-[#8B90A0] px-3 py-1.5 hover:bg-gray-50 dark:hover:bg-white/5"
                  >
                    Previous
                  </Link>
                )}
                {page * pageSize < total && (
                  <Link
                    href={`/leads?${new URLSearchParams({ ...(statusFilter ? { status: statusFilter } : {}), page: String(page + 1) })}`}
                    className="rounded-md border border-gray-300 dark:border-[#2A2D3E] dark:text-[#8B90A0] px-3 py-1.5 hover:bg-gray-50 dark:hover:bg-white/5"
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
