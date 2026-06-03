"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, Plus, Trash2 } from "lucide-react"
import { toast } from "sonner"

type Room = { room: string; state: string; note: string }
const STATES = ["Bon", "Moyen", "Mauvais"]

export function InspectionForm({
  orgId, leaseId, onSuccess,
}: { orgId: string; leaseId: string; onSuccess: () => void }) {
  const supabase = createClient()
  const [type, setType] = useState<"entry" | "exit">("entry")
  const [rooms, setRooms] = useState<Room[]>([{ room: "Salon", state: "Bon", note: "" }])
  const [eau, setEau] = useState("")
  const [electricite, setElectricite] = useState("")
  const [tenantSig, setTenantSig] = useState("")
  const [ownerSig, setOwnerSig] = useState("")
  const [notes, setNotes] = useState("")
  const [saving, setSaving] = useState(false)

  function setRoom(i: number, patch: Partial<Room>) {
    setRooms((r) => r.map((x, idx) => (idx === i ? { ...x, ...patch } : x)))
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    const { error } = await supabase.from("inspections").insert({
      org_id: orgId, lease_id: leaseId, type,
      rooms: rooms.filter((r) => r.room.trim()),
      meter_readings: { eau: eau || null, electricite: electricite || null },
      tenant_signature: tenantSig || null,
      owner_signature: ownerSig || null,
      notes: notes || null,
    })
    setSaving(false)
    if (error) { toast.error("Erreur lors de l'enregistrement de l'état des lieux"); return }
    toast.success("État des lieux enregistré")
    onSuccess()
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
      <div>
        <Label>Type</Label>
        <select value={type} onChange={(e) => setType(e.target.value as "entry" | "exit")}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
          <option value="entry">État des lieux d'entrée</option>
          <option value="exit">État des lieux de sortie</option>
        </select>
      </div>

      <div>
        <div className="flex items-center justify-between mb-1">
          <Label>Pièces</Label>
          <Button type="button" size="sm" variant="outline"
            onClick={() => setRooms((r) => [...r, { room: "", state: "Bon", note: "" }])}>
            <Plus className="w-3.5 h-3.5 mr-1" /> Pièce
          </Button>
        </div>
        <div className="space-y-2">
          {rooms.map((r, i) => (
            <div key={i} className="flex gap-2 items-start">
              <Input placeholder="Pièce" value={r.room} onChange={(e) => setRoom(i, { room: e.target.value })} className="flex-1" />
              <select value={r.state} onChange={(e) => setRoom(i, { state: e.target.value })}
                className="h-10 rounded-md border border-input bg-background px-2 text-sm">
                {STATES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
              <Input placeholder="Note" value={r.note} onChange={(e) => setRoom(i, { note: e.target.value })} className="flex-1" />
              <Button type="button" size="icon" variant="ghost" className="h-10 w-9 text-red-500"
                onClick={() => setRooms((r) => r.filter((_, idx) => idx !== i))}>
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div><Label>Compteur eau</Label><Input value={eau} onChange={(e) => setEau(e.target.value)} placeholder="m³" /></div>
        <div><Label>Compteur électricité</Label><Input value={electricite} onChange={(e) => setElectricite(e.target.value)} placeholder="kWh" /></div>
      </div>

      <div><Label>Notes générales</Label><Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} /></div>

      <div className="grid grid-cols-2 gap-3">
        <div><Label>Signature locataire (nom)</Label><Input value={tenantSig} onChange={(e) => setTenantSig(e.target.value)} /></div>
        <div><Label>Signature propriétaire (nom)</Label><Input value={ownerSig} onChange={(e) => setOwnerSig(e.target.value)} /></div>
      </div>

      <Button type="submit" disabled={saving} className="w-full bg-[#f97316] hover:bg-[#ea580c] text-white">
        {saving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Enregistrement…</> : "Enregistrer l'état des lieux"}
      </Button>
    </form>
  )
}
