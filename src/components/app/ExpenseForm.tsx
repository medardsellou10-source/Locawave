"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase"
import { useOrganization } from "@/hooks/useOrganization"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"

export const EXPENSE_CATEGORIES = [
  "Taxe foncière",
  "Syndic",
  "Réparations",
  "Commissions",
  "Assurance",
  "Eau / Électricité",
  "Autre",
] as const

type PropertyOption = { id: string; name: string }

export function ExpenseForm({ onSuccess }: { onSuccess: () => void }) {
  const { org } = useOrganization()
  const supabase = createClient()

  const [properties, setProperties] = useState<PropertyOption[]>([])
  const [propertyId, setPropertyId] = useState("")
  const [category, setCategory] = useState<string>(EXPENSE_CATEGORIES[0])
  const [amount, setAmount] = useState("")
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10))
  const [description, setDescription] = useState("")
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!org) return
    supabase
      .from("properties")
      .select("id, name")
      .eq("org_id", org.id)
      .order("name")
      .then(({ data }) => {
        const list = (data as PropertyOption[]) ?? []
        setProperties(list)
        if (list.length && !propertyId) setPropertyId(list[0].id)
      })
  }, [org])

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!org) return
    if (!propertyId) { toast.error("Sélectionnez un bien"); return }
    const amt = parseInt(amount)
    if (!amt || amt <= 0) { toast.error("Montant invalide"); return }

    setSaving(true)
    const { error } = await supabase.from("expenses").insert({
      org_id: org.id,
      property_id: propertyId,
      category,
      amount_fcfa: amt,
      date,
      description: description || null,
    })
    setSaving(false)

    if (error) { toast.error("Erreur lors de l'enregistrement de la charge"); return }
    toast.success("Charge enregistrée")
    onSuccess()
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <Label htmlFor="exp-property">Bien concerné</Label>
        <select
          id="exp-property"
          value={propertyId}
          onChange={(e) => setPropertyId(e.target.value)}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
        >
          {properties.length === 0 && <option value="">Aucun bien — créez-en un d'abord</option>}
          {properties.map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="exp-cat">Catégorie</Label>
          <select
            id="exp-cat"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            {EXPENSE_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <Label htmlFor="exp-amount">Montant (FCFA)</Label>
          <Input id="exp-amount" type="number" min={1} value={amount}
            onChange={(e) => setAmount(e.target.value)} placeholder="50000" />
        </div>
      </div>

      <div>
        <Label htmlFor="exp-date">Date</Label>
        <Input id="exp-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
      </div>

      <div>
        <Label htmlFor="exp-desc">Description (optionnel)</Label>
        <Textarea id="exp-desc" value={description} onChange={(e) => setDescription(e.target.value)}
          placeholder="Détails de la charge…" rows={2} />
      </div>

      <Button type="submit" disabled={saving} className="w-full bg-[#f97316] hover:bg-[#ea580c] text-white">
        {saving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Enregistrement…</> : "Enregistrer la charge"}
      </Button>
    </form>
  )
}
