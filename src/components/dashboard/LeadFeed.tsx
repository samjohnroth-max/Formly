"use client";

import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import type { RoutingStatus, DestinationType } from "@/types/db";

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

function leadName(l: FeedLead): string {
  return [l.firstName, l.lastName].filter(Boolean).join(" ") || "Unknown";
}

const STATUS_CLASSES: Record<string, string> = {
  SUCCESS: "bg-green-100 text-green-700",
  FAILED: "bg-red-100 text-red-700",
  PROCESSING: "bg-blue-100 text-blue-700",
  RETRY: "bg-amber-100 text-amber-700",
  PENDING: "bg-gray-100 text-gray-600",
};

const DEST_CLASSES: Record<string, string> = {
  BOOKING: "bg-indigo-100 text-indigo-700",
  LEAD: "bg-cyan-100 text-cyan-700",
  FOLLOWUP: "bg-orange-100 text-orange-700",
};

export function LeadFeed({ leads }: { leads: FeedLead[] }) {
  if (leads.length === 0) {
    return (
      <div className="flex h-40 items-center justify-center rounded-xl border border-dashed border-gray-200">
        <p className="text-sm text-gray-400">No leads yet</p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-gray-100 rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
      {leads.map((lead) => (
        <Link
          key={lead.id}
          href={`/leads/${lead.id}`}
          className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
        >
          {/* Status dot */}
          <span
            className={`size-2 shrink-0 rounded-full ${
              lead.routingStatus === "SUCCESS"
                ? "bg-green-500"
                : lead.routingStatus === "FAILED"
                ? "bg-red-500"
                : lead.routingStatus === "RETRY"
                ? "bg-amber-400"
                : "bg-gray-300"
            }`}
          />

          {/* Name + campaign */}
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-gray-900 truncate">
              {leadName(lead)}
            </p>
            {lead.campaign && (
              <p className="text-xs text-gray-400 truncate">
                {lead.campaign.name}
              </p>
            )}
          </div>

          {/* Badges */}
          <div className="flex shrink-0 items-center gap-1.5">
            {lead.campaign && (
              <span
                className={`rounded-full px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
                  DEST_CLASSES[lead.campaign.destinationType as DestinationType] ??
                  "bg-gray-100 text-gray-600"
                }`}
              >
                {lead.campaign.destinationType}
              </span>
            )}
            <span
              className={`rounded-full px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
                STATUS_CLASSES[lead.routingStatus as RoutingStatus] ??
                "bg-gray-100 text-gray-600"
              }`}
            >
              {lead.routingStatus}
            </span>
          </div>

          {/* Time */}
          <span className="shrink-0 text-xs text-gray-400">
            {formatDistanceToNow(new Date(lead.createdAt), { addSuffix: true })}
          </span>
        </Link>
      ))}
    </div>
  );
}
