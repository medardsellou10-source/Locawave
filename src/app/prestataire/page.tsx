"use client"

export const dynamic = "force-dynamic"

import { useEffect, useState, useCallback } from "react"
import { createClient } from "@/lib/supabase"
import { formatFCFA, formatDateFR } from "@/lib/formatters"
import { KycUpload } from "@/components/app/KycUpload"
import { Inbox } from "@/components/app/Inbox"
import { TrustBadge } from "@/components/app/TrustBadge"
import { DisputeDialog } from "@/components/app/DisputeDialog"
import { MediaUploader } from "@/components/app/MediaUploader"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Skeleton } from "@/components/ui/skeleton"
import { CheckCircle2, Clock, Loader2, MapPin, Plus, Wrench, Scale, HeartPulse, HardHat, ArrowRight, Images, Award, Trash2, ExternalLink } from "lucide-react"
import { toast } from "sonner"

type Profile = { id: string; display_name: string | null; bio: string | null; trades: string[]; quartier: string | null; city: string | null; languages: string[]; is_verified: boolean; trust_score: number | null; jobs_done: number | null }
type Service = { id: string; trade: string; title: string; base_price: number | null; price_unit: string }
type WorkOrder = { id: string; description: string | null; amount_fcfa: number | null; status: string; escrow_status: string; created_at: string; client_id: string | null; org_id: string | null }
type Chantier = { id: string; title: string; status: string; total_budget_fcfa: number | null }
type Portfolio = { id: string; media_url: string; caption: string | null }
type Cert = { id: string; label: string; issuer: string | null }

const WO_STATUS: Record<string, string> = { pending: "En attente", assigned: "Assignée", in_progress: "En cours", completed: "Terminée", cancelled: "Annulée" }

