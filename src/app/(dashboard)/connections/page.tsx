"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { Plus, Unlink, RefreshCw, Loader2, ExternalLink, ChevronDown } from "lucide-react";
import { ClientCard, type ClientData, type MetaConnSummary, type STConnSummary } from "@/components/dashboard/ClientCard";
import { AddClientModal } from "@/components/dashboard/AddClientModal";
import { AddSTModal } from "@/components/dashboard/AddSTModal";
import { disconnectMeta, disconnectST, testSTConnection } from "@/actions/connections";
import type { ConnectionStatus } from "@/types/db";

interface PageData {
  clients: ClientData[];
  unassigned: {
    metaConnections: MetaConnSummary[];
    stConnections: STConnSummary[];
  };
}

export default function ConnectionsPage() {
  const [data, setData] = useState<PageData | null>(null);
  const [showAddClient, setShowAddClient] = useState(false);
  const [showAddST, setShowAddST] = useState(false);
  const [flash, setFlash] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [newClientId, setNewClientId] = useState<string | null>(null);

  useEffect(() => {
    if (!newClientId) return;
    const timer = setTimeout(() => setNewClientId(null), 10_000);
    return () => clearTimeout(timer);
  }, [newClientId]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("success") === "meta_connected") {
      setFlash({ type: "success", message: "Meta account connected successfully." });
    }
    if (params.get("error")) {
      setFlash({ type: "error", message: decodeURIComponent(params.get("error")!) });
    }
    if (params.toString()) window.history.replaceState({}, "", window.location.pathname);
    loadData();
  }, []);

  async function loadData() {
    const res = await fetch("/api/clients");
    if (res.ok) setData(await res.json());
  }

  return (
    <div className="mx-auto max-w-4xl space-y-8 p-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-[#F0F4FF]">Connections</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-[#8B90A0]">
            One card per client — each showing their Meta and ServiceTitan connections.
          </p>
        </div>
        <button
          onClick={() => setShowAddClient(true)}
          className="inline-flex items-center gap-2 rounded-md bg-[#0F4C8F] px-4 py-2 text-sm font-medium text-white hover:bg-[#0D3F7A]"
        >
          <Plus className="size-4" />
          Add Client
        </button>
      </div>

      {/* Flash */}
      {flash && (
        <div className={`rounded-lg px-4 py-3 text-sm ${flash.type === "success" ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"}`}>
          {flash.message}
        </div>
      )}

      {/* Client cards */}
      {!data ? (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="h-48 animate-pulse rounded-xl bg-gray-100 dark:bg-[#1A1D27]" />
          ))}
        </div>
      ) : data.clients.length === 0 && data.unassigned.metaConnections.length === 0 && data.unassigned.stConnections.length === 0 ? (
        <EmptyState onAdd={() => setShowAddClient(true)} />
      ) : (
        <div className="space-y-4">
          {data.clients.map((client) => (
            <ClientCard key={client.id} client={client} onRefresh={loadData} isNew={client.id === newClientId} />
          ))}
        </div>
      )}

      {/* Unassigned connections */}
      {data && (data.unassigned.metaConnections.length > 0 || data.unassigned.stConnections.length > 0) && (
        <UnassignedSection
          metaConnections={data.unassigned.metaConnections}
          stConnections={data.unassigned.stConnections}
          clients={data.clients}
          onRefresh={loadData}
          onAddST={() => setShowAddST(true)}
        />
      )}

      {showAddClient && (
        <AddClientModal
          onCreated={(client) => { setShowAddClient(false); setNewClientId(client.id); loadData(); }}
          onClose={() => setShowAddClient(false)}
        />
      )}

      {showAddST && (
        <AddSTModal onClose={() => { setShowAddST(false); loadData(); }} />
      )}
    </div>
  );
}

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="rounded-xl border border-dashed border-gray-300 dark:border-[#2A2D3E] bg-gray-50 dark:bg-[#1A1D27] p-12 text-center">
      <p className="mb-1 text-sm font-medium text-gray-700 dark:text-[#F0F4FF]">No clients yet</p>
      <p className="mb-4 text-sm text-gray-500 dark:text-[#8B90A0]">Add your first client to connect their Meta account and ServiceTitan tenant.</p>
      <button
        onClick={onAdd}
        className="inline-flex items-center gap-2 rounded-md bg-[#0F4C8F] px-4 py-2 text-sm font-medium text-white hover:bg-[#0D3F7A]"
      >
        <Plus className="size-4" /> Add Client
      </button>
    </div>
  );
}

