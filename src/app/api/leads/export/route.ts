import { NextRequest, NextResponse } from "next/server";
import { format } from "date-fns";
import { getRequiredSession } from "@/lib/auth/session";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  const session = await getRequiredSession();
  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { accountId: true },
  });
  if (!user?.accountId) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { searchParams } = req.nextUrl;
  const status = searchParams.get("status");
  const from = searchParams.get("from");
  const to = searchParams.get("to");
  const campaignId = searchParams.get("campaignId");

  const where: Record<string, unknown> = {
    accountId: user.accountId,
    ...(status ? { routingStatus: status } : {}),
    ...(campaignId ? { campaignId } : {}),
    ...((from || to)
      ? {
          createdAt: {
            ...(from ? { gte: new Date(from) } : {}),
            ...(to ? { lte: new Date(`${to}T23:59:59.999Z`) } : {}),
          },
        }
      : {}),
  };

  const leads = await db.lead.findMany({
    where,
    select: {
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
      zip: true,
      city: true,
      state: true,
      routingStatus: true,
      emailStatus: true,
      capiStatus: true,
      stJobId: true,
      stLeadId: true,
      stTaskId: true,
      bookingValue: true,
      invoiceValue: true,
      rawData: true,
      createdAt: true,
      campaign: {
        select: { name: true, metaFormName: true, destinationType: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  // Collect all unique form field keys across all leads
  const formFieldKeys = new Set<string>();
  for (const lead of leads) {
    const raw = lead.rawData as { field_data?: Array<{ name: string; values: string[] }> };
    for (const f of raw.field_data ?? []) {
      formFieldKeys.add(f.name);
    }
  }
  const dynamicKeys = Array.from(formFieldKeys);

  const STATIC_HEADERS = [
    "Date/Time",
    "First Name",
    "Last Name",
    "Email",
    "Phone",
    "Zip",
    "City",
    "State",
    "Campaign Name",
    "Source Form",
    "Destination Type",
    "ST Record ID",
    "Routing Status",
    "Email Status",
    "CAPI Status",
    "Booking Value",
    "Invoice Value",
  ];

  const rows = leads.map((lead) => {
    const raw = lead.rawData as { field_data?: Array<{ name: string; values: string[] }> };
    const fieldMap = new Map<string, string>();
    for (const f of raw.field_data ?? []) {
      fieldMap.set(f.name, f.values[0] ?? "");
    }

    const stRecordId = lead.stJobId ?? lead.stLeadId ?? lead.stTaskId ?? "";

    const cells = [
      format(lead.createdAt, "yyyy-MM-dd HH:mm:ss"),
      lead.firstName ?? "",
      lead.lastName ?? "",
      lead.email ?? "",
      lead.phone ?? "",
      lead.zip ?? "",
      lead.city ?? "",
      lead.state ?? "",
      lead.campaign?.name ?? "",
      lead.campaign?.metaFormName ?? "",
      lead.campaign?.destinationType ?? "",
      stRecordId,
      lead.routingStatus,
      lead.emailStatus,
      lead.capiStatus,
      lead.bookingValue != null ? lead.bookingValue.toFixed(2) : "",
      lead.invoiceValue != null ? lead.invoiceValue.toFixed(2) : "",
      ...dynamicKeys.map((k) => fieldMap.get(k) ?? ""),
    ];

    return cells;
  });

  const csvLine = (row: string[]) =>
    row.map((c) => `"${c.replace(/"/g, '""')}"`).join(",");

  const csv = [[...STATIC_HEADERS, ...dynamicKeys], ...rows]
    .map(csvLine)
    .join("\n");

  const filename = campaignId
    ? `leads-campaign-${format(new Date(), "yyyy-MM-dd")}.csv`
    : `leads-${format(new Date(), "yyyy-MM-dd")}.csv`;

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
