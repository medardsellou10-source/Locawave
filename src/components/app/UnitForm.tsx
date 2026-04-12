"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase"
import { useOrganization } from "@/hooks/useOrganization"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"
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
  const [saving, setSaving] = useState(false)

  const [unitNumber, setUnitNumber] = useState(unit?.unit_number ?? "")
  const [type, setType] = useState(unit?.type ?? "f2")
  const [floor, setFloor] = useState(unit?.floor?.toString() ?? "")
  const [surface, setSurface] = useState(unit?.surface_m2?.toString() ?? "")
  const [rent, setRent] = useState(unit?.rent_fcfa?.toString() ?? "")
  const [status, setStatus] = useState(unit?.status ?? "vacant")
  const [errors, setErrors] = useState<Record<string, string>>({})

  function validate() {
    const errs: Record<string, string> = {}
    if (!unitNumber.trim()) errs.unit_number = "Le numéro d'unité est requis"
    if (!rent || isNaN(Number(rent)) || Number(rent) <= 0) errs.rent_fcfa = "Le loyer doit être un nombre positif"
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate() || !org) return
    setSaving(true)

    const data = {
      unit_number: unitNumber.trim(),
      type,
      floor: floor ? parseInt(floor) : null,
      surface_m2: surface ? parseFloat(surface) : null,
      rent_fcfa: parseInt(rent),
      status,
    }

    if (unit) {
      const { error } = await supabase.from("units").update(data).eq("id", unit.id)
      if (error) { toast.error("Erreur lors de la modification"); setSaving(false); return }
      toast.success("Unité modifiée avec succès")
    } else {
      const { error } = await supabase.from("units").insert({ ...data, property_id: propertyId, org_id: org.id })
      if (error) { toast.error("Erreur lors de la création"); setSaving(false); return }
      toast.success("Unité créée avec succès")
    }
    onSuccess()
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="unit_number">Numéro d'unité</Label>
          <Input id="unit_number" placeholder="A1, B2..." value={unitNumber} onChange={e => setUnitNumber(e.target.value)} />
          {errors.unit_number && <p className="text-sm text-red-500 mt-1">{errors.unit_number}</p>}
        </div>
        <div>
          <Label htmlFor="type">Type</Label>
          <select
            id="type"
            value={type}
            onChange={e => setType(e.target.value)}
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
          <Label htmlFor="floor">Étage (optionnel)</Label>
          <Input id="floor" type="number" placeholder="0" value={floor} onChange={e => setFloor(e.target.value)} />
        </div>
        <div>
          <Label htmlFor="surface">Surface m² (optionnel)</Label>
          <Input id="surface" type="number" placeholder="45" value={surface} onChange={e => setSurface(e.target.value)} />
        </div>
      </div>

      <div>
        <Label htmlFor="rent">Loyer mensuel (FCFA)</Label>
        <Input id="rent" type="number" placeholder="150000" value={rent} onChange={e => setRent(e.target.value)} />
        {errors.rent_fcfa && <p className="text-sm text-red-500 mt-1">{errors.rent_fcfa}</p>}
      </div>

      <div>
        <Label htmlFor="status">Statut</Label>
        <select
          id="status"
          value={status}
          onChange={e => setStatus(e.target.value)}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
        >
          <option value="vacant">Vacant</option>
          <option value="rented">Loué</option>
          <option value="maintenance">Maintenance</option>
        </select>
      </div>

      <Button type="submit" className="w-full bg-[#f97316] hover:bg-[#ea580c] text-white" disabled={saving}>
        {saving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Enregistrement...</> : unit ? "Modifier l'unité" : "Ajouter l'unité"}
      </Button>
    </form>
  )
}
