import { formatDistanceToNow } from "date-fns";
import type { CAPIHealthRow } from "@/app/(dashboard)/dashboard/data";

const STATUS_CONFIG = {
  HEALTHY: { label: "Healthy", cls: "bg-green-100 text-green-700" },
  LOW_VOLUME: { label: "Low Volume", cls: "bg-amber-100 text-amber-700" },
  NO_SIGNAL: { label: "No Signal", cls: "bg-red-100 text-red-700" },
};

export function CAPISignalHealth({ rows }: { rows: CAPIHealthRow[] }) {
  return (
    <div>
      <h2 className="mb-3 text-sm font-semibold text-gray-700">CAPI signal health — last 30 days</h2>
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        {rows.length === 0 ? (
          <div className="flex h-24 items-center justify-center text-sm text-gray-400">
            No active campaigns
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="py-3 pl-5 pr-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                  Campaign
                </th>
                <th className="px-3 py-3 text-right text-xs font-medium uppercase tracking-wide text-gray-500">
                  Lead events
                </th>
                <th className="px-3 py-3 text-right text-xs font-medium uppercase tracking-wide text-gray-500">
                  Schedule events
                </th>
                <th className="px-3 py-3 text-right text-xs font-medium uppercase tracking-wide text-gray-500">
                  Purchase events
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                  Last event
                </th>
                <th className="py-3 pl-3 pr-5 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {rows.map((r) => {
                const cfg = STATUS_CONFIG[r.status];
                return (
                  <tr key={r.id} className="hover:bg-gray-50/50">
                    <td className="py-3 pl-5 pr-3 font-medium text-gray-900">{r.name}</td>
                    <td className="px-3 py-3 text-right tabular-nums text-gray-700">
                      {r.leadEvents.toLocaleString()}
                    </td>
                    <td className="px-3 py-3 text-right tabular-nums text-gray-400">
                      {r.scheduleEvents.toLocaleString()}
                    </td>
                    <td className="px-3 py-3 text-right tabular-nums text-gray-700">
                      {r.purchaseEvents.toLocaleString()}
                    </td>
                    <td className="px-3 py-3 text-gray-400 text-xs">
                      {r.lastEventAt
                        ? formatDistanceToNow(new Date(r.lastEventAt), { addSuffix: true })
                        : "—"}
                    </td>
                    <td className="py-3 pl-3 pr-5">
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${cfg.cls}`}>
                        {cfg.label}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
