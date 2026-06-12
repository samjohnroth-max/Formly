"use client";

import { useState, useTransition } from "react";
import { ChevronUp, ChevronDown, Download, Info, CheckCircle2 } from "lucide-react";
import { Sparkline } from "./Sparkline";
import type { CampaignPerfRow } from "@/app/(dashboard)/dashboard/data";
import { cn } from "@/lib/utils";

type SortKey =
  | "name"
  | "leadsThisMonth"
  | "bookedJobs"
  | "bookingRate"
  | "totalRevenue"
  | "avgJobValue"
  | "adSpend"
  | "roas"
  | "capiEventsSent";

function fmtCurrency(n: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);
}

function fmtRoas(r: number | null) {
  if (r === null) return "—";
  return `${r.toFixed(2)}x`;
}

function bookingRateClass(rate: number) {
  if (rate >= 50) return "text-emerald-600 dark:text-emerald-400 font-semibold";
  if (rate >= 25) return "text-amber-600 dark:text-amber-400";
  return "text-red-500 dark:text-red-400";
}

function roasClass(roas: number | null) {
  if (roas === null) return "text-gray-300 dark:text-[#2A2D3E]";
  if (roas >= 3) return "text-emerald-600 dark:text-emerald-400 font-semibold";
  if (roas >= 1) return "text-amber-600 dark:text-amber-400";
  return "text-red-500 dark:text-red-400";
}

function generateCSV(rows: CampaignPerfRow[], rangeLabel: string): string {
  const lines: string[] = [];

  lines.push("Formly Campaign Performance Report");
  lines.push(`Period: ${rangeLabel}`);
  lines.push("");
  lines.push("Campaign Summary");
  lines.push("Campaign,Leads,Booked Jobs,Booking Rate,Revenue,Avg Job Value,Ad Spend,ROAS,CAPI Events,Status");

  for (const r of rows) {
    lines.push([
      `"${r.name}"`,
      r.leadsThisMonth,
      r.bookedJobs,
      `${r.bookingRate}%`,
      r.totalRevenue.toFixed(2),
      r.avgJobValue.toFixed(2),
      r.adSpend.toFixed(2),
      r.roas !== null ? `${r.roas.toFixed(2)}x` : "-",
      r.capiEventsSent,
      r.campaignStatus,
    ].join(","));
  }

  // Totals row
  const totalLeads = rows.reduce((s, r) => s + r.leadsThisMonth, 0);
  const totalBooked = rows.reduce((s, r) => s + r.bookedJobs, 0);
  const totalRevenue = rows.reduce((s, r) => s + r.totalRevenue, 0);
  const totalSpend = rows.reduce((s, r) => s + r.adSpend, 0);
  const blendedRoas = totalSpend > 0 ? totalRevenue / totalSpend : null;
  lines.push([
    "TOTAL",
    totalLeads,
    totalBooked,
    totalLeads > 0 ? `${Math.round((totalBooked / totalLeads) * 100)}%` : "0%",
    totalRevenue.toFixed(2),
    totalBooked > 0 ? (totalRevenue / totalBooked).toFixed(2) : "0.00",
    totalSpend.toFixed(2),
    blendedRoas !== null ? `${blendedRoas.toFixed(2)}x` : "-",
    rows.reduce((s, r) => s + r.capiEventsSent, 0),
    "",
  ].join(","));

  lines.push("");
  lines.push("Daily Lead Breakdown");
  lines.push("Campaign,Date,Leads");

  for (const r of rows) {
    for (const day of r.dailyLeads) {
      lines.push([`"${r.name}"`, day.date, day.count].join(","));
    }
  }

  return lines.join("\n");
}

interface Props {
  rows: CampaignPerfRow[];
  periodKey: string;   // "YYYY-MM" for ad spend saving
  rangeLabel: string;  // human-readable for CSV filename + display
}

