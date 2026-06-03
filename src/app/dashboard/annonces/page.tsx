"use client"

export const dynamic = "force-dynamic"

import { useEffect, useState, useCallback } from "react"
import { createClient } from "@/lib/supabase"
import { useOrganization } from "@/hooks/useOrganization"
import { formatFCFA } from "@/lib/formatters"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Skeleton } from "@/components/ui/skeleton"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Megaphone, Plus, MapPin, Loader2, ShieldAlert, Trash2, Users } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

type Listing = {
  id: string; title: string; type: string; rent_fcfa: number; rooms: number | null
  quartier: string | null; city: string | null; status: string; is_verified: boolean
}
const TYPES = ["appartement", "chambre", "maison", "studio", "bureau"]
const STATUS_UI: Record<string, { label: string; cls: string }> = {
  published: { label: "Publiée", cls: "bg-green-100 text-green-700" },
  draft: { label: "Brouillon", cls: "bg-gray-100 text-gray-600" },
  rented: { label: "Louée", cls: "bg-blue-100 text-blue-700" },
}

export default function AnnoncesPage() {
  const { org } = useOrganization()
  const supabase = createClient()
  const [uid, setUid] = useState<string | null>(null)
  const [kyc, setKyc] = useState<string>("none")
  const [listings, setListings] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)

  // form
  const [type, setType] = useState("appartement")
  const [title, setTitle] = useState("")
  const [rent, setRent] = useState("")
  const [charges, setCharges] = useState("")
  const [deposit, setDeposit] = useState("")
  const [rooms, setRooms] = useState("")
  const [area, setArea] = useState("")
  const [quartier, setQuartier] = useState("")
  const [city, setCity] = useState("Dakar")
  const [description, setDescription] = useState("")
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null)

  const load = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    setUid(user.id)
    const { data: prof } = await supabase.from("profiles").select("kyc_status").eq("id", user.id).maybeSingle()
    setKyc(prof?.kyc_status ?? "none")
    const { data } = await supabase.from("listings")
      .select("id, title, type, rent_fcfa, rooms, quartier, city, status, is_verified")
      .eq("owner_id", user.id).order("created_at", { ascending: false })
    setListings((data as Listing[]) ?? [])
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  function useMyLocation() {
    if (!navigator.geolocation) { toast.error("Géolocalisation indisponible"); return }
    navigator.geolocation.getCurrentPosition(
      (pos) => { setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude }); toast.success("Position enregistrée") },
      () => toast.error("Position refusée"))
  }

  async function createListing() {
    if (!uid) return
    if (!title || !rent) { toast.error("Titre et loyer requis"); return }
    setSaving(true)
    const payload: Record<string, unknown> = {
      owner_id: uid, org_id: org?.id ?? null, type, title, description: description || null,
      rent_fcfa: parseInt(rent), charges_fcfa: charges ? parseInt(charges) : 0,
      deposit_fcfa: deposit ? parseInt(deposit) : 0, rooms: rooms ? parseInt(rooms) : null,
      area_m2: area ? parseInt(area) : null, quartier: quartier || null, city: city || "Dakar",
      is_verified: kyc === "verified", status: "published",
    }
    if (coords) payload.geo = `SRID=4326;POINT(${coords.lng} ${coords.lat})`
    const { error } = await supabase.from("listings").insert(payload)
    setSaving(false)
    if (error) { toast.error("Erreur lors de la publication"); return }
    toast.success("Annonce publiée")
    setOpen(false); setTitle(""); setRent(""); setCharges(""); setRooms(""); setArea(""); setQuartier(""); setDescription(""); setCoords(null)
    load()
  }

  async function setStatus(id: string, status: string) {
    await supabase.from("listings").update({ status }).eq("id", id)
    toast.success(status === "published" ? "Annonce republiée" : "Annonce dépubliée"); load()
  }
  async function remove(id: string) {
    if (!confirm("Supprimer cette annonce ?")) return
    await supabase.from("listings").delete().eq("id", id); toast.success("Annonce supprimée"); load()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-2xl font-bold text-[#1a2744] flex items-center gap-2"><Megaphone className="w-6 h-6 text-[#f97316]" /> Annonces</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger>
            <Button className="bg-[#f97316] hover:bg-[#ea580c] text-white" disabled={kyc !== "verified"}>
              <Plus className="w-4 h-4 mr-1" /> Publier
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>Publier une annonce</DialogTitle></DialogHeader>
            <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-1">
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Type</Label>
                  <select value={type} onChange={(e) => setType(e.target.value)} className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm">
                    {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div><Label>Pièces</Label><Input type="number" value={rooms} onChange={(e) => setRooms(e.target.value)} /></div>
              </div>
              <div><Label>Titre</Label><Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Bel appartement F3 à Mermoz" /></div>
              <div className="grid grid-cols-3 gap-3">
                <div><Label>Loyer FCFA</Label><Input type="number" value={rent} onChange={(e) => setRent(e.target.value)} /></div>
                <div><Label>Charges</Label><Input type="number" value={charges} onChange={(e) => setCharges(e.target.value)} /></div>
                <div><Label>Caution</Label><Input type="number" value={deposit} onChange={(e) => setDeposit(e.target.value)} /></div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div><Label>Surface m²</Label><Input type="number" value={area} onChange={(e) => setArea(e.target.value)} /></div>
                <div><Label>Quartier</Label><Input value={quartier} onChange={(e) => setQuartier(e.target.value)} /></div>
                <div><Label>Ville</Label><Input value={city} onChange={(e) => setCity(e.target.value)} /></div>
              </div>
              <div><Label>Description</Label><Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} /></div>
              <div className="flex items-center gap-2">
                <Button type="button" variant="outline" size="sm" onClick={useMyLocation}><MapPin className="w-4 h-4 mr-1" /> Position du bien</Button>
                {coords && <span className="text-xs text-green-600">Position prête</span>}
              </div>
              <Button onClick={createListing} disabled={saving} className="w-full bg-[#f97316] hover:bg-[#ea580c] text-white">
                {saving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Publication…</> : "Publier l'annonce"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      <p className="text-gray-500 text-sm mb-4">Publiez vos biens à louer. La boucle Trouver → Louer → Gérer démarre ici.</p>

      {kyc !== "verified" && (
        <Card className="mb-4 border-orange-300 bg-orange-50/50"><CardContent className="py-3 flex items-center gap-2 text-sm text-orange-800">
          <ShieldAlert className="w-4 h-4" /> Vous devez être <strong>vérifié (KYC)</strong> pour publier.
          <Link href="/dashboard/verification" className="underline ml-1">Vérifier mon identité</Link>
        </CardContent></Card>
      )}

      {loading ? <Skeleton className="h-40" /> : listings.length === 0 ? (
        <div className="text-center py-16 text-gray-400">Aucune annonce. Publiez votre premier bien à louer.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {listings.map((l) => {
            const st = STATUS_UI[l.status] ?? STATUS_UI.draft
            return (
              <Card key={l.id}><CardContent className="py-4">
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-[#1a2744]">{l.title}</p>
                  <Badge className={st.cls}>{st.label}</Badge>
                </div>
                <p className="text-sm text-gray-500 mt-1 capitalize">{l.type}{l.rooms ? ` · ${l.rooms} pièces` : ""} · {l.quartier ?? ""} {l.city}</p>
                <p className="font-medium text-[#1a2744] mt-1">{formatFCFA(l.rent_fcfa)} / mois {l.is_verified && <Badge className="ml-1 bg-green-100 text-green-700">Vérifié</Badge>}</p>
                <div className="flex gap-2 mt-3">
                  <Link href={`/dashboard/annonces/${l.id}`}><Button size="sm" variant="outline"><Users className="w-4 h-4 mr-1" /> Candidatures</Button></Link>
                  {l.status === "published"
                    ? <Button size="sm" variant="outline" onClick={() => setStatus(l.id, "draft")}>Dépublier</Button>
                    : l.status === "draft"
                    ? <Button size="sm" variant="outline" onClick={() => setStatus(l.id, "published")}>Publier</Button>
                    : null}
                  <Button size="sm" variant="ghost" className="text-red-500" onClick={() => remove(l.id)}><Trash2 className="w-4 h-4" /></Button>
                </div>
              </CardContent></Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
