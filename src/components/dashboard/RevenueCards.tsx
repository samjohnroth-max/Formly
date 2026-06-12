import { DollarSign, Briefcase, TrendingUp, Zap, Info } from "lucide-react";
import type { RevenueMetrics } from "@/app/(dashboard)/dashboard/data";

function fmt(n: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);
}

type SignalTier = "Poor" | "Building" | "Strong" | "Excellent";

function getSignalTier(count: number): SignalTier {
  if (count === 0) return "Poor";
  if (count <= 10) return "Building";
  if (count <= 30) return "Strong";
  return "Excellent";
}

const TIER_STYLE: Record<SignalTier, { pill: string; dot: string; label: string }> = {
  Poor:      { pill: "bg-red-50 text-red-700",     dot: "bg-red-500",    label: "Poor" },
  Building:  { pill: "bg-amber-50 text-amber-700", dot: "bg-amber-400",  label: "Building" },
  Strong:    { pill: "bg-blue-50 text-blue-700",   dot: "bg-blue-500",   label: "Strong" },
  Excellent: { pill: "bg-green-50 text-green-700", dot: "bg-green-500",  label: "Excellent" },
};

const TIER_MESSAGE: Record<SignalTier, string> = {
  Poor:      "No revenue signals sent to Meta yet. Connect ServiceTitan to start building signal.",
  Building:  "Meta is receiving your revenue data. Signal improves as more jobs close.",
  Strong:    "Good signal quality. Meta is learning which leads become paying customers.",
  Excellent: "Strong signal. Meta can now optimize your campaigns for revenue automatically.",
};

const TOOLTIP_TEXT =
  "Meta uses your booking and revenue data to find more high-value customers. The more jobs Formly tracks, the smarter your campaigns become. There is no threshold — improvement is continuous.";

export function RevenueCards({ metrics }: { metrics: RevenueMetrics }) {
  const { totalRevenueThisMonth, avgJobValue, bookingRateThisMonth, purchaseEvents30Days } = metrics;
  const tier = getSignalTier(purchaseEvents30Days);
  const style = TIER_STYLE[tier];

  return (
    <div>
      <h2 className="mb-3 text-sm font-semibold text-gray-700">Revenue overview — this month</h2>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">

        {/* Total revenue */}
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="mb-3 inline-flex rounded-lg p-2 text-emerald-600 bg-emerald-50">
            <DollarSign className="size-4" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{fmt(totalRevenueThisMonth)}</p>
          <p className="mt-0.5 text-xs text-gray-500">Total revenue this month</p>
        </div>

        {/* Avg job value */}
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="mb-3 inline-flex rounded-lg p-2 text-blue-600 bg-blue-50">
            <Briefcase className="size-4" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{fmt(avgJobValue)}</p>
          <p className="mt-0.5 text-xs text-gray-500">Average job value</p>
        </div>

        {/* Booking rate */}
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="mb-3 inline-flex rounded-lg p-2 text-violet-600 bg-violet-50">
            <TrendingUp className="size-4" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{bookingRateThisMonth}%</p>
          <p className="mt-0.5 text-xs text-gray-500">Booking rate this month</p>
        </div>

        {/* Revenue signal strength */}
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <div className="inline-flex rounded-lg p-2 text-amber-600 bg-amber-50">
              <Zap className="size-4" />
            </div>
            {/* CSS-only tooltip — no client JS needed */}
            <div className="group relative">
              <Info className="size-3.5 cursor-help text-gray-400" />
              <div className="pointer-events-none absolute right-0 top-5 z-10 hidden w-60 rounded-lg border border-gray-200 bg-white p-3 text-xs leading-relaxed text-gray-600 shadow-lg group-hover:block">
                {TOOLTIP_TEXT}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${style.pill}`}>
              <span className={`size-1.5 rounded-full ${style.dot}`} />
              {style.label}
            </span>
          </div>

          <p className="mt-1 text-xs font-medium text-gray-700">Revenue signal strength</p>
          <p className="mt-1.5 text-xs leading-relaxed text-gray-500">{TIER_MESSAGE[tier]}</p>
          <p className="mt-3 text-xs tabular-nums text-gray-400">
            {purchaseEvents30Days.toLocaleString()} Purchase event{purchaseEvents30Days !== 1 ? "s" : ""} · last 30 days
          </p>
        </div>

      </div>
    </div>
  );
}
