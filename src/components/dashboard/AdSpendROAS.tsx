"use client";

import { useState, useTransition } from "react";
import { Sparkline } from "./Sparkline";
import type { AdSpendRow } from "@/app/(dashboard)/dashboard/data";

function fmt(n: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);
}

function fmtRoas(r: number | null) {
  if (r === null) return "—";
  return `${r.toFixed(2)}x`;
}

export function AdSpendROAS({ initialRows }: { initialRows: AdSpendRow[] }) {
  const [rows, setRows] = useState(initialRows);
  const [editing, setEditing] = useState<{ campaignId: string; month: string; value: string } | null>(null);
  const [pending, startTransition] = useTransition();
  const [saveError, setSaveError] = useState<string | null>(null);

  async function handleSave() {
    if (!editing) return;
    setSaveError(null);
    const spend = parseFloat(editing.value);
    if (isNaN(spend) || spend < 0) {
      setSaveError("Enter a valid spend amount");
      return;
    }
    startTransition(async () => {
      const res = await fetch("/api/dashboard/ad-spend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ campaignId: editing.campaignId, month: editing.month, spend }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setSaveError(data.error ?? "Failed to save");
        return;
      }
      setRows((prev) =>
        prev.map((row) => {
          if (row.campaignId !== editing.campaignId) return row;
          return {
            ...row,
            months: row.months.map((m) => {
              if (m.month !== editing.month) return m;
              return { ...m, spend, roas: spend > 0 ? m.revenue / spend : null };
            }),
          };
        })
      );
      setEditing(null);
    });
  }

  if (rows.length === 0) return null;

  return (
    <div>
      <h2 className="mb-3 text-sm font-semibold text-gray-700">Ad spend &amp; ROAS — last 3 months</h2>
      <div className="space-y-4">
        {rows.map((row) => {
          const roasTrend = row.months.map((m) => m.roas ?? 0);
          return (
            <div key={row.campaignId} className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
              <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50 px-5 py-3">
                <span className="text-sm font-semibold text-gray-800">{row.campaignName}</span>
                <Sparkline values={roasTrend} width={60} height={18} className="text-[#0F4C8F]" />
              </div>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="py-2 pl-5 pr-3 text-left text-xs font-medium uppercase tracking-wide text-gray-400">
                      Month
                    </th>
                    <th className="px-3 py-2 text-right text-xs font-medium uppercase tracking-wide text-gray-400">
                      Ad spend
                    </th>
                    <th className="px-3 py-2 text-right text-xs font-medium uppercase tracking-wide text-gray-400">
                      Revenue
                    </th>
                    <th className="py-2 pl-3 pr-5 text-right text-xs font-medium uppercase tracking-wide text-gray-400">
                      ROAS
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {row.months.map((m) => {
                    const isEditing =
                      editing?.campaignId === row.campaignId && editing.month === m.month;
                    const [yr, mo] = m.month.split("-").map(Number);
                    const label = new Date(yr, mo - 1, 1).toLocaleString("en-US", {
                      month: "short",
                      year: "numeric",
                    });
                    return (
                      <tr key={m.month} className="hover:bg-gray-50/50">
                        <td className="py-3 pl-5 pr-3 text-gray-700">{label}</td>
                        <td className="px-3 py-3 text-right">
                          {isEditing ? (
                            <div className="inline-flex items-center gap-1">
                              <span className="text-gray-500">$</span>
                              <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={editing.value}
                                onChange={(e) => setEditing({ ...editing, value: e.target.value })}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") handleSave();
                                  if (e.key === "Escape") setEditing(null);
                                }}
                                autoFocus
                                className="w-24 rounded border border-gray-300 px-2 py-0.5 text-right text-sm focus:border-[#0F4C8F] focus:outline-none focus:ring-1 focus:ring-[#0F4C8F]"
                              />
                              <button
                                onClick={handleSave}
                                disabled={pending}
                                className="rounded bg-[#0F4C8F] px-2 py-0.5 text-xs text-white hover:bg-[#0D3F7A] disabled:opacity-50"
                              >
                                Save
                              </button>
                              <button
                                onClick={() => { setEditing(null); setSaveError(null); }}
                                className="rounded border border-gray-200 px-2 py-0.5 text-xs text-gray-500 hover:bg-gray-50"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() =>
                                setEditing({
                                  campaignId: row.campaignId,
                                  month: m.month,
                                  value: m.spend > 0 ? String(m.spend) : "",
                                })
                              }
                              className="tabular-nums text-gray-700 underline decoration-dashed underline-offset-2 hover:text-[#0F4C8F]"
                            >
                              {m.spend > 0 ? fmt(m.spend) : <span className="text-gray-300">+ add spend</span>}
                            </button>
                          )}
                        </td>
                        <td className="px-3 py-3 text-right tabular-nums text-gray-700">
                          {fmt(m.revenue)}
                        </td>
                        <td className="py-3 pl-3 pr-5 text-right tabular-nums">
                          <span
                            className={
                              m.roas === null
                                ? "text-gray-300"
                                : m.roas >= 3
                                  ? "font-semibold text-emerald-600"
                                  : m.roas >= 1
                                    ? "text-amber-600"
                                    : "text-red-500"
                            }
                          >
                            {fmtRoas(m.roas)}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {saveError && editing?.campaignId === row.campaignId && (
                <p className="border-t border-gray-100 px-5 py-2 text-xs text-red-500">{saveError}</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
