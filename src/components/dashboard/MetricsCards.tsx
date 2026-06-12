import { Zap, CheckCircle, TrendingUp, Clock } from "lucide-react";

interface Metrics {
  leadsToday: number;
  successToday: number;
  successRate: number;
  avgRoutingSec: number;
}

export function MetricsCards({ metrics }: { metrics: Metrics }) {
  const cards = [
    {
      label: "Leads today",
      value: metrics.leadsToday.toLocaleString(),
      icon: Zap,
      color: "text-blue-600 bg-blue-50",
    },
    {
      label: "Routed successfully today",
      value: metrics.successToday.toLocaleString(),
      icon: CheckCircle,
      color: "text-green-600 bg-green-50",
    },
    {
      label: "Success rate (30 days)",
      value: `${metrics.successRate}%`,
      icon: TrendingUp,
      color: "text-purple-600 bg-purple-50",
    },
    {
      label: "Avg routing time",
      value:
        metrics.avgRoutingSec > 0
          ? `${metrics.avgRoutingSec}s`
          : "—",
      icon: Clock,
      color: "text-amber-600 bg-amber-50",
    },
  ];

  return (
    <div className="grid grid-cols-4 gap-4">
      {cards.map(({ label, value, icon: Icon, color }) => (
        <div
          key={label}
          className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
        >
          <div className={`mb-3 inline-flex rounded-lg p-2 ${color}`}>
            <Icon className="size-4" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          <p className="mt-0.5 text-xs text-gray-500">{label}</p>
        </div>
      ))}
    </div>
  );
}
