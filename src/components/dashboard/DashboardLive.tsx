"use client";

import { useState, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
import { LeadFeed } from "./LeadFeed";
import { RefreshCw } from "lucide-react";

// Mapbox needs SSR disabled
const LeadMap = dynamic(
  () => import("./LeadMap").then((m) => m.LeadMap),
  { ssr: false, loading: () => <div className="h-[360px] animate-pulse rounded-xl bg-gray-100" /> }
);

interface FeedLead {
  id: string;
  firstName: string | null;
  lastName: string | null;
  createdAt: string;
  routingStatus: string;
  lat: number | null;
  lng: number | null;
  stJobId: string | null;
  stLeadId: string | null;
  campaign: { name: string; destinationType: string } | null;
}

const POLL_MS = 30_000;

export function DashboardLive() {
  const [leads, setLeads] = useState<FeedLead[]>([]);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [loading, setLoading] = useState(true);

  const fetchLeads = useCallback(async () => {
    try {
      const res = await fetch("/api/dashboard/feed");
      if (!res.ok) return;
      const data = await res.json();
      setLeads(data.leads ?? []);
      setLastUpdated(new Date());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLeads();
    const interval = setInterval(fetchLeads, POLL_MS);
    return () => clearInterval(interval);
  }, [fetchLeads]);

  return (
    <div className="space-y-6">
      {/* Section header with last updated */}
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-gray-700">
          Lead activity
        </h2>
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <RefreshCw className="size-3" />
          Updated {lastUpdated.toLocaleTimeString()} · refreshes every 30s
        </div>
      </div>

      {loading ? (
        <div className="h-[360px] animate-pulse rounded-xl bg-gray-100" />
      ) : (
        <LeadMap leads={leads} />
      )}

      <div>
        <h2 className="mb-3 text-sm font-semibold text-gray-700">
          Last {leads.length} leads
        </h2>
        {loading ? (
          <div className="h-40 animate-pulse rounded-xl bg-gray-100" />
        ) : (
          <LeadFeed leads={leads} />
        )}
      </div>
    </div>
  );
}
