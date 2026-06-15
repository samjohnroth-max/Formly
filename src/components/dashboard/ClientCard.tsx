"use client";

import { useState, useTransition, useRef, useEffect } from "react";
import { formatDistanceToNow } from "date-fns";
import {
  CheckCircle, Clock, AlertCircle, XCircle,
  Zap, Unlink, RefreshCw, Loader2, Pencil, Check, X,
  ExternalLink, Plus, Palette, MoreVertical, AlertTriangle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { AddSTModal } from "./AddSTModal";
import {
  disconnectMeta, disconnectST, testSTConnection,
  disableClient, enableClient,
  removeMetaFromClient, removeSTFromClient,
} from "@/actions/connections";
import type { ConnectionStatus } from "@/types/db";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface MetaConnSummary {
  id: string;
  metaAccountName: string;
  pixelId: string | null;
  datasetId: string | null;
  status: ConnectionStatus;
  createdAt: Date | string;
  campaignCount: number;
  leadsThisMonth: number;
}

export interface STConnSummary {
  id: string;
  tenantName: string;
  tenantId: string;
  status: ConnectionStatus;
  createdAt: Date | string;
  campaignCount: number;
  leadsThisMonth: number;
}

export interface ClientData {
  id: string;
  name: string;
  status: "ACTIVE" | "DISABLED";
  createdAt: Date | string;
  metaConnections: MetaConnSummary[];
  stConnections: STConnSummary[];
}

interface ClientCardProps {
  client: ClientData;
  onRefresh: () => void;
  isNew?: boolean;
}

// ─── Status badge ─────────────────────────────────────────────────────────────

function StatusDot({ status }: { status: ConnectionStatus }) {
  const map: Record<ConnectionStatus, string> = {
    ACTIVE: "bg-green-500",
    EXPIRED: "bg-amber-400",
    ERROR: "bg-red-500",
    DISCONNECTED: "bg-gray-300",
  };
  return <span className={cn("inline-block size-2 shrink-0 rounded-full", map[status])} />;
}

function StatusBadge({ status }: { status: ConnectionStatus }) {
  const configs: Record<ConnectionStatus, { label: string; icon: typeof CheckCircle; cls: string }> = {
    ACTIVE:       { label: "Active",       icon: CheckCircle, cls: "bg-green-50 text-green-700 ring-green-600/20" },
    EXPIRED:      { label: "Expired",      icon: Clock,       cls: "bg-amber-50 text-amber-700 ring-amber-600/20" },
    ERROR:        { label: "Error",        icon: AlertCircle, cls: "bg-red-50 text-red-700 ring-red-600/20" },
    DISCONNECTED: { label: "Disconnected", icon: XCircle,     cls: "bg-gray-50 text-gray-500 ring-gray-500/20" },
  };
  const { label, icon: Icon, cls } = configs[status];
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset", cls)}>
      <Icon className="size-3" />
      {label}
    </span>
  );
}

// ─── Meta connection slot ─────────────────────────────────────────────────────

