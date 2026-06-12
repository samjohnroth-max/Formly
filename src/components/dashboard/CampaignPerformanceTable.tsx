"use client";

import { useState } from "react";
import { ChevronUp, ChevronDown } from "lucide-react";
import { Sparkline } from "./Sparkline";
import type { CampaignPerfRow } from "@/app/(dashboard)/dashboard/data";

type SortKey = keyof Pick<
  CampaignPerfRow,
  "name" | "leadsThisMonth" | "bookingRate" | "totalRevenue" | "avgJobValue" | "capiEventsSent"
>;

function fmtCurrency(n: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);
}

export function CampaignPerformanceTable({ rows }: { rows: CampaignPerfRow[] }) {
  const [sortKey, setSortKey] = useState<SortKey>("totalRevenue");
  const [dir, setDir] = useState<"asc" | "desc">("desc");

  function toggle(key: SortKey) {
    if (sortKey === key) {
      setDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setDir("desc");
    }
  }

  const sorted = [...rows].sort((a, b) => {
    const av = a[sortKey];
    const bv = b[sortKey];
    const cmp = typeof av === "string" ? av.localeCompare(bv as string) : (av as number) - (bv as number);
    return dir === "asc" ? cmp : -cmp;
  });

  function SortIcon({ col }: { col: SortKey }) {
    if (sortKey !== col) return <ChevronDown className="inline size-3 text-gray-300 dark:text-[#2A2D3E]" />;
    return dir === "asc" ? (
      <ChevronUp className="inline size-3 text-gray-500 dark:text-[#8B90A0]" />
    ) : (
      <ChevronDown className="inline size-3 text-gray-500 dark:text-[#8B90A0]" />
    );
  }

  function Th({ col, label, right }: { col: SortKey; label: string; right?: boolean }) {
    return (
      <th
        className={`cursor-pointer select-none py-3 text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-[#8B90A0] hover:text-gray-700 dark:hover:text-[#F0F4FF] ${right ? "px-3 text-right" : "pl-5 pr-3 text-left"}`}
        onClick={() => toggle(col)}
      >
        {label} <SortIcon col={col} />
      </th>
    );
  }

  return (
    <div>
      <h2 className="mb-3 text-sm font-semibold text-gray-700 dark:text-[#8B90A0]">Campaign performance — this month</h2>
      <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-[#2A2D3E] bg-white dark:bg-[#1A1D27] shadow-sm">
        {rows.length === 0 ? (
          <div className="flex h-24 items-center justify-center text-sm text-gray-400 dark:text-[#8B90A0]">No campaigns yet</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 dark:border-[#2A2D3E] bg-gray-50 dark:bg-white/5">
                  <Th col="name" label="Campaign" />
                  <Th col="leadsThisMonth" label="Leads" right />
                  <Th col="bookingRate" label="Booked %" right />
                  <Th col="totalRevenue" label="Revenue" right />
                  <Th col="avgJobValue" label="Avg job" right />
                  <Th col="capiEventsSent" label="CAPI events" right />
                  <th className="py-3 pl-3 pr-5 text-right text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-[#8B90A0]">
                    7d trend
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-[#2A2D3E]">
                {sorted.map((r) => (
                  <tr key={r.id} className="hover:bg-gray-50/50 dark:hover:bg-white/5">
                    <td className="py-3 pl-5 pr-3 font-medium text-gray-900 dark:text-[#F0F4FF]">{r.name}</td>
                    <td className="px-3 py-3 text-right tabular-nums text-gray-700 dark:text-[#F0F4FF]">{r.leadsThisMonth}</td>
                    <td className="px-3 py-3 text-right tabular-nums">
                      <span
                        className={
                          r.bookingRate >= 50
                            ? "text-emerald-600 dark:text-emerald-400 font-semibold"
                            : r.bookingRate >= 25
                              ? "text-amber-600 dark:text-amber-400"
                              : "text-gray-400 dark:text-[#8B90A0]"
                        }
                      >
                        {r.bookingRate}%
                      </span>
                    </td>
                    <td className="px-3 py-3 text-right tabular-nums text-gray-700 dark:text-[#F0F4FF]">
                      {fmtCurrency(r.totalRevenue)}
                    </td>
                    <td className="px-3 py-3 text-right tabular-nums text-gray-500 dark:text-[#8B90A0]">
                      {r.avgJobValue > 0 ? fmtCurrency(r.avgJobValue) : "—"}
                    </td>
                    <td className="px-3 py-3 text-right tabular-nums text-gray-500 dark:text-[#8B90A0]">{r.capiEventsSent}</td>
                    <td className="py-3 pl-3 pr-5 text-right">
                      <Sparkline
                        values={r.revenueTrend}
                        width={72}
                        height={22}
                        className="text-[#0F4C8F] dark:text-[#3B7DD8] ml-auto"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
