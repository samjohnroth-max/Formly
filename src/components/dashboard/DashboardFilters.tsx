"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CalendarDays, X, ChevronDown, Users, Megaphone, Check } from "lucide-react";
import { PRESETS, DEFAULT_PRESET, isValidPreset } from "@/lib/dashboard/dateRange";
import type { RangePreset } from "@/lib/dashboard/dateRange";
import { cn } from "@/lib/utils";
import type { ClientOption, CampaignOption } from "@/app/(dashboard)/dashboard/data";

// ─── localStorage ─────────────────────────────────────────────────────────────

const LS_KEY = "formly-dash-filters";

interface StoredFilters {
  preset: RangePreset;
  startStr?: string;
  endStr?: string;
  clientIds?: string[];
  campaignIds?: string[];
}

function loadStored(): StoredFilters | null {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return null;
    const v = JSON.parse(raw) as StoredFilters;
    if (!isValidPreset(v.preset)) return null;
    return v;
  } catch {
    return null;
  }
}

function saveStored(v: StoredFilters) {
  try { localStorage.setItem(LS_KEY, JSON.stringify(v)); } catch {}
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface Props {
  currentPreset: RangePreset;
  currentStart?: string;
  currentEnd?: string;
  currentClientIds: string[];
  currentCampaignIds: string[];
  clients: ClientOption[];
  campaigns: CampaignOption[];
}

// ─── Component ────────────────────────────────────────────────────────────────

export function DashboardFilters({
  currentPreset, currentStart, currentEnd,
  currentClientIds, currentCampaignIds,
  clients, campaigns,
}: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Date range state
  const [showCustom, setShowCustom] = useState(false);
  const [fromDate, setFromDate] = useState(currentStart ?? "");
  const [toDate, setToDate] = useState(currentEnd ?? "");
  const customRef = useRef<HTMLDivElement>(null);

  // Client / campaign dropdown state (pending = uncommitted selection inside open dropdown)
  const [showClients, setShowClients] = useState(false);
  const [pendingClientIds, setPendingClientIds] = useState<string[]>(currentClientIds);
  const clientRef = useRef<HTMLDivElement>(null);

  const [showCampaigns, setShowCampaigns] = useState(false);
  const [pendingCampaignIds, setPendingCampaignIds] = useState<string[]>(currentCampaignIds);
  const campaignRef = useRef<HTMLDivElement>(null);

  // Restore from localStorage on first mount if no URL params
  useEffect(() => {
    if (searchParams.get("range") || searchParams.get("clientIds") || searchParams.get("campaignIds")) return;
    const stored = loadStored();
    if (!stored) return;
    navigate(stored.preset, stored.startStr, stored.endStr, stored.clientIds ?? [], stored.campaignIds ?? []);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Close custom dropdown when clicking outside
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (customRef.current && !customRef.current.contains(e.target as Node)) setShowCustom(false);
      if (clientRef.current && !clientRef.current.contains(e.target as Node)) setShowClients(false);
      if (campaignRef.current && !campaignRef.current.contains(e.target as Node)) setShowCampaigns(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  function navigate(preset: RangePreset, startStr?: string, endStr?: string, clientIds: string[] = [], campaignIds: string[] = []) {
    saveStored({ preset, startStr, endStr, clientIds, campaignIds });
    const params = new URLSearchParams(searchParams.toString());
    params.set("range", preset);
    if (preset === "custom" && startStr) params.set("start", startStr); else params.delete("start");
    if (preset === "custom" && endStr) params.set("end", endStr); else params.delete("end");
    if (clientIds.length > 0) params.set("clientIds", clientIds.join(",")); else params.delete("clientIds");
    if (campaignIds.length > 0) params.set("campaignIds", campaignIds.join(",")); else params.delete("campaignIds");
    router.replace(`?${params.toString()}`);
  }

  // ── Date handlers ──────────────────────────────────────────────────────────

  function applyPreset(preset: RangePreset) {
    navigate(preset, undefined, undefined, currentClientIds, currentCampaignIds);
  }

  function applyCustom() {
    if (!fromDate || !toDate) return;
    navigate("custom", fromDate, toDate, currentClientIds, currentCampaignIds);
    setShowCustom(false);
  }

  function clearCustom() {
    setFromDate("");
    setToDate("");
    navigate(DEFAULT_PRESET, undefined, undefined, currentClientIds, currentCampaignIds);
  }

  // ── Client handlers ────────────────────────────────────────────────────────

  function openClients() {
    setPendingClientIds([...currentClientIds]);
    setShowClients(true);
    setShowCampaigns(false);
    setShowCustom(false);
  }

  function applyClients() {
    // When client filter changes, remove campaign selections that no longer belong to selected clients
    const validCampaignIds = pendingClientIds.length > 0
      ? currentCampaignIds.filter((cid) => {
          const camp = campaigns.find((c) => c.id === cid);
          return camp && camp.clientId !== null && pendingClientIds.includes(camp.clientId);
        })
      : currentCampaignIds;
    navigate(currentPreset, currentStart, currentEnd, pendingClientIds, validCampaignIds);
    setShowClients(false);
  }

  function clearClientFilter(clientId: string) {
    const newIds = currentClientIds.filter((id) => id !== clientId);
    // Also remove campaigns for this client
    const validCampaignIds = newIds.length > 0
      ? currentCampaignIds.filter((cid) => {
          const camp = campaigns.find((c) => c.id === cid);
          return camp && camp.clientId !== null && newIds.includes(camp.clientId);
        })
      : currentCampaignIds;
    navigate(currentPreset, currentStart, currentEnd, newIds, validCampaignIds);
  }

  // ── Campaign handlers ──────────────────────────────────────────────────────

  function openCampaigns() {
    setPendingCampaignIds([...currentCampaignIds]);
    setShowCampaigns(true);
    setShowClients(false);
    setShowCustom(false);
  }

  function applyCampaigns() {
    navigate(currentPreset, currentStart, currentEnd, currentClientIds, pendingCampaignIds);
    setShowCampaigns(false);
  }

  function clearCampaignFilter(campaignId: string) {
    navigate(currentPreset, currentStart, currentEnd, currentClientIds, currentCampaignIds.filter((id) => id !== campaignId));
  }

  function clearAll() {
    setPendingClientIds([]);
    setPendingCampaignIds([]);
    navigate(DEFAULT_PRESET);
  }

  // ── Derived ────────────────────────────────────────────────────────────────

  const isCustomActive = currentPreset === "custom";
  const hasClientFilter = currentClientIds.length > 0;
  const hasCampaignFilter = currentCampaignIds.length > 0;
  const hasNonDefaultDate = currentPreset !== DEFAULT_PRESET;
  const hasActiveFilters = hasNonDefaultDate || hasClientFilter || hasCampaignFilter;

  // Available campaigns in dropdown: filter by selected clients if any
  const availableCampaigns = currentClientIds.length > 0
    ? campaigns.filter((c) => c.clientId !== null && currentClientIds.includes(c.clientId))
    : campaigns;

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-3">
        {/* ── Date range ────────────────────────────────────────────────── */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-[#8B90A0]">
            <CalendarDays className="size-3.5" />
            <span className="font-medium">Period:</span>
          </div>
          <div className="flex items-center gap-1 flex-wrap">
            {PRESETS.map((p) => (
              <button
                key={p.id}
                onClick={() => applyPreset(p.id)}
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
            <div className="relative" ref={customRef}>
              {isCustomActive ? (
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

              {showCustom && (
                <div className="absolute left-0 bottom-full z-50 mb-1.5 w-64 rounded-xl border border-gray-200 dark:border-[#2A2D3E] bg-white dark:bg-[#1A1D27] p-4 shadow-lg">
                  <div className="flex gap-3">
                    <div className="flex-1">
                      <label className="block text-xs font-medium text-gray-500 dark:text-[#8B90A0] mb-1">From</label>
                      <input
                        type="date"
                        value={fromDate}
                        max={toDate || undefined}
                        onChange={(e) => setFromDate(e.target.value)}
                        className="w-full rounded-lg border border-gray-200 dark:border-[#2A2D3E] bg-white dark:bg-[#0F1117] px-2.5 py-1.5 text-xs text-gray-900 dark:text-[#F0F4FF] focus:border-[#0F4C8F] focus:outline-none focus:ring-1 focus:ring-[#0F4C8F] transition-shadow"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block text-xs font-medium text-gray-500 dark:text-[#8B90A0] mb-1">To</label>
                      <input
                        type="date"
                        value={toDate}
                        min={fromDate || undefined}
                        onChange={(e) => setToDate(e.target.value)}
                        className="w-full rounded-lg border border-gray-200 dark:border-[#2A2D3E] bg-white dark:bg-[#0F1117] px-2.5 py-1.5 text-xs text-gray-900 dark:text-[#F0F4FF] focus:border-[#0F4C8F] focus:outline-none focus:ring-1 focus:ring-[#0F4C8F] transition-shadow"
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

        {/* Divider */}
        {clients.length > 0 && (
          <div className="h-5 w-px bg-gray-200 dark:bg-[#2A2D3E]" />
        )}

        {/* ── Client filter ─────────────────────────────────────────────── */}
        {clients.length > 0 && (
          <div className="relative" ref={clientRef}>
            <button
              onClick={openClients}
              className={cn(
                "flex items-center gap-1.5 rounded-lg px-3 py-1 text-xs font-medium transition-colors",
                hasClientFilter
                  ? "bg-[#0F4C8F] text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-white/10 dark:text-[#8B90A0] dark:hover:bg-white/15"
              )}
            >
              <Users className="size-3.5" />
              {hasClientFilter
                ? currentClientIds.length === 1
                  ? (clients.find((c) => c.id === currentClientIds[0])?.name ?? "1 client")
                  : `${currentClientIds.length} clients`
                : "All clients"}
              <ChevronDown className={cn("size-3 transition-transform", showClients && "rotate-180")} />
            </button>

            {showClients && (
              <div className="absolute left-0 bottom-full z-50 mb-1.5 w-52 rounded-xl border border-gray-200 dark:border-[#2A2D3E] bg-white dark:bg-[#1A1D27] shadow-lg overflow-hidden">
                <div className="p-1 max-h-56 overflow-y-auto">
                  <button
                    onClick={() => setPendingClientIds([])}
                    className={cn(
                      "flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs text-left transition-colors hover:bg-gray-50 dark:hover:bg-white/5",
                      pendingClientIds.length === 0 && "font-medium text-[#0F4C8F] dark:text-[#3B7DD8]"
                    )}
                  >
                    <Check className={cn("size-3.5 shrink-0", pendingClientIds.length === 0 ? "opacity-100" : "opacity-0")} />
                    All clients
                  </button>
                  {clients.map((client) => (
                    <button
                      key={client.id}
                      onClick={() =>
                        setPendingClientIds((prev) =>
                          prev.includes(client.id) ? prev.filter((id) => id !== client.id) : [...prev, client.id]
                        )
                      }
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs text-left text-gray-700 dark:text-[#F0F4FF] transition-colors hover:bg-gray-50 dark:hover:bg-white/5"
                    >
                      <Check
                        className={cn(
                          "size-3.5 shrink-0 text-[#0F4C8F] dark:text-[#3B7DD8]",
                          pendingClientIds.includes(client.id) ? "opacity-100" : "opacity-0"
                        )}
                      />
                      {client.name}
                    </button>
                  ))}
                </div>
                <div className="border-t border-gray-100 dark:border-[#2A2D3E] p-2">
                  <button
                    onClick={applyClients}
                    className="w-full rounded-lg bg-[#0F4C8F] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#0D3F7A] transition-colors"
                  >
                    Apply
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Campaign filter ───────────────────────────────────────────── */}
        {campaigns.length > 0 && (
          <div className="relative" ref={campaignRef}>
            <button
              onClick={openCampaigns}
              className={cn(
                "flex items-center gap-1.5 rounded-lg px-3 py-1 text-xs font-medium transition-colors",
                hasCampaignFilter
                  ? "bg-[#0F4C8F] text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-white/10 dark:text-[#8B90A0] dark:hover:bg-white/15"
              )}
            >
              <Megaphone className="size-3.5" />
              {hasCampaignFilter
                ? currentCampaignIds.length === 1
                  ? (campaigns.find((c) => c.id === currentCampaignIds[0])?.name ?? "1 campaign")
                  : `${currentCampaignIds.length} campaigns`
                : "All campaigns"}
              <ChevronDown className={cn("size-3 transition-transform", showCampaigns && "rotate-180")} />
            </button>

            {showCampaigns && (
              <div className="absolute left-0 bottom-full z-50 mb-1.5 w-56 rounded-xl border border-gray-200 dark:border-[#2A2D3E] bg-white dark:bg-[#1A1D27] shadow-lg overflow-hidden">
                <div className="p-1 max-h-60 overflow-y-auto">
                  <button
                    onClick={() => setPendingCampaignIds([])}
                    className={cn(
                      "flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs text-left transition-colors hover:bg-gray-50 dark:hover:bg-white/5",
                      pendingCampaignIds.length === 0 && "font-medium text-[#0F4C8F] dark:text-[#3B7DD8]"
                    )}
                  >
                    <Check className={cn("size-3.5 shrink-0", pendingCampaignIds.length === 0 ? "opacity-100" : "opacity-0")} />
                    {currentClientIds.length > 0 ? "All selected clients' campaigns" : "All campaigns"}
                  </button>
                  {availableCampaigns.map((camp) => (
                    <button
                      key={camp.id}
                      onClick={() =>
                        setPendingCampaignIds((prev) =>
                          prev.includes(camp.id) ? prev.filter((id) => id !== camp.id) : [...prev, camp.id]
                        )
                      }
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs text-left text-gray-700 dark:text-[#F0F4FF] transition-colors hover:bg-gray-50 dark:hover:bg-white/5"
                    >
                      <Check
                        className={cn(
                          "size-3.5 shrink-0 text-[#0F4C8F] dark:text-[#3B7DD8]",
                          pendingCampaignIds.includes(camp.id) ? "opacity-100" : "opacity-0"
                        )}
                      />
                      {camp.name}
                    </button>
                  ))}
                </div>
                <div className="border-t border-gray-100 dark:border-[#2A2D3E] p-2">
                  <button
                    onClick={applyCampaigns}
                    className="w-full rounded-lg bg-[#0F4C8F] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#0D3F7A] transition-colors"
                  >
                    Apply
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Active filter pills ──────────────────────────────────────────── */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-1.5">
          {currentClientIds.map((clientId) => {
            const client = clients.find((c) => c.id === clientId);
            if (!client) return null;
            return (
              <span
                key={clientId}
                className="inline-flex items-center gap-1 rounded-full bg-blue-50 dark:bg-blue-500/10 px-2.5 py-0.5 text-xs font-medium text-blue-700 dark:text-blue-400"
              >
                {client.name}
                <button onClick={() => clearClientFilter(clientId)} className="ml-0.5 hover:opacity-70">
                  <X className="size-3" />
                </button>
              </span>
            );
          })}
          {currentCampaignIds.map((campId) => {
            const camp = campaigns.find((c) => c.id === campId);
            if (!camp) return null;
            return (
              <span
                key={campId}
                className="inline-flex items-center gap-1 rounded-full bg-purple-50 dark:bg-purple-500/10 px-2.5 py-0.5 text-xs font-medium text-purple-700 dark:text-purple-400"
              >
                {camp.name}
                <button onClick={() => clearCampaignFilter(campId)} className="ml-0.5 hover:opacity-70">
                  <X className="size-3" />
                </button>
              </span>
            );
          })}
          <button
            onClick={clearAll}
            className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
          >
            <X className="size-3" /> Clear all
          </button>
        </div>
      )}
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
