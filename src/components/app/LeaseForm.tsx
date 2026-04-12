"use client"

import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { leaseSchema, type LeaseInput } from "@/lib/schemas"
import { createClient } from "@/lib/supabase"
import { useOrganization } from "@/hooks/useOrganization"
import { formatFCFA } from "@/lib/formatters"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import type { Database } from "@/types/database"

type Unit = Database["public"]["Tables"]["units"]["Row"] & { properties: { name: string } | null }
type Tenant = Database["public"]["Tables"]["tenants"]["Row"]

interface LeaseFormProps {
  onSuccess: () => void
}

export function LeaseForm({ onSuccess }: LeaseFormProps) {
  const { org } = useOrganization()
  const supabase = createClient()
  const [vacantUnits, setVacantUnits] = useState<Unit[]>([])
  const [tenants, setTenants] = useState<Tenant[]>([])

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<LeaseInput>({
    resolver: zodResolver(leaseSchema),
    defaultValues: { due_day: 5, deposit_fcfa: 0 },
  })

  const selectedUnitId = watch("unit_id")

  useEffect(() => {
    if (!org) return

    async function fetchData() {
      const { data: units } = await supabase
        .from("units")
        .select("*, properties(name)")
        .eq("org_id", org!.id)
        .eq("status", "vacant")

      const { data: tenantsList } = await supabase
        .from("tenants")
        .select("*")
        .eq("org_id", org!.id)
        .order("first_name")

      setVacantUnits((units as Unit[]) ?? [])
      setTenants(tenantsList ?? [])
    }

    fetchData()
  }, [org])

  // Pré-remplir le loyer quand une unité est sélectionnée
  useEffect(() => {
    const unit = vacantUnits.find((u) => u.id === selectedUnitId)
    if (unit) {
      setValue("rent_fcfa", unit.rent_fcfa)
    }
  }, [selectedUnitId, vacantUnits])

  async function onSubmit(data: LeaseInput) {
    if (!org) return

    // 1. Créer le bail
    const { data: lease, error: leaseError } = await supabase
      .from("leases")
      .insert({
        org_id: org.id,
        unit_id: data.unit_id,
        tenant_id: data.tenant_id,
        start_date: data.start_date,
        end_date: data.end_date,
        rent_fcfa: data.rent_fcfa,
        due_day: data.due_day,
        deposit_fcfa: data.deposit_fcfa,
        status: "active",
      })
      .select()
      .single()

    if (leaseError || !lease) {
      toast.error("Erreur lors de la création du bail")
      return
    }

    // 2. Marquer l'unité comme louée
    await supabase.from("units").update({ status: "rented" }).eq("id", data.unit_id)

    // 3. Générer 12 échéances (rent_schedules)
    const schedules = []
    const startDate = new Date(data.start_date)

    for (let i = 0; i < 12; i++) {
      const dueDate = new Date(startDate.getFullYear(), startDate.getMonth() + i, data.due_day)
      // Si le jour d'échéance dépasse le nombre de jours du mois, ajuster
      if (dueDate.getDate() !== data.due_day) {
        dueDate.setDate(0) // Dernier jour du mois précédent
      }

      schedules.push({
        lease_id: lease.id,
        org_id: org.id,
        due_date: dueDate.toISOString().split("T")[0],
        amount_fcfa: data.rent_fcfa,
        status: "pending" as const,
      })
    }

    const { error: schedError } = await supabase.from("rent_schedules").insert(schedules)
    if (schedError) {
      toast.error("Bail créé mais erreur lors de la génération des échéances")
      return
    }

    toast.success(`Bail créé avec 12 échéances de ${formatFCFA(data.rent_fcfa)}`)
    onSuccess()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Label htmlFor="unit_id">Unité (uniquement vacantes)</Label>
        <select
          id="unit_id"
          {...register("unit_id")}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
        >
          <option value="">-- Sélectionner une unité --</option>
          {vacantUnits.map((unit) => (
            <option key={unit.id} value={unit.id}>
              {unit.properties?.name} — {unit.unit_number} ({formatFCFA(unit.rent_fcfa)})
            </option>
          ))}
        </select>
        {errors.unit_id && <p className="text-sm text-red-500 mt-1">{errors.unit_id.message}</p>}
        {vacantUnits.length === 0 && (
          <p className="text-sm text-orange-500 mt-1">Aucune unité vacante disponible</p>
        )}
      </div>

      <div>
        <Label htmlFor="tenant_id">Locataire</Label>
        <select
          id="tenant_id"
          {...register("tenant_id")}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
        >
          <option value="">-- Sélectionner un locataire --</option>
          {tenants.map((t) => (
            <option key={t.id} value={t.id}>
              {t.first_name} {t.last_name} ({t.whatsapp})
            </option>
          ))}
        </select>
        {errors.tenant_id && <p className="text-sm text-red-500 mt-1">{errors.tenant_id.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="start_date">Date de début</Label>
          <Input id="start_date" type="date" {...register("start_date")} />
          {errors.start_date && <p className="text-sm text-red-500 mt-1">{errors.start_date.message}</p>}
        </div>
        <div>
          <Label htmlFor="end_date">Date de fin</Label>
          <Input id="end_date" type="date" {...register("end_date")} />
          {errors.end_date && <p className="text-sm text-red-500 mt-1">{errors.end_date.message}</p>}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="rent_fcfa">Loyer mensuel (FCFA)</Label>
          <Input id="rent_fcfa" type="number" {...register("rent_fcfa", { valueAsNumber: true })} />
          {errors.rent_fcfa && <p className="text-sm text-red-500 mt-1">{errors.rent_fcfa.message}</p>}
        </div>
        <div>
          <Label htmlFor="due_day">Jour d'échéance (1-31)</Label>
          <Input id="due_day" type="number" min={1} max={31} {...register("due_day", { valueAsNumber: true })} />
          {errors.due_day && <p className="text-sm text-red-500 mt-1">{errors.due_day.message}</p>}
        </div>
      </div>

      <div>
        <Label htmlFor="deposit_fcfa">Caution (FCFA)</Label>
        <Input id="deposit_fcfa" type="number" placeholder="0" {...register("deposit_fcfa", { valueAsNumber: true })} />
      </div>

      <Button type="submit" className="w-full bg-[#f97316] hover:bg-[#ea580c] text-white" disabled={isSubmitting}>
        {isSubmitting ? "Création en cours..." : "Créer le bail + 12 échéances"}
      </Button>
    </form>
  )
}
