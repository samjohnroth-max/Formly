import { Users, Briefcase, DollarSign, TrendingUp, MapPin } from "lucide-react";
import type { RoutingMetrics, OutOfAreaMetrics } from "@/app/(dashboard)/dashboard/data";

interface Props {
  metrics: RoutingMetrics;
  outOfArea?: OutOfAreaMetrics;
}

export function MetricsCards({ metrics, outOfArea }: Props) {
  const cards = [
    {
      label: "Leads",
      value: metrics.totalLeads.toLocaleString(),
      icon: Users,
      color: "text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-500/10",
    },
    {
      label: "Booked",
      value: metrics.bookedLeads.toLocaleString(),
      icon: Briefcase,
      color: "text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-500/10",
    },
    {
      label: "Sold jobs",
      value: metrics.soldJobs.toLocaleString(),
      icon: DollarSign,
      color: "text-purple-600 bg-purple-50 dark:text-purple-400 dark:bg-purple-500/10",
    },
    {
      label: "Booking rate",
      value: `${metrics.bookingRate}%`,
      icon: TrendingUp,
      color: "text-amber-600 bg-amber-50 dark:text-amber-400 dark:bg-amber-500/10",
    },
  ];

  return (
    <div className={`grid gap-4 ${outOfArea !== undefined ? "grid-cols-5" : "grid-cols-4"}`}>
      {cards.map(({ label, value, icon: Icon, color }) => (
        <div
          key={label}
          className="rounded-xl border border-gray-200 bg-white dark:bg-[#1A1D27] dark:border-[#2A2D3E] p-5 shadow-sm"
        >
          <div className={`mb-3 inline-flex rounded-lg p-2 ${color}`}>
            <Icon className="size-4" />
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-[#F0F4FF]">{value}</p>
          <p className="mt-0.5 text-xs text-gray-500 dark:text-[#8B90A0]">{label}</p>
        </div>
      ))}

      {outOfArea !== undefined && (
        <div className="rounded-xl border border-gray-200 bg-white dark:bg-[#1A1D27] dark:border-[#2A2D3E] p-5 shadow-sm">
          <div className="mb-3 inline-flex rounded-lg p-2 text-rose-600 bg-rose-50 dark:text-rose-400 dark:bg-rose-500/10">
            <MapPin className="size-4" />
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-[#F0F4FF]">
            {outOfArea.outOfAreaThisMonth}
          </p>
          <p className="mt-0.5 text-xs text-gray-500 dark:text-[#8B90A0]">
            Out of area
            {outOfArea.outOfAreaPct > 0 && (
              <span className="ml-1 text-rose-500 dark:text-rose-400">({outOfArea.outOfAreaPct}%)</span>
            )}
          </p>
        </div>
      )}
    </div>
  );
}