export default function PrestatairePage() {
  const supabase = createClient()
  const [uid, setUid] = useState<string | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [services, setServices] = useState<Service[]>([])
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([])
  const [chantiers, setChantiers] = useState<Chantier[]>([])
  const [portfolio, setPortfolio] = useState<Portfolio[]>([])
  const [certs, setCerts] = useState<Cert[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // certification form
  const [certLabel, setCertLabel] = useState("")
  const [certIssuer, setCertIssuer] = useState("")

  // form
  const [displayName, setDisplayName] = useState("")
  const [bio, setBio] = useState("")
  const [trades, setTrades] = useState("")
  const [quartier, setQuartier] = useState("")
  const [city, setCity] = useState("Dakar")
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null)

  // service form
  const [svcTitle, setSvcTitle] = useState("")
  const [svcTrade, setSvcTrade] = useState("")
  const [svcPrice, setSvcPrice] = useState("")
  const [svcUnit, setSvcUnit] = useState("forfait")

  const load = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    setUid(user.id)
    const { data: p } = await supabase.from("provider_profiles")
      .select("id, display_name, bio, trades, quartier, city, languages, is_verified, trust_score, jobs_done").eq("id", user.id).maybeSingle()
    // Nom par défaut depuis le profil (lisible par soi-même)
    const { data: prof } = await supabase.from("profiles").select("full_name").eq("id", user.id).maybeSingle()
    if (p) {
      setProfile(p as Profile)
      setDisplayName(p.display_name ?? prof?.full_name ?? "")
      setBio(p.bio ?? ""); setTrades((p.trades ?? []).join(", ")); setQuartier(p.quartier ?? ""); setCity(p.city ?? "Dakar")
      const { data: svc } = await supabase.from("provider_services").select("id, trade, title, base_price, price_unit").eq("provider_id", user.id)
      setServices((svc as Service[]) ?? [])
      const { data: wo } = await supabase.from("work_orders").select("id, description, amount_fcfa, status, escrow_status, created_at, client_id, org_id").eq("provider_id", user.id).order("created_at", { ascending: false })
      setWorkOrders((wo as WorkOrder[]) ?? [])
      const { data: ch } = await supabase.from("construction_projects").select("id, title, status, total_budget_fcfa").eq("provider_id", user.id).order("created_at", { ascending: false })
      setChantiers((ch as Chantier[]) ?? [])
      const { data: pf } = await supabase.from("portfolio_items").select("id, media_url, caption").eq("provider_id", user.id).order("created_at", { ascending: false })
      setPortfolio((pf as Portfolio[]) ?? [])
      const { data: ce } = await supabase.from("certifications").select("id, label, issuer").eq("provider_id", user.id).order("created_at", { ascending: false })
      setCerts((ce as Cert[]) ?? [])
    } else {
      setDisplayName(prof?.full_name ?? "")
    }
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  async function saveProfile() {
    if (!uid) return
    setSaving(true)
    const payload: Record<string, unknown> = {
      id: uid, display_name: displayName || null, bio: bio || null,
      trades: trades.split(",").map((t) => t.trim()).filter(Boolean),
      quartier: quartier || null, city: city || "Dakar",
    }
    if (coords) payload.geo = `SRID=4326;POINT(${coords.lng} ${coords.lat})`
    const { error } = await supabase.from("provider_profiles").upsert(payload, { onConflict: "id" })
    setSaving(false)
    if (error) { toast.error("Erreur lors de l'enregistrement"); return }
    toast.success("Profil enregistré")
    load()
  }

  function useMyLocation() {
    if (!navigator.geolocation) { toast.error("Géolocalisation indisponible"); return }
    navigator.geolocation.getCurrentPosition(
      (pos) => { setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude }); toast.success("Position enregistrée (à sauvegarder)") },
      () => toast.error("Position refusée")
    )
  }

  async function addService() {
    if (!uid || !svcTitle || !svcTrade) { toast.error("Métier et titre requis"); return }
    const { error } = await supabase.from("provider_services").insert({
      provider_id: uid, trade: svcTrade, title: svcTitle,
      base_price: svcPrice ? parseInt(svcPrice) : null, price_unit: svcUnit,
    })
    if (error) { toast.error("Erreur"); return }
    setSvcTitle(""); setSvcTrade(""); setSvcPrice("")
    toast.success("Service ajouté"); load()
  }

  async function setWoStatus(id: string, status: string) {
    const { error } = await supabase.from("work_orders").update({ status }).eq("id", id)
    if (error) toast.error("Erreur"); else { toast.success("Mission mise à jour"); load() }
  }

  async function addPortfolio(urls: string[]) {
    if (!uid) return
    const rows = urls.map((u) => ({ provider_id: uid, media_url: u, caption: null }))
    const { error } = await supabase.from("portfolio_items").insert(rows)
    if (error) { toast.error("Erreur"); return }
    load()
  }
  async function removePortfolio(id: string) {
    await supabase.from("portfolio_items").delete().eq("id", id); load()
  }
  async function addCert() {
    if (!uid || !certLabel) { toast.error("Intitulé requis"); return }
    const { error } = await supabase.from("certifications").insert({ provider_id: uid, label: certLabel, issuer: certIssuer || null })
    if (error) { toast.error("Erreur"); return }
    setCertLabel(""); setCertIssuer(""); toast.success("Certification ajoutée"); load()
  }
  async function removeCert(id: string) {
    await supabase.from("certifications").delete().eq("id", id); load()
  }

  if (loading) return <div className="space-y-4"><Skeleton className="h-8 w-48" /><Skeleton className="h-64" /></div>

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-[#1a2744] flex items-center gap-2"><Wrench className="w-6 h-6 text-[#f97316]" /> Espace prestataire</h1>
          {profile && (
            <div className="mt-1 flex items-center gap-2 flex-wrap">
              <Badge className={`gap-1 ${profile.is_verified ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700"}`}>
                {profile.is_verified ? <><CheckCircle2 className="w-3.5 h-3.5" /> Profil vérifié</> : <><Clock className="w-3.5 h-3.5" /> En attente de vérification</>}
              </Badge>
              <TrustBadge score={profile.trust_score} jobs={profile.jobs_done} />
            </div>
          )}
        </div>
        <div className="flex gap-2 flex-wrap">
          {profile?.is_verified && <Link href={`/prestataires/${profile.id}`} target="_blank"><Button variant="outline" size="sm"><ExternalLink className="w-4 h-4 mr-1" /> Ma fiche publique</Button></Link>}
          <Link href="/avantages"><Button variant="outline" size="sm"><HeartPulse className="w-4 h-4 mr-1" /> Avantages</Button></Link>
          <Link href="/litiges"><Button variant="outline" size="sm"><Scale className="w-4 h-4 mr-1" /> Litiges</Button></Link>
        </div>
      </div>

      {/* Profil */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-base">{profile ? "Mon profil" : "Créer mon profil prestataire"}</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div><Label>Nom affiché</Label><Input value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="Cheikh Plomberie" /></div>
          <div><Label>Présentation</Label><Textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={2} placeholder="Votre expérience, vos spécialités…" /></div>
          <div><Label>Métiers (séparés par des virgules)</Label><Input value={trades} onChange={(e) => setTrades(e.target.value)} placeholder="Plomberie, Électricité" /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Quartier</Label><Input value={quartier} onChange={(e) => setQuartier(e.target.value)} placeholder="Mermoz" /></div>
            <div><Label>Ville</Label><Input value={city} onChange={(e) => setCity(e.target.value)} /></div>
          </div>
          <div className="flex items-center gap-2">
            <Button type="button" variant="outline" size="sm" onClick={useMyLocation}><MapPin className="w-4 h-4 mr-1" /> Utiliser ma position</Button>
            {coords && <span className="text-xs text-green-600">Position prête</span>}
          </div>
          <Button onClick={saveProfile} disabled={saving} className="bg-[#f97316] hover:bg-[#ea580c] text-white">
            {saving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Enregistrement…</> : "Enregistrer le profil"}
          </Button>
        </CardContent>
      </Card>

      {profile && (
        <>
          <Inbox />

          {/* Services */}
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-base">Mes prestations</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {services.length > 0 && (
                <div className="divide-y">
                  {services.map((s) => (
                    <div key={s.id} className="py-2 flex justify-between text-sm">
                      <span><span className="font-medium">{s.title}</span> <span className="text-gray-400">· {s.trade}</span></span>
                      <span>{s.base_price ? `${formatFCFA(s.base_price)} / ${s.price_unit}` : "Sur devis"}</span>
                    </div>
                  ))}
                </div>
              )}
              <div className="grid grid-cols-2 gap-2">
                <Input placeholder="Titre (ex: Dépannage fuite)" value={svcTitle} onChange={(e) => setSvcTitle(e.target.value)} />
                <Input placeholder="Métier" value={svcTrade} onChange={(e) => setSvcTrade(e.target.value)} />
                <Input placeholder="Prix FCFA" type="number" value={svcPrice} onChange={(e) => setSvcPrice(e.target.value)} />
                <select value={svcUnit} onChange={(e) => setSvcUnit(e.target.value)} className="h-10 rounded-md border border-input bg-background px-3 text-sm">
                  <option value="forfait">forfait</option><option value="heure">heure</option><option value="jour">jour</option>
                </select>
              </div>
              <Button size="sm" variant="outline" onClick={addService}><Plus className="w-4 h-4 mr-1" /> Ajouter</Button>
            </CardContent>
          </Card>

          {/* Missions */}
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-base">Mes missions</CardTitle></CardHeader>
            <CardContent>
              {workOrders.length === 0 ? (
                <p className="text-sm text-gray-500">Aucune mission pour l'instant.</p>
              ) : (
                <div className="divide-y">
                  {workOrders.map((w) => (
                    <div key={w.id} className="py-3 flex items-center justify-between gap-2 flex-wrap">
                      <div>
                        <p className="text-sm font-medium">{w.description ?? "Mission"}</p>
                        <p className="text-xs text-gray-400">{w.amount_fcfa ? formatFCFA(w.amount_fcfa) : "Montant à définir"} · séquestre : {w.escrow_status} · {formatDateFR(w.created_at)}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{WO_STATUS[w.status] ?? w.status}</Badge>
                        {w.status === "assigned" && <Button size="sm" variant="outline" onClick={() => setWoStatus(w.id, "in_progress")}>Démarrer</Button>}
                        {w.status === "in_progress" && <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white" onClick={() => setWoStatus(w.id, "completed")}>Terminer</Button>}
                        {w.escrow_status === "held" && (
                          <DisputeDialog workOrderId={w.id} orgId={w.org_id} againstId={w.client_id} amountFcfa={w.amount_fcfa} onOpened={load} />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Portfolio / réalisations */}
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><Images className="w-5 h-5 text-[#f97316]" /> Mes réalisations</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {portfolio.length > 0 ? (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {portfolio.map((it) => (
                    <div key={it.id} className="relative group">
                      <img src={it.media_url} alt={it.caption ?? ""} className="w-full h-24 object-cover rounded-lg" />
                      <button onClick={() => removePortfolio(it.id)} className="absolute top-1 right-1 bg-white/90 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity" title="Supprimer">
                        <Trash2 className="w-3.5 h-3.5 text-red-500" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : <p className="text-sm text-gray-500">Ajoutez des photos de vos chantiers/réalisations pour inspirer confiance.</p>}
              <MediaUploader bucket="reports" accept="image/*" maxMb={5} label="Ajouter des photos" onUploaded={addPortfolio} />
            </CardContent>
          </Card>

          {/* Certifications */}
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><Award className="w-5 h-5 text-[#f97316]" /> Certifications</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {certs.length > 0 && (
                <div className="divide-y">
                  {certs.map((c) => (
                    <div key={c.id} className="py-2 flex items-center justify-between text-sm">
                      <span><span className="font-medium">{c.label}</span>{c.issuer ? <span className="text-gray-400"> · {c.issuer}</span> : null}</span>
                      <button onClick={() => removeCert(c.id)} title="Supprimer"><Trash2 className="w-4 h-4 text-red-400" /></button>
                    </div>
                  ))}
                </div>
              )}
              <div className="grid grid-cols-2 gap-2">
                <Input placeholder="Intitulé (ex: CAP Plomberie)" value={certLabel} onChange={(e) => setCertLabel(e.target.value)} />
                <Input placeholder="Délivré par (optionnel)" value={certIssuer} onChange={(e) => setCertIssuer(e.target.value)} />
              </div>
              <Button size="sm" variant="outline" onClick={addCert}><Plus className="w-4 h-4 mr-1" /> Ajouter</Button>
            </CardContent>
          </Card>

          {/* Chantiers (chef de chantier) */}
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><HardHat className="w-5 h-5 text-[#f97316]" /> Mes chantiers</CardTitle></CardHeader>
            <CardContent>
              {chantiers.length === 0 ? (
                <p className="text-sm text-gray-500">Aucun chantier assigné. Un propriétaire peut vous désigner chef de chantier.</p>
              ) : (
                <div className="divide-y">
                  {chantiers.map((c) => (
                    <Link key={c.id} href={`/prestataire/chantiers/${c.id}`} className="flex items-center justify-between py-3 hover:text-[#f97316]">
                      <span><span className="font-medium">{c.title}</span> <span className="text-gray-400 text-sm">· {formatFCFA(c.total_budget_fcfa ?? 0)}</span></span>
                      <span className="flex items-center gap-1 text-sm">{c.status} <ArrowRight className="w-4 h-4" /></span>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <KycUpload />
        </>
      )}
    </div>
  )
}
