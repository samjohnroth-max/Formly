"use client";

import { MapContainer, TileLayer, CircleMarker, Circle } from "react-leaflet";
import "leaflet/dist/leaflet.css";

interface Props {
  lat: number;
  lng: number;
  radiusMiles: number;
  address: string;
}

export function ServiceAreaMap({ lat, lng, radiusMiles, address }: Props) {
  return (
    <MapContainer
      center={[lat, lng]}
      zoom={9}
      style={{ width: "100%", height: 192 }}
      scrollWheelZoom={false}
      zoomControl={false}
      dragging={false}
      key={`${lat}-${lng}-${radiusMiles}`}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Circle
        center={[lat, lng]}
        radius={radiusMiles * 1609.34}
        pathOptions={{
          color: "#0F4C8F",
          fillColor: "#0F4C8F",
          fillOpacity: 0.1,
          weight: 1.5,
          dashArray: "6 4",
        }}
      />
      <CircleMarker
        center={[lat, lng]}
        radius={6}
        pathOptions={{ color: "#fff", fillColor: "#0F4C8F", fillOpacity: 1, weight: 2 }}
      />
    </MapContainer>
  );
}
