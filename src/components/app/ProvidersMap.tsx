"use client"

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet"
import "leaflet/dist/leaflet.css"
import L from "leaflet"

// Icône par défaut servie depuis le CDN (évite les soucis de chemin avec le bundler)
const icon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41],
})

export type MapProvider = { id: string; display_name: string | null; trades: string[] | null; lat: number | null; lng: number | null }

export default function ProvidersMap({
  providers, center,
}: { providers: MapProvider[]; center: [number, number] }) {
  const pts = providers.filter((p) => p.lat != null && p.lng != null)
  return (
    <MapContainer center={center} zoom={12} style={{ height: 320, width: "100%" }} className="rounded-lg z-0">
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; OpenStreetMap'
      />
      {pts.map((p) => (
        <Marker key={p.id} position={[p.lat as number, p.lng as number]} icon={icon}>
          <Popup>
            <strong>{p.display_name ?? "Prestataire"}</strong><br />
            {(p.trades ?? []).join(", ")}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  )
}
