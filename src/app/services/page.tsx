"use client"

export const dynamic = "force-dynamic"

import { useState, useCallback } from "react"
import dynamicImport from "next/dynamic"
import Link from "next/link"
import { createClient } from "@/lib/supabase"
import { formatFCFA } from "@/lib/formatters"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { MessageThread } from "@/components/app/MessageThread"
import { Building2, MapPin, Search, Star, Loader2, MessageCircle, CheckCircle2 } from "lucide-react"
import { toast } from "sonner"

const ProvidersMap = dynamicImport(() => import("@/components/app/ProvidersMap"), {
  ssr: false,
  loading: () => <div className="h-80 rounded-lg bg-gray-100 animate-pulse" />,
})

type Result = {
  id: string; display_name: string | null; bio: string | null; trades: string[] | null
  quartier: string | null; city: string | null; trust_score: number | null; jobs_done: number | null
  distance_km: number | null; lat: number | null; lng: number | null
}
type Service = { id: string; trade: string; title: string; base_price: number | null; price_unit: string }
type Review = { id: string; rating: number; comment: string | null }

const DAKAR: [number, number] = [14.7167, -17.4677]

export default function ServicesPage() {
  const supabase = createClient()
  const [trade, setTrade] = useState("")
  const [radius, setRadius] = useState(10)
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null)
  const [results, setResults] = useState<Result[]>([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)

  const [selected, setSelected] = useState<Result | null>(null)
  const [services, setServices] = useState<Service[]>([])
  const [reviews, setReviews] = useState<Review[]>([])
  const [authed, setAuthed] = useState(false)
  const [chatOpen, setChatOpen] = useState(false)
  const [bookOpen, setBookOpen] = useState(false)
  const [bookFreq, setBookFreq] = useState("weekly")
  const [bookAmount, setBookAmount] = useState("")
  const [bookTitle, setBookTitle] = useState("")

  const search = useCallback(async (c: { lat: number; lng: number } | null) => {
    setLoading(true); setSearched(true)
    const { data } = await supabase.rpc("search_providers", {
      p_lat: c?.lat ?? null, p_lng: c?.lng ?? null, p_radius_km: radius, p_trade: trade || null,
    })
    setResults((data as Result[]) ?? [])
    setLoading(false)
  }, [trade, radius])

  function nearMe() {
    if (!navigator.geolocation) { toast.error("Géolocalisation indisponible"); search(null); return }
    navigator.geolocation.getCurrentPosition(
      (pos) => { const c = { lat: pos.coords.latitude, lng: pos.coords.longitude }; setCoords(c); search(c) },
      () => { toast.error("Position refusée — recherche sans proximité"); search(null) }
    )
  }

  async function openProvider(r: Result) {
    setSelected(r)
    const [{ data: svc }, { data: rev }, { data: { user } }] = await Promise.all([
      supabase.from("provider_services").select("id, trade, title, base_price, price_unit").eq("provider_id", r.id),
      supabase.from("reviews").select("id, rating, comment").eq("provider_id", r.id).order("created_at", { ascending: false }).limit(5),
      supabase.auth.getUser(),
    ])
    setServices((svc as Service[]) ?? [])
    setReviews((rev as Review[]) ?? [])
    setAuthed(!!user)
    setChatOpen(false)
  }

  async function createBooking() {
    if (!selected) return
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { toast.error("Connectez-vous d'abord"); return }
    const { error } = await supabase.from("recurring_bookings").insert({
      client_id: user.id, provider_id: selected.id,
      title: bookTitle || `Service ${selected.trades?.[0] ?? ""}`.trim(),
      frequency: bookFreq, amount_fcfa: bookAmount ? parseInt(bookAmount) : null,
      next_run: new Date().toISOString().slice(0, 10),
    })
    if (error) { toast.error("Erreur lors de la réservation"); return }
    toast.success("Réservation récurrente créée — séquestre à chaque échéance")
    setBookOpen(false); setBookTitle(""); setBookAmount("")
  }

  const center: [number, number] = coords ? [coords.lat, coords.lng] : DAKAR

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
        <h1 className="text-2xl font-bold text-[#1a2744] mb-1">Trouver un service de proximité</h1>
        <p className="text-gray-500 text-sm mb-4">Plombiers, électriciens, ménage, garde d'enfants… des prestataires vérifiés près de chez vous.</p>

        <Card className="mb-6">
          <CardContent className="py-4 flex flex-col sm:flex-row gap-2">
            <Input placeholder="Quel service ? (ex: Plomberie, ménage)" value={trade} onChange={(e) => setTrade(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") search(coords) }} className="flex-1" />
            <select value={radius} onChange={(e) => setRadius(Number(e.target.value))}
              className="h-10 rounded-md border border-input bg-background px-3 text-sm">
              <option value={5}>5 km</option><option value={10}>10 km</option><option value={25}>25 km</option><option value={100}>Tout Dakar</option>
            </select>
            <Button variant="outline" onClick={nearMe}><MapPin className="w-4 h-4 mr-1" /> Près de moi</Button>
            <Button onClick={() => search(coords)} className="bg-[#f97316] hover:bg-[#ea580c] text-white"><Search className="w-4 h-4 mr-1" /> Rechercher</Button>
          </CardContent>
        </Card>

        {searched && (
          <div className="mb-6"><ProvidersMap providers={results} center={center} /></div>
        )}

        {loading ? (
          <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 animate-spin text-[#f97316]" /></div>
        ) : !searched ? (
          <p className="text-gray-400 text-center py-10">Lancez une recherche pour voir les prestataires.</p>
        ) : results.length === 0 ? (
          <p className="text-gray-400 text-center py-10">Aucun prestataire vérifié trouvé. Élargissez la zone ou le métier.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {results.map((r) => (
              <Card key={r.id} className="cursor-pointer hover:border-[#f97316]/50" onClick={() => openProvider(r)}>
                <CardContent className="py-4">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-[#1a2744]">{r.display_name ?? "Prestataire"}</p>
                    <Badge className="bg-green-100 text-green-700 gap-1"><CheckCircle2 className="w-3 h-3" /> Vérifié</Badge>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">{(r.trades ?? []).join(", ")}</p>
                  <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                    <span className="flex items-center gap-1"><Star className="w-3.5 h-3.5 text-amber-500" /> {Number(r.trust_score ?? 0).toFixed(1)}</span>
                    {r.quartier && <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {r.quartier}</span>}
                    {r.distance_km != null && <span>{r.distance_km.toFixed(1)} km</span>}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      {/* Fiche prestataire */}
      <Dialog open={!!selected} onOpenChange={(o) => { if (!o) setSelected(null) }}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{selected?.display_name ?? "Prestataire"}</DialogTitle></DialogHeader>
          {selected && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-sm">
                <Badge className="bg-green-100 text-green-700 gap-1"><CheckCircle2 className="w-3 h-3" /> Vérifié</Badge>
                <span className="flex items-center gap-1"><Star className="w-3.5 h-3.5 text-amber-500" /> {Number(selected.trust_score ?? 0).toFixed(1)}</span>
                <span className="text-gray-500">{selected.quartier} {selected.city}</span>
              </div>
              {selected.bio && <p className="text-sm text-gray-600">{selected.bio}</p>}

              {services.length > 0 && (
                <div>
                  <p className="text-sm font-medium mb-1">Prestations</p>
                  <div className="divide-y">
                    {services.map((s) => (
                      <div key={s.id} className="flex justify-between py-1.5 text-sm">
                        <span>{s.title} <span className="text-gray-400">· {s.trade}</span></span>
                        <span>{s.base_price ? `${formatFCFA(s.base_price)} / ${s.price_unit}` : "Sur devis"}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {reviews.length > 0 && (
                <div>
                  <p className="text-sm font-medium mb-1">Avis</p>
                  {reviews.map((rv) => (
                    <div key={rv.id} className="text-sm text-gray-600">★ {rv.rating}/5 — {rv.comment ?? ""}</div>
                  ))}
                </div>
              )}

              {chatOpen ? (
                <MessageThread otherId={selected.id} otherName={selected.display_name ?? "Prestataire"} />
              ) : authed ? (
                <Button onClick={() => setChatOpen(true)} className="w-full bg-[#f97316] hover:bg-[#ea580c] text-white">
                  <MessageCircle className="w-4 h-4 mr-2" /> Contacter (messagerie sécurisée)
                </Button>
              ) : (
                <Link href="/login" className="block">
                  <Button className="w-full bg-[#f97316] hover:bg-[#ea580c] text-white">
                    <MessageCircle className="w-4 h-4 mr-2" /> Connectez-vous pour contacter
                  </Button>
                </Link>
              )}
              {authed && !chatOpen && (
                <div className="border-t pt-3">
                  {!bookOpen ? (
                    <Button variant="outline" className="w-full" onClick={() => setBookOpen(true)}>
                      Réservation récurrente (ménage, etc.)
                    </Button>
                  ) : (
                    <div className="space-y-2">
                      <Input placeholder="Intitulé (ex: Ménage hebdomadaire)" value={bookTitle} onChange={(e) => setBookTitle(e.target.value)} />
                      <div className="grid grid-cols-2 gap-2">
                        <select value={bookFreq} onChange={(e) => setBookFreq(e.target.value)} className="h-10 rounded-md border border-input bg-background px-3 text-sm">
                          <option value="weekly">Chaque semaine</option>
                          <option value="biweekly">Toutes les 2 semaines</option>
                          <option value="monthly">Chaque mois</option>
                        </select>
                        <Input type="number" placeholder="Montant FCFA / passage" value={bookAmount} onChange={(e) => setBookAmount(e.target.value)} />
                      </div>
                      <Button onClick={createBooking} className="w-full bg-[#1a2744] hover:bg-[#0f1a2e] text-white">Confirmer la réservation récurrente</Button>
                    </div>
                  )}
                </div>
              )}
              <p className="text-[11px] text-gray-400 text-center">Échangez dans l'app — ne communiquez jamais votre numéro avant d'engager.</p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
