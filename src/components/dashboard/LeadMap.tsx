"use client";

import { useState, useEffect, useRef } from "react";
import type { RoutingStatus } from "@/types/db";
import type mapboxgl from "mapbox-gl";

interface FeedLead {
  id: string;
  firstName: string | null;
  lastName: string | null;
  createdAt: string;
  routingStatus: string;
  lat: number | null;
  lng: number | null;
  stJobId: string | null;
  stLeadId: string | null;
  campaign: { name: string; destinationType: string } | null;
}

interface PopupInfo {
  lead: FeedLead;
  x: number;
  y: number;
}

const STATUS_COLORS: Record<string, string> = {
  SUCCESS: "#22c55e",
  FAILED: "#ef4444",
  PROCESSING: "#f59e0b",
  RETRY: "#f59e0b",
  PENDING: "#94a3b8",
};

function leadName(l: FeedLead): string {
  return [l.firstName, l.lastName].filter(Boolean).join(" ") || "Unknown";
}

function stRecord(l: FeedLead): string {
  if (l.stJobId) return `Job ${l.stJobId}`;
  if (l.stLeadId) return `Lead ${l.stLeadId}`;
  return "—";
}

export function LeadMap({ leads }: { leads: FeedLead[] }) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const [popup, setPopup] = useState<PopupInfo | null>(null);
  const [mapReady, setMapReady] = useState(false);
  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

  useEffect(() => {
    if (!mapContainer.current || mapRef.current || !token) return;

    let cancelled = false;

    import("mapbox-gl").then((mod) => {
      if (cancelled) return;
      const mapboxgl = mod.default;

      // Import CSS — only runs once on client
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = "https://api.mapbox.com/mapbox-gl-js/v3.8.0/mapbox-gl.css";
      document.head.appendChild(link);

      mapboxgl.accessToken = token;

      const map = new mapboxgl.Map({
        container: mapContainer.current!,
        style: "mapbox://styles/mapbox/light-v11",
        center: [-98.5795, 39.8283],
        zoom: 3.5,
      });

      map.on("load", () => {
        if (cancelled) {
          map.remove();
          return;
        }
        mapRef.current = map;
        setMapReady(true);
      });
    });

    return () => {
      cancelled = true;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  useEffect(() => {
    if (!mapReady || !mapRef.current) return;

    import("mapbox-gl").then((mod) => {
      const mapboxgl = mod.default;

      for (const m of markersRef.current) m.remove();
      markersRef.current = [];

      const geoLeads = leads.filter((l) => l.lat !== null && l.lng !== null);

      for (const lead of geoLeads) {
        const el = document.createElement("div");
        const color = STATUS_COLORS[lead.routingStatus] ?? "#94a3b8";
        el.style.cssText = [
          "width:12px",
          "height:12px",
          "border-radius:50%",
          `background:${color}`,
          "border:2px solid white",
          "box-shadow:0 1px 4px rgba(0,0,0,.3)",
          "cursor:pointer",
        ].join(";");

        el.addEventListener("click", (e) => {
          const containerRect = mapContainer.current?.getBoundingClientRect();
          setPopup({
            lead,
            x: e.clientX - (containerRect?.left ?? 0),
            y: e.clientY - (containerRect?.top ?? 0),
          });
          e.stopPropagation();
        });

        const marker = new mapboxgl.Marker({ element: el })
          .setLngLat([lead.lng!, lead.lat!])
          .addTo(mapRef.current!);

        markersRef.current.push(marker);
      }
    });
  }, [mapReady, leads]);

  if (!token) {
    return (
      <div className="flex h-64 items-center justify-center rounded-xl border border-dashed border-gray-200 bg-gray-50">
        <p className="text-sm text-gray-400">
          Add{" "}
          <code className="rounded bg-gray-100 px-1 py-0.5 text-xs">
            NEXT_PUBLIC_MAPBOX_TOKEN
          </code>{" "}
          to enable the map
        </p>
      </div>
    );
  }

  return (
    <div
      data-map-container
      className="relative overflow-hidden rounded-xl border border-gray-200 shadow-sm"
      onClick={() => setPopup(null)}
    >
      <div ref={mapContainer} style={{ width: "100%", height: 360 }} />

      {/* Legend */}
      <div className="absolute bottom-3 left-3 flex items-center gap-3 rounded-md bg-white/90 px-3 py-2 text-xs shadow backdrop-blur-sm">
        {(
          [
            ["SUCCESS", "bg-green-500"],
            ["FAILED", "bg-red-500"],
            ["PENDING", "bg-slate-400"],
            ["RETRY", "bg-amber-400"],
          ] as [RoutingStatus, string][]
        ).map(([label, cls]) => (
          <span key={label} className="flex items-center gap-1">
            <span className={`size-2 rounded-full ${cls}`} />
            {label.toLowerCase()}
          </span>
        ))}
      </div>

      {/* Click popover */}
      {popup && (
        <div
          className="absolute z-10 w-52 rounded-lg border border-gray-200 bg-white p-3 shadow-lg"
          style={{ left: popup.x + 8, top: popup.y - 10 }}
          onClick={(e) => e.stopPropagation()}
        >
          <p className="text-sm font-medium text-gray-900">
            {leadName(popup.lead)}
          </p>
          <p className="mt-0.5 text-xs text-gray-500">
            {popup.lead.campaign?.name ?? "—"}
          </p>
          <p className="mt-1 text-xs text-gray-500">
            ST record: {stRecord(popup.lead)}
          </p>
          <span
            className={`mt-1.5 inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
              popup.lead.routingStatus === "SUCCESS"
                ? "bg-green-100 text-green-700"
                : popup.lead.routingStatus === "FAILED"
                ? "bg-red-100 text-red-700"
                : "bg-amber-100 text-amber-700"
            }`}
          >
            {popup.lead.routingStatus}
          </span>
        </div>
      )}
    </div>
  );
}
