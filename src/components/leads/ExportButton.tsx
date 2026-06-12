"use client";

import { useRef, useState } from "react";
import { Download, X } from "lucide-react";
import { useSearchParams } from "next/navigation";

interface Props {
  campaignId?: string;
}

export function ExportButton({ campaignId }: Props) {
  const [open, setOpen] = useState(false);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  const searchParams = useSearchParams();
  const statusFilter = searchParams.get("status") ?? "";

  function buildUrl() {
    const params = new URLSearchParams();
    if (campaignId) params.set("campaignId", campaignId);
    if (statusFilter) params.set("status", statusFilter);
    if (from) params.set("from", from);
    if (to) params.set("to", to);
    return `/api/leads/export?${params.toString()}`;
  }

  function download() {
    window.location.href = buildUrl();
    setOpen(false);
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-1.5 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
      >
        <Download className="size-3.5" />
        Export CSV
      </button>

      {open && (
        <div className="absolute right-0 top-full z-20 mt-1 w-64 rounded-lg border border-gray-200 bg-white p-4 shadow-lg">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-xs font-semibold text-gray-700">Date range (optional)</p>
            <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600">
              <X className="size-3.5" />
            </button>
          </div>
          <div className="space-y-2">
            <div>
              <label className="mb-1 block text-xs text-gray-500">From</label>
              <input
                type="date"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                className="w-full rounded border border-gray-200 px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-gray-500">To</label>
              <input
                type="date"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                className="w-full rounded border border-gray-200 px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>
          <button
            onClick={download}
            className="mt-3 w-full rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700"
          >
            Download CSV
          </button>
          <p className="mt-2 text-center text-xs text-gray-400">
            {statusFilter ? `Filtered: ${statusFilter}` : "All statuses"} · All time if no dates set
          </p>
        </div>
      )}
    </div>
  );
}
