"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { propertySchema, type PropertyInput } from "@/lib/schemas"
import { createClient } from "@/lib/supabase"
import { useOrganization } from "@/hooks/useOrganization"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import type { Database } from "@/types/database"

type Property = Database["public"]["Tables"]["properties"]["Row"]

interface PropertyFormProps {
  property?: Property
  onSuccess: () => void
}

export function PropertyForm({ property, onSuccess }: PropertyFormProps) {
  const { org } = useOrganization()
  const supabase = createClient()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<PropertyInput>({
    resolver: zodResolver(propertySchema),
    defaultValues: property
      ? {
          name: property.name,
          type: property.type as PropertyInput["type"],
          address: property.address ?? "",
          neighborhood: property.neighborhood ?? "",
          city: property.city,
          notes: property.notes ?? "",
        }
      : { city: "Dakar", type: "appartement" },
  })

  async function onSubmit(data: PropertyInput) {
    if (!org) return

    if (property) {
      const { error } = await supabase
        .from("properties")
        .update(data)
        .eq("id", property.id)
      if (error) {
        toast.error("Erreur lors de la modification")
        return
      }
      toast.success("Bien modifié avec succès")
    } else {
      const { error } = await supabase
        .from("properties")
        .insert({ ...data, org_id: org.id })
      if (error) {
        toast.error("Erreur lors de la création")
        return
      }
      toast.success("Bien créé avec succès")
    }
    onSuccess()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Label htmlFor="name">Nom du bien</Label>
        <Input id="name" placeholder="Résidence Mermoz" {...register("name")} />
        {errors.name && <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>}
      </div>

      <div>
        <Label htmlFor="type">Type</Label>
        <select
          id="type"
          {...register("type")}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
        >
          <option value="appartement">Appartement</option>
          <option value="villa">Villa</option>
          <option value="bureau">Bureau</option>
          <option value="local">Local commercial</option>
        </select>
        {errors.type && <p className="text-sm text-red-500 mt-1">{errors.type.message}</p>}
      </div>

      <div>
        <Label htmlFor="address">Adresse</Label>
        <Input id="address" placeholder="Rue 10, Mermoz" {...register("address")} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="neighborhood">Quartier</Label>
          <Input id="neighborhood" placeholder="Mermoz" {...register("neighborhood")} />
        </div>
        <div>
          <Label htmlFor="city">Ville</Label>
          <Input id="city" placeholder="Dakar" {...register("city")} />
        </div>
      </div>

      <div>
        <Label htmlFor="notes">Notes</Label>
        <Textarea id="notes" placeholder="Informations complémentaires..." {...register("notes")} />
      </div>

      <Button type="submit" className="w-full bg-[#f97316] hover:bg-[#ea580c] text-white" disabled={isSubmitting}>
        {isSubmitting ? "Enregistrement..." : property ? "Modifier le bien" : "Créer le bien"}
      </Button>
    </form>
  )
}
