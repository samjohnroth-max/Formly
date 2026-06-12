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
    if (sortKey !== col) return <ChevronDown className="inline size-3 text-gray-300" />;
    return dir === "asc" ? (
      <ChevronUp className="inline size-3 text-gray-500" />
    ) : (
      <ChevronDown className="inline size-3 text-gray-500" />
    );
  }

  function Th({ col, label, right }: { col: SortKey; label: string; right?: boolean }) {
    return (
      <th
        className={`cursor-pointer select-none py-3 text-xs font-medium uppercase tracking-wide text-gray-500 hover:text-gray-700 ${right ? "px-3 text-right" : "pl-5 pr-3 text-left"}`}
        onClick={() => toggle(col)}
      >
        {label} <SortIcon col={col} />
      </th>
    );
  }

  return (
    <div>
      <h2 className="mb-3 text-sm font-semibold text-gray-700">Campaign performance — this month</h2>
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        {rows.length === 0 ? (
          <div className="flex h-24 items-center justify-center text-sm text-gray-400">No campaigns yet</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <Th col="name" label="Campaign" />
                  <Th col="leadsThisMonth" label="Leads" right />
                  <Th col="bookingRate" label="Booked %" right />
                  <Th col="totalRevenue" label="Revenue" right />
                  <Th col="avgJobValue" label="Avg job" right />
                  <Th col="capiEventsSent" label="CAPI events" right />
                  <th className="py-3 pl-3 pr-5 text-right text-xs font-medium uppercase tracking-wide text-gray-500">
                    7d trend
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {sorted.map((r) => (
                  <tr key={r.id} className="hover:bg-gray-50/50">
                    <td className="py-3 pl-5 pr-3 font-medium text-gray-900">{r.name}</td>
                    <td className="px-3 py-3 text-right tabular-nums text-gray-700">{r.leadsThisMonth}</td>
                    <td className="px-3 py-3 text-right tabular-nums">
                      <span
                        className={
                          r.bookingRate >= 50
                            ? "text-emerald-600 font-semibold"
                            : r.bookingRate >= 25
                              ? "text-amber-600"
                              : "text-gray-400"
                        }
                      >
                        {r.bookingRate}%
                      </span>
                    </td>
                    <td className="px-3 py-3 text-right tabular-nums text-gray-700">
                      {fmtCurrency(r.totalRevenue)}
                    </td>
                    <td className="px-3 py-3 text-right tabular-nums text-gray-500">
                      {r.avgJobValue > 0 ? fmtCurrency(r.avgJobValue) : "—"}
                    </td>
                    <td className="px-3 py-3 text-right tabular-nums text-gray-500">{r.capiEventsSent}</td>
                    <td className="py-3 pl-3 pr-5 text-right">
                      <Sparkline
                        values={r.revenueTrend}
                        width={72}
                        height={22}
                        className="text-[#0F4C8F] ml-auto"
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
