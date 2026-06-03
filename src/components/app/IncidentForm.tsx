"use client"

import { useRef, useState } from "react"
import { createClient } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, AlertTriangle } from "lucide-react"
import { toast } from "sonner"

export const INCIDENT_CATEGORIES = [
  "Plomberie", "Électricité", "Serrurerie", "Toiture / Fuite",
  "Électroménager", "Peinture / Mur", "Autre",
] as const

const URGENCIES = [
  { value: "low", label: "Faible" },
  { value: "medium", label: "Moyenne" },
  { value: "high", label: "Haute (urgent)" },
] as const

export function IncidentForm({
  orgId, leaseId, propertyId, onSuccess,
}: { orgId: string; leaseId: string; propertyId: string | null; onSuccess: () => void }) {
  const supabase = createClient()
  const fileRef = useRef<HTMLInputElement>(null)
  const [category, setCategory] = useState<string>(INCIDENT_CATEGORIES[0])
  const [urgency, setUrgency] = useState<string>("medium")
  const [description, setDescription] = useState("")
  const [saving, setSaving] = useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setSaving(false); return }

    // Photo optionnelle → bucket public 'reports'
    let mediaUrls: string[] = []
    const file = fileRef.current?.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) { toast.error("Photo trop volumineuse (max 5 Mo)"); setSaving(false); return }
      const ext = file.name.split(".").pop() ?? "jpg"
      const path = `incidents/${leaseId}/${Date.now()}.${ext}`
      const { error: upErr } = await supabase.storage.from("reports").upload(path, file)
      if (!upErr) {
        mediaUrls = [supabase.storage.from("reports").getPublicUrl(path).data.publicUrl]
      }
    }

    const { data: incident, error } = await supabase.from("incidents").insert({
      org_id: orgId, property_id: propertyId, lease_id: leaseId, reporter_id: user.id,
      category, urgency, description: description || null, media_urls: mediaUrls,
    }).select("id").single()

    if (error || !incident) { toast.error("Erreur lors du signalement"); setSaving(false); return }

    // Trace dans reports (preuve datée géoloc réutilisable)
    if (propertyId) {
      await supabase.from("reports").insert({
        org_id: orgId, property_id: propertyId, lease_id: leaseId, author_id: user.id,
        type: "incident", note: `[${category}] ${description ?? ""}`, media_urls: mediaUrls,
      })
    }

    // Notifier le propriétaire (best effort)
    fetch("/api/incidents/notify", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ incident_id: incident.id }),
    }).catch(() => {})

    setSaving(false)
    toast.success("Incident signalé — le propriétaire est prévenu")
    onSuccess()
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <Label htmlFor="inc-cat">Catégorie</Label>
        <select id="inc-cat" value={category} onChange={(e) => setCategory(e.target.value)}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
          {INCIDENT_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>
      <div>
        <Label htmlFor="inc-urg">Urgence</Label>
        <select id="inc-urg" value={urgency} onChange={(e) => setUrgency(e.target.value)}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
          {URGENCIES.map((u) => <option key={u.value} value={u.value}>{u.label}</option>)}
        </select>
      </div>
      <div>
        <Label htmlFor="inc-desc">Description</Label>
        <Textarea id="inc-desc" value={description} onChange={(e) => setDescription(e.target.value)}
          placeholder="Décrivez le problème…" rows={3} />
      </div>
      <div>
        <Label htmlFor="inc-photo">Photo (optionnel, max 5 Mo)</Label>
        <input id="inc-photo" ref={fileRef} type="file" accept="image/*"
          className="block w-full text-sm text-gray-600 file:mr-3 file:rounded-md file:border-0 file:bg-[#1a2744] file:px-3 file:py-2 file:text-white" />
      </div>
      <Button type="submit" disabled={saving} className="w-full bg-[#f97316] hover:bg-[#ea580c] text-white">
        {saving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Envoi…</> : <><AlertTriangle className="w-4 h-4 mr-2" /> Signaler l'incident</>}
      </Button>
    </form>
  )
}
