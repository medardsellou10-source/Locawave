"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { tenantSchema, type TenantInput } from "@/lib/schemas"
import { createClient } from "@/lib/supabase"
import { useOrganization } from "@/hooks/useOrganization"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import type { Database } from "@/types/database"

type Tenant = Database["public"]["Tables"]["tenants"]["Row"]

interface TenantFormProps {
  tenant?: Tenant
  onSuccess: () => void
}

export function TenantForm({ tenant, onSuccess }: TenantFormProps) {
  const { org } = useOrganization()
  const supabase = createClient()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<TenantInput>({
    resolver: zodResolver(tenantSchema),
    defaultValues: tenant
      ? {
          first_name: tenant.first_name,
          last_name: tenant.last_name,
          whatsapp: tenant.whatsapp,
          email: tenant.email ?? "",
          id_document_type: tenant.id_document_type ?? "",
          id_document_number: tenant.id_document_number ?? "",
          employer: tenant.employer ?? "",
        }
      : {},
  })

  async function onSubmit(data: TenantInput) {
    if (!org) return

    const payload = {
      ...data,
      email: data.email || null,
      id_document_type: data.id_document_type || null,
      id_document_number: data.id_document_number || null,
      employer: data.employer || null,
    }

    if (tenant) {
      const { error } = await supabase.from("tenants").update(payload).eq("id", tenant.id)
      if (error) { toast.error("Erreur lors de la modification"); return }
      toast.success("Locataire modifié avec succès")
    } else {
      const { error } = await supabase.from("tenants").insert({ ...payload, org_id: org.id })
      if (error) { toast.error("Erreur lors de la création"); return }
      toast.success("Locataire ajouté avec succès")
    }
    onSuccess()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="first_name">Prénom</Label>
          <Input id="first_name" placeholder="Moussa" {...register("first_name")} />
          {errors.first_name && <p className="text-sm text-red-500 mt-1">{errors.first_name.message}</p>}
        </div>
        <div>
          <Label htmlFor="last_name">Nom</Label>
          <Input id="last_name" placeholder="Diallo" {...register("last_name")} />
          {errors.last_name && <p className="text-sm text-red-500 mt-1">{errors.last_name.message}</p>}
        </div>
      </div>

      <div>
        <Label htmlFor="whatsapp">WhatsApp</Label>
        <Input id="whatsapp" placeholder="+221 77 123 45 67" {...register("whatsapp")} />
        {errors.whatsapp && <p className="text-sm text-red-500 mt-1">{errors.whatsapp.message}</p>}
      </div>

      <div>
        <Label htmlFor="email">Email (optionnel)</Label>
        <Input id="email" type="email" placeholder="moussa@email.com" {...register("email")} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="id_document_type">Pièce d'identité</Label>
          <select
            id="id_document_type"
            {...register("id_document_type")}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="">-- Sélectionner --</option>
            <option value="cni">CNI</option>
            <option value="passeport">Passeport</option>
            <option value="carte_consulaire">Carte consulaire</option>
            <option value="autre">Autre</option>
          </select>
        </div>
        <div>
          <Label htmlFor="id_document_number">Numéro</Label>
          <Input id="id_document_number" placeholder="N° pièce" {...register("id_document_number")} />
        </div>
      </div>

      <div>
        <Label htmlFor="employer">Employeur (optionnel)</Label>
        <Input id="employer" placeholder="Société, entreprise..." {...register("employer")} />
      </div>

      <Button type="submit" className="w-full bg-[#f97316] hover:bg-[#ea580c] text-white" disabled={isSubmitting}>
        {isSubmitting ? "Enregistrement..." : tenant ? "Modifier le locataire" : "Ajouter le locataire"}
      </Button>
    </form>
  )
}
