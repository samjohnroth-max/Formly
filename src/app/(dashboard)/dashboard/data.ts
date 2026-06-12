import { db } from "@/lib/db";
import { haversineDistance } from "@/lib/geo";

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
  leadsThisMonth: number;
  bookedJobs: number;
  bookingRate: number;
  totalRevenue: number;
  avgJobValue: number;
  capiEventsSent: number;
  revenueTrend: number[]; // 7 days oldest→newest
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

export async function fetchRoutingMetrics(accountId: string): Promise<RoutingMetrics> {
  const [leadsToday, successToday, leadsThirty, successThirty, routingTimes] =
    await Promise.all([
      db.lead.count({ where: { accountId, createdAt: { gte: todayStart() } } }),
      db.lead.count({ where: { accountId, routingStatus: "SUCCESS", createdAt: { gte: todayStart() } } }),
      db.lead.count({ where: { accountId, createdAt: { gte: daysAgo(30) } } }),
      db.lead.count({ where: { accountId, routingStatus: "SUCCESS", createdAt: { gte: daysAgo(30) } } }),
      db.lead.findMany({
        where: { accountId, routingStatus: "SUCCESS", createdAt: { gte: daysAgo(30) } },
        select: { createdAt: true, updatedAt: true },
      }),
    ]);

  const successRate = leadsThirty > 0 ? Math.round((successThirty / leadsThirty) * 100) : 0;
  const avgMs =
    routingTimes.length > 0
      ? routingTimes.reduce((s, l) => s + (l.updatedAt.getTime() - l.createdAt.getTime()), 0) /
        routingTimes.length
      : 0;

  return { leadsToday, successToday, successRate, avgRoutingSec: Math.round(avgMs / 1000) };
}

export async function fetchRevenueMetrics(accountId: string): Promise<RevenueMetrics> {
  const ms = monthStart();
  const ago30 = daysAgo(30);

  const [invoicedLeads, allLeadsMonth, purchaseEvents30Days] = await Promise.all([
    db.lead.findMany({
      where: { accountId, invoiceValue: { not: null, gt: 0 }, createdAt: { gte: ms } },
      select: { invoiceValue: true },
    }),
    db.lead.findMany({
      where: { accountId, createdAt: { gte: ms } },
      select: { stJobId: true },
    }),
    db.cAPIEvent.count({
      where: { eventName: "Purchase", status: "SENT", createdAt: { gte: ago30 }, lead: { accountId } },
    }),
  ]);

  const totalRevenueThisMonth = invoicedLeads.reduce((s, l) => s + (l.invoiceValue ?? 0), 0);
  const avgJobValue = invoicedLeads.length > 0 ? totalRevenueThisMonth / invoicedLeads.length : 0;
  const booked = allLeadsMonth.filter((l) => l.stJobId).length;
  const bookingRateThisMonth = allLeadsMonth.length > 0 ? Math.round((booked / allLeadsMonth.length) * 100) : 0;

  return { totalRevenueThisMonth, avgJobValue, bookingRateThisMonth, purchaseEvents30Days };
}

export async function fetchCAPIHealth(accountId: string): Promise<CAPIHealthRow[]> {
  const ago30 = daysAgo(30);

  const [campaigns, events] = await Promise.all([
    db.campaign.findMany({
      where: { accountId, status: { not: "ARCHIVED" } },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
    db.cAPIEvent.findMany({
      where: { status: "SENT", createdAt: { gte: ago30 }, lead: { accountId } },
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

export async function fetchCampaignPerformance(accountId: string): Promise<CampaignPerfRow[]> {
  const ms = monthStart();
  const ago7 = daysAgo(7);

  const [campaigns, leadsMonth, capiEvents] = await Promise.all([
    db.campaign.findMany({
      where: { accountId, status: { not: "ARCHIVED" } },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
    db.lead.findMany({
      where: { accountId, createdAt: { gte: ms } },
      select: { campaignId: true, stJobId: true, invoiceValue: true, createdAt: true },
    }),
    db.cAPIEvent.findMany({
      where: { status: "SENT", createdAt: { gte: ms }, lead: { accountId } },
      select: { lead: { select: { campaignId: true } } },
    }),
  ]);

  // 7-day revenue leads for sparklines
  const revenueLeads7d = leadsMonth.filter(
    (l) => l.invoiceValue && l.invoiceValue > 0 && l.createdAt >= ago7
  );

  return campaigns.map((c) => {
    const leads = leadsMonth.filter((l) => l.campaignId === c.id);
    const booked = leads.filter((l) => l.stJobId).length;
    const invoiced = leads.filter((l) => l.invoiceValue && l.invoiceValue > 0);
    const totalRevenue = invoiced.reduce((s, l) => s + (l.invoiceValue ?? 0), 0);
    const avgJobValue = invoiced.length > 0 ? totalRevenue / invoiced.length : 0;
    const bookingRate = leads.length > 0 ? Math.round((booked / leads.length) * 100) : 0;
    const capiEventsSent = capiEvents.filter((e) => e.lead.campaignId === c.id).length;

    // 7-day revenue trend
    const now = new Date();
    const revenueTrend = Array.from({ length: 7 }, (_, i) => {
      const day = new Date(now.getTime() - (6 - i) * 24 * 60 * 60 * 1000);
      const ds = new Date(day.getFullYear(), day.getMonth(), day.getDate());
      const de = new Date(ds.getTime() + 86400_000);
      return revenueLeads7d
        .filter((l) => l.campaignId === c.id && l.createdAt >= ds && l.createdAt < de)
        .reduce((s, l) => s + (l.invoiceValue ?? 0), 0);
    });

    return {
      id: c.id,
      name: c.name,
      leadsThisMonth: leads.length,
      bookedJobs: booked,
      bookingRate,
      totalRevenue,
      avgJobValue,
      capiEventsSent,
      revenueTrend,
    };
  });
}

export async function fetchOutOfAreaMetrics(accountId: string): Promise<OutOfAreaMetrics> {
  const ms = monthStart();

  const [serviceArea, leadsThisMonth] = await Promise.all([
    db.serviceArea.findUnique({ where: { accountId } }),
    db.lead.findMany({
      where: { accountId, createdAt: { gte: ms } },
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
  // Last 3 calendar months including current
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