export function CampaignPerformanceTable({ rows, periodKey, rangeLabel }: Props) {
  const [sortKey, setSortKey] = useState<SortKey>("totalRevenue");
  const [dir, setDir] = useState<"asc" | "desc">("desc");
  const [editing, setEditing] = useState<{ campaignId: string; value: string } | null>(null);
  const [saved, setSaved] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [localSpend, setLocalSpend] = useState<Record<string, number>>({});
  const [, startTransition] = useTransition();

  function toggle(key: SortKey) {
    if (sortKey === key) {
      setDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setDir("desc");
    }
  }

  // Merge localSpend overrides (optimistic updates after saving)
  const displayRows = rows.map((r) => {
    const spend = localSpend[r.id] !== undefined ? localSpend[r.id] : r.adSpend;
    const roas = spend > 0 ? r.totalRevenue / spend : null;
    return { ...r, adSpend: spend, roas };
  });

  const sorted = [...displayRows].sort((a, b) => {
    const av = a[sortKey];
    const bv = b[sortKey];
    if (av === null && bv === null) return 0;
    if (av === null) return 1;
    if (bv === null) return -1;
    const cmp = typeof av === "string" ? av.localeCompare(bv as string) : (av as number) - (bv as number);
    return dir === "asc" ? cmp : -cmp;
  });

  // Totals
  const totalLeads = displayRows.reduce((s, r) => s + r.leadsThisMonth, 0);
  const totalBooked = displayRows.reduce((s, r) => s + r.bookedJobs, 0);
  const totalRevenue = displayRows.reduce((s, r) => s + r.totalRevenue, 0);
  const totalSpend = displayRows.reduce((s, r) => s + r.adSpend, 0);
  const totalCapi = displayRows.reduce((s, r) => s + r.capiEventsSent, 0);
  const blendedRoas = totalSpend > 0 ? totalRevenue / totalSpend : null;
  const blendedBooking = totalLeads > 0 ? Math.round((totalBooked / totalLeads) * 100) : 0;
  const totalAvgJob = totalBooked > 0 ? totalRevenue / totalBooked : 0;

  async function saveSpend(campaignId: string, valueStr: string) {
    setSaveError(null);
    const spend = parseFloat(valueStr);
    if (isNaN(spend) || spend < 0) {
      setSaveError("Enter a valid amount");
      return;
    }
    startTransition(async () => {
      const res = await fetch("/api/dashboard/ad-spend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ campaignId, month: periodKey, spend }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setSaveError(data.error ?? "Failed to save");
        return;
      }
      setLocalSpend((prev) => ({ ...prev, [campaignId]: spend }));
      setEditing(null);
      setSaved(campaignId);
      setTimeout(() => setSaved(null), 2000);
    });
  }

  function handleExport() {
    const csv = generateCSV(displayRows, rangeLabel);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `formly-campaign-report-${periodKey}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function SortIcon({ col }: { col: SortKey }) {
    if (sortKey !== col) return <ChevronDown className="inline size-3 text-gray-300 dark:text-[#2A2D3E]" />;
    return dir === "asc"
      ? <ChevronUp className="inline size-3 text-gray-500 dark:text-[#8B90A0]" />
      : <ChevronDown className="inline size-3 text-gray-500 dark:text-[#8B90A0]" />;
  }

  function Th({ col, label, right, tooltip }: { col: SortKey; label: string; right?: boolean; tooltip?: string }) {
    return (
      <th
        className={cn(
          "cursor-pointer select-none py-3 text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-[#8B90A0] hover:text-gray-700 dark:hover:text-[#F0F4FF]",
          right ? "px-3 text-right" : "pl-5 pr-3 text-left"
        )}
        onClick={() => toggle(col)}
      >
        <span className="inline-flex items-center gap-1">
          {label}
          {tooltip && (
            <span className="group relative" onClick={(e) => e.stopPropagation()}>
              <Info className="size-3 text-gray-400 dark:text-[#8B90A0] cursor-help" />
              <span className="pointer-events-none absolute bottom-5 left-1/2 -translate-x-1/2 z-20 hidden w-64 rounded-lg border border-gray-200 dark:border-[#2A2D3E] bg-white dark:bg-[#1A1D27] p-3 text-xs leading-relaxed text-gray-600 dark:text-[#8B90A0] shadow-lg group-hover:block normal-case font-normal tracking-normal">
                {tooltip}
              </span>
            </span>
          )}
          <SortIcon col={col} />
        </span>
      </th>
    );
  }

  if (rows.length === 0) {
    return (
      <div>
        <h2 className="mb-3 text-sm font-semibold text-gray-700 dark:text-[#8B90A0]">Campaign performance</h2>
        <div className="flex h-24 items-center justify-center rounded-xl border border-gray-200 dark:border-[#2A2D3E] bg-white dark:bg-[#1A1D27] text-sm text-gray-400 dark:text-[#8B90A0]">
          No campaigns yet
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "Total leads", value: totalLeads.toLocaleString() },
          { label: "Total revenue", value: fmtCurrency(totalRevenue) },
          { label: "Total ad spend", value: fmtCurrency(totalSpend) },
          { label: "Blended ROAS", value: fmtRoas(blendedRoas) },
        ].map(({ label, value }) => (
          <div key={label} className="rounded-xl border border-gray-200 dark:border-[#2A2D3E] bg-white dark:bg-[#1A1D27] px-4 py-3 shadow-sm">
            <p className="text-lg font-bold text-gray-900 dark:text-[#F0F4FF]">{value}</p>
            <p className="text-xs text-gray-500 dark:text-[#8B90A0] mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Table header */}
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-gray-700 dark:text-[#8B90A0]">
          Campaign performance — {rangeLabel.toLowerCase()}
        </h2>
        <button
          onClick={handleExport}
          className="flex items-center gap-1.5 rounded-lg border border-gray-200 dark:border-[#2A2D3E] bg-white dark:bg-[#1A1D27] px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-[#8B90A0] hover:bg-gray-50 dark:hover:bg-white/5 transition-colors shadow-sm"
        >
          <Download className="size-3.5" />
          Export report
        </button>
      </div>

      {saveError && (
        <p className="text-xs text-red-500 px-1">{saveError}</p>
      )}

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-[#2A2D3E] bg-white dark:bg-[#1A1D27] shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[900px]">
            <thead>
              <tr className="border-b border-gray-100 dark:border-[#2A2D3E] bg-gray-50 dark:bg-white/5">
                <Th col="name" label="Campaign" />
                <Th col="leadsThisMonth" label="Leads" right />
                <Th col="bookedJobs" label="Booked" right />
                <Th col="bookingRate" label="Booked %" right />
                <Th col="totalRevenue" label="Revenue" right />
                <Th col="avgJobValue" label="Avg job" right />
                <Th
                  col="adSpend"
                  label="Ad spend"
                  right
                  tooltip="Enter your Meta ad spend for this period to calculate ROAS. Click any cell in this column to edit."
                />
                <Th
                  col="roas"
                  label="ROAS"
                  right
                  tooltip="Return on Ad Spend = Revenue ÷ Ad Spend. A 3x ROAS means for every $1 spent on ads you generated $3 in booked revenue. Formly calculates this using actual invoice amounts from ServiceTitan."
                />
                <Th col="capiEventsSent" label="CAPI" right />
                <th className="py-3 pl-3 pr-5 text-right text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-[#8B90A0]">
                  7d trend
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-[#2A2D3E]">
              {sorted.map((r) => {
                const isEditing = editing?.campaignId === r.id;
                return (
                  <tr key={r.id} className="hover:bg-gray-50/50 dark:hover:bg-white/5">
                    {/* Campaign name + sparkline */}
                    <td className="py-3 pl-5 pr-3">
                      <div className="flex items-center gap-3">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-[#F0F4FF] leading-tight">{r.name}</p>
                          <span className={cn(
                            "inline-block mt-0.5 text-[10px] font-medium px-1.5 py-0.5 rounded-full",
                            r.campaignStatus === "ACTIVE"
                              ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400"
                              : "bg-gray-100 text-gray-500 dark:bg-white/10 dark:text-[#8B90A0]"
                          )}>
                            {r.campaignStatus.toLowerCase()}
                          </span>
                        </div>
                        <Sparkline
                          values={r.leadTrend}
                          width={48}
                          height={18}
                          className="text-[#0F4C8F] dark:text-[#3B7DD8] shrink-0"
                        />
                      </div>
                    </td>
                    <td className="px-3 py-3 text-right tabular-nums text-gray-700 dark:text-[#F0F4FF]">
                      {r.leadsThisMonth}
                    </td>
                    <td className="px-3 py-3 text-right tabular-nums text-gray-700 dark:text-[#F0F4FF]">
                      {r.bookedJobs}
                    </td>
                    <td className="px-3 py-3 text-right tabular-nums">
                      <span className={bookingRateClass(r.bookingRate)}>{r.bookingRate}%</span>
                    </td>
                    <td className="px-3 py-3 text-right tabular-nums text-gray-700 dark:text-[#F0F4FF]">
                      {fmtCurrency(r.totalRevenue)}
                    </td>
                    <td className="px-3 py-3 text-right tabular-nums text-gray-500 dark:text-[#8B90A0]">
                      {r.avgJobValue > 0 ? fmtCurrency(r.avgJobValue) : "—"}
                    </td>
                    {/* Ad spend — inline editable */}
                    <td className="px-3 py-3 text-right">
                      {isEditing ? (
                        <div className="inline-flex items-center gap-1 justify-end">
                          <span className="text-gray-400 text-xs">$</span>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={editing.value}
                            onChange={(e) => setEditing({ ...editing, value: e.target.value })}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") saveSpend(r.id, editing.value);
                              if (e.key === "Escape") { setEditing(null); setSaveError(null); }
                            }}
                            onBlur={() => saveSpend(r.id, editing.value)}
                            autoFocus
                            placeholder="0.00"
                            className="w-24 rounded border border-gray-300 dark:border-[#2A2D3E] bg-white dark:bg-[#0F1117] px-2 py-0.5 text-right text-xs text-gray-900 dark:text-[#F0F4FF] focus:border-[#0F4C8F] focus:outline-none focus:ring-1 focus:ring-[#0F4C8F]"
                          />
                        </div>
                      ) : (
                        <button
                          onClick={() => setEditing({ campaignId: r.id, value: r.adSpend > 0 ? r.adSpend.toFixed(2) : "" })}
                          className="inline-flex items-center gap-1 tabular-nums hover:text-[#0F4C8F] dark:hover:text-[#3B7DD8] transition-colors"
                          title="Click to edit ad spend"
                        >
                          {saved === r.id && (
                            <CheckCircle2 className="size-3 text-emerald-500 shrink-0" />
                          )}
                          {r.adSpend > 0
                            ? <span className="text-gray-700 dark:text-[#F0F4FF] underline decoration-dashed underline-offset-2">{fmtCurrency(r.adSpend)}</span>
                            : <span className="text-gray-300 dark:text-[#2A2D3E] text-xs">Enter spend</span>
                          }
                        </button>
                      )}
                    </td>
                    <td className="px-3 py-3 text-right tabular-nums">
                      <span className={roasClass(r.roas)}>{fmtRoas(r.roas)}</span>
                    </td>
                    <td className="px-3 py-3 text-right tabular-nums text-gray-500 dark:text-[#8B90A0]">
                      {r.capiEventsSent}
                    </td>
                    {/* 7-day revenue trend sparkline */}
                    <td className="py-3 pl-3 pr-5 text-right">
                      <Sparkline
                        values={r.revenueTrend}
                        width={72}
                        height={22}
                        className="text-[#0F4C8F] dark:text-[#3B7DD8] ml-auto"
                      />
                    </td>
                  </tr>
                );
              })}

              {/* Totals row */}
              <tr className="border-t-2 border-gray-200 dark:border-[#2A2D3E] bg-gray-50/80 dark:bg-white/5 font-semibold">
                <td className="py-3 pl-5 pr-3 text-xs font-bold uppercase tracking-wide text-gray-500 dark:text-[#8B90A0]">
                  Totals
                </td>
                <td className="px-3 py-3 text-right tabular-nums text-gray-900 dark:text-[#F0F4FF]">{totalLeads}</td>
                <td className="px-3 py-3 text-right tabular-nums text-gray-900 dark:text-[#F0F4FF]">{totalBooked}</td>
                <td className="px-3 py-3 text-right tabular-nums">
                  <span className={bookingRateClass(blendedBooking)}>{blendedBooking}%</span>
                </td>
                <td className="px-3 py-3 text-right tabular-nums text-gray-900 dark:text-[#F0F4FF]">{fmtCurrency(totalRevenue)}</td>
                <td className="px-3 py-3 text-right tabular-nums text-gray-500 dark:text-[#8B90A0]">
                  {totalBooked > 0 ? fmtCurrency(totalAvgJob) : "—"}
                </td>
                <td className="px-3 py-3 text-right tabular-nums text-gray-900 dark:text-[#F0F4FF]">{fmtCurrency(totalSpend)}</td>
                <td className="px-3 py-3 text-right tabular-nums">
                  <span className={roasClass(blendedRoas)}>{fmtRoas(blendedRoas)}</span>
                </td>
                <td className="px-3 py-3 text-right tabular-nums text-gray-500 dark:text-[#8B90A0]">{totalCapi}</td>
                <td className="py-3 pl-3 pr-5" />
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
