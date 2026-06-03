"use client"

export const dynamic = "force-dynamic"

import { useState, useCallback } from "react"
import dynamicImport from "next/dynamic"
import Link from "next/link"
import { createClient } from "@/lib/supabase"
import { formatFCFA } from "@/lib/formatters"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { EmptyState } from "@/components/app/EmptyState"
import { Building2, MapPin, Search, Loader2, CheckCircle2, Home } from "lucide-react"
import { toast } from "sonner"

const ProvidersMap = dynamicImport(() => import("@/components/app/ProvidersMap"), {
  ssr: false, loading: () => <div className="h-80 rounded-lg bg-gray-100 animate-pulse" />,
})

type Listing = {
  id: string; title: string; type: string; rent_fcfa: number; charges_fcfa: number | null
  rooms: number | null; area_m2: number | null; quartier: string | null; city: string | null
  photos: string[] | null; is_verified: boolean; distance_km: number | null; lat: number | null; lng: number | null
}
const DAKAR: [number, number] = [14.7167, -17.4677]
const TYPES = ["", "appartement", "chambre", "maison", "studio", "bureau"]

export default function AnnoncesPublicPage() {
  const supabase = createClient()
  const [type, setType] = useState("")
  const [maxRent, setMaxRent] = useState("")
  const [minRooms, setMinRooms] = useState("")
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null)
  const [results, setResults] = useState<Listing[]>([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)
  const [selected, setSelected] = useState<Listing | null>(null)
  const [authed, setAuthed] = useState(false)

  const search = useCallback(async (c: { lat: number; lng: number } | null) => {
    setLoading(true); setSearched(true)
    const { data } = await supabase.rpc("search_listings", {
      p_lat: c?.lat ?? null, p_lng: c?.lng ?? null, p_radius_km: 25,
      p_type: type || null, p_max_rent: maxRent ? parseInt(maxRent) : null,
      p_min_rooms: minRooms ? parseInt(minRooms) : null, p_city: null,
    })
    setResults((data as Listing[]) ?? [])
    setLoading(false)
  }, [type, maxRent, minRooms])

  function nearMe() {
    if (!navigator.geolocation) { search(null); return }
    navigator.geolocation.getCurrentPosition(
      (pos) => { const c = { lat: pos.coords.latitude, lng: pos.coords.longitude }; setCoords(c); search(c) },
      () => { toast.error("Position refusée"); search(null) })
  }

  async function openListing(l: Listing) {
    setSelected(l)
    const { data: { user } } = await supabase.auth.getUser()
    setAuthed(!!user)
  }

  const center: [number, number] = coords ?? DAKAR
  const mapPoints = results.map((l) => ({ id: l.id, display_name: l.title, trades: [formatFCFA(l.rent_fcfa)], lat: l.lat, lng: l.lng }))

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b bg-white">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#f97316] rounded-lg flex items-center justify-center"><Building2 className="w-5 h-5 text-white" /></div>
            <span className="text-lg font-bold text-[#1a2744]">Locawave</span>
          </Link>
          <Link href="/login" className="text-sm text-[#f97316] hover:underline">Se connecter</Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold text-[#1a2744] mb-1">Trouver un logement à louer</h1>
        <p className="text-gray-500 text-sm mb-4">Annonces vérifiées par Locawave, partout au Sénégal.</p>

        <Card className="mb-6"><CardContent className="py-4 flex flex-col sm:flex-row gap-2 flex-wrap">
          <select value={type} onChange={(e) => setType(e.target.value)} className="h-10 rounded-md border border-input bg-background px-3 text-sm">
            <option value="">Tout type</option>
            {TYPES.filter(Boolean).map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
          <Input type="number" placeholder="Budget max FCFA" value={maxRent} onChange={(e) => setMaxRent(e.target.value)} className="w-40" />
          <Input type="number" placeholder="Pièces min" value={minRooms} onChange={(e) => setMinRooms(e.target.value)} className="w-28" />
          <Button variant="outline" onClick={nearMe}><MapPin className="w-4 h-4 mr-1" /> Près de moi</Button>
          <Button onClick={() => search(coords)} className="bg-[#f97316] hover:bg-[#ea580c] text-white"><Search className="w-4 h-4 mr-1" /> Rechercher</Button>
        </CardContent></Card>

        {searched && <div className="mb-6"><ProvidersMap providers={mapPoints} center={center} /></div>}

        {loading ? <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 animate-spin text-[#f97316]" /></div>
          : !searched ? <p className="text-gray-400 text-center py-10">Lancez une recherche pour voir les logements.</p>
          : results.length === 0 ? <EmptyState icon={Home} title="Aucune annonce trouvée" description="Élargissez vos critères (budget, type, zone) pour voir plus de logements." />
          : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {results.map((l) => (
              <Card key={l.id} className="cursor-pointer hover:border-[#f97316]/50" onClick={() => openListing(l)}>
                <CardContent className="py-4">
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-semibold text-[#1a2744]">{l.title}</p>
                    {l.is_verified && <Badge className="bg-green-100 text-green-700 gap-1 shrink-0"><CheckCircle2 className="w-3 h-3" /> Vérifié</Badge>}
                  </div>
                  <p className="text-sm text-gray-500 mt-1 capitalize">{l.type}{l.rooms ? ` · ${l.rooms} pièces` : ""}{l.area_m2 ? ` · ${l.area_m2} m²` : ""}</p>
                  <p className="font-bold text-[#1a2744] mt-1">{formatFCFA(l.rent_fcfa)} <span className="text-xs font-normal text-gray-400">/ mois</span></p>
                  <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                    {l.quartier && <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {l.quartier} {l.city}</span>}
                    {l.distance_km != null && <span>{l.distance_km.toFixed(1)} km</span>}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      <Dialog open={!!selected} onOpenChange={(o) => { if (!o) setSelected(null) }}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle className="flex items-center gap-2"><Home className="w-5 h-5 text-[#f97316]" /> {selected?.title}</DialogTitle></DialogHeader>
          {selected && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                {selected.is_verified && <Badge className="bg-green-100 text-green-700 gap-1"><CheckCircle2 className="w-3 h-3" /> Vérifié par Locawave</Badge>}
                <span className="capitalize text-gray-500">{selected.type}</span>
              </div>
              <p className="text-2xl font-bold text-[#1a2744]">{formatFCFA(selected.rent_fcfa)} <span className="text-sm font-normal text-gray-400">/ mois</span></p>
              <div className="text-sm text-gray-600 space-y-1">
                {selected.charges_fcfa ? <p>Charges : {formatFCFA(selected.charges_fcfa)}</p> : null}
                {selected.rooms ? <p>{selected.rooms} pièces{selected.area_m2 ? ` · ${selected.area_m2} m²` : ""}</p> : null}
                {selected.quartier && <p>{selected.quartier}, {selected.city}</p>}
              </div>
              {authed ? (
                <Link href={`/annonces/${selected.id}`} className="block">
                  <Button className="w-full bg-[#f97316] hover:bg-[#ea580c] text-white">Postuler / Visiter</Button>
                </Link>
              ) : (
                <Link href="/login" className="block">
                  <Button className="w-full bg-[#f97316] hover:bg-[#ea580c] text-white">Connectez-vous pour postuler</Button>
                </Link>
              )}
              <p className="text-[11px] text-gray-400 text-center">Candidature et visite sécurisées dans l'app.</p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
