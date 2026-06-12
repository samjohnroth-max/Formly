"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { MapPin, Save, Loader2 } from "lucide-react";

const ServiceAreaMap = dynamic(() => import("./ServiceAreaMap").then((m) => m.ServiceAreaMap), {
  ssr: false,
  loading: () => <div className="h-48 animate-pulse rounded-lg bg-gray-100 dark:bg-[#0F1117]" />,
});

interface ServiceArea {
  address: string;
  lat: number;
  lng: number;
  radiusMiles: number;
}

export function ServiceAreaSettings({ initial }: { initial: ServiceArea | null }) {
  const [address, setAddress] = useState(initial?.address ?? "");
  const [radiusMiles, setRadiusMiles] = useState(initial?.radiusMiles ?? 25);
  const [saved, setSaved] = useState<ServiceArea | null>(initial);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Debounce radius changes into saved preview
  useEffect(() => {
    if (saved) setSaved((s) => s ? { ...s, radiusMiles } : s);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [radiusMiles]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess(false);
    setSaving(true);

    try {
      const res = await fetch("/api/service-area", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address, radiusMiles }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Failed to save");
        return;
      }
      setSaved(data.serviceArea);
      setAddress(data.serviceArea.address);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="rounded-xl border border-gray-200 dark:border-[#2A2D3E] bg-white dark:bg-[#1A1D27] shadow-sm p-6">
      <h2 className="text-sm font-semibold text-gray-900 dark:text-[#F0F4FF] flex items-center gap-2 mb-1">
        <MapPin className="size-4 text-gray-500 dark:text-[#8B90A0]" />
        Service area
      </h2>
      <p className="text-xs text-gray-500 dark:text-[#8B90A0] mb-5">
        Set your business location and coverage radius. Leads outside this area are flagged on the map and lead list.
      </p>

      <form onSubmit={handleSave} className="space-y-4">
        {error && (
          <div className="rounded-lg bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 px-3 py-2 text-sm text-red-700 dark:text-red-400">
            {error}
          </div>
        )}
        {success && (
          <div className="rounded-lg bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/30 px-3 py-2 text-sm text-green-700 dark:text-green-400">
            Service area saved.
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-[#F0F4FF] mb-1.5">
            Business address
          </label>
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="123 Main St, Dallas, TX 75201"
            required
            className="w-full px-3 py-2 border border-gray-300 dark:border-[#2A2D3E] rounded-lg text-sm text-gray-900 dark:text-[#F0F4FF] bg-white dark:bg-[#0F1117] placeholder:text-gray-400 dark:placeholder:text-[#8B90A0] focus:outline-none focus:ring-2 focus:ring-[#0F4C8F] dark:focus:ring-[#3B7DD8] focus:border-transparent"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-sm font-medium text-gray-700 dark:text-[#F0F4FF]">
              Service radius
            </label>
            <span className="text-sm font-semibold text-[#0F4C8F] dark:text-[#3B7DD8]">
              {radiusMiles} miles
            </span>
          </div>
          <input
            type="range"
            min={5}
            max={150}
            step={5}
            value={radiusMiles}
            onChange={(e) => setRadiusMiles(Number(e.target.value))}
            className="w-full accent-[#0F4C8F] dark:accent-[#3B7DD8]"
          />
          <div className="flex justify-between text-xs text-gray-400 dark:text-[#8B90A0] mt-1">
            <span>5 mi</span>
            <span>150 mi</span>
          </div>
        </div>

        {/* Map preview */}
        {saved && (
          <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-[#2A2D3E]">
            <ServiceAreaMap
              lat={saved.lat}
              lng={saved.lng}
              radiusMiles={radiusMiles}
              address={saved.address}
            />
          </div>
        )}

        <button
          type="submit"
          disabled={saving}
          className="flex items-center gap-2 rounded-lg bg-[#0F4C8F] dark:bg-[#3B7DD8] px-5 py-2 text-sm font-semibold text-white hover:bg-[#0D3F7A] dark:hover:bg-[#2E6BBF] disabled:opacity-60 transition-colors"
        >
          {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
          {saving ? "Geocoding & saving…" : "Save service area"}
        </button>
      </form>
    </div>
  );
}
