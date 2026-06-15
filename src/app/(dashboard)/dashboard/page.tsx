import { Suspense } from "react";
import { getRequiredSession } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { MetricsCards } from "@/components/dashboard/MetricsCards";
import { DashboardLive } from "@/components/dashboard/DashboardLive";
import { ConnectionHealthBanner } from "@/components/dashboard/ConnectionHealthBanner";
import { RevenueCards } from "@/components/dashboard/RevenueCards";
import { CAPISignalHealth } from "@/components/dashboard/CAPISignalHealth";
import { CampaignPerformanceTable } from "@/components/dashboard/CampaignPerformanceTable";
import { DashboardFilters } from "@/components/dashboard/DashboardFilters";
import {
  fetchRoutingMetrics,
  fetchRevenueMetrics,
  fetchCAPIHealth,
  fetchCampaignPerformance,
  fetchOutOfAreaMetrics,
  fetchClientList,
  fetchCampaignList,
} from "./data";
import { FormlyPattern } from "@/components/brand/FormlyPattern";
import { parseDateRangeParams, getPeriodKey, formatRangeLabel } from "@/lib/dashboard/dateRange";

export const revalidate = 0;

interface PageProps {
  searchParams: {
    range?: string;
    start?: string;
    end?: string;
    clientIds?: string;
    campaignIds?: string;
  };
}

export default async function DashboardPage({ searchParams }: PageProps) {
  const session = await getRequiredSession();
  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { accountId: true },
  });

  const accountId = user?.accountId ?? "";

  const account = accountId
    ? await db.account.findUnique({ where: { id: accountId }, select: { email: true } })
    : null;
  const isDemo = account?.email === "demo@formly.io";
  const dateRange = parseDateRangeParams(searchParams);
  const periodKey = getPeriodKey(dateRange);
  const rangeLabel = formatRangeLabel(dateRange);

  // Parse client/campaign filter params
  const currentClientIds = searchParams.clientIds?.split(",").filter(Boolean) ?? [];
  const currentCampaignIds = searchParams.campaignIds?.split(",").filter(Boolean) ?? [];

  // Effective campaign IDs for data fetching:
  // - campaignIds param present → use directly
  // - only clientIds → resolve to those clients' campaigns
  // - neither → undefined (no filter)
  let effectiveCampaignIds: string[] | undefined;
  if (currentCampaignIds.length > 0) {
    effectiveCampaignIds = currentCampaignIds;
  } else if (currentClientIds.length > 0 && accountId) {
    const clientCampaigns = await db.campaign.findMany({
      where: {
        accountId,
        status: { not: "ARCHIVED" },
        metaConnection: { groupId: { in: currentClientIds } },
      },
      select: { id: true },
    });
    effectiveCampaignIds = clientCampaigns.map((c) => c.id);
  }

  const [routing, revenue, capiHealth, campaignPerf, outOfArea, allClients, allCampaigns] =
    await Promise.all([
      accountId
        ? fetchRoutingMetrics(accountId, dateRange, effectiveCampaignIds)
        : Promise.resolve({ totalLeads: 0, bookedLeads: 0, soldJobs: 0, bookingRate: 0 }),
      accountId
        ? fetchRevenueMetrics(accountId, dateRange, effectiveCampaignIds)
        : Promise.resolve({ totalRevenueThisMonth: 0, avgJobValue: 0, bookingRateThisMonth: 0, purchaseEvents30Days: 0 }),
      accountId ? fetchCAPIHealth(accountId, dateRange, effectiveCampaignIds) : Promise.resolve([]),
      accountId ? fetchCampaignPerformance(accountId, dateRange, effectiveCampaignIds) : Promise.resolve([]),
      accountId ? fetchOutOfAreaMetrics(accountId, dateRange, effectiveCampaignIds) : Promise.resolve({ outOfAreaThisMonth: 0, outOfAreaPct: 0 }),
      accountId ? fetchClientList(accountId) : Promise.resolve([]),
      accountId ? fetchCampaignList(accountId) : Promise.resolve([]),
    ]);

  return (
    <div className="space-y-8 p-8">
      {/* Branded header strip */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-[#0F4C8F] to-[#1a5fad] px-6 py-4">
        <FormlyPattern color="#ffffff" opacity={0.06} spacing={36} />
        <div className="relative">
          <h1 className="text-base font-semibold text-white">Dashboard</h1>
          <p className="text-xs text-blue-200 mt-0.5">Real-time lead routing and CAPI performance</p>
        </div>
      </div>

      {/* Filter bar: date range + client + campaign */}
      <Suspense fallback={null}>
        <DashboardFilters
          currentPreset={dateRange.preset}
          currentStart={dateRange.startStr}
          currentEnd={dateRange.endStr}
          currentClientIds={currentClientIds}
          currentCampaignIds={currentCampaignIds}
          clients={allClients}
          campaigns={allCampaigns}
        />
      </Suspense>

      {/* Connection health warning */}
      <ConnectionHealthBanner />

      {/* Routing metrics */}
      <MetricsCards metrics={routing} outOfArea={outOfArea} />

      {/* Revenue metrics */}
      <RevenueCards metrics={revenue} />

      {/* Lead map */}
      <DashboardLive />

      {/* CAPI signal health */}
      <CAPISignalHealth rows={capiHealth} />

      {/* Campaign performance */}
      <CampaignPerformanceTable
        rows={campaignPerf}
        periodKey={periodKey}
        rangeLabel={rangeLabel}
        isDemo={isDemo}
      />
    </div>
  );
}
