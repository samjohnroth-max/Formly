"use client";

import { useState, useTransition } from "react";
import { formatDistanceToNow } from "date-fns";
import { Loader2, RefreshCw, Unlink, CheckCircle, AlertCircle, Clock, XCircle, Zap, BarChart2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ConnectionStatus } from "@/types/db";

function StatusBadge({ status }: { status: ConnectionStatus }) {
  const configs: Record<ConnectionStatus, { label: string; icon: typeof CheckCircle; className: string }> = {
    ACTIVE:       { label: "Active",       icon: CheckCircle, className: "bg-green-50 text-green-700 ring-green-600/20" },
    EXPIRED:      { label: "Expired",      icon: Clock,       className: "bg-yellow-50 text-yellow-700 ring-yellow-600/20" },
    ERROR:        { label: "Error",        icon: AlertCircle, className: "bg-red-50 text-red-700 ring-red-600/20" },
    DISCONNECTED: { label: "Disconnected", icon: XCircle,     className: "bg-gray-50 text-gray-600 ring-gray-500/20" },
  };
  const { label, icon: Icon, className } = configs[status];
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ring-1 ring-inset", className)}>
      <Icon className="size-3" />
      {label}
    </span>
  );
}

function StatPill({ label, value }: { label: string; value: string | number }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-md bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
      <BarChart2 className="size-3 text-gray-400" />
      <span className="font-medium text-gray-800">{value}</span> {label}
    </span>
  );
}

// ─── Meta Connection Card ─────────────────────────────────────────────────────

interface MetaCardProps {
  id: string;
  metaAccountName: string;
  pixelId: string | null;
  status: ConnectionStatus;
  createdAt: Date;
  campaignCount: number;
  leadsThisMonth: number;
  onDisconnect: (id: string) => Promise<void>;
  onPixelSaved?: () => void;
}

