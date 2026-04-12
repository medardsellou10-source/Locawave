"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase"
import { useOrganization } from "@/hooks/useOrganization"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"
import type { Database } from "@/types/database"

type Property = Database["public"]["Tables"]["properties"]["Row"]

interface PropertyFormProps {
  property?: Property
  onSuccess: () => void
}

export function PropertyForm({ property, onSuccess }: PropertyFormProps) {
  const { org } = useOrganization()
  const supabase = createClient()
  const [saving, setSaving] = useState(false)

  const [name, setName] = useState(property?.name ?? "")
  const [type, setType] = useState<string>(property?.type ?? "appartement")
  const [address, setAddress] = useState(property?.address ?? "")
  const [neighborhood, setNeighborhood] = useState(property?.neighborhood ?? "")
  const [city, setCity] = useState(property?.city ?? "Dakar")
  const [notes, setNotes] = useState(property?.notes ?? "")
  const [errors, setErrors] = useState<Record<string, string>>({})

  function validate() {
    const errs: Record<string, string> = {}
    if (!name || name.trim().length < 2) errs.name = "Le nom du bien est requis (min. 2 caractères)"
    if (!type) errs.type = "Le type est requis"
    if (!city || city.trim().length < 1) errs.city = "La ville est requise"
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate() || !org) return
    setSaving(true)

    const data = { name: name.trim(), type, address: address || null, neighborhood: neighborhood || null, city: city.trim(), notes: notes || null }

    if (property) {
      const { error } = await supabase.from("properties").update(data).eq("id", property.id)
      if (error) { toast.error("Erreur lors de la modification"); setSaving(false); return }
      toast.success("Bien modifié avec succès")
    } else {
      const { error } = await supabase.from("properties").insert({ ...data, org_id: org.id })
      if (error) { toast.error("Erreur lors de la création"); setSaving(false); return }
      toast.success("Bien créé avec succès")
    }
    onSuccess()
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name">Nom du bien</Label>
        <Input id="name" placeholder="Résidence Mermoz" value={name} onChange={e => setName(e.target.value)} />
        {errors.name && <p className="text-sm text-red-500 mt-1">{errors.name}</p>}
      </div>

      <div>
        <Label htmlFor="type">Type</Label>
        <select
          id="type"
          value={type}
          onChange={e => setType(e.target.value)}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
        >
          <option value="appartement">Appartement</option>
          <option value="villa">Villa</option>
          <option value="bureau">Bureau</option>
          <option value="local">Local commercial</option>
        </select>
      </div>

      <div>
        <Label htmlFor="address">Adresse</Label>
        <Input id="address" placeholder="Rue 10, Mermoz" value={address} onChange={e => setAddress(e.target.value)} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="neighborhood">Quartier</Label>
          <Input id="neighborhood" placeholder="Mermoz" value={neighborhood} onChange={e => setNeighborhood(e.target.value)} />
        </div>
        <div>
          <Label htmlFor="city">Ville</Label>
          <Input id="city" placeholder="Dakar" value={city} onChange={e => setCity(e.target.value)} />
          {errors.city && <p className="text-sm text-red-500 mt-1">{errors.city}</p>}
        </div>
      </div>

      <div>
        <Label htmlFor="notes">Notes</Label>
        <Textarea id="notes" placeholder="Informations complémentaires..." value={notes} onChange={e => setNotes(e.target.value)} />
      </div>

      <Button type="submit" className="w-full bg-[#f97316] hover:bg-[#ea580c] text-white" disabled={saving}>
        {saving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Enregistrement...</> : property ? "Modifier le bien" : "Créer le bien"}
      </Button>
    </form>
  )
}
