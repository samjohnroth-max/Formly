import { db } from "@/lib/db";
import { haversineDistance } from "@/lib/geo";
import type { DateRange } from "@/lib/dashboard/dateRange";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface OutOfAreaMetrics {
  outOfAreaThisMonth: number;
  outOfAreaPct: number;
}

export interface RoutingMetrics {
  leadsToday: number;
  successToday: number;
  successRate: number;
  avgRoutingSec: number;
}

export interface RevenueMetrics {
  totalRevenueThisMonth: number;
  avgJobValue: number;
  bookingRateThisMonth: number;
  purchaseEvents30Days: number;
}

export interface CAPIHealthRow {
  id: string;
  name: string;
  leadEvents: number;
  scheduleEvents: number;
  purchaseEvents: number;
  lastEventAt: Date | null;
  status: "HEALTHY" | "LOW_VOLUME" | "NO_SIGNAL";
}

export interface CampaignPerfRow {
  id: string;
  name: string;
  campaignStatus: string;
  leadsThisMonth: number;
  bookedJobs: number;
  bookingRate: number;
  totalRevenue: number;
  avgJobValue: number;
  capiEventsSent: number;
  adSpend: number;
  roas: number | null;
  leadTrend: number[]; // 7-day lead volume sparkline, oldest→newest
  revenueTrend: number[]; // 7-day revenue sparkline, oldest→newest
  dailyLeads: Array<{ date: string; count: number }>; // for export
}

export interface AdSpendMonth {
  month: string; // "YYYY-MM"
  spend: number;
  revenue: number;
  roas: number | null;
}

export interface AdSpendRow {
  campaignId: string;
  campaignName: string;
  months: AdSpendMonth[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function monthStart(d = new Date()) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}
function todayStart(d = new Date()) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}
function daysAgo(n: number) {
  return new Date(Date.now() - n * 24 * 60 * 60 * 1000);
}
function toMonthKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

// ─── Fetchers ─────────────────────────────────────────────────────────────────

export async function fetchRoutingMetrics(
  accountId: string,
  range?: DateRange
): Promise<RoutingMetrics> {
  const rangeStart = range?.start ?? daysAgo(30);
  const rangeEnd = range?.end;

  const rangeFilter = {
    gte: rangeStart,
    ...(rangeEnd ? { lte: rangeEnd } : {}),
  };

  const [leadsToday, successToday, leadsRange, successRange, routingTimes] =
    await Promise.all([
      db.lead.count({ where: { accountId, createdAt: { gte: todayStart() } } }),
      db.lead.count({ where: { accountId, routingStatus: "SUCCESS", createdAt: { gte: todayStart() } } }),
      db.lead.count({ where: { accountId, createdAt: rangeFilter } }),
      db.lead.count({ where: { accountId, routingStatus: "SUCCESS", createdAt: rangeFilter } }),
      db.lead.findMany({
        where: { accountId, routingStatus: "SUCCESS", createdAt: rangeFilter },
        select: { createdAt: true, updatedAt: true },
      }),
    ]);

  const successRate = leadsRange > 0 ? Math.round((successRange / leadsRange) * 100) : 0;
  const avgMs =
    routingTimes.length > 0
      ? routingTimes.reduce((s, l) => s + (l.updatedAt.getTime() - l.createdAt.getTime()), 0) /
        routingTimes.length
      : 0;

  return { leadsToday, successToday, successRate, avgRoutingSec: Math.round(avgMs / 1000) };
}

export async function fetchRevenueMetrics(
  accountId: string,
  range?: DateRange
): Promise<RevenueMetrics> {
  const rangeStart = range?.start ?? monthStart();
  const rangeEnd = range?.end;
  const ago30 = daysAgo(30);

  const rangeFilter = {
    gte: rangeStart,
    ...(rangeEnd ? { lte: rangeEnd } : {}),
  };

  const [invoicedLeads, allLeadsRange, purchaseEvents30Days] = await Promise.all([
    db.lead.findMany({
      where: { accountId, invoiceValue: { not: null, gt: 0 }, createdAt: rangeFilter },
      select: { invoiceValue: true },
    }),
    db.lead.findMany({
      where: { accountId, createdAt: rangeFilter },
      select: { stJobId: true },
    }),
    db.cAPIEvent.count({
      where: { eventName: "Purchase", status: "SENT", createdAt: { gte: ago30 }, lead: { accountId } },
    }),
  ]);

  const totalRevenueThisMonth = invoicedLeads.reduce((s, l) => s + (l.invoiceValue ?? 0), 0);
  const avgJobValue = invoicedLeads.length > 0 ? totalRevenueThisMonth / invoicedLeads.length : 0;
  const booked = allLeadsRange.filter((l) => l.stJobId).length;
  const bookingRateThisMonth =
    allLeadsRange.length > 0 ? Math.round((booked / allLeadsRange.length) * 100) : 0;

  return { totalRevenueThisMonth, avgJobValue, bookingRateThisMonth, purchaseEvents30Days };
}

