"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { unitSchema, type UnitInput } from "@/lib/schemas"
import { createClient } from "@/lib/supabase"
import { useOrganization } from "@/hooks/useOrganization"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import type { Database } from "@/types/database"

type Unit = Database["public"]["Tables"]["units"]["Row"]

interface UnitFormProps {
  propertyId: string
  unit?: Unit
  onSuccess: () => void
}

export function UnitForm({ propertyId, unit, onSuccess }: UnitFormProps) {
  const { org } = useOrganization()
  const supabase = createClient()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<UnitInput>({
    resolver: zodResolver(unitSchema),
    defaultValues: unit
      ? {
          unit_number: unit.unit_number,
          type: unit.type as UnitInput["type"],
          floor: unit.floor ?? undefined,
          surface_m2: unit.surface_m2 ?? undefined,
          rent_fcfa: unit.rent_fcfa,
          status: unit.status as UnitInput["status"],
        }
      : { type: "f2", status: "vacant" },
  })

  async function onSubmit(data: UnitInput) {
    if (!org) return

    if (unit) {
      const { error } = await supabase.from("units").update(data).eq("id", unit.id)
      if (error) {
        toast.error("Erreur lors de la modification")
        return
      }
      toast.success("Unité modifiée avec succès")
    } else {
      const { error } = await supabase
        .from("units")
        .insert({ ...data, property_id: propertyId, org_id: org.id })
      if (error) {
        toast.error("Erreur lors de la création")
        return
      }
      toast.success("Unité créée avec succès")
    }
    onSuccess()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="unit_number">Numéro d'unité</Label>
          <Input id="unit_number" placeholder="A1, B2..." {...register("unit_number")} />
          {errors.unit_number && <p className="text-sm text-red-500 mt-1">{errors.unit_number.message}</p>}
        </div>
        <div>
          <Label htmlFor="type">Type</Label>
          <select
            id="type"
            {...register("type")}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="studio">Studio</option>
            <option value="f1">F1</option>
            <option value="f2">F2</option>
            <option value="f3">F3</option>
            <option value="f4">F4</option>
            <option value="commerce">Commerce</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="floor">Étage</Label>
          <Input id="floor" type="number" placeholder="0" {...register("floor", { valueAsNumber: true })} />
        </div>
        <div>
          <Label htmlFor="surface_m2">Surface (m²)</Label>
          <Input id="surface_m2" type="number" placeholder="45" {...register("surface_m2", { valueAsNumber: true })} />
        </div>
      </div>

      <div>
        <Label htmlFor="rent_fcfa">Loyer mensuel (FCFA)</Label>
        <Input id="rent_fcfa" type="number" placeholder="150000" {...register("rent_fcfa", { valueAsNumber: true })} />
        {errors.rent_fcfa && <p className="text-sm text-red-500 mt-1">{errors.rent_fcfa.message}</p>}
      </div>

      <div>
        <Label htmlFor="status">Statut</Label>
        <select
          id="status"
          {...register("status")}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
        >
          <option value="vacant">Vacant</option>
          <option value="rented">Loué</option>
          <option value="maintenance">Maintenance</option>
        </select>
      </div>

      <Button type="submit" className="w-full bg-[#f97316] hover:bg-[#ea580c] text-white" disabled={isSubmitting}>
        {isSubmitting ? "Enregistrement..." : unit ? "Modifier l'unité" : "Ajouter l'unité"}
      </Button>
    </form>
  )
}
