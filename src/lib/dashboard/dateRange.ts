// Shared date range utilities for the dashboard filter.
// This module must be importable from both server and client components — no "use client".

export type RangePreset = "today" | "7d" | "30d" | "90d" | "ytd" | "all" | "custom";

export interface DateRange {
  preset: RangePreset;
  start: Date;
  end: Date;
  /** ISO date strings for custom ranges — stored in URL/localStorage */
  startStr?: string;
  endStr?: string;
}

export const PRESETS: { id: RangePreset; label: string }[] = [
  { id: "today", label: "Today" },
  { id: "7d", label: "Last 7 days" },
  { id: "30d", label: "Last 30 days" },
  { id: "90d", label: "Last 90 days" },
  { id: "ytd", label: "This year" },
  { id: "all", label: "All time" },
];

export const DEFAULT_PRESET: RangePreset = "30d";

export function computeDateRange(
  preset: RangePreset,
  startStr?: string,
  endStr?: string
): DateRange {
  const now = new Date();
  const end = endStr ? new Date(endStr + "T23:59:59.999Z") : now;

  switch (preset) {
    case "today": {
      const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      return { preset, start, end: now };
    }
    case "7d":
      return { preset, start: new Date(now.getTime() - 7 * 86400_000), end: now };
    case "30d":
      return { preset, start: new Date(now.getTime() - 30 * 86400_000), end: now };
    case "90d":
      return { preset, start: new Date(now.getTime() - 90 * 86400_000), end: now };
    case "ytd":
      return { preset, start: new Date(now.getFullYear(), 0, 1), end: now };
    case "all":
      return { preset, start: new Date(0), end: now };
    case "custom": {
      const start = startStr ? new Date(startStr + "T00:00:00.000Z") : new Date(now.getTime() - 30 * 86400_000);
      return { preset, start, end, startStr, endStr };
    }
  }
}

/** Parse URL search params into a DateRange. */
export function parseDateRangeParams(params: {
  range?: string;
  start?: string;
  end?: string;
}): DateRange {
  const preset = isValidPreset(params.range) ? params.range : DEFAULT_PRESET;
  return computeDateRange(preset, params.start, params.end);
}

export function isValidPreset(v: unknown): v is RangePreset {
  return typeof v === "string" &&
    ["today", "7d", "30d", "90d", "ytd", "all", "custom"].includes(v);
}

/** Returns YYYY-MM string for the primary month of the range — used for ad spend saving. */
export function getPeriodKey(range: DateRange): string {
  const d = range.start;
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export function formatRangeLabel(range: DateRange): string {
  if (range.preset !== "custom") {
    return PRESETS.find((p) => p.id === range.preset)?.label ?? "Last 30 days";
  }
  const fmt = (d: Date) =>
    d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  return `${fmt(range.start)} – ${fmt(range.end)}`;
}
