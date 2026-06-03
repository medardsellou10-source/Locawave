"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { ShieldAlert, Loader2 } from "lucide-react"
import { toast } from "sonner"

type Props = {
  workOrderId?: string | null
  incidentId?: string | null
  orgId?: string | null
  againstId?: string | null
  amountFcfa?: number | null
  onOpened?: () => void
}

/** Ouvre un litige : gèle les fonds en séquestre (held -> disputed) côté DB et trace dans audit_log. */
export function DisputeDialog({ workOrderId, incidentId, orgId, againstId, amountFcfa, onOpened }: Props) {
  const supabase = createClient()
  const [open, setOpen] = useState(false)
  const [reason, setReason] = useState("")
  const [description, setDescription] = useState("")
  const [busy, setBusy] = useState(false)

  async function submit() {
    if (!reason.trim()) { toast.error("Indiquez un motif"); return }
    setBusy(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setBusy(false); toast.error("Non authentifié"); return }
    const { error } = await supabase.from("disputes").insert({
      opened_by: user.id,
      work_order_id: workOrderId ?? null,
      incident_id: incidentId ?? null,
      org_id: orgId ?? null,
      against_id: againstId ?? null,
      amount_frozen_fcfa: amountFcfa ?? 0,
      reason: reason.trim(),
      description: description || null,
    })
    setBusy(false)
    if (error) { toast.error("Erreur lors de l'ouverture du litige"); return }
    toast.success("Litige ouvert — fonds gelés en séquestre")
    setOpen(false); setReason(""); setDescription("")
    onOpened?.()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button size="sm" variant="outline" className="text-red-600 border-red-200 hover:bg-red-50" />}>
        <ShieldAlert className="w-4 h-4 mr-1" /> Litige
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader><DialogTitle>Ouvrir un litige</DialogTitle></DialogHeader>
        <p className="text-sm text-gray-600">
          Les fonds en séquestre seront <strong>gelés</strong> le temps de la médiation. Décrivez le problème honnêtement.
        </p>
        <div className="space-y-3">
          <div><Label>Motif</Label><Input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Travail non conforme, retard, absence…" /></div>
          <div><Label>Détails (optionnel)</Label><Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} /></div>
        </div>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => setOpen(false)}>Annuler</Button>
          <Button onClick={submit} disabled={busy} className="bg-red-600 hover:bg-red-700 text-white">
            {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : "Ouvrir le litige"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
