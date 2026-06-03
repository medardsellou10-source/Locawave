"use client"

export const dynamic = "force-dynamic"

import { useEffect, useState, useCallback } from "react"
import { createClient } from "@/lib/supabase"
import { useOrganization } from "@/hooks/useOrganization"
import { formatDateFR } from "@/lib/formatters"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { AlertTriangle } from "lucide-react"
import { toast } from "sonner"
import { IncidentAssign, type ProviderOption } from "@/components/app/IncidentAssign"

type Incident = {
  id: string; category: string; urgency: string; description: string | null
  status: string; charge_to: string | null; created_at: string; media_urls: string[] | null
  property_id: string | null
  properties: { name: string } | null
  leases: { tenants: { first_name: string; last_name: string } | null } | null
}

const STATUS = [
  { value: "open", label: "Ouvert" },
  { value: "assigned", label: "Assigné" },
  { value: "in_progress", label: "En cours" },
  { value: "resolved", label: "Résolu" },
]
const STATUS_CLS: Record<string, string> = {
  open: "bg-orange-100 text-orange-700", assigned: "bg-blue-100 text-blue-700",
  in_progress: "bg-purple-100 text-purple-700", resolved: "bg-green-100 text-green-700",
}
const URGENCY: Record<string, { label: string; cls: string }> = {
  low: { label: "Faible", cls: "bg-gray-100 text-gray-600" },
  medium: { label: "Moyenne", cls: "bg-yellow-100 text-yellow-700" },
  high: { label: "Haute", cls: "bg-red-100 text-red-700" },
}

export default function IncidentsPage() {
  const { org } = useOrganization()
  const supabase = createClient()
  const [incidents, setIncidents] = useState<Incident[]>([])
  const [providers, setProviders] = useState<ProviderOption[]>([])
  const [ownerId, setOwnerId] = useState("")
  const [loading, setLoading] = useState(true)

  const fetchIncidents = useCallback(async () => {
    if (!org) return
    const { data } = await supabase
      .from("incidents")
      .select("id, category, urgency, description, status, charge_to, created_at, media_urls, property_id, properties(name), leases(tenants(first_name, last_name))")
      .eq("org_id", org.id)
      .order("created_at", { ascending: false })
    setIncidents((data as Incident[]) ?? [])
    setLoading(false)
  }, [org])

  const fetchProviders = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) setOwnerId(user.id)
    const [{ data: provs }, { data: trusted }] = await Promise.all([
      supabase.from("provider_profiles").select("id, trades, display_name").eq("is_verified", true),
      user ? supabase.from("trusted_providers").select("provider_id").eq("owner_id", user.id) : Promise.resolve({ data: [] as { provider_id: string }[] }),
    ])
    const trustedSet = new Set((trusted ?? []).map((t) => t.provider_id))
    setProviders((provs ?? []).map((p) => ({
      id: p.id,
      name: p.display_name ?? "Prestataire",
      trades: p.trades ?? [],
      trusted: trustedSet.has(p.id),
    })))
  }, [])

  useEffect(() => {
    if (!org) return
    fetchIncidents()
    fetchProviders()
    const channel = supabase
      .channel(`incidents-org-${org.id}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "incidents", filter: `org_id=eq.${org.id}` },
        () => fetchIncidents())
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [org, fetchIncidents])

  async function update(id: string, patch: Partial<Incident>) {
    const { error } = await supabase.from("incidents").update(patch).eq("id", id)
    if (error) toast.error("Erreur de mise à jour")
    else { toast.success("Incident mis à jour"); fetchIncidents() }
  }

  if (loading) return <div className="space-y-4"><Skeleton className="h-8 w-48" /><Skeleton className="h-64" /></div>

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#1a2744] mb-6 flex items-center gap-2">
        <AlertTriangle className="w-6 h-6 text-[#f97316]" /> Incidents
      </h1>

      {incidents.length === 0 ? (
        <div className="text-center py-16 text-gray-400">Aucun incident signalé.</div>
      ) : (
        <div className="space-y-3">
          {incidents.map((i) => {
            const tenant = i.leases?.tenants
            const urg = URGENCY[i.urgency] ?? URGENCY.medium
            return (
              <Card key={i.id} className={i.urgency === "high" && i.status !== "resolved" ? "border-red-300" : ""}>
                <CardContent className="py-4 space-y-3">
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-[#1a2744]">{i.category}</span>
                        <Badge className={urg.cls}>{urg.label}</Badge>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{i.description ?? "—"}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {i.properties?.name ?? ""} · {tenant ? `${tenant.first_name} ${tenant.last_name}` : ""} · {formatDateFR(i.created_at)}
                      </p>
                      {i.media_urls && i.media_urls.length > 0 && (
                        <a href={i.media_urls[0]} target="_blank" rel="noopener noreferrer"
                          className="text-xs text-[#f97316] hover:underline">Voir la photo</a>
                      )}
                    </div>
                    <Badge className={STATUS_CLS[i.status]}>{STATUS.find((s) => s.value === i.status)?.label}</Badge>
                  </div>

                  <div className="flex flex-wrap gap-3 pt-2 border-t">
                    <label className="text-xs text-gray-500 flex items-center gap-1">
                      Statut
                      <select value={i.status} onChange={(e) => update(i.id, { status: e.target.value })}
                        className="h-8 rounded border border-input bg-background px-2 text-sm">
                        {STATUS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                      </select>
                    </label>
                    <label className="text-xs text-gray-500 flex items-center gap-1">
                      Charge
                      <select value={i.charge_to ?? ""} onChange={(e) => update(i.id, { charge_to: e.target.value || null })}
                        className="h-8 rounded border border-input bg-background px-2 text-sm">
                        <option value="">— Non définie</option>
                        <option value="owner">Propriétaire</option>
                        <option value="tenant">Locataire</option>
                      </select>
                    </label>
                  </div>
                  <div className="pt-2">
                    {org && (
                      <IncidentAssign
                        incidentId={i.id} orgId={org.id} propertyId={i.property_id}
                        ownerId={ownerId} providers={providers} onChanged={fetchIncidents}
                      />
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