// ─── Unassigned section ───────────────────────────────────────────────────────

function UnassignedSection({
  metaConnections,
  stConnections,
  clients,
  onRefresh,
  onAddST,
}: {
  metaConnections: MetaConnSummary[];
  stConnections: STConnSummary[];
  clients: ClientData[];
  onRefresh: () => void;
  onAddST: () => void;
}) {
  return (
    <section>
      <div className="mb-3 flex items-center gap-2">
        <h2 className="text-sm font-semibold text-gray-700 dark:text-[#F0F4FF]">Unassigned connections</h2>
        <span className="rounded-full bg-gray-200 dark:bg-[#2A2D3E] px-2 py-0.5 text-xs text-gray-600 dark:text-[#8B90A0]">
          {metaConnections.length + stConnections.length}
        </span>
      </div>
      <p className="mb-4 text-xs text-gray-500 dark:text-[#8B90A0]">
        These connections aren&apos;t linked to a client yet. Assign them or add a new client.
      </p>
      <div className="space-y-2">
        {metaConnections.map((c) => (
          <UnassignedMetaRow key={c.id} conn={c} clients={clients} onRefresh={onRefresh} />
        ))}
        {stConnections.map((c) => (
          <UnassignedSTRow key={c.id} conn={c} clients={clients} onRefresh={onRefresh} />
        ))}
      </div>
      <div className="mt-3 flex gap-2">
        <a
          href="/api/integrations/meta/connect"
          className="inline-flex items-center gap-1.5 rounded-md border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-700 hover:bg-blue-100"
        >
          <Plus className="size-3.5" /> Connect Meta <ExternalLink className="size-3 opacity-60" />
        </a>
        <button
          onClick={onAddST}
          className="inline-flex items-center gap-1.5 rounded-md border border-orange-200 bg-orange-50 px-3 py-1.5 text-xs font-medium text-orange-700 hover:bg-orange-100"
        >
          <Plus className="size-3.5" /> Add ST Tenant
        </button>
      </div>
    </section>
  );
}