function MetaSlot({
  conn,
  clientId,
  onRefresh,
}: {
  conn: MetaConnSummary;
  clientId: string;
  onRefresh: () => void;
}) {
  const [showEditCapi, setShowEditCapi] = useState(!conn.pixelId);
  const [pixelInput, setPixelInput] = useState(conn.pixelId ?? "");
  const [datasetInput, setDatasetInput] = useState(conn.datasetId ?? "");
  const [savingPixel, setSavingPixel] = useState(false);
  const [pixelError, setPixelError] = useState<string | null>(null);
  const [confirmRemove, setConfirmRemove] = useState(false);
  const [isPending, startTransition] = useTransition();

  const capiActive = !!conn.pixelId;

  async function savePixel() {
    setSavingPixel(true);
    setPixelError(null);
    const res = await fetch(`/api/integrations/meta/connection/${conn.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pixelId: pixelInput, datasetId: datasetInput }),
    });
    setSavingPixel(false);
    if (!res.ok) {
      const d = await res.json();
      setPixelError(d.error ?? "Failed to save");
    } else {
      setShowEditCapi(false);
      onRefresh();
    }
  }

  const isInactive = conn.status !== "ACTIVE";

  return (
    <div className={cn("rounded-lg border bg-white p-3", isInactive ? "border-gray-200 opacity-80" : "border-gray-200")}>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <StatusDot status={conn.status} />
            <span className="truncate text-sm font-medium text-gray-900">{conn.metaAccountName}</span>
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-gray-500">
            <span>{conn.leadsThisMonth} leads this month</span>
            <span>·</span>
            <span>{conn.campaignCount} {conn.campaignCount === 1 ? "campaign" : "campaigns"}</span>
          </div>
        </div>
        <StatusBadge status={conn.status} />
      </div>

      {/* CAPI section — always visible */}
      <div className="mt-2.5 rounded-md border border-gray-100 bg-gray-50 p-2.5">
        <div className="flex items-center justify-between gap-2">
          {capiActive ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700 ring-1 ring-inset ring-emerald-600/20">
              <Zap className="size-3" /> CAPI active
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700 ring-1 ring-inset ring-amber-600/20">
              <Zap className="size-3" /> CAPI disabled
            </span>
          )}
          {capiActive && !showEditCapi && (
            <button onClick={() => setShowEditCapi(true)} className="text-xs text-gray-400 hover:text-gray-600">
              Edit
            </button>
          )}
        </div>

        {capiActive && !showEditCapi && (
          <div className="mt-1.5 space-y-0.5 text-xs text-gray-500">
            <p>Pixel: <span className="font-mono text-gray-700">{conn.pixelId}</span></p>
            {conn.datasetId && <p>Dataset: <span className="font-mono text-gray-700">{conn.datasetId}</span></p>}
          </div>
        )}

        {(!capiActive || showEditCapi) && (
          <div className="mt-2 space-y-1.5">
            {!capiActive && (
              <p className="text-xs text-amber-700">Add your Pixel ID to enable CAPI revenue attribution.</p>
            )}
            <input
              type="text"
              value={pixelInput}
              onChange={(e) => setPixelInput(e.target.value)}
              placeholder="Pixel ID (e.g. 1234567890)"
              className="w-full rounded border border-gray-200 bg-white px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-400"
            />
            <input
              type="text"
              value={datasetInput}
              onChange={(e) => setDatasetInput(e.target.value)}
              placeholder="Dataset ID (optional)"
              className="w-full rounded border border-gray-200 bg-white px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-400"
            />
            <div className="flex items-center gap-1.5">
              <button
                onClick={savePixel}
                disabled={savingPixel || !pixelInput.trim()}
                className="rounded bg-blue-600 px-2.5 py-1 text-xs font-medium text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {savingPixel ? "Saving…" : "Save"}
              </button>
              {capiActive && (
                <button
                  onClick={() => { setShowEditCapi(false); setPixelInput(conn.pixelId ?? ""); setDatasetInput(conn.datasetId ?? ""); }}
                  className="rounded px-2 py-1 text-xs text-gray-500 hover:bg-gray-100"
                >
                  Cancel
                </button>
              )}
              {pixelError && <span className="text-xs text-red-600">{pixelError}</span>}
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="mt-2 flex flex-wrap items-center gap-1.5">
        {isInactive && (
          <a
            href={`/api/integrations/meta/connect?groupId=${clientId}`}
            className="inline-flex items-center gap-1 rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 hover:bg-blue-100"
          >
            <RefreshCw className="size-3" /> Reconnect
          </a>
        )}
        {conn.status !== "DISCONNECTED" && (
          <button
            onClick={() => startTransition(async () => { await disconnectMeta(conn.id); onRefresh(); })}
            disabled={isPending}
            className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs text-gray-500 hover:bg-gray-100 disabled:opacity-50"
          >
            {isPending ? <Loader2 className="size-3 animate-spin" /> : <Unlink className="size-3" />}
            Disconnect
          </button>
        )}
        {!confirmRemove ? (
          <button
            onClick={() => setConfirmRemove(true)}
            className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs text-red-500 hover:bg-red-50"
          >
            <X className="size-3" /> Remove
          </button>
        ) : (
          <span className="flex items-center gap-1.5 text-xs">
            <span className="text-gray-600">Remove connection?</span>
            <button
              onClick={() => startTransition(async () => { await removeMetaFromClient(conn.id); onRefresh(); })}
              disabled={isPending}
              className="rounded bg-red-500 px-2 py-0.5 text-white hover:bg-red-600 disabled:opacity-50"
            >
              Yes
            </button>
            <button onClick={() => setConfirmRemove(false)} className="rounded px-2 py-0.5 text-gray-500 hover:bg-gray-100">
              Cancel
            </button>
          </span>
        )}
      </div>
    </div>
  );
}

// ─── ST connection slot ───────────────────────────────────────────────────────

function STSlot({
  conn,
  groupId,
  onRefresh,
  onReconnect,
}: {
  conn: STConnSummary;
  groupId: string;
  onRefresh: () => void;
  onReconnect: () => void;
}) {
  const [isPending, startTransition] = useTransition();
  const [testResult, setTestResult] = useState<{ ok: boolean; error?: string } | null>(null);
  const [confirmRemove, setConfirmRemove] = useState(false);
  const isInactive = conn.status !== "ACTIVE";

  function handleTest() {
    startTransition(async () => {
      const r = await testSTConnection(conn.id);
      setTestResult(r);
      setTimeout(() => setTestResult(null), 4000);
      onRefresh();
    });
  }

  return (
    <div className={cn("rounded-lg border bg-white p-3", isInactive ? "border-gray-200 opacity-80" : "border-gray-200")}>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <StatusDot status={conn.status} />
            <span className="truncate text-sm font-medium text-gray-900">{conn.tenantName}</span>
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-gray-500">
            <span>Tenant {conn.tenantId}</span>
            <span>·</span>
            <span>{conn.campaignCount} {conn.campaignCount === 1 ? "campaign" : "campaigns"}</span>
            <span>·</span>
            <span>{conn.leadsThisMonth} leads this month</span>
          </div>
        </div>
        <StatusBadge status={conn.status} />
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-1.5">
        {testResult && (
          <span className={cn("text-xs font-medium", testResult.ok ? "text-green-600" : "text-red-600")}>
            {testResult.ok ? "OK" : testResult.error}
          </span>
        )}
        {isInactive ? (
          <button
            onClick={() => startTransition(() => onReconnect())}
            disabled={isPending}
            className="inline-flex items-center gap-1 rounded-md bg-orange-50 px-2 py-1 text-xs font-medium text-orange-700 hover:bg-orange-100 disabled:opacity-50"
          >
            {isPending ? <Loader2 className="size-3 animate-spin" /> : <RefreshCw className="size-3" />}
            Reconnect
          </button>
        ) : (
          <button
            onClick={handleTest}
            disabled={isPending}
            className="inline-flex items-center gap-1 rounded-md bg-gray-50 px-2 py-1 text-xs text-gray-700 hover:bg-gray-100 disabled:opacity-50"
          >
            {isPending ? <Loader2 className="size-3 animate-spin" /> : <RefreshCw className="size-3" />}
            Test
          </button>
        )}
        {conn.status !== "DISCONNECTED" && (
          <button
            onClick={() => startTransition(async () => { await disconnectST(conn.id); onRefresh(); })}
            disabled={isPending}
            className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs text-gray-500 hover:bg-gray-100 disabled:opacity-50"
          >
            {isPending ? <Loader2 className="size-3 animate-spin" /> : <Unlink className="size-3" />}
            Disconnect
          </button>
        )}
        {!confirmRemove ? (
          <button
            onClick={() => setConfirmRemove(true)}
            className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs text-red-500 hover:bg-red-50"
          >
            <X className="size-3" /> Remove
          </button>
        ) : (
          <span className="flex items-center gap-1.5 text-xs">
            <span className="text-gray-600">Remove connection?</span>
            <button
              onClick={() => startTransition(async () => { await removeSTFromClient(conn.id); onRefresh(); })}
              disabled={isPending}
              className="rounded bg-red-500 px-2 py-0.5 text-white hover:bg-red-600 disabled:opacity-50"
            >
              Yes
            </button>
            <button onClick={() => setConfirmRemove(false)} className="rounded px-2 py-0.5 text-gray-500 hover:bg-gray-100">
              Cancel
            </button>
          </span>
        )}
      </div>
    </div>
  );
}

// ─── Client Card ──────────────────────────────────────────────────────────────

export function ClientCard({ client, onRefresh, isNew = false }: ClientCardProps) {
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(client.name);
  const [savingName, setSavingName] = useState(false);
  const [showSTModal, setShowSTModal] = useState(false);
  const [reconnectST, setReconnectST] = useState<STConnSummary | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Remove dialog state
  const [removeDialog, setRemoveDialog] = useState<"idle" | "open" | "processing">("idle");
  const [removeInput, setRemoveInput] = useState("");

  const isDisabled = client.status === "DISABLED";

  // Close menu on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  async function saveName() {
    const trimmed = nameInput.trim();
    if (!trimmed || trimmed === client.name) { setEditingName(false); return; }
    setSavingName(true);
    await fetch(`/api/clients/${client.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: trimmed }),
    });
    setSavingName(false);
    setEditingName(false);
    onRefresh();
  }

  async function handleDisable() {
    setMenuOpen(false);
    await disableClient(client.id);
    onRefresh();
  }

  async function handleEnable() {
    setMenuOpen(false);
    await enableClient(client.id);
    onRefresh();
  }

  async function handleRemoveConfirm() {
    if (removeInput !== client.name) return;
    setRemoveDialog("processing");
    await fetch(`/api/clients/${client.id}`, { method: "DELETE" });
    setRemoveDialog("idle");
    onRefresh();
  }

  function handleSTReconnect(conn: STConnSummary) {
    setReconnectST(conn);
    setShowSTModal(true);
  }

  return (
    <>
      <div className={cn(
        "overflow-hidden rounded-xl border bg-gray-50 shadow-sm transition-shadow",
        isNew ? "border-[#0F4C8F] ring-2 ring-[#0F4C8F]/20" : "border-gray-200",
        isDisabled && "opacity-60"
      )}>
        {/* Card header */}
        <div className="flex items-center justify-between border-b border-gray-200 bg-white px-5 py-3">
          {editingName ? (
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") saveName();
                  if (e.key === "Escape") { setEditingName(false); setNameInput(client.name); }
                }}
                autoFocus
                className="rounded-md border border-[#0F4C8F]/40 px-2 py-1 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#0F4C8F]"
              />
              <button onClick={saveName} disabled={savingName} className="rounded p-1 text-green-600 hover:bg-green-50 disabled:opacity-50">
                {savingName ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" />}
              </button>
              <button onClick={() => { setEditingName(false); setNameInput(client.name); }} className="rounded p-1 text-gray-500 hover:bg-gray-100">
                <X className="size-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-gray-900">{client.name}</h3>
              {isDisabled && (
                <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-500">
                  Disabled
                </span>
              )}
            </div>
          )}

          <div className="flex items-center gap-1.5">
            <a
              href={`/settings/brand?client=${client.id}`}
              className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs text-gray-500 hover:bg-gray-100 hover:text-gray-700"
              title="Brand settings"
            >
              <Palette className="size-3.5" />
              Brand
            </a>

            {/* Three-dot menu */}
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setMenuOpen((v) => !v)}
                className="rounded-md p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                title="Client options"
              >
                <MoreVertical className="size-4" />
              </button>

              {menuOpen && (
                <div className="absolute right-0 top-full z-20 mt-1 w-44 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg">
                  <button
                    onClick={() => { setMenuOpen(false); setEditingName(true); setNameInput(client.name); }}
                    className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <Pencil className="size-3.5 text-gray-400" /> Rename
                  </button>
                  {isDisabled ? (
                    <button
                      onClick={handleEnable}
                      className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-green-700 hover:bg-green-50"
                    >
                      <Check className="size-3.5 text-green-500" /> Re-enable
                    </button>
                  ) : (
                    <button
                      onClick={handleDisable}
                      className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-amber-700 hover:bg-amber-50"
                    >
                      <XCircle className="size-3.5 text-amber-500" /> Disable client
                    </button>
                  )}
                  <div className="border-t border-gray-100" />
                  <button
                    onClick={() => { setMenuOpen(false); setRemoveInput(""); setRemoveDialog("open"); }}
                    className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50"
                  >
                    <AlertTriangle className="size-3.5 text-red-500" /> Remove client
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Disabled notice */}
        {isDisabled && (
          <div className="border-b border-amber-200 bg-amber-50 px-5 py-2 text-xs text-amber-800">
            This client is disabled — their campaigns are paused and no new leads will be routed.
          </div>
        )}

        {/* Two-column body */}
        <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2">
          {/* Meta column */}
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Meta Business</p>
            {client.metaConnections.length === 0 ? (
              isNew ? (
                <a
                  href={`/api/integrations/meta/connect?groupId=${client.id}`}
                  className="flex items-center justify-center gap-2 rounded-lg border-2 border-dashed border-blue-300 bg-blue-50 p-5 text-sm font-medium text-blue-700 transition-colors hover:bg-blue-100"
                >
                  <Plus className="size-4" />
                  Connect Meta Account
                  <ExternalLink className="size-3.5 opacity-60" />
                </a>
              ) : (
                <div className="rounded-lg border border-dashed border-gray-300 bg-white p-3 text-center">
                  <p className="text-xs text-gray-400">No Meta account connected</p>
                </div>
              )
            ) : (
              client.metaConnections.map((conn) => (
                <MetaSlot key={conn.id} conn={conn} clientId={client.id} onRefresh={onRefresh} />
              ))
            )}
            {(!isNew || client.metaConnections.length > 0) && (
              <a
                href={`/api/integrations/meta/connect?groupId=${client.id}`}
                className="inline-flex items-center gap-1.5 rounded-md border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-700 hover:bg-blue-100"
              >
                <Plus className="size-3.5" />
                {client.metaConnections.length > 0 ? "Connect another account" : "Connect Meta"}
                <ExternalLink className="size-3 opacity-60" />
              </a>
            )}
          </div>

          {/* ServiceTitan column */}
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">ServiceTitan</p>
            {client.stConnections.length === 0 ? (
              isNew ? (
                <button
                  onClick={() => setShowSTModal(true)}
                  className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-orange-300 bg-orange-50 p-5 text-sm font-medium text-orange-700 transition-colors hover:bg-orange-100"
                >
                  <Plus className="size-4" />
                  Add ServiceTitan Tenant
                </button>
              ) : (
                <div className="rounded-lg border border-dashed border-gray-300 bg-white p-3 text-center">
                  <p className="text-xs text-gray-400">No ServiceTitan tenant connected</p>
                </div>
              )
            ) : (
              client.stConnections.map((conn) => (
                <STSlot
                  key={conn.id}
                  conn={conn}
                  groupId={client.id}
                  onRefresh={onRefresh}
                  onReconnect={() => handleSTReconnect(conn)}
                />
              ))
            )}
            {(!isNew || client.stConnections.length > 0) && (
              <button
                onClick={() => setShowSTModal(true)}
                className="inline-flex items-center gap-1.5 rounded-md border border-orange-200 bg-orange-50 px-3 py-1.5 text-xs font-medium text-orange-700 hover:bg-orange-100"
              >
                <Plus className="size-3.5" />
                {client.stConnections.length > 0 ? "Add another tenant" : "Add ST Tenant"}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Remove client dialog */}
      {removeDialog !== "idle" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl bg-white shadow-xl">
            <div className="p-6">
              <div className="mb-4 flex items-start gap-3">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-red-100">
                  <AlertTriangle className="size-5 text-red-600" />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-gray-900">Remove {client.name}</h2>
                  <p className="mt-1 text-sm text-gray-500">
                    This will permanently archive all campaigns for <strong>{client.name}</strong> and unlink
                    their Meta and ServiceTitan connections. Lead history will be preserved. This cannot be undone.
                  </p>
                </div>
              </div>

              <div className="mb-4">
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Type <strong>{client.name}</strong> to confirm
                </label>
                <input
                  type="text"
                  value={removeInput}
                  onChange={(e) => setRemoveInput(e.target.value)}
                  placeholder={client.name}
                  autoFocus
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-red-400 focus:outline-none focus:ring-1 focus:ring-red-400"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => { setRemoveDialog("idle"); setRemoveInput(""); }}
                  disabled={removeDialog === "processing"}
                  className="flex-1 rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRemoveConfirm}
                  disabled={removeInput !== client.name || removeDialog === "processing"}
                  className="flex-1 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-40"
                >
                  {removeDialog === "processing" ? "Removing…" : "Remove client"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showSTModal && (
        <AddSTModal
          groupId={client.id}
          onClose={() => { setShowSTModal(false); setReconnectST(null); onRefresh(); }}
        />
      )}
    </>
  );
}
