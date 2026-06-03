"use client"

export const dynamic = "force-dynamic"

import { useEffect, useState, useCallback } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase"
import { formatFCFA } from "@/lib/formatters"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Building2, Home, CheckCircle2, Loader2, Star } from "lucide-react"
import { toast } from "sonner"

type Listing = { id: string; title: string; type: string; rent_fcfa: number; charges_fcfa: number | null; deposit_fcfa: number | null; rooms: number | null; area_m2: number | null; quartier: string | null; city: string | null; description: string | null; is_verified: boolean; status: string }

export default function ListingDetailPage() {
  const params = useParams()
  const supabase = createClient()
  const listingId = params.id as string
  const [listing, setListing] = useState<Listing | null>(null)
  const [uid, setUid] = useState<string | null>(null)
  const [score, setScore] = useState(0)
  const [fullName, setFullName] = useState<string | null>(null)
  const [application, setApplication] = useState<{ status: string; tenant_score: number } | null>(null)
  const [message, setMessage] = useState("")
  const [visitDate, setVisitDate] = useState("")
  const [visitMode, setVisitMode] = useState("onsite")
  const [busy, setBusy] = useState(false)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    const { data: l } = await supabase.from("listings").select("*").eq("id", listingId).maybeSingle()
    setListing(l as Listing)
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      setUid(user.id)
      const { data: prof } = await supabase.from("profiles").select("kyc_status, full_name").eq("id", user.id).maybeSingle()
      let s = 25 // compte créé
      if (prof?.kyc_status === "verified") s += 50
      if (prof?.full_name) s += 25
      setScore(s)
      setFullName(prof?.full_name ?? null)
      const { data: app } = await supabase.from("applications").select("status, tenant_score").eq("listing_id", listingId).eq("applicant_id", user.id).maybeSingle()
      setApplication(app as { status: string; tenant_score: number } | null)
    }
    setLoading(false)
  }, [listingId])

  useEffect(() => { load() }, [load])

  async function apply() {
    if (!uid) return
    setBusy(true)
    const { error } = await supabase.from("applications").insert({
      listing_id: listingId, applicant_id: uid, message: message || null, tenant_score: score,
      applicant_name: fullName,
    })
    setBusy(false)
    if (error) { toast.error(error.message.includes("duplicate") ? "Vous avez déjà postulé" : "Erreur"); return }
    toast.success("Candidature envoyée"); load()
  }

  async function requestVisit() {
    if (!uid || !visitDate) { toast.error("Choisissez une date"); return }
    setBusy(true)
    const { error } = await supabase.from("visits").insert({
      listing_id: listingId, applicant_id: uid, scheduled_at: new Date(visitDate).toISOString(), mode: visitMode,
    })
    setBusy(false)
    if (error) { toast.error("Erreur"); return }
    toast.success(visitMode === "video" ? "Visite vidéo demandée" : "Visite demandée")
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin text-[#f97316]" /></div>
  if (!listing) return <div className="min-h-screen flex items-center justify-center text-gray-500">Annonce introuvable</div>

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b bg-white">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/annonces" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#f97316] rounded-lg flex items-center justify-center"><Building2 className="w-5 h-5 text-white" /></div>
            <span className="text-lg font-bold text-[#1a2744]">Locawave</span>
          </Link>
          <Link href="/annonces" className="text-sm text-[#f97316] hover:underline">← Annonces</Link>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-[#1a2744]">{listing.title}</h1>
            {listing.is_verified && <Badge className="bg-green-100 text-green-700 gap-1"><CheckCircle2 className="w-3 h-3" /> Vérifié</Badge>}
          </div>
          <p className="text-gray-500 text-sm capitalize">{listing.type}{listing.rooms ? ` · ${listing.rooms} pièces` : ""}{listing.area_m2 ? ` · ${listing.area_m2} m²` : ""} · {listing.quartier} {listing.city}</p>
          <p className="text-2xl font-bold text-[#1a2744] mt-2">{formatFCFA(listing.rent_fcfa)} <span className="text-sm font-normal text-gray-400">/ mois</span></p>
          {listing.description && <p className="text-sm text-gray-600 mt-2">{listing.description}</p>}
        </div>

        {listing.status === "rented" ? (
          <Card><CardContent className="py-6 text-center text-gray-500">Cette annonce n'est plus disponible (louée).</CardContent></Card>
        ) : !uid ? (
          <Card><CardContent className="py-6 text-center"><Link href="/login"><Button className="bg-[#f97316] hover:bg-[#ea580c] text-white">Connectez-vous pour postuler</Button></Link></CardContent></Card>
        ) : (
          <>
            {/* Candidature */}
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-base">Ma candidature</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {application ? (
                  <div className="flex items-center gap-2 text-sm">
                    <Badge className={application.status === "accepted" ? "bg-green-100 text-green-700" : application.status === "rejected" ? "bg-red-100 text-red-700" : "bg-orange-100 text-orange-700"}>
                      {application.status === "accepted" ? "Acceptée" : application.status === "rejected" ? "Refusée" : "En attente"}
                    </Badge>
                    <span className="text-gray-500 flex items-center gap-1"><Star className="w-3.5 h-3.5 text-amber-500" /> Score {application.tenant_score}/100</span>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-2 text-sm bg-gray-50 rounded p-2">
                      <Star className="w-4 h-4 text-amber-500" /> Votre pré-score : <strong>{score}/100</strong>
                      {score < 75 && <Link href="/dashboard/verification" className="text-[#f97316] underline ml-1">Améliorer (KYC)</Link>}
                    </div>
                    <div><Label>Message au propriétaire</Label><Textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={3} placeholder="Présentez-vous, votre situation…" /></div>
                    <Button onClick={apply} disabled={busy} className="w-full bg-[#f97316] hover:bg-[#ea580c] text-white">
                      {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : "Envoyer ma candidature"}
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Visite */}
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-base">Demander une visite</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>Date</Label><Input type="datetime-local" value={visitDate} onChange={(e) => setVisitDate(e.target.value)} /></div>
                  <div><Label>Mode</Label>
                    <select value={visitMode} onChange={(e) => setVisitMode(e.target.value)} className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm">
                      <option value="onsite">Sur place</option>
                      <option value="video">Visite vidéo (diaspora)</option>
                    </select>
                  </div>
                </div>
                <Button onClick={requestVisit} disabled={busy} variant="outline" className="w-full"><Home className="w-4 h-4 mr-2" /> Demander la visite</Button>
              </CardContent>
            </Card>
          </>
        )}
      </main>
    </div>
  )
}
