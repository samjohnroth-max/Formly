"use client";

import { useState, useTransition } from "react";
import { X, Loader2 } from "lucide-react";

interface AddClientModalProps {
  onCreated: (client: { id: string; name: string }) => void;
  onClose: () => void;
}

export function AddClientModal({ onCreated, onClose }: AddClientModalProps) {
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleCreate() {
    const trimmed = name.trim();
    if (!trimmed) { setError("Client name is required"); return; }
    setError(null);
    startTransition(async () => {
      const res = await fetch("/api/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: trimmed }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Failed to create client"); return; }
      onCreated(data);
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-sm rounded-xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <h2 className="text-base font-semibold text-gray-900">Add Client</h2>
          <button onClick={onClose} className="rounded-md p-1 hover:bg-gray-100">
            <X className="size-4 text-gray-500" />
          </button>
        </div>
        <div className="space-y-4 p-6">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Client name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => { setName(e.target.value); setError(null); }}
              onKeyDown={(e) => { if (e.key === "Enter") handleCreate(); }}
              placeholder="e.g. Acme HVAC"
              autoFocus
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0F4C8F]"
            />
            {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
          </div>
          <p className="text-xs text-gray-500">
            After creating the client, connect their Meta account and ServiceTitan tenant from the card that appears.
          </p>
          <div className="flex justify-end gap-3">
            <button onClick={onClose} className="rounded-md px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100">
              Cancel
            </button>
            <button
              onClick={handleCreate}
              disabled={isPending || !name.trim()}
              className="inline-flex items-center gap-2 rounded-md bg-[#0F4C8F] px-4 py-2 text-sm font-medium text-white hover:bg-[#0D3F7A] disabled:opacity-50"
            >
              {isPending && <Loader2 className="size-4 animate-spin" />}
              {isPending ? "Creating…" : "Create Client"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
