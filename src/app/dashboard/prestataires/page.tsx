"use client"

export const dynamic = "force-dynamic"

import { useEffect, useState, useCallback } from "react"
import { createClient } from "@/lib/supabase"
import { formatFCFA } from "@/lib/formatters"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import Link from "next/link"
import { Wrench, Star, MapPin, Search, BookmarkPlus, BookmarkCheck, CheckCircle2, ExternalLink } from "lucide-react"
import { toast } from "sonner"

type Provider = {
  id: string; display_name: string | null; bio: string | null; trades: string[] | null
  quartier: string | null; city: string | null; trust_score: number | null; jobs_done: number | null
}
type Service = { id: string; trade: string; title: string; base_price: number | null; price_unit: string }
type Review = { id: string; rating: number; comment: string | null }

export default function DashboardProvidersPage() {
  const supabase = createClient()
  const [uid, setUid] = useState<string | null>(null)
  const [trade, setTrade] = useState("")
  const [providers, setProviders] = useState<Provider[]>([])
  const [trusted, setTrusted] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<Provider | null>(null)
  const [services, setServices] = useState<Service[]>([])
  const [reviews, setReviews] = useState<Review[]>([])

  const load = useCallback(async () => {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (user) setUid(user.id)
    const { data } = await supabase.rpc("search_providers", { p_lat: null, p_lng: null, p_radius_km: 100, p_trade: trade || null })
    setProviders((data as Provider[]) ?? [])
    if (user) {
      const { data: tp } = await supabase.from("trusted_providers").select("provider_id").eq("owner_id", user.id)
      setTrusted(new Set((tp ?? []).map((t) => t.provider_id)))
    }
    setLoading(false)
  }, [trade])

  useEffect(() => { load() }, [])

  async function toggleTrust(p: Provider) {
    if (!uid) return
    if (trusted.has(p.id)) {
      await supabase.from("trusted_providers").delete().eq("owner_id", uid).eq("provider_id", p.id)
      toast.success("Retiré du carnet")
    } else {
      await supabase.from("trusted_providers").insert({ owner_id: uid, provider_id: p.id })
      toast.success("Ajouté à votre carnet d'artisans")
    }
    load()
  }

  async function openProvider(p: Provider) {
    setSelected(p)
    const [{ data: svc }, { data: rev }] = await Promise.all([
      supabase.from("provider_services").select("id, trade, title, base_price, price_unit").eq("provider_id", p.id),
      supabase.from("reviews").select("id, rating, comment").eq("provider_id", p.id).order("created_at", { ascending: false }).limit(5),
    ])
    setServices((svc as Service[]) ?? [])
    setReviews((rev as Review[]) ?? [])
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#1a2744] mb-2 flex items-center gap-2"><Wrench className="w-6 h-6 text-[#f97316]" /> Prestataires</h1>
      <p className="text-gray-500 text-sm mb-4">Trouvez des artisans vérifiés et constituez votre carnet d'artisans (proposés en priorité lors d'un incident).</p>

      <Card className="mb-4"><CardContent className="py-3 flex gap-2">
        <Input placeholder="Métier (ex: Plomberie, Électricité)" value={trade} onChange={(e) => setTrade(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") load() }} className="flex-1" />
        <Button onClick={load} className="bg-[#f97316] hover:bg-[#ea580c] text-white"><Search className="w-4 h-4 mr-1" /> Rechercher</Button>
      </CardContent></Card>

      {loading ? <Skeleton className="h-40" /> : providers.length === 0 ? (
        <div className="text-center py-16 text-gray-400">Aucun prestataire vérifié pour ce métier.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {providers.map((p) => (
            <Card key={p.id} className="hover:border-[#f97316]/50">
              <CardContent className="py-4">
                <div className="flex items-center justify-between">
                  <button className="font-semibold text-[#1a2744] hover:underline text-left" onClick={() => openProvider(p)}>{p.display_name ?? "Prestataire"}</button>
                  <Badge className="bg-green-100 text-green-700 gap-1"><CheckCircle2 className="w-3 h-3" /> Vérifié</Badge>
                </div>
                <p className="text-sm text-gray-500 mt-1">{(p.trades ?? []).join(", ")}</p>
                <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                  <span className="flex items-center gap-1"><Star className="w-3.5 h-3.5 text-amber-500" /> {Number(p.trust_score ?? 0).toFixed(1)}</span>
                  {p.quartier && <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {p.quartier}</span>}
                </div>
                <Button size="sm" variant={trusted.has(p.id) ? "outline" : "default"}
                  className={`mt-3 ${trusted.has(p.id) ? "" : "bg-[#1a2744] hover:bg-[#0f1a2e] text-white"}`} onClick={() => toggleTrust(p)}>
                  {trusted.has(p.id) ? <><BookmarkCheck className="w-4 h-4 mr-1" /> Dans le carnet</> : <><BookmarkPlus className="w-4 h-4 mr-1" /> Ajouter au carnet</>}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={!!selected} onOpenChange={(o) => { if (!o) setSelected(null) }}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{selected?.display_name ?? "Prestataire"}</DialogTitle></DialogHeader>
          {selected && (
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <Badge className="bg-green-100 text-green-700 gap-1"><CheckCircle2 className="w-3 h-3" /> Vérifié</Badge>
                <span className="flex items-center gap-1"><Star className="w-3.5 h-3.5 text-amber-500" /> {Number(selected.trust_score ?? 0).toFixed(1)}</span>
                <span className="text-gray-500">{selected.quartier} {selected.city}</span>
              </div>
              {selected.bio && <p className="text-sm text-gray-600">{selected.bio}</p>}
              <Link href={`/prestataires/${selected.id}`} target="_blank" className="text-sm text-[#f97316] hover:underline inline-flex items-center gap-1">
                <ExternalLink className="w-3.5 h-3.5" /> Voir la fiche complète
              </Link>
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
                  {reviews.map((rv) => <div key={rv.id} className="text-sm text-gray-600">★ {rv.rating}/5 — {rv.comment ?? ""}</div>)}
                </div>
              )}
              <Button onClick={() => toggleTrust(selected)} variant={trusted.has(selected.id) ? "outline" : "default"}
                className={`w-full ${trusted.has(selected.id) ? "" : "bg-[#1a2744] hover:bg-[#0f1a2e] text-white"}`}>
                {trusted.has(selected.id) ? "Retirer du carnet" : "Ajouter au carnet d'artisans"}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
