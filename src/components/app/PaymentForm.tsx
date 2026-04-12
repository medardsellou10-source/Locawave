"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase"
import { useOrganization } from "@/hooks/useOrganization"
import { formatFCFA, formatDateFR, generateReceiptNumber } from "@/lib/formatters"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

type PendingSchedule = {
  id: string
  due_date: string
  amount_fcfa: number
  status: string
  leases: {
    tenants: { first_name: string; last_name: string } | null
    units: { unit_number: string; properties: { name: string } | null } | null
  } | null
}

interface PaymentFormProps {
  scheduleId?: string
  onSuccess: () => void
}

export function PaymentForm({ scheduleId, onSuccess }: PaymentFormProps) {
  const { org } = useOrganization()
  const supabase = createClient()
  const [saving, setSaving] = useState(false)
  const [pendingSchedules, setPendingSchedules] = useState<PendingSchedule[]>([])

  const [selectedScheduleId, setSelectedScheduleId] = useState(scheduleId ?? "")
  const [amount, setAmount] = useState("")
  const [method, setMethod] = useState("wave")
  const [reference, setReference] = useState("")
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (!org) return
    supabase
      .from("rent_schedules")
      .select("id, due_date, amount_fcfa, status, leases(tenants(first_name, last_name), units(unit_number, properties(name)))")
      .eq("org_id", org.id)
      .in("status", ["pending", "late"])
      .order("due_date")
      .then(({ data }) => setPendingSchedules((data as PendingSchedule[]) ?? []))
  }, [org])

  // Auto-fill amount when schedule selected
  useEffect(() => {
    const sched = pendingSchedules.find(s => s.id === selectedScheduleId)
    if (sched) setAmount(sched.amount_fcfa.toString())
  }, [selectedScheduleId, pendingSchedules])

  function validate() {
    const errs: Record<string, string> = {}
    if (!selectedScheduleId) errs.schedule = "Sélectionnez une échéance"
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) errs.amount = "Le montant doit être positif"
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate() || !org) return
    setSaving(true)

    const { data: payment, error: payError } = await supabase
      .from("payments")
      .insert({ org_id: org.id, rent_schedule_id: selectedScheduleId, amount_fcfa: parseInt(amount), method, reference: reference || null, paid_at: new Date().toISOString() })
      .select().single()

    if (payError || !payment) {
      toast.error("Erreur lors de l'enregistrement du paiement")
      setSaving(false)
      return
    }

    await supabase.from("rent_schedules").update({ status: "paid" }).eq("id", selectedScheduleId)

    const { count } = await supabase.from("receipts").select("*", { count: "exact", head: true }).eq("org_id", org.id)
    const receiptNumber = generateReceiptNumber((count ?? 0) + 1)
    await supabase.from("receipts").insert({ org_id: org.id, payment_id: payment.id, receipt_number: receiptNumber })

    toast.success(`Paiement enregistré — Quittance ${receiptNumber}`)
    onSuccess()
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <Label htmlFor="schedule">Échéance à encaisser</Label>
        <select id="schedule" value={selectedScheduleId} onChange={e => setSelectedScheduleId(e.target.value)}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
          <option value="">-- Sélectionner une échéance --</option>
          {pendingSchedules.map(s => {
            const lease = s.leases
            const label = lease?.tenants
              ? `${lease.tenants.first_name} ${lease.tenants.last_name} — ${lease.units?.properties?.name ?? ""} ${lease.units?.unit_number ?? ""}`
              : "Échéance"
            return (
              <option key={s.id} value={s.id}>
                {label} — {formatDateFR(s.due_date)} — {formatFCFA(s.amount_fcfa)}
                {s.status === "late" ? " (EN RETARD)" : ""}
              </option>
            )
          })}
        </select>
        {errors.schedule && <p className="text-sm text-red-500 mt-1">{errors.schedule}</p>}
      </div>

      <div>
        <Label htmlFor="amount">Montant (FCFA)</Label>
        <Input id="amount" type="number" placeholder="150000" value={amount} onChange={e => setAmount(e.target.value)} />
        {errors.amount && <p className="text-sm text-red-500 mt-1">{errors.amount}</p>}
      </div>

      <div>
        <Label htmlFor="method">Méthode de paiement</Label>
        <select id="method" value={method} onChange={e => setMethod(e.target.value)}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
          <option value="wave">Wave</option>
          <option value="orange_money">Orange Money</option>
          <option value="cash">Espèces</option>
        </select>
      </div>

      <div>
        <Label htmlFor="reference">Référence transaction (optionnel)</Label>
        <Input id="reference" placeholder="Numéro de transaction Wave..." value={reference} onChange={e => setReference(e.target.value)} />
      </div>

      <Button type="submit" className="w-full bg-[#f97316] hover:bg-[#ea580c] text-white" disabled={saving}>
        {saving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Enregistrement...</> : "Enregistrer le paiement"}
      </Button>
    </form>
  )
}
