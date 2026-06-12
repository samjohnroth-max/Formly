import { cn } from "@/lib/utils";
import type { RoutingStatus } from "@/types/db";

const CONFIG: Record<RoutingStatus, { label: string; className: string }> = {
  PENDING:    { label: "Pending",    className: "bg-gray-100 text-gray-600 ring-gray-500/20" },
  PROCESSING: { label: "Processing", className: "bg-blue-50 text-blue-700 ring-blue-600/20 animate-pulse" },
  SUCCESS:    { label: "Success",    className: "bg-green-50 text-green-700 ring-green-600/20" },
  FAILED:     { label: "Failed",     className: "bg-red-50 text-red-700 ring-red-600/20" },
  RETRY:      { label: "Retrying",   className: "bg-orange-50 text-orange-700 ring-orange-600/20" },
};

interface Props {
  status: RoutingStatus;
  className?: string;
}

export function RoutingStatusBadge({ status, className }: Props) {
  const cfg = CONFIG[status] ?? CONFIG.PENDING;
  return (
    <span className={cn(
      "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset",
      cfg.className,
      className
    )}>
      {cfg.label}
    </span>
  );
}
