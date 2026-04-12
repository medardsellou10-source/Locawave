"use client"

import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { paymentSchema, type PaymentInput } from "@/lib/schemas"
import { createClient } from "@/lib/supabase"
import { useOrganization } from "@/hooks/useOrganization"
import { formatFCFA, formatDateFR, generateReceiptNumber } from "@/lib/formatters"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"

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
  const [pendingSchedules, setPendingSchedules] = useState<PendingSchedule[]>([])

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<PaymentInput>({
    resolver: zodResolver(paymentSchema),
    defaultValues: { method: "wave", rent_schedule_id: scheduleId ?? "" },
  })

  const selectedScheduleId = watch("rent_schedule_id")

  useEffect(() => {
    if (!org) return

    async function fetchSchedules() {
      const { data } = await supabase
        .from("rent_schedules")
        .select("id, due_date, amount_fcfa, status, leases(tenants(first_name, last_name), units(unit_number, properties(name)))")
        .eq("org_id", org!.id)
        .in("status", ["pending", "late"])
        .order("due_date")

      setPendingSchedules((data as PendingSchedule[]) ?? [])
    }

    fetchSchedules()
  }, [org])

  // Pré-remplir le montant
  useEffect(() => {
    const sched = pendingSchedules.find((s) => s.id === selectedScheduleId)
    if (sched) {
      setValue("amount_fcfa", sched.amount_fcfa)
    }
  }, [selectedScheduleId, pendingSchedules])

  async function onSubmit(data: PaymentInput) {
    if (!org) return

    // 1. Créer le paiement
    const { data: payment, error: payError } = await supabase
      .from("payments")
      .insert({
        org_id: org.id,
        rent_schedule_id: data.rent_schedule_id,
        amount_fcfa: data.amount_fcfa,
        method: data.method,
        reference: data.reference || null,
        paid_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (payError || !payment) {
      toast.error("Erreur lors de l'enregistrement du paiement")
      return
    }

    // 2. Marquer l'échéance comme payée
    await supabase.from("rent_schedules").update({ status: "paid" }).eq("id", data.rent_schedule_id)

    // 3. Générer le numéro de quittance
    const { count } = await supabase
      .from("receipts")
      .select("*", { count: "exact", head: true })
      .eq("org_id", org.id)

    const receiptNumber = generateReceiptNumber((count ?? 0) + 1)

    // 4. Créer la quittance
    await supabase.from("receipts").insert({
      org_id: org.id,
      payment_id: payment.id,
      receipt_number: receiptNumber,
    })

    toast.success(`Paiement enregistré — Quittance ${receiptNumber}`)
    onSuccess()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Label htmlFor="rent_schedule_id">Échéance à encaisser</Label>
        <select
          id="rent_schedule_id"
          {...register("rent_schedule_id")}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
        >
          <option value="">-- Sélectionner une échéance --</option>
          {pendingSchedules.map((s) => {
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
        {errors.rent_schedule_id && <p className="text-sm text-red-500 mt-1">{errors.rent_schedule_id.message}</p>}
      </div>

      <div>
        <Label htmlFor="amount_fcfa">Montant (FCFA)</Label>
        <Input id="amount_fcfa" type="number" {...register("amount_fcfa", { valueAsNumber: true })} />
        {errors.amount_fcfa && <p className="text-sm text-red-500 mt-1">{errors.amount_fcfa.message}</p>}
      </div>

      <div>
        <Label htmlFor="method">Méthode de paiement</Label>
        <select
          id="method"
          {...register("method")}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
        >
          <option value="wave">Wave</option>
          <option value="orange_money">Orange Money</option>
          <option value="cash">Espèces</option>
        </select>
      </div>

      <div>
        <Label htmlFor="reference">Référence transaction (optionnel)</Label>
        <Input id="reference" placeholder="Numéro de transaction Wave..." {...register("reference")} />
      </div>

      <Button type="submit" className="w-full bg-[#f97316] hover:bg-[#ea580c] text-white" disabled={isSubmitting}>
        {isSubmitting ? "Enregistrement..." : "Enregistrer le paiement"}
      </Button>
    </form>
  )
}