function AssignDropdown({
  connectionId,
  type,
  clients,
  onRefresh,
}: {
  connectionId: string;
  type: "meta" | "st";
  clients: ClientData[];
  onRefresh: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [isPending, startTransition] = useTransition();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setCreating(false);
        setNewName("");
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  function assign(clientId: string) {
    startTransition(async () => {
      await fetch(`/api/clients/${clientId}/assign`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, connectionId }),
      });
      setOpen(false);
      onRefresh();
    });
  }

  function createAndAssign() {
    const trimmed = newName.trim();
    if (!trimmed) return;
    startTransition(async () => {
      const res = await fetch("/api/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: trimmed }),
      });
      if (!res.ok) return;
      const client = await res.json();
      await fetch(`/api/clients/${client.id}/assign`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, connectionId }),
      });
      setOpen(false);
      setCreating(false);
      setNewName("");
      onRefresh();
    });
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        disabled={isPending}
        className="inline-flex items-center gap-1 rounded-md border border-gray-200 dark:border-[#2A2D3E] bg-white dark:bg-[#1A1D27] px-2 py-1 text-xs text-gray-600 dark:text-[#8B90A0] hover:bg-gray-50 dark:hover:bg-white/10 disabled:opacity-50"
      >
        {isPending ? <Loader2 className="size-3 animate-spin" /> : <ChevronDown className="size-3 opacity-60" />}
        Assign to client
      </button>

      {open && (
        <div className="absolute right-0 z-20 mt-1 min-w-[190px] overflow-hidden rounded-lg border border-gray-200 dark:border-[#2A2D3E] bg-white dark:bg-[#1A1D27] shadow-lg">
          {clients.map((c) => (
            <button
              key={c.id}
              onClick={() => assign(c.id)}
              className="w-full px-3 py-2 text-left text-sm text-gray-700 dark:text-[#F0F4FF] hover:bg-gray-50 dark:hover:bg-white/10"
            >
              {c.name}
            </button>
          ))}
          {clients.length > 0 && <div className="border-t border-gray-100" />}
          {creating ? (
            <div className="space-y-2 p-2">
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") createAndAssign();
                  if (e.key === "Escape") { setCreating(false); setNewName(""); }
                }}
                placeholder="Client name…"
                autoFocus
                className="w-full rounded border border-gray-200 px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-[#0F4C8F]"
              />
              <div className="flex gap-1">
                <button
                  onClick={createAndAssign}
                  disabled={!newName.trim() || isPending}
                  className="flex-1 rounded bg-[#0F4C8F] px-2 py-1 text-xs font-medium text-white hover:bg-[#0D3F7A] disabled:opacity-50"
                >
                  {isPending ? "Creating…" : "Create & Assign"}
                </button>
                <button
                  onClick={() => { setCreating(false); setNewName(""); }}
                  className="rounded px-2 py-1 text-xs text-gray-500 hover:bg-gray-100"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setCreating(true)}
              className="flex w-full items-center gap-1 px-3 py-2 text-left text-xs font-medium text-[#0F4C8F] hover:bg-blue-50"
            >
              <Plus className="size-3" /> Create new client
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function StatusPill({ status }: { status: ConnectionStatus }) {
  const map: Record<ConnectionStatus, string> = {
    ACTIVE: "bg-green-100 text-green-700",
    EXPIRED: "bg-amber-100 text-amber-700",
    ERROR: "bg-red-100 text-red-700",
    DISCONNECTED: "bg-gray-100 text-gray-500",
  };
  return <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${map[status]}`}>{status}</span>;
}

function UnassignedMetaRow({
  conn,
  clients,
  onRefresh,
}: {
  conn: MetaConnSummary;
  clients: ClientData[];
  onRefresh: () => void;
}) {
  const [isPending, startTransition] = useTransition();
  return (
    <div className="flex items-center justify-between rounded-lg border border-gray-200 dark:border-[#2A2D3E] bg-white dark:bg-[#1A1D27] px-4 py-3">
      <div className="flex items-center gap-3">
        <div className="flex size-8 items-center justify-center rounded-lg bg-blue-600">
          <span className="text-xs font-bold text-white">M</span>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-900 dark:text-[#F0F4FF]">{conn.metaAccountName}</p>
          <p className="text-xs text-gray-500 dark:text-[#8B90A0]">
            {conn.leadsThisMonth} leads this month · {conn.campaignCount} campaigns
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <StatusPill status={conn.status} />
        <AssignDropdown connectionId={conn.id} type="meta" clients={clients} onRefresh={onRefresh} />
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
        {conn.status !== "ACTIVE" && (
          <a
            href="/api/integrations/meta/connect"
            className="inline-flex items-center gap-1 rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 hover:bg-blue-100"
          >
            <RefreshCw className="size-3" /> Reconnect
          </a>
        )}
      </div>
    </div>
  );
}

function UnassignedSTRow({
  conn,
  clients,
  onRefresh,
}: {
  conn: STConnSummary;
  clients: ClientData[];
  onRefresh: () => void;
}) {
  const [isPending, startTransition] = useTransition();
  const [testResult, setTestResult] = useState<{ ok: boolean; error?: string } | null>(null);

  function handleTest() {
    startTransition(async () => {
      const r = await testSTConnection(conn.id);
      setTestResult(r);
      setTimeout(() => setTestResult(null), 4000);
      onRefresh();
    });
  }

  return (
    <div className="flex items-center justify-between rounded-lg border border-gray-200 dark:border-[#2A2D3E] bg-white dark:bg-[#1A1D27] px-4 py-3">
      <div className="flex items-center gap-3">
        <div className="flex size-8 items-center justify-center rounded-lg bg-orange-500">
          <span className="text-xs font-bold text-white">ST</span>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-900 dark:text-[#F0F4FF]">{conn.tenantName}</p>
          <p className="text-xs text-gray-500 dark:text-[#8B90A0]">
            Tenant {conn.tenantId} · {conn.campaignCount} campaigns · {conn.leadsThisMonth} leads this month
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <StatusPill status={conn.status} />
        {testResult && (
          <span className={`text-xs font-medium ${testResult.ok ? "text-green-600" : "text-red-600"}`}>
            {testResult.ok ? "OK" : testResult.error}
          </span>
        )}
        <AssignDropdown connectionId={conn.id} type="st" clients={clients} onRefresh={onRefresh} />
        {conn.status === "ACTIVE" && (
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
      </div>
    </div>
  );
}
