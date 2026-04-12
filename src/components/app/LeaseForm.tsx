"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase"
import { useOrganization } from "@/hooks/useOrganization"
import { formatFCFA } from "@/lib/formatters"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"
import type { Database } from "@/types/database"

type Unit = Database["public"]["Tables"]["units"]["Row"] & { properties: { name: string } | null }
type Tenant = Database["public"]["Tables"]["tenants"]["Row"]

interface LeaseFormProps {
  onSuccess: () => void
}

export function LeaseForm({ onSuccess }: LeaseFormProps) {
  const { org } = useOrganization()
  const supabase = createClient()
  const [saving, setSaving] = useState(false)
  const [vacantUnits, setVacantUnits] = useState<Unit[]>([])
  const [tenants, setTenants] = useState<Tenant[]>([])

  const [unitId, setUnitId] = useState("")
  const [tenantId, setTenantId] = useState("")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [rent, setRent] = useState("")
  const [dueDay, setDueDay] = useState("5")
  const [deposit, setDeposit] = useState("0")
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (!org) return
    async function fetchData() {
      const { data: units } = await supabase
        .from("units").select("*, properties(name)")
        .eq("org_id", org!.id).eq("status", "vacant")
      const { data: tenantsList } = await supabase
        .from("tenants").select("*").eq("org_id", org!.id).order("first_name")
      setVacantUnits((units as Unit[]) ?? [])
      setTenants(tenantsList ?? [])
    }
    fetchData()
  }, [org])

  // Auto-fill rent when unit selected
  useEffect(() => {
    const unit = vacantUnits.find(u => u.id === unitId)
    if (unit) setRent(unit.rent_fcfa.toString())
  }, [unitId, vacantUnits])

  function validate() {
    const errs: Record<string, string> = {}
    if (!unitId) errs.unit_id = "Sélectionnez une unité"
    if (!tenantId) errs.tenant_id = "Sélectionnez un locataire"
    if (!startDate) errs.start_date = "La date de début est requise"
    if (!endDate) errs.end_date = "La date de fin est requise"
    if (startDate && endDate && new Date(endDate) <= new Date(startDate)) errs.end_date = "La date de fin doit être après la date de début"
    if (!rent || isNaN(Number(rent)) || Number(rent) <= 0) errs.rent = "Le loyer doit être positif"
    const dd = parseInt(dueDay)
    if (isNaN(dd) || dd < 1 || dd > 31) errs.due_day = "Le jour d'échéance doit être entre 1 et 31"
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate() || !org) return
    setSaving(true)

    const rentFcfa = parseInt(rent)
    const dueDayNum = parseInt(dueDay)
    const depositFcfa = parseInt(deposit) || 0

    const { data: lease, error: leaseError } = await supabase
      .from("leases")
      .insert({ org_id: org.id, unit_id: unitId, tenant_id: tenantId, start_date: startDate, end_date: endDate, rent_fcfa: rentFcfa, due_day: dueDayNum, deposit_fcfa: depositFcfa, status: "active" })
      .select().single()

    if (leaseError || !lease) {
      toast.error("Erreur lors de la création du bail")
      setSaving(false)
      return
    }

    await supabase.from("units").update({ status: "rented" }).eq("id", unitId)

    const schedules = []
    const sd = new Date(startDate)
    for (let i = 0; i < 12; i++) {
      const d = new Date(sd.getFullYear(), sd.getMonth() + i, dueDayNum)
      if (d.getDate() !== dueDayNum) d.setDate(0)
      schedules.push({ lease_id: lease.id, org_id: org.id, due_date: d.toISOString().split("T")[0], amount_fcfa: rentFcfa, status: "pending" as const })
    }

    const { error: schedError } = await supabase.from("rent_schedules").insert(schedules)
    if (schedError) {
      toast.error("Bail créé mais erreur lors de la génération des échéances")
      setSaving(false)
      return
    }

    toast.success(`Bail créé avec 12 échéances de ${formatFCFA(rentFcfa)}`)
    onSuccess()
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <Label htmlFor="unit_id">Unité (uniquement vacantes)</Label>
        <select id="unit_id" value={unitId} onChange={e => setUnitId(e.target.value)}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
          <option value="">-- Sélectionner une unité --</option>
          {vacantUnits.map(u => (
            <option key={u.id} value={u.id}>{u.properties?.name} — {u.unit_number} ({formatFCFA(u.rent_fcfa)})</option>
          ))}
        </select>
        {errors.unit_id && <p className="text-sm text-red-500 mt-1">{errors.unit_id}</p>}
        {vacantUnits.length === 0 && <p className="text-sm text-orange-500 mt-1">Aucune unité vacante disponible</p>}
      </div>

      <div>
        <Label htmlFor="tenant_id">Locataire</Label>
        <select id="tenant_id" value={tenantId} onChange={e => setTenantId(e.target.value)}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
          <option value="">-- Sélectionner un locataire --</option>
          {tenants.map(t => (
            <option key={t.id} value={t.id}>{t.first_name} {t.last_name} ({t.whatsapp})</option>
          ))}
        </select>
        {errors.tenant_id && <p className="text-sm text-red-500 mt-1">{errors.tenant_id}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="start_date">Date de début</Label>
          <Input id="start_date" type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
          {errors.start_date && <p className="text-sm text-red-500 mt-1">{errors.start_date}</p>}
        </div>
        <div>
          <Label htmlFor="end_date">Date de fin</Label>
          <Input id="end_date" type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
          {errors.end_date && <p className="text-sm text-red-500 mt-1">{errors.end_date}</p>}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="rent">Loyer mensuel (FCFA)</Label>
          <Input id="rent" type="number" placeholder="150000" value={rent} onChange={e => setRent(e.target.value)} />
          {errors.rent && <p className="text-sm text-red-500 mt-1">{errors.rent}</p>}
        </div>
        <div>
          <Label htmlFor="due_day">Jour d'échéance (1-31)</Label>
          <Input id="due_day" type="number" min={1} max={31} value={dueDay} onChange={e => setDueDay(e.target.value)} />
          {errors.due_day && <p className="text-sm text-red-500 mt-1">{errors.due_day}</p>}
        </div>
      </div>

      <div>
        <Label htmlFor="deposit">Caution (FCFA)</Label>
        <Input id="deposit" type="number" placeholder="0" value={deposit} onChange={e => setDeposit(e.target.value)} />
      </div>

      <Button type="submit" className="w-full bg-[#f97316] hover:bg-[#ea580c] text-white" disabled={saving}>
        {saving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Création en cours...</> : "Créer le bail + 12 échéances"}
      </Button>
    </form>
  )
}
