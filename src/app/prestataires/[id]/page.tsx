"use client"

export const dynamic = "force-dynamic"

import { useEffect, useState, useCallback } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase"
import { formatFCFA } from "@/lib/formatters"
import { TrustBadge } from "@/components/app/TrustBadge"
import { MessageThread } from "@/components/app/MessageThread"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Building2, CheckCircle2, Loader2, MapPin, Star, Award, MessageCircle, Images } from "lucide-react"

type Provider = { id: string; display_name: string | null; bio: string | null; trades: string[] | null; quartier: string | null; city: string | null; languages: string[] | null; trust_score: number | null; jobs_done: number | null; is_verified: boolean }
type Service = { id: string; trade: string; title: string; base_price: number | null; price_unit: string }
type Review = { id: string; rating: number; comment: string | null }
type Portfolio = { id: string; media_url: string; caption: string | null }
type Cert = { id: string; label: string; issuer: string | null }

export default function ProviderPublicPage() {
  const params = useParams()
  const supabase = createClient()
  const id = params.id as string
  const [p, setP] = useState<Provider | null>(null)
  const [services, setServices] = useState<Service[]>([])
  const [reviews, setReviews] = useState<Review[]>([])
  const [portfolio, setPortfolio] = useState<Portfolio[]>([])
  const [certs, setCerts] = useState<Cert[]>([])
  const [authed, setAuthed] = useState(false)
  const [chatOpen, setChatOpen] = useState(false)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    const [{ data: prov }, { data: svc }, { data: rev }, { data: pf }, { data: ce }, { data: { user } }] = await Promise.all([
      supabase.from("provider_profiles").select("id, display_name, bio, trades, quartier, city, languages, trust_score, jobs_done, is_verified").eq("id", id).maybeSingle(),
      supabase.from("provider_services").select("id, trade, title, base_price, price_unit").eq("provider_id", id),
      supabase.from("reviews").select("id, rating, comment").eq("provider_id", id).order("created_at", { ascending: false }).limit(10),
      supabase.from("portfolio_items").select("id, media_url, caption").eq("provider_id", id).order("created_at", { ascending: false }),
      supabase.from("certifications").select("id, label, issuer").eq("provider_id", id),
      supabase.auth.getUser(),
    ])
    setP(prov as Provider); setServices((svc as Service[]) ?? []); setReviews((rev as Review[]) ?? [])
    setPortfolio((pf as Portfolio[]) ?? []); setCerts((ce as Cert[]) ?? []); setAuthed(!!user)
    setLoading(false)
  }, [id])

  useEffect(() => { load() }, [load])

  const avg = reviews.length ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : null

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin text-[#f97316]" /></div>
  if (!p) return <div className="min-h-screen flex items-center justify-center text-gray-500">Prestataire introuvable ou non vérifié.</div>

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b bg-white">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#f97316] rounded-lg flex items-center justify-center"><Building2 className="w-5 h-5 text-white" /></div>
            <span className="text-lg font-bold text-[#1a2744]">Locawave</span>
          </Link>
          <Link href="/services" className="text-sm text-[#f97316] hover:underline">← Annuaire</Link>
        </div>
      </header>

      {/* Bannière */}
      <div className="bg-gradient-to-br from-[#1a2744] to-[#1e3a5f] text-white">
        <div className="max-w-3xl mx-auto px-4 py-8">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-2xl bg-[#f97316] flex items-center justify-center text-2xl font-bold shrink-0">
              {(p.display_name ?? "P").charAt(0).toUpperCase()}
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold">{p.display_name ?? "Prestataire"}</h1>
              <p className="text-gray-300 text-sm">{(p.trades ?? []).join(" · ")}</p>
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                {p.is_verified && <Badge className="bg-green-500/20 text-green-300 gap-1"><CheckCircle2 className="w-3 h-3" /> Vérifié</Badge>}
                <TrustBadge score={p.trust_score} jobs={p.jobs_done} />
                {avg && <span className="text-sm flex items-center gap-1"><Star className="w-3.5 h-3.5 text-amber-400" /> {avg}/5 ({reviews.length})</span>}
              </div>
              {(p.quartier || p.city) && <p className="text-gray-400 text-sm mt-1 flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {p.quartier} {p.city}</p>}
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-3xl mx-auto px-4 py-6 space-y-5">
        {p.bio && <Card><CardContent className="py-4 text-sm text-gray-600">{p.bio}</CardContent></Card>}

        {/* Contact */}
        <Card>
          <CardContent className="py-4">
            {chatOpen && authed ? (
              <MessageThread otherId={p.id} otherName={p.display_name ?? "Prestataire"} />
            ) : authed ? (
              <Button onClick={() => setChatOpen(true)} className="w-full bg-[#f97316] hover:bg-[#ea580c] text-white"><MessageCircle className="w-4 h-4 mr-2" /> Contacter (messagerie sécurisée)</Button>
            ) : (
              <Link href="/login" className="block"><Button className="w-full bg-[#f97316] hover:bg-[#ea580c] text-white"><MessageCircle className="w-4 h-4 mr-2" /> Connectez-vous pour contacter</Button></Link>
            )}
          </CardContent>
        </Card>

        {/* Portfolio */}
        {portfolio.length > 0 && (
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><Images className="w-5 h-5 text-[#f97316]" /> Réalisations</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {portfolio.map((it) => (
                  <a key={it.id} href={it.media_url} target="_blank" rel="noreferrer">
                    <img src={it.media_url} alt={it.caption ?? ""} className="w-full h-32 object-cover rounded-lg hover:opacity-90 transition-opacity" />
                  </a>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Services */}
        {services.length > 0 && (
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-base">Prestations</CardTitle></CardHeader>
            <CardContent>
              <div className="divide-y">
                {services.map((s) => (
                  <div key={s.id} className="flex justify-between py-2 text-sm">
                    <span>{s.title} <span className="text-gray-400">· {s.trade}</span></span>
                    <span className="font-medium">{s.base_price ? `${formatFCFA(s.base_price)} / ${s.price_unit}` : "Sur devis"}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Certifications */}
        {certs.length > 0 && (
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><Award className="w-5 h-5 text-[#f97316]" /> Certifications</CardTitle></CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              {certs.map((c) => (
                <Badge key={c.id} className="bg-blue-100 text-blue-700 gap-1"><Award className="w-3.5 h-3.5" /> {c.label}{c.issuer ? ` · ${c.issuer}` : ""}</Badge>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Avis */}
        {reviews.length > 0 && (
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-base">Avis clients</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {reviews.map((r) => (
                <div key={r.id} className="text-sm text-gray-600 border-b pb-2 last:border-0">
                  <span className="text-amber-500">{"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}</span>
                  {r.comment ? <span className="ml-2">{r.comment}</span> : null}
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        <p className="text-[11px] text-gray-400 text-center">Échangez et payez toujours dans l'app Locawave — séquestre sécurisé, jamais de numéro avant d'engager.</p>
      </main>
    </div>
  )
}