export function MetaConnectionCard({
  id,
  metaAccountName,
  pixelId,
  status,
  createdAt,
  campaignCount,
  leadsThisMonth,
  onDisconnect,
  onPixelSaved,
}: MetaCardProps) {
  const [isPending, startTransition] = useTransition();
  const [showPixelForm, setShowPixelForm] = useState(!pixelId && status === "ACTIVE");
  const [pixelInput, setPixelInput] = useState(pixelId ?? "");
  const [datasetInput, setDatasetInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  async function handleSavePixel() {
    setSaving(true);
    setSaveError(null);
    try {
      const res = await fetch(`/api/integrations/meta/connection/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pixelId: pixelInput, datasetId: datasetInput }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Failed to save");
      }
      setShowPixelForm(false);
      onPixelSaved?.();
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  const isInactive = status !== "ACTIVE";

  return (
    <div className={cn("rounded-lg border bg-white overflow-hidden", isInactive ? "border-gray-200 opacity-90" : "border-gray-200")}>
      <div className="flex items-start justify-between p-4">
        <div className="flex items-start gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-blue-600">
            <span className="text-xs font-bold text-white">M</span>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-gray-900">{metaAccountName}</p>
            <p className="text-xs text-gray-500">Connected {formatDistanceToNow(createdAt, { addSuffix: true })}</p>
            <div className="flex flex-wrap items-center gap-2">
              <StatPill value={campaignCount} label={campaignCount === 1 ? "campaign" : "campaigns"} />
              <StatPill value={leadsThisMonth} label="leads this month" />
              {pixelId ? (
                <span className="inline-flex items-center gap-0.5 text-xs text-emerald-600">
                  <Zap className="size-3" />
                  Pixel {pixelId}
                </span>
              ) : status === "ACTIVE" ? (
                <button
                  onClick={() => setShowPixelForm(true)}
                  className="text-xs text-amber-600 underline hover:text-amber-700"
                >
                  No pixel — CAPI disabled
                </button>
              ) : null}
            </div>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <StatusBadge status={status} />
          {isInactive && (
            <a
              href="/api/integrations/meta/connect"
              className="inline-flex items-center gap-1 rounded-md bg-blue-50 px-2.5 py-1.5 text-xs font-medium text-blue-700 hover:bg-blue-100"
            >
              <RefreshCw className="size-3" />
              Reconnect
            </a>
          )}
          {pixelId && status === "ACTIVE" && (
            <button
              onClick={() => setShowPixelForm((v) => !v)}
              className="inline-flex items-center gap-1 rounded-md px-2.5 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100"
            >
              <Zap className="size-3" />
              Edit Pixel
            </button>
          )}
          {status !== "DISCONNECTED" && (
            <button
              onClick={() => startTransition(() => onDisconnect(id))}
              disabled={isPending}
              className="inline-flex items-center gap-1 rounded-md px-2.5 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100 disabled:opacity-50"
            >
              {isPending ? <Loader2 className="size-3 animate-spin" /> : <Unlink className="size-3" />}
              Disconnect
            </button>
          )}
        </div>
      </div>

      {showPixelForm && (
        <div className="border-t border-amber-100 bg-amber-50 px-4 py-4">
          <p className="mb-3 text-sm font-medium text-amber-800">Set up Meta Pixel for Conversions API</p>
          <p className="mb-3 text-xs text-amber-700">
            Find your Pixel ID in{" "}
            <a href="https://www.facebook.com/events_manager" target="_blank" rel="noopener noreferrer" className="underline">
              Meta Events Manager
            </a>{" "}
            → your pixel → Settings. Without this, CAPI events cannot attribute revenue and the Purchase ROAS column in Ads Manager will not populate.
          </p>
          <div className="flex items-end gap-3">
            <div className="flex-1">
              <label className="mb-1 block text-xs font-medium text-amber-700">
                Pixel ID <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={pixelInput}
                onChange={(e) => setPixelInput(e.target.value)}
                placeholder="e.g. 1234567890123456"
                className="w-full rounded-md border border-amber-200 bg-white px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
            </div>
            <div className="flex-1">
              <label className="mb-1 block text-xs font-medium text-amber-700">
                Dataset ID <span className="font-normal text-amber-600">(optional)</span>
              </label>
              <input
                type="text"
                value={datasetInput}
                onChange={(e) => setDatasetInput(e.target.value)}
                placeholder="Same as Pixel ID usually"
                className="w-full rounded-md border border-amber-200 bg-white px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleSavePixel}
                disabled={saving || !pixelInput.trim()}
                className="rounded-md bg-amber-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-amber-700 disabled:opacity-50"
              >
                {saving ? "Saving…" : "Save"}
              </button>
              {pixelId && (
                <button
                  onClick={() => setShowPixelForm(false)}
                  className="rounded-md px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100"
                >
                  Cancel
                </button>
              )}
            </div>
          </div>
          {saveError && <p className="mt-2 text-xs text-red-600">{saveError}</p>}
        </div>
      )}
    </div>
  );
}

// ─── ServiceTitan Connection Card ─────────────────────────────────────────────

interface STCardProps {
  id: string;
  tenantName: string;
  tenantId: string;
  status: ConnectionStatus;
  createdAt: Date;
  campaignCount: number;
  leadsThisMonth: number;
  onDisconnect: (id: string) => Promise<void>;
  onReconnect: (id: string) => Promise<void>;
  onTest: (id: string) => Promise<{ ok: boolean; error?: string }>;
}

export function STConnectionCard({
  id,
  tenantName,
  tenantId,
  status,
  createdAt,
  campaignCount,
  leadsThisMonth,
  onDisconnect,
  onReconnect,
  onTest,
}: STCardProps) {
  const [isPending, startTransition] = useTransition();
  const [testResult, setTestResult] = useState<{ ok: boolean; error?: string } | null>(null);

  function handleTest() {
    startTransition(async () => {
      const result = await onTest(id);
      setTestResult(result);
      setTimeout(() => setTestResult(null), 4000);
    });
  }

  const isInactive = status !== "ACTIVE";

  return (
    <div className={cn("rounded-lg border bg-white p-4", isInactive ? "border-gray-200 opacity-90" : "border-gray-200")}>
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-orange-500">
            <span className="text-xs font-bold text-white">ST</span>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-gray-900">{tenantName}</p>
            <p className="text-xs text-gray-500">
              Tenant {tenantId} · Connected {formatDistanceToNow(createdAt, { addSuffix: true })}
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <StatPill value={campaignCount} label={campaignCount === 1 ? "campaign" : "campaigns"} />
              <StatPill value={leadsThisMonth} label="leads this month" />
            </div>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <StatusBadge status={status} />
          {testResult && (
            <span className={cn("text-xs font-medium", testResult.ok ? "text-green-600" : "text-red-600")}>
              {testResult.ok ? "Connection OK" : testResult.error}
            </span>
          )}
          {isInactive ? (
            <button
              onClick={() => startTransition(() => onReconnect(id))}
              disabled={isPending}
              className="inline-flex items-center gap-1 rounded-md bg-orange-50 px-2.5 py-1.5 text-xs font-medium text-orange-700 hover:bg-orange-100 disabled:opacity-50"
            >
              {isPending ? <Loader2 className="size-3 animate-spin" /> : <RefreshCw className="size-3" />}
              Reconnect
            </button>
          ) : (
            <button
              onClick={handleTest}
              disabled={isPending}
              className="inline-flex items-center gap-1 rounded-md bg-gray-50 px-2.5 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50"
            >
              {isPending ? <Loader2 className="size-3 animate-spin" /> : <RefreshCw className="size-3" />}
              Test
            </button>
          )}
          {status !== "DISCONNECTED" && (
            <button
              onClick={() => startTransition(() => onDisconnect(id))}
              disabled={isPending}
              className="inline-flex items-center gap-1 rounded-md px-2.5 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100 disabled:opacity-50"
            >
              {isPending ? <Loader2 className="size-3 animate-spin" /> : <Unlink className="size-3" />}
              Disconnect
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
