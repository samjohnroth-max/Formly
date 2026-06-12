"use client";

import Link from "next/link";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Pause, Play, Archive, Loader2, Download, Settings } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import type { CampaignStatus, DestinationType } from "@/types/db";

interface Props {
  id: string;
  name: string;
  metaFormName: string;
  metaAccountName: string;
  tenantName: string;
  destinationType: DestinationType;
  status: CampaignStatus;
  leadCount: number;
  createdAt: Date;
}

const DESTINATION_BADGE: Record<DestinationType, { label: string; className: string }> = {
  BOOKING: { label: "Booking", className: "bg-blue-50 text-blue-700 ring-blue-600/20" },
  LEAD: { label: "Lead", className: "bg-purple-50 text-purple-700 ring-purple-600/20" },
  FOLLOWUP: { label: "Follow-up", className: "bg-orange-50 text-orange-700 ring-orange-600/20" },
};

const STATUS_BADGE: Record<CampaignStatus, { label: string; className: string }> = {
  ACTIVE: { label: "Active", className: "bg-green-50 text-green-700 ring-green-600/20" },
  PAUSED: { label: "Paused", className: "bg-yellow-50 text-yellow-700 ring-yellow-600/20" },
  ARCHIVED: { label: "Archived", className: "bg-gray-50 text-gray-600 ring-gray-500/20" },
};

const badgeCls = "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset";

export function CampaignRow({
  id, name, metaFormName, metaAccountName, tenantName,
  destinationType, status, leadCount, createdAt,
}: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  async function updateStatus(newStatus: CampaignStatus) {
    startTransition(async () => {
      await fetch(`/api/campaigns/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      router.refresh();
    });
  }

  const dest = DESTINATION_BADGE[destinationType];
  const stat = STATUS_BADGE[status];

  return (
    <tr className="group hover:bg-gray-50">
      <td className="py-3.5 pl-6 pr-3">
        <p className="text-sm font-medium text-gray-900">{name}</p>
        <p className="text-xs text-gray-500 mt-0.5">
          {metaFormName} · <span className="text-gray-400">{metaAccountName}</span>
        </p>
      </td>
      <td className="px-3 py-3.5">
        <span className={cn(badgeCls, dest.className)}>{dest.label}</span>
      </td>
      <td className="px-3 py-3.5 text-sm text-gray-500">{tenantName}</td>
      <td className="px-3 py-3.5">
        <span className={cn(badgeCls, stat.className)}>{stat.label}</span>
      </td>
      <td className="px-3 py-3.5 text-sm text-gray-900 tabular-nums">{leadCount.toLocaleString()}</td>
      <td className="px-3 py-3.5 text-xs text-gray-400">
        {formatDistanceToNow(createdAt, { addSuffix: true })}
      </td>
      <td className="py-3.5 pl-3 pr-6">
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {isPending ? (
            <Loader2 className="size-4 animate-spin text-gray-400" />
          ) : (
            <>
              <Link
                href={`/campaigns/${id}`}
                title="Campaign settings & email sequence"
                className="rounded p-1.5 text-gray-500 hover:text-gray-900"
              >
                <Settings className="size-3.5" />
              </Link>
              <a
                href={`/api/leads/export?campaignId=${id}`}
                title="Export leads as CSV"
                className="rounded p-1.5 text-gray-500 hover:text-gray-900"
                download
              >
                <Download className="size-3.5" />
              </a>
              {status === "ACTIVE" && (
                <ActionButton onClick={() => updateStatus("PAUSED")} title="Pause">
                  <Pause className="size-3.5" />
                </ActionButton>
              )}
              {status === "PAUSED" && (
                <ActionButton onClick={() => updateStatus("ACTIVE")} title="Resume">
                  <Play className="size-3.5" />
                </ActionButton>
              )}
              {status !== "ARCHIVED" && (
                <ActionButton onClick={() => updateStatus("ARCHIVED")} title="Archive" danger>
                  <Archive className="size-3.5" />
                </ActionButton>
              )}
            </>
          )}
        </div>
      </td>
    </tr>
  );
}

function ActionButton({ onClick, title, danger, children }: {
  onClick: () => void;
  title: string;
  danger?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      className={cn(
        "rounded p-1.5 text-gray-500 hover:text-gray-900",
        danger && "hover:bg-red-50 hover:text-red-600"
      )}
    >
      {children}
    </button>
  );
}
