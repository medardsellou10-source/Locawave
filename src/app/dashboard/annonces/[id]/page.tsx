"use client"

export const dynamic = "force-dynamic"

import { useEffect, useState, useCallback } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase"
import { formatFCFA } from "@/lib/formatters"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { ArrowLeft, Star, Loader2, CheckCircle2, Users, CalendarClock, Video, MapPin } from "lucide-react"
import { toast } from "sonner"

type Listing = { id: string; title: string; rent_fcfa: number; status: string; quartier: string | null; city: string | null }
type Application = { id: string; applicant_name: string | null; message: string | null; tenant_score: number; status: string; created_at: string }
type Visit = { id: string; scheduled_at: string; mode: string; status: string; applicant_name?: string | null }

const STATUS: Record<string, { label: string; cls: string }> = {
  pending: { label: "En attente", cls: "bg-orange-100 text-orange-700" },
  accepted: { label: "Acceptée", cls: "bg-green-100 text-green-700" },
  rejected: { label: "Refusée", cls: "bg-red-100 text-red-700" },
}

export default function OwnerListingDetailPage() {
  const params = useParams()
  const supabase = createClient()
  const listingId = params.id as string
  const [listing, setListing] = useState<Listing | null>(null)
  const [apps, setApps] = useState<Application[]>([])
  const [visits, setVisits] = useState<Visit[]>([])
  const [loading, setLoading] = useState(true)
  const [accepting, setAccepting] = useState<string | null>(null)

  const load = useCallback(async () => {
    const { data: l } = await supabase.from("listings").select("id, title, rent_fcfa, status, quartier, city").eq("id", listingId).maybeSingle()
    setListing(l as Listing)
    const { data: a } = await supabase.from("applications")
      .select("id, applicant_name, message, tenant_score, status, created_at")
      .eq("listing_id", listingId).order("tenant_score", { ascending: false })
    setApps((a as Application[]) ?? [])
    const { data: v } = await supabase.from("visits")
      .select("id, scheduled_at, mode, status")
      .eq("listing_id", listingId).order("scheduled_at", { ascending: true })
    setVisits((v as Visit[]) ?? [])
    setLoading(false)
  }, [listingId])

  useEffect(() => { load() }, [load])

  async function accept(applicationId: string) {
    if (!confirm("Accepter cette candidature ? Un bail sera créé et l'annonce dépubliée.")) return
    setAccepting(applicationId)
    const res = await fetch("/api/listings/accept", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ application_id: applicationId }),
    })
    const json = await res.json()
    setAccepting(null)
    if (!res.ok) { toast.error(json.error ?? "Erreur"); return }
    toast.success("Candidature acceptée — bail créé")
    load()
  }

  if (loading) return <div className="space-y-3"><Skeleton className="h-8 w-64" /><Skeleton className="h-40" /></div>
  if (!listing) return <div className="text-gray-500 py-10 text-center">Annonce introuvable</div>

  const st = STATUS[listing.status === "rented" ? "accepted" : "pending"]

  return (
    <div>
      <Link href="/dashboard/annonces" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-[#f97316] mb-3"><ArrowLeft className="w-4 h-4" /> Annonces</Link>
      <div className="flex items-center justify-between mb-1">
        <h1 className="text-2xl font-bold text-[#1a2744]">{listing.title}</h1>
        {listing.status === "rented"
          ? <Badge className="bg-blue-100 text-blue-700">Louée</Badge>
          : <Badge className="bg-green-100 text-green-700">Publiée</Badge>}
      </div>
      <p className="text-gray-500 text-sm mb-5">{formatFCFA(listing.rent_fcfa)} / mois · {listing.quartier} {listing.city}</p>

      <Card className="mb-5">
        <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><Users className="w-5 h-5 text-[#f97316]" /> Candidatures ({apps.length})</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {apps.length === 0 ? <p className="text-sm text-gray-400 py-3 text-center">Aucune candidature pour le moment.</p> : apps.map((a) => (
            <div key={a.id} className="border rounded-lg p-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-semibold text-[#1a2744]">{a.applicant_name ?? "Candidat"}</p>
                  <span className="text-xs text-gray-500 flex items-center gap-1"><Star className="w-3.5 h-3.5 text-amber-500" /> Score {a.tenant_score}/100</span>
                </div>
                <Badge className={(STATUS[a.status] ?? st).cls}>{(STATUS[a.status] ?? st).label}</Badge>
              </div>
              {a.message && <p className="text-sm text-gray-600 mt-2">{a.message}</p>}
              {a.status === "pending" && listing.status !== "rented" && (
                <Button size="sm" onClick={() => accept(a.id)} disabled={accepting === a.id} className="mt-3 bg-[#f97316] hover:bg-[#ea580c] text-white">
                  {accepting === a.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <><CheckCircle2 className="w-4 h-4 mr-1" /> Accepter → créer le bail</>}
                </Button>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><CalendarClock className="w-5 h-5 text-[#f97316]" /> Visites demandées ({visits.length})</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {visits.length === 0 ? <p className="text-sm text-gray-400 py-3 text-center">Aucune visite demandée.</p> : visits.map((v) => (
            <div key={v.id} className="flex items-center justify-between border rounded-lg px-3 py-2 text-sm">
              <span className="flex items-center gap-2">
                {v.mode === "video" ? <Video className="w-4 h-4 text-blue-500" /> : <MapPin className="w-4 h-4 text-gray-400" />}
                {new Date(v.scheduled_at).toLocaleString("fr-FR", { dateStyle: "medium", timeStyle: "short" })}
              </span>
              <Badge variant="outline">{v.mode === "video" ? "Vidéo" : "Sur place"}</Badge>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
