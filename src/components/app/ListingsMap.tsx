"use client"

import { useEffect, useMemo } from "react"
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet"
import MarkerClusterGroup from "react-leaflet-cluster"
import Link from "next/link"
import "leaflet/dist/leaflet.css"
import "leaflet.markercluster/dist/MarkerCluster.css"
import "leaflet.markercluster/dist/MarkerCluster.Default.css"
import L from "leaflet"
import { formatFCFA } from "@/lib/formatters"

/**
 * Carte de recherche des annonces.
 *
 * Le projet n'avait aucune carte pour les annonces — seulement une liste et une
 * carte de prestataires. Celle-ci reprend ses conventions (fond OpenStreetMap,
 * icônes servies par CDN pour éviter les chemins cassés par le bundler) et y
 * ajoute le regroupement des points, indispensable dès qu'un quartier concentre
 * plusieurs biens : sans lui, les marqueurs se superposent et deviennent
 * incliquables.
 */

const icone = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41],
})

export type AnnonceCarte = {
  id: string
  title: string
  type: string
  rent_fcfa: number
  rooms: number | null
  quartier: string | null
  city: string | null
  photo: string | null
  lat: number | null
  lng: number | null
  published_at: string | null
}

/** Recentre la carte quand le jeu de résultats change (filtre, recherche). */
function Recentrer({ points }: { points: [number, number][] }) {
  const map = useMap()
  useEffect(() => {
    if (points.length === 0) return
    if (points.length === 1) {
      map.setView(points[0], 15)
      return
    }
    map.fitBounds(L.latLngBounds(points), { padding: [40, 40], maxZoom: 15 })
  }, [points, map])
  return null
}

/** « Nouveau » sous 48 h, « Récent » sous 7 jours — même règle que la liste. */
function fraicheur(publie: string | null): { texte: string; classe: string } | null {
  if (!publie) return null
  const heures = (Date.now() - new Date(publie).getTime()) / 3_600_000
  if (heures < 48) return { texte: "Nouveau", classe: "bg-[#f97316] text-white" }
  if (heures < 24 * 7) return { texte: "Récent", classe: "bg-amber-100 text-amber-800" }
  return null
}

export default function ListingsMap({
  annonces,
  center = [14.6928, -17.4467], // Dakar
  hauteur = 520,
}: {
  annonces: AnnonceCarte[]
  center?: [number, number]
  hauteur?: number
}) {
  const localisees = useMemo(
    () => annonces.filter((a) => a.lat != null && a.lng != null),
    [annonces]
  )
  const points = useMemo(
    () => localisees.map((a) => [a.lat as number, a.lng as number] as [number, number]),
    [localisees]
  )

  return (
    <div className="relative">
      <MapContainer
        center={center}
        zoom={12}
        scrollWheelZoom
        style={{ height: hauteur, width: "100%" }}
        className="z-0 rounded-xl"
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap"
        />
        <Recentrer points={points} />

        <MarkerClusterGroup chunkedLoading maxClusterRadius={55}>
          {localisees.map((a) => {
            const f = fraicheur(a.published_at)
            return (
              <Marker key={a.id} position={[a.lat as number, a.lng as number]} icon={icone}>
                <Popup minWidth={210}>
                  <span className="block">
                    {a.photo && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={a.photo} alt="" className="mb-1.5 h-24 w-full rounded object-cover" />
                    )}
                    <span className="flex items-center gap-1.5">
                      <strong className="text-[#1a2744]">{formatFCFA(a.rent_fcfa)}</strong>
                      {f && (
                        <span className={`rounded px-1.5 py-0.5 text-[10px] font-semibold ${f.classe}`}>
                          {f.texte}
                        </span>
                      )}
                    </span>
                    <span className="block text-xs text-gray-600">{a.title}</span>
                    <span className="block text-xs text-gray-400">
                      {[a.quartier, a.city].filter(Boolean).join(", ")}
                      {a.rooms ? ` · ${a.rooms} pièce(s)` : ""}
                    </span>
                    <Link
                      href={`/annonces/${a.id}`}
                      className="mt-1.5 block text-xs font-semibold text-[#f97316] hover:underline"
                    >
                      Voir l&apos;annonce →
                    </Link>
                  </span>
                </Popup>
              </Marker>
            )
          })}
        </MarkerClusterGroup>
      </MapContainer>

      {/* Une annonce sans coordonnées n'apparaît pas sur la carte. On le dit,
          plutôt que de laisser croire que le quartier est vide. */}
      {annonces.length > localisees.length && (
        <p className="mt-2 text-xs text-gray-500">
          {annonces.length - localisees.length} annonce(s) sans position ne
          figurent pas sur la carte — elles restent visibles dans la liste.
        </p>
      )}
    </div>
  )
}
