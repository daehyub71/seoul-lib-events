"use client";

import { MapContainer, TileLayer, Marker } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useMemo } from "react";
import { MAP_LOCATIONS } from "@/constants/venues";

interface Props {
  /** 지점별 건수 (현재 필터 기준, F2) */
  counts: Record<string, number>;
  selectedId: string | null;
  onSelect: (locationId: string) => void;
}

const CENTER: [number, number] = [37.5687, 126.9776];

function pinIcon(name: string, count: number, selected: boolean) {
  const base = selected
    ? "background:#0f172a;color:#fff;border-color:#0f172a"
    : "background:#fff;color:#0f172a;border-color:#cbd5e1";
  return L.divIcon({
    className: "", // leaflet 기본 흰 박스 제거
    iconSize: undefined,
    html: `<div style="transform:translate(-50%,-100%);display:inline-flex;align-items:center;gap:6px;white-space:nowrap;border:1.5px solid;border-radius:9999px;padding:4px 10px;font-size:12px;font-weight:600;box-shadow:0 1px 4px rgba(0,0,0,.2);cursor:pointer;${base}">
      ${name}<span style="background:${selected ? "#334155" : "#f1f5f9"};border-radius:9999px;padding:1px 7px;font-weight:700">${count}</span>
    </div>`,
  });
}

/** F1/F2 — 실제 지도 (Leaflet + OSM). 반드시 dynamic(ssr:false)로 로드할 것 */
export default function MapView({ counts, selectedId, onSelect }: Props) {
  const markers = useMemo(
    () =>
      MAP_LOCATIONS.map((loc) => (
        <Marker
          key={`${loc.id}-${counts[loc.id] ?? 0}-${selectedId === loc.id}`}
          position={[loc.lat, loc.lng]}
          icon={pinIcon(loc.name, counts[loc.id] ?? 0, selectedId === loc.id)}
          eventHandlers={{ click: () => onSelect(loc.id) }}
        />
      )),
    [counts, selectedId, onSelect],
  );

  return (
    <MapContainer
      center={CENTER}
      zoom={15}
      scrollWheelZoom
      className="h-full w-full"
      attributionControl
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {markers}
    </MapContainer>
  );
}
