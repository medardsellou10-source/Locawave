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

type Tenant = Database["public"]["Tables"]["tenants"]["Row"]

interface TenantFormProps {
  tenant?: Tenant
  onSuccess: () => void
}

export function TenantForm({ tenant, onSuccess }: TenantFormProps) {
  const { org } = useOrganization()
  const supabase = createClient()
  const [saving, setSaving] = useState(false)

  const [firstName, setFirstName] = useState(tenant?.first_name ?? "")
  const [lastName, setLastName] = useState(tenant?.last_name ?? "")
  const [whatsapp, setWhatsapp] = useState(tenant?.whatsapp ?? "")
  const [email, setEmail] = useState(tenant?.email ?? "")
  const [idType, setIdType] = useState(tenant?.id_document_type ?? "")
  const [idNumber, setIdNumber] = useState(tenant?.id_document_number ?? "")
  const [employer, setEmployer] = useState(tenant?.employer ?? "")
  const [errors, setErrors] = useState<Record<string, string>>({})

  function validate() {
    const errs: Record<string, string> = {}
    if (!firstName || firstName.trim().length < 2) errs.first_name = "Le prénom est requis (min. 2 caractères)"
    if (!lastName || lastName.trim().length < 2) errs.last_name = "Le nom est requis (min. 2 caractères)"
    if (!whatsapp || whatsapp.trim().length < 9) errs.whatsapp = "Le numéro WhatsApp est requis"
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = "Email invalide"
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate() || !org) return
    setSaving(true)

    const payload = {
      first_name: firstName.trim(),
      last_name: lastName.trim(),
      whatsapp: whatsapp.trim(),
      email: email || null,
      id_document_type: idType || null,
      id_document_number: idNumber || null,
      employer: employer || null,
    }

    if (tenant) {
      const { error } = await supabase.from("tenants").update(payload).eq("id", tenant.id)
      if (error) { toast.error("Erreur lors de la modification"); setSaving(false); return }
      toast.success("Locataire modifié avec succès")
    } else {
      const { error } = await supabase.from("tenants").insert({ ...payload, org_id: org.id })
      if (error) { toast.error("Erreur lors de la création"); setSaving(false); return }
      toast.success("Locataire ajouté avec succès")
    }
    onSuccess()
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="first_name">Prénom</Label>
          <Input id="first_name" placeholder="Moussa" value={firstName} onChange={e => setFirstName(e.target.value)} />
          {errors.first_name && <p className="text-sm text-red-500 mt-1">{errors.first_name}</p>}
        </div>
        <div>
          <Label htmlFor="last_name">Nom</Label>
          <Input id="last_name" placeholder="Diallo" value={lastName} onChange={e => setLastName(e.target.value)} />
          {errors.last_name && <p className="text-sm text-red-500 mt-1">{errors.last_name}</p>}
        </div>
      </div>

      <div>
        <Label htmlFor="whatsapp">WhatsApp</Label>
        <Input id="whatsapp" placeholder="+221 77 123 45 67" value={whatsapp} onChange={e => setWhatsapp(e.target.value)} />
        {errors.whatsapp && <p className="text-sm text-red-500 mt-1">{errors.whatsapp}</p>}
      </div>

      <div>
        <Label htmlFor="email">Email (optionnel)</Label>
        <Input id="email" type="email" placeholder="moussa@email.com" value={email} onChange={e => setEmail(e.target.value)} />
        {errors.email && <p className="text-sm text-red-500 mt-1">{errors.email}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="id_document_type">Pièce d'identité</Label>
          <select
            id="id_document_type"
            value={idType}
            onChange={e => setIdType(e.target.value)}
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
          <Input id="id_document_number" placeholder="N° pièce" value={idNumber} onChange={e => setIdNumber(e.target.value)} />
        </div>
      </div>

      <div>
        <Label htmlFor="employer">Employeur (optionnel)</Label>
        <Input id="employer" placeholder="Société, entreprise..." value={employer} onChange={e => setEmployer(e.target.value)} />
      </div>

      <Button type="submit" className="w-full bg-[#f97316] hover:bg-[#ea580c] text-white" disabled={saving}>
        {saving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Enregistrement...</> : tenant ? "Modifier le locataire" : "Ajouter le locataire"}
      </Button>
    </form>
  )
}
