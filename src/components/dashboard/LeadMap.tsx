"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, CircleMarker, Circle, Tooltip, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";

interface FeedLead {
  id: string;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  createdAt: string;
  routingStatus: string;
  lat: number | null;
  lng: number | null;
  stJobId: string | null;
  stLeadId: string | null;
  distanceMiles: number | null;
  inServiceArea: boolean | null;
  campaign: { name: string; destinationType: string } | null;
}

interface ServiceAreaData {
  lat: number;
  lng: number;
  radiusMiles: number;
  address: string;
}

function leadName(l: FeedLead) {
  return [l.firstName, l.lastName].filter(Boolean).join(" ") || "Unknown";
}

function stRecord(l: FeedLead) {
  if (l.stJobId) return `Job ${l.stJobId}`;
  if (l.stLeadId) return `Lead ${l.stLeadId}`;
  return "—";
}

function pinColor(l: FeedLead): string {
  if (l.inServiceArea === true) return "#1D9E75";
  if (l.inServiceArea === false) return "#E24B4A";
  return "#94a3b8";
}

// Auto-fit map to show all leads + service area
function MapFitter({ leads, serviceArea }: { leads: FeedLead[]; serviceArea: ServiceAreaData | null }) {
  const map = useMap();

  useEffect(() => {
    const points: [number, number][] = leads
      .filter((l) => l.lat != null && l.lng != null)
      .map((l) => [l.lat!, l.lng!]);

    if (serviceArea) points.push([serviceArea.lat, serviceArea.lng]);

    if (points.length === 0) {
      map.setView([39.8283, -98.5795], 4);
      return;
    }

    // Compute bounding box
    const lats = points.map((p) => p[0]);
    const lngs = points.map((p) => p[1]);
    const pad = 0.5;
    map.fitBounds(
      [
        [Math.min(...lats) - pad, Math.min(...lngs) - pad],
        [Math.max(...lats) + pad, Math.max(...lngs) + pad],
      ],
      { maxZoom: 10, animate: false }
    );
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}

export function LeadMap({
  leads,
  serviceArea,
}: {
  leads: FeedLead[];
  serviceArea: ServiceAreaData | null;
}) {
  const geoLeads = leads.filter((l) => l.lat != null && l.lng != null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = geoLeads.find((l) => l.id === selectedId) ?? null;

  const center: [number, number] = serviceArea
    ? [serviceArea.lat, serviceArea.lng]
    : [39.8283, -98.5795];

  return (
    <div
      className="relative overflow-hidden rounded-xl border border-gray-200 dark:border-[#2A2D3E] shadow-sm"
      onClick={() => setSelectedId(null)}
    >
      <MapContainer
        center={center}
        zoom={4}
        style={{ width: "100%", height: 360 }}
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapFitter leads={geoLeads} serviceArea={serviceArea} />

        {/* Service area circle */}
        {serviceArea && (
          <>
            <Circle
              center={[serviceArea.lat, serviceArea.lng]}
              radius={serviceArea.radiusMiles * 1609.34}
              pathOptions={{
                color: "#0F4C8F",
                fillColor: "#0F4C8F",
                fillOpacity: 0.08,
                weight: 1.5,
                dashArray: "6 4",
              }}
            />
            <CircleMarker
              center={[serviceArea.lat, serviceArea.lng]}
              radius={5}
              pathOptions={{ color: "#0F4C8F", fillColor: "#0F4C8F", fillOpacity: 1, weight: 2 }}
            >
              <Tooltip direction="top" permanent={false}>
                {serviceArea.address}
              </Tooltip>
            </CircleMarker>
          </>
        )}

        {/* Lead pins */}
        {geoLeads.map((lead) => (
          <CircleMarker
            key={lead.id}
            center={[lead.lat!, lead.lng!]}
            radius={7}
            pathOptions={{
              color: "#fff",
              fillColor: pinColor(lead),
              fillOpacity: 1,
              weight: 2,
            }}
            eventHandlers={{
              click: (e) => {
                e.originalEvent.stopPropagation();
                setSelectedId(lead.id === selectedId ? null : lead.id);
              },
            }}
          />
        ))}
      </MapContainer>

      {/* Legend */}
      <div className="absolute bottom-3 left-3 z-[1000] flex flex-col gap-1 rounded-md bg-white/90 dark:bg-[#1A1D27]/90 px-3 py-2 text-xs shadow backdrop-blur-sm">
        {serviceArea ? (
          <>
            <span className="flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-[#1D9E75]" />
              In service area
            </span>
            <span className="flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-[#E24B4A]" />
              Outside service area
            </span>
            <span className="flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-slate-400" />
              No location
            </span>
          </>
        ) : (
          <>
            <span className="flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-green-500" />
              success
            </span>
            <span className="flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-red-500" />
              failed
            </span>
            <span className="flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-slate-400" />
              pending
            </span>
          </>
        )}
      </div>

      {/* Popover */}
      {selected && (
        <div
          className="absolute right-3 top-3 z-[1000] w-56 rounded-lg border border-gray-200 dark:border-[#2A2D3E] bg-white dark:bg-[#1A1D27] p-3 shadow-lg"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-start justify-between gap-2">
            <p className="text-sm font-medium text-gray-900 dark:text-[#F0F4FF]">{leadName(selected)}</p>
            <button
              onClick={() => setSelectedId(null)}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-xs leading-none"
            >
              ✕
            </button>
          </div>
          {selected.phone && (
            <p className="mt-0.5 text-xs text-gray-500 dark:text-[#8B90A0]">{selected.phone}</p>
          )}
          <p className="mt-0.5 text-xs text-gray-500 dark:text-[#8B90A0]">
            {selected.campaign?.name ?? "—"}
          </p>
          <p className="mt-0.5 text-xs text-gray-400 dark:text-[#8B90A0]">ST: {stRecord(selected)}</p>
          {selected.distanceMiles != null && (
            <p className="mt-0.5 text-xs text-gray-500 dark:text-[#8B90A0]">
              {selected.distanceMiles} mi from business
            </p>
          )}
          <div className="mt-2">
            {selected.inServiceArea === true && (
              <span className="inline-flex items-center rounded-full bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 dark:text-emerald-400">
                ✓ In service area
              </span>
            )}
            {selected.inServiceArea === false && (
              <span className="inline-flex items-center rounded-full bg-red-50 dark:bg-red-500/10 px-2 py-0.5 text-[10px] font-semibold text-red-700 dark:text-red-400">
                ✕ Outside service area
              </span>
            )}
            {selected.inServiceArea === null && (
              <span className="inline-flex items-center rounded-full bg-gray-100 dark:bg-[#2A2D3E] px-2 py-0.5 text-[10px] font-semibold text-gray-500 dark:text-[#8B90A0]">
                No location
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
