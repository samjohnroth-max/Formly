import { getRequiredSession } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { MetricsCards } from "@/components/dashboard/MetricsCards";
import { DashboardLive } from "@/components/dashboard/DashboardLive";
import { ConnectionHealthBanner } from "@/components/dashboard/ConnectionHealthBanner";
import { RevenueCards } from "@/components/dashboard/RevenueCards";
import { CAPISignalHealth } from "@/components/dashboard/CAPISignalHealth";
import { CampaignPerformanceTable } from "@/components/dashboard/CampaignPerformanceTable";
import { AdSpendROAS } from "@/components/dashboard/AdSpendROAS";
import {
  fetchRoutingMetrics,
  fetchRevenueMetrics,
  fetchCAPIHealth,
  fetchCampaignPerformance,
  fetchAdSpend,
  fetchOutOfAreaMetrics,
} from "./data";

export const revalidate = 0;

export default async function DashboardPage() {
  const session = await getRequiredSession();
  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { accountId: true },
  });

  const accountId = user?.accountId ?? "";

  const [routing, revenue, capiHealth, campaignPerf, adSpend, outOfArea] = await Promise.all([
    accountId ? fetchRoutingMetrics(accountId) : Promise.resolve({ leadsToday: 0, successToday: 0, successRate: 0, avgRoutingSec: 0 }),
    accountId ? fetchRevenueMetrics(accountId) : Promise.resolve({ totalRevenueThisMonth: 0, avgJobValue: 0, bookingRateThisMonth: 0, purchaseEvents30Days: 0 }),
    accountId ? fetchCAPIHealth(accountId) : Promise.resolve([]),
    accountId ? fetchCampaignPerformance(accountId) : Promise.resolve([]),
    accountId ? fetchAdSpend(accountId) : Promise.resolve([]),
    accountId ? fetchOutOfAreaMetrics(accountId) : Promise.resolve({ outOfAreaThisMonth: 0, outOfAreaPct: 0 }),
  ]);

  return (
    <div className="space-y-8 p-8">
      <h1 className="text-xl font-semibold text-gray-900 dark:text-[#F0F4FF]">Dashboard</h1>

      {/* Connection health warning */}
      <ConnectionHealthBanner />

      {/* Routing metrics */}
      <MetricsCards metrics={routing} outOfArea={outOfArea} />

      {/* Revenue metrics */}
      <RevenueCards metrics={revenue} />

      {/* Live lead feed */}
      <DashboardLive />

      {/* CAPI signal health */}
      <CAPISignalHealth rows={capiHealth} />

      {/* Campaign performance */}
      <CampaignPerformanceTable rows={campaignPerf} />

      {/* Ad spend & ROAS */}
      <AdSpendROAS initialRows={adSpend} />
    </div>
  );
}
