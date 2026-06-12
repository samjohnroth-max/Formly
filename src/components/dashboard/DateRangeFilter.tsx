"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CalendarDays, X, ChevronDown } from "lucide-react";
import { PRESETS, DEFAULT_PRESET, computeDateRange, isValidPreset } from "@/lib/dashboard/dateRange";
import type { RangePreset } from "@/lib/dashboard/dateRange";
import { cn } from "@/lib/utils";

const LS_KEY = "formly-dash-range";

interface Stored {
  preset: RangePreset;
  startStr?: string;
  endStr?: string;
}

function loadStored(): Stored | null {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return null;
    const v = JSON.parse(raw) as Stored;
    if (!isValidPreset(v.preset)) return null;
    return v;
  } catch {
    return null;
  }
}

function saveStored(v: Stored) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(v));
  } catch {
    // ignore
  }
}

interface Props {
  /** Current values from server (parsed from URL params). */
  currentPreset: RangePreset;
  currentStart?: string;
  currentEnd?: string;
}

export function DateRangeFilter({ currentPreset, currentStart, currentEnd }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showCustom, setShowCustom] = useState(false);
  const [fromDate, setFromDate] = useState(currentStart ?? "");
  const [toDate, setToDate] = useState(currentEnd ?? "");
  const dropdownRef = useRef<HTMLDivElement>(null);

  // On first mount, if URL has no range param, restore from localStorage
  useEffect(() => {
    if (searchParams.get("range")) return;
    const stored = loadStored();
    if (!stored) return;
    apply(stored.preset, stored.startStr, stored.endStr);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Close custom dropdown when clicking outside
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowCustom(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  function apply(preset: RangePreset, startStr?: string, endStr?: string) {
    saveStored({ preset, startStr, endStr });
    const params = new URLSearchParams(searchParams.toString());
    params.set("range", preset);
    if (preset === "custom" && startStr) {
      params.set("start", startStr);
    } else {
      params.delete("start");
    }
    if (preset === "custom" && endStr) {
      params.set("end", endStr);
    } else {
      params.delete("end");
    }
    router.replace(`?${params.toString()}`);
  }

  function applyCustom() {
    if (!fromDate || !toDate) return;
    apply("custom", fromDate, toDate);
    setShowCustom(false);
  }

  function clearCustom() {
    setFromDate("");
    setToDate("");
    apply(DEFAULT_PRESET);
  }

  const isCustomActive = currentPreset === "custom";

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-[#8B90A0]">
        <CalendarDays className="size-3.5" />
        <span className="font-medium">Period:</span>
      </div>

      {/* Preset buttons */}
      <div className="flex items-center gap-1 flex-wrap">
        {PRESETS.map((p) => (
          <button
            key={p.id}
            onClick={() => apply(p.id)}
            className={cn(
              "rounded-lg px-3 py-1 text-xs font-medium transition-colors",
              currentPreset === p.id && !isCustomActive
                ? "bg-[#0F4C8F] text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-white/10 dark:text-[#8B90A0] dark:hover:bg-white/15"
            )}
          >
            {p.label}
          </button>
        ))}

        {/* Custom range */}
        <div className="relative" ref={dropdownRef}>
          {isCustomActive ? (
            /* Active custom range pill */
            <div className="flex items-center gap-1 rounded-lg bg-[#0F4C8F] px-3 py-1 text-xs font-medium text-white">
              <button
                onClick={() => { setFromDate(currentStart ?? ""); setToDate(currentEnd ?? ""); setShowCustom(true); }}
                className="hover:opacity-80"
              >
                {formatCustomLabel(currentStart, currentEnd)}
              </button>
              <button onClick={clearCustom} className="ml-1 hover:opacity-80">
                <X className="size-3" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowCustom((v) => !v)}
              className="flex items-center gap-1 rounded-lg bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600 hover:bg-gray-200 dark:bg-white/10 dark:text-[#8B90A0] dark:hover:bg-white/15 transition-colors"
            >
              Custom range
              <ChevronDown className={cn("size-3 transition-transform", showCustom && "rotate-180")} />
            </button>
          )}

          {/* Custom range dropdown */}
          {showCustom && (
            <div className="absolute left-0 top-full z-30 mt-1.5 w-64 rounded-xl border border-gray-200 dark:border-[#2A2D3E] bg-white dark:bg-[#1A1D27] p-4 shadow-lg">
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="block text-xs font-medium text-gray-500 dark:text-[#8B90A0] mb-1">
                    From
                  </label>
                  <input
                    type="date"
                    value={fromDate}
                    max={toDate || undefined}
                    onChange={(e) => setFromDate(e.target.value)}
                    className="w-full rounded-lg border border-gray-200 dark:border-[#2A2D3E] bg-white dark:bg-[#0F1117] px-2.5 py-1.5 text-xs text-gray-900 dark:text-[#F0F4FF] focus:border-[#0F4C8F] focus:outline-none focus:ring-1 focus:ring-[#0F4C8F] dark:focus:border-[#3B7DD8] dark:focus:ring-[#3B7DD8] transition-shadow"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-medium text-gray-500 dark:text-[#8B90A0] mb-1">
                    To
                  </label>
                  <input
                    type="date"
                    value={toDate}
                    min={fromDate || undefined}
                    onChange={(e) => setToDate(e.target.value)}
                    className="w-full rounded-lg border border-gray-200 dark:border-[#2A2D3E] bg-white dark:bg-[#0F1117] px-2.5 py-1.5 text-xs text-gray-900 dark:text-[#F0F4FF] focus:border-[#0F4C8F] focus:outline-none focus:ring-1 focus:ring-[#0F4C8F] dark:focus:border-[#3B7DD8] dark:focus:ring-[#3B7DD8] transition-shadow"
                  />
                </div>
              </div>
              <button
                onClick={applyCustom}
                disabled={!fromDate || !toDate}
                className="mt-3 w-full rounded-lg bg-[#0F4C8F] hover:bg-[#0D3F7A] disabled:opacity-40 px-3 py-1.5 text-xs font-semibold text-white transition-colors"
              >
                Apply
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function formatCustomLabel(startStr?: string, endStr?: string): string {
  const fmt = (s: string) => {
    const [y, m, d] = s.split("-").map(Number);
    return new Date(y, m - 1, d).toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };
  if (!startStr && !endStr) return "Custom range";
  if (!endStr) return fmt(startStr!);
  return `${fmt(startStr!)} – ${fmt(endStr)}`;
}
