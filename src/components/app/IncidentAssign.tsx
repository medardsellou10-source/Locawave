"use client"

import { useEffect, useState, useCallback } from "react"
import { createClient } from "@/lib/supabase"
import { formatFCFA } from "@/lib/formatters"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Loader2, UserCheck } from "lucide-react"
import { toast } from "sonner"

export type ProviderOption = { id: string; name: string; trades: string[]; trusted: boolean }
type WorkOrder = { id: string; provider_id: string | null; amount_fcfa: number | null; status: string; escrow_status: string }

export function IncidentAssign({
  incidentId, orgId, propertyId, ownerId, providers, onChanged,
}: {
  incidentId: string; orgId: string; propertyId: string | null; ownerId: string
  providers: ProviderOption[]; onChanged: () => void
}) {
  const supabase = createClient()
  const [wo, setWo] = useState<WorkOrder | null>(null)
  const [providerId, setProviderId] = useState("")
  const [amount, setAmount] = useState("")
  const [busy, setBusy] = useState(false)

  const load = useCallback(async () => {
    const { data } = await supabase.from("work_orders")
      .select("id, provider_id, amount_fcfa, status, escrow_status")
      .eq("incident_id", incidentId).maybeSingle()
    setWo((data as WorkOrder) ?? null)
  }, [incidentId])

  useEffect(() => { load() }, [load])

  async function assign() {
    if (!providerId) { toast.error("Choisissez un prestataire"); return }
    setBusy(true)
    const amt = amount ? parseInt(amount) : null
    const { error } = await supabase.from("work_orders").insert({
      org_id: orgId, incident_id: incidentId, property_id: propertyId, client_id: ownerId,
      provider_id: providerId, type: "incident_repair", amount_fcfa: amt,
      status: "assigned", escrow_status: amt ? "held" : "none",
    })
    if (error) { toast.error("Erreur d'assignation"); setBusy(false); return }
    await supabase.from("incidents").update({ status: "assigned" }).eq("id", incidentId)
    await supabase.from("audit_log").insert({ entity: "work_orders", entity_id: incidentId, action: "assigned", actor_id: ownerId, payload: { provider_id: providerId, amount: amt } })
    toast.success("Prestataire assigné")
    setBusy(false); load(); onChanged()
  }

  async function validate() {
    if (!wo) return
    setBusy(true)
    await supabase.from("work_orders").update({ status: "completed", escrow_status: wo.escrow_status === "held" ? "released" : wo.escrow_status }).eq("id", wo.id)
    await supabase.from("incidents").update({ status: "resolved" }).eq("id", incidentId)
    await supabase.from("audit_log").insert({ entity: "work_orders", entity_id: wo.id, action: "validated_escrow_released", actor_id: ownerId })
    toast.success("Intervention validée — séquestre libéré")
    setBusy(false); load(); onChanged()
  }

  if (wo) {
    const prov = providers.find((p) => p.id === wo.provider_id)
    return (
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <Badge className="bg-blue-100 text-blue-700"><UserCheck className="w-3 h-3 mr-1" />{prov?.name ?? "Prestataire"}</Badge>
        <span className="text-gray-500">Mission : {wo.status} · séquestre : {wo.escrow_status}{wo.amount_fcfa ? ` (${formatFCFA(wo.amount_fcfa)})` : ""}</span>
        {wo.status !== "completed" && (
          <Button size="sm" variant="outline" disabled={busy} onClick={validate}>Valider & libérer le séquestre</Button>
        )}
      </div>
    )
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <select value={providerId} onChange={(e) => setProviderId(e.target.value)}
        className="h-8 rounded border border-input bg-background px-2 text-sm">
        <option value="">— Prestataire vérifié —</option>
        {providers.map((p) => (
          <option key={p.id} value={p.id}>{p.trusted ? "★ " : ""}{p.name}{p.trades.length ? ` (${p.trades[0]})` : ""}</option>
        ))}
      </select>
      <Input type="number" placeholder="Montant FCFA" value={amount} onChange={(e) => setAmount(e.target.value)} className="h-8 w-32" />
      <Button size="sm" className="bg-[#1a2744] hover:bg-[#0f1a2e] text-white" disabled={busy} onClick={assign}>
        {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : "Assigner"}
      </Button>
    </div>
  )
}