export async function fetchCAPIHealth(
  accountId: string,
  range?: DateRange
): Promise<CAPIHealthRow[]> {
  const rangeStart = range?.start ?? daysAgo(30);
  const rangeEnd = range?.end;

  const rangeFilter = {
    gte: rangeStart,
    ...(rangeEnd ? { lte: rangeEnd } : {}),
  };

  const [campaigns, events] = await Promise.all([
    db.campaign.findMany({
      where: { accountId, status: { not: "ARCHIVED" } },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
    db.cAPIEvent.findMany({
      where: { status: "SENT", createdAt: rangeFilter, lead: { accountId } },
      select: { eventName: true, createdAt: true, lead: { select: { campaignId: true } } },
    }),
  ]);

  return campaigns.map((c) => {
    const campaignEvents = events.filter((e) => e.lead.campaignId === c.id);
    const leadEvents = campaignEvents.filter((e) => e.eventName === "Lead").length;
    const scheduleEvents = campaignEvents.filter((e) => e.eventName === "Schedule").length;
    const purchaseEvents = campaignEvents.filter((e) => e.eventName === "Purchase").length;
    const sorted = campaignEvents.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    const lastEventAt = sorted[0]?.createdAt ?? null;

    const status: CAPIHealthRow["status"] =
      leadEvents >= 10 ? "HEALTHY" : leadEvents > 0 ? "LOW_VOLUME" : "NO_SIGNAL";

    return { id: c.id, name: c.name, leadEvents, scheduleEvents, purchaseEvents, lastEventAt, status };
  });
}

export async function fetchCampaignPerformance(
  accountId: string,
  range?: DateRange
): Promise<CampaignPerfRow[]> {
  const rangeStart = range?.start ?? monthStart();
  const rangeEnd = range?.end ?? new Date();
  const ago7 = daysAgo(7);

  const rangeFilter = { gte: rangeStart, lte: rangeEnd };

  const [campaigns, leadsRange, capiEvents, adSpends] = await Promise.all([
    db.campaign.findMany({
      where: { accountId, status: { not: "ARCHIVED" } },
      select: { id: true, name: true, status: true },
      orderBy: { name: "asc" },
    }),
    db.lead.findMany({
      where: { accountId, createdAt: rangeFilter },
      select: { campaignId: true, stJobId: true, invoiceValue: true, createdAt: true },
    }),
    db.cAPIEvent.findMany({
      where: { status: "SENT", createdAt: rangeFilter, lead: { accountId } },
      select: { lead: { select: { campaignId: true } } },
    }),
    db.monthlyAdSpend.findMany({
      where: { campaign: { accountId }, month: { gte: rangeStart, lte: rangeEnd } },
    }),
  ]);

  const now = new Date();

  return campaigns.map((c) => {
    const leads = leadsRange.filter((l) => l.campaignId === c.id);
    const booked = leads.filter((l) => l.stJobId).length;
    const invoiced = leads.filter((l) => l.invoiceValue && l.invoiceValue > 0);
    const totalRevenue = invoiced.reduce((s, l) => s + (l.invoiceValue ?? 0), 0);
    const avgJobValue = invoiced.length > 0 ? totalRevenue / invoiced.length : 0;
    const bookingRate = leads.length > 0 ? Math.round((booked / leads.length) * 100) : 0;
    const capiEventsSent = capiEvents.filter((e) => e.lead.campaignId === c.id).length;

    // Ad spend & ROAS
    const campaignSpends = adSpends.filter((s) => s.campaignId === c.id);
    const adSpend = campaignSpends.reduce((sum, s) => sum + s.spend, 0);
    const roas = adSpend > 0 ? totalRevenue / adSpend : null;

    // 7-day lead sparkline (always last 7 days, shows momentum)
    const leadTrend = Array.from({ length: 7 }, (_, i) => {
      const day = new Date(now.getTime() - (6 - i) * 86400_000);
      const ds = new Date(day.getFullYear(), day.getMonth(), day.getDate());
      const de = new Date(ds.getTime() + 86400_000);
      return leads.filter((l) => l.createdAt >= ds && l.createdAt < de).length;
    });

    // 7-day revenue sparkline
    const revenueLeads7d = leads.filter((l) => l.invoiceValue && l.invoiceValue > 0 && l.createdAt >= ago7);
    const revenueTrend = Array.from({ length: 7 }, (_, i) => {
      const day = new Date(now.getTime() - (6 - i) * 86400_000);
      const ds = new Date(day.getFullYear(), day.getMonth(), day.getDate());
      const de = new Date(ds.getTime() + 86400_000);
      return revenueLeads7d
        .filter((l) => l.createdAt >= ds && l.createdAt < de)
        .reduce((s, l) => s + (l.invoiceValue ?? 0), 0);
    });

    // Daily leads for CSV export
    const dailyMap = new Map<string, number>();
    for (const lead of leads) {
      const d = lead.createdAt;
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      dailyMap.set(key, (dailyMap.get(key) ?? 0) + 1);
    }
    const dailyLeads = Array.from(dailyMap.entries())
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));

    return {
      id: c.id,
      name: c.name,
      campaignStatus: c.status,
      leadsThisMonth: leads.length,
      bookedJobs: booked,
      bookingRate,
      totalRevenue,
      avgJobValue,
      capiEventsSent,
      adSpend,
      roas,
      leadTrend,
      revenueTrend,
      dailyLeads,
    };
  });
}

