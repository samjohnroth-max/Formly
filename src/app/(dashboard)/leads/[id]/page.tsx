import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, ExternalLink, AlertTriangle, MapPin } from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";
import { getRequiredSession } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { RoutingStatusBadge } from "@/components/leads/RoutingStatusBadge";
import { LeadTimeline } from "@/components/leads/LeadTimeline";
import { RawDataPanel } from "@/components/leads/RawDataPanel";
import type { RoutingStatus } from "@/types/db";

export const revalidate = 0;

export default async function LeadDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await getRequiredSession();
  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { accountId: true },
  });
  if (!user?.accountId) notFound();

  const lead = await db.lead.findFirst({
    where: { id: params.id, accountId: user.accountId },
    include: {
      campaign: {
        select: {
          name: true,
          destinationType: true,
          metaFormName: true,
          metaConnection: { select: { metaAccountName: true } },
          stConnection: { select: { tenantName: true, tenantId: true } },
        },
      },
      capiEvents: { orderBy: { createdAt: "asc" } },
    },
    // formData is a Json field — Prisma includes it automatically
  });
  if (!lead) notFound();

  const name = [lead.firstName, lead.lastName].filter(Boolean).join(" ") || "Unknown Lead";
  const tenantId = lead.campaign?.stConnection.tenantId;

  return (
    <div className="mx-auto max-w-5xl p-8 space-y-6">
      {/* Header */}
      <div>
        <Link href="/leads" className="mb-3 flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700">
          <ChevronLeft className="size-4" /> Back to leads
        </Link>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">{name}</h1>
            <p className="mt-1 text-sm text-gray-500">
              {lead.campaign?.name} ·{" "}
              {formatDistanceToNow(lead.createdAt, { addSuffix: true })}
            </p>
          </div>
          <RoutingStatusBadge status={lead.routingStatus as RoutingStatus} className="text-sm px-3 py-1" />
        </div>
        {lead.routingError && (
          <div className="mt-3 flex items-start gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700">
            <AlertTriangle className="mt-0.5 size-4 shrink-0" />
            <p>{lead.routingError}</p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Left column: Timeline */}
        <div className="col-span-1">
          <Panel title="Processing Timeline">
            <LeadTimeline
              lead={{
                createdAt: lead.createdAt,
                routingStatus: lead.routingStatus,
                routingError: lead.routingError,
                firstName: lead.firstName,
                email: lead.email,
                lat: lead.lat,
                stMatchedCustomer: lead.stMatchedCustomer,
                stCustomerId: lead.stCustomerId,
                stJobId: lead.stJobId,
                stLeadId: lead.stLeadId,
                stTaskId: lead.stTaskId,
                emailStatus: lead.emailStatus,
                capiStatus: lead.capiStatus,
              }}
            />
          </Panel>
        </div>

        {/* Right columns: Details */}
        <div className="col-span-2 space-y-6">
          {/* Contact info */}
          <Panel title="Contact">
            {lead.addressComplete === false && (
              <div className="mb-4 flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2">
                <MapPin className="size-4 shrink-0 text-amber-500" />
                <p className="text-xs font-medium text-amber-800">
                  Address incomplete — a CSR should verify the service address with the customer before dispatching.
                </p>
              </div>
            )}
            <dl className="grid grid-cols-2 gap-3 text-sm">
              <InfoRow label="Name" value={name} />
              <InfoRow label="Email" value={lead.email} />
              <InfoRow label="Phone" value={lead.phone} />
              <InfoRow label="Street" value={(lead as { street?: string | null }).street} />
              <InfoRow label="City" value={lead.city} />
              <InfoRow label="State" value={lead.state} />
              <InfoRow label="Zip" value={lead.zip} />
              {lead.lat && <InfoRow label="Coords" value={`${lead.lat.toFixed(4)}, ${lead.lng?.toFixed(4)}`} />}
              <InfoRow label="Service Interest" value={lead.serviceInterest} />
            </dl>
          </Panel>

          {/* ServiceTitan Record */}
          <Panel title="ServiceTitan Record">
            <dl className="grid grid-cols-2 gap-3 text-sm">
              <InfoRow label="Tenant" value={lead.campaign?.stConnection.tenantName} />
              <InfoRow label="Customer ID" value={lead.stCustomerId} />
              <InfoRow
                label="Customer Match"
                value={lead.stCustomerId ? (lead.stMatchedCustomer ? "Matched existing" : "Created new") : undefined}
              />
              {lead.stJobId && (
                <InfoRow
                  label="Job ID"
                  value={lead.stJobId}
                  link={tenantId ? `https://app.servicetitan.com/Job/Index/${lead.stJobId}?tenant=${tenantId}` : undefined}
                />
              )}
              {lead.stLeadId && <InfoRow label="Lead ID" value={lead.stLeadId} />}
              {lead.stTaskId && <InfoRow label="Task ID" value={lead.stTaskId} />}
              {(lead as { stLocationId?: string | null }).stLocationId && (
                <InfoRow label="Location ID" value={(lead as { stLocationId?: string | null }).stLocationId} />
              )}
              <InfoRow label="Booking value" value={lead.bookingValue ? `$${lead.bookingValue.toFixed(2)}` : undefined} />
              <InfoRow label="Invoice value" value={lead.invoiceValue ? `$${lead.invoiceValue.toFixed(2)}` : undefined} />
            </dl>
          </Panel>

          {/* CAPI Events */}
          {lead.capiEvents.length > 0 && (
            <Panel title="CAPI Events">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="pb-2 text-left text-xs font-medium text-gray-500">Event</th>
                    <th className="pb-2 text-left text-xs font-medium text-gray-500">Status</th>
                    <th className="pb-2 text-left text-xs font-medium text-gray-500">Value</th>
                    <th className="pb-2 text-left text-xs font-medium text-gray-500">Sent</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {lead.capiEvents.map((e: { id: string; eventName: string; status: string; error: string | null; value: number | null; currency: string; sentAt: Date | null }) => (
                    <tr key={e.id}>
                      <td className="py-2 font-mono text-xs">{e.eventName}</td>
                      <td className="py-2">
                        <span className={`text-xs font-medium ${e.status === "SENT" ? "text-green-600" : e.status === "FAILED" ? "text-red-600" : "text-gray-500"}`}>
                          {e.status}
                        </span>
                        {e.error && <p className="text-xs text-red-500 mt-0.5">{e.error}</p>}
                      </td>
                      <td className="py-2 text-xs text-gray-500">
                        {e.value ? `$${e.value} ${e.currency}` : "—"}
                      </td>
                      <td className="py-2 text-xs text-gray-400">
                        {e.sentAt ? format(e.sentAt, "MMM d, HH:mm") : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Panel>
          )}

          {/* Form Responses */}
          {lead.formData && Object.keys(lead.formData as Record<string, string>).length > 0 && (
            <Panel title="Form Responses">
              <dl className="grid grid-cols-2 gap-3 text-sm">
                {Object.entries(lead.formData as Record<string, string>).map(([key, val]) => (
                  <div key={key}>
                    <dt className="text-xs capitalize text-gray-500">
                      {key.replace(/_/g, " ")}
                    </dt>
                    <dd className="mt-0.5 font-medium text-gray-900">{val || "—"}</dd>
                  </div>
                ))}
              </dl>
            </Panel>
          )}

          {/* Raw form data */}
          <Panel title="Raw Form Data">
            <RawDataPanel data={lead.rawData as Record<string, unknown>} />
          </Panel>
        </div>
      </div>
    </div>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <h2 className="mb-4 text-sm font-semibold text-gray-900">{title}</h2>
      {children}
    </div>
  );
}

function InfoRow({
  label,
  value,
  link,
}: {
  label: string;
  value?: string | null;
  link?: string;
}) {
  if (!value) return null;
  return (
    <div>
      <dt className="text-xs text-gray-500">{label}</dt>
      <dd className="mt-0.5 font-medium text-gray-900">
        {link ? (
          <a href={link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-blue-600 hover:underline">
            {value} <ExternalLink className="size-3" />
          </a>
        ) : value}
      </dd>
    </div>
  );
}