export async function fetchOutOfAreaMetrics(
  accountId: string,
  range?: DateRange
): Promise<OutOfAreaMetrics> {
  const rangeStart = range?.start ?? monthStart();
  const rangeEnd = range?.end;

  const rangeFilter = {
    gte: rangeStart,
    ...(rangeEnd ? { lte: rangeEnd } : {}),
  };

  const [serviceArea, leadsThisMonth] = await Promise.all([
    db.serviceArea.findUnique({ where: { accountId } }),
    db.lead.findMany({
      where: { accountId, createdAt: rangeFilter },
      select: { lat: true, lng: true },
    }),
  ]);

  if (!serviceArea) return { outOfAreaThisMonth: 0, outOfAreaPct: 0 };

  const geoLeads = leadsThisMonth.filter((l) => l.lat != null && l.lng != null);
  const outOfArea = geoLeads.filter(
    (l) => haversineDistance(serviceArea.lat, serviceArea.lng, l.lat!, l.lng!) > serviceArea.radiusMiles
  );

  const pct = geoLeads.length > 0 ? Math.round((outOfArea.length / geoLeads.length) * 100) : 0;
  return { outOfAreaThisMonth: outOfArea.length, outOfAreaPct: pct };
}

export async function fetchAdSpend(accountId: string): Promise<AdSpendRow[]> {
  // Ad spend is month-based and not affected by the date range filter
  const now = new Date();
  const months = Array.from({ length: 3 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (2 - i), 1);
    return d;
  });
  const oldestMonth = months[0];

  const [campaigns, spends, revenueLeads] = await Promise.all([
    db.campaign.findMany({
      where: { accountId, status: { not: "ARCHIVED" } },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
    db.monthlyAdSpend.findMany({
      where: { campaign: { accountId }, month: { gte: oldestMonth } },
    }),
    db.lead.findMany({
      where: { accountId, invoiceValue: { not: null, gt: 0 }, createdAt: { gte: oldestMonth } },
      select: { campaignId: true, invoiceValue: true, createdAt: true },
    }),
  ]);

  return campaigns.map((c) => {
    const monthRows: AdSpendMonth[] = months.map((m) => {
      const key = toMonthKey(m);
      const nextM = new Date(m.getFullYear(), m.getMonth() + 1, 1);
      const spendRow = spends.find(
        (s) => s.campaignId === c.id && s.month >= m && s.month < nextM
      );
      const revenue = revenueLeads
        .filter((l) => l.campaignId === c.id && l.createdAt >= m && l.createdAt < nextM)
        .reduce((s, l) => s + (l.invoiceValue ?? 0), 0);
      const spend = spendRow?.spend ?? 0;
      return {
        month: key,
        spend,
        revenue,
        roas: spend > 0 ? revenue / spend : null,
      };
    });
    return { campaignId: c.id, campaignName: c.name, months: monthRows };
  });
}
