"use client"

import { useEffect, useState, useCallback } from "react"
import { createClient } from "@/lib/supabase"
import { IncidentForm } from "@/components/app/IncidentForm"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { AlertTriangle, Plus } from "lucide-react"
import { formatDateFR } from "@/lib/formatters"

type Incident = {
  id: string; category: string; urgency: string; description: string | null
  status: string; created_at: string; media_urls: string[] | null
}

const STATUS: Record<string, { label: string; cls: string }> = {
  open: { label: "Ouvert", cls: "bg-orange-100 text-orange-700" },
  assigned: { label: "Assigné", cls: "bg-blue-100 text-blue-700" },
  in_progress: { label: "En cours", cls: "bg-purple-100 text-purple-700" },
  resolved: { label: "Résolu", cls: "bg-green-100 text-green-700" },
}
const URGENCY: Record<string, string> = { low: "Faible", medium: "Moyenne", high: "Haute" }

export function TenantIncidents({
  orgId, leaseId, propertyId,
}: { orgId: string; leaseId: string; propertyId: string | null }) {
  const supabase = createClient()
  const [incidents, setIncidents] = useState<Incident[]>([])
  const [open, setOpen] = useState(false)

  const fetchIncidents = useCallback(async () => {
    const { data } = await supabase
      .from("incidents")
      .select("id, category, urgency, description, status, created_at, media_urls")
      .eq("lease_id", leaseId)
      .order("created_at", { ascending: false })
    setIncidents((data as Incident[]) ?? [])
  }, [leaseId])

  useEffect(() => {
    fetchIncidents()
    const channel = supabase
      .channel(`incidents-${leaseId}`)
      .on("postgres_changes",
        { event: "*", schema: "public", table: "incidents", filter: `lease_id=eq.${leaseId}` },
        () => fetchIncidents())
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [leaseId, fetchIncidents])

  return (
    <Card>
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <CardTitle className="text-base flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-[#f97316]" /> Mes incidents
        </CardTitle>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger>
            <Button size="sm" className="bg-[#f97316] hover:bg-[#ea580c] text-white">
              <Plus className="w-4 h-4 mr-1" /> Signaler
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Signaler un incident</DialogTitle></DialogHeader>
            <IncidentForm orgId={orgId} leaseId={leaseId} propertyId={propertyId}
              onSuccess={() => { setOpen(false); fetchIncidents() }} />
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {incidents.length === 0 ? (
          <p className="text-gray-500 text-sm">Aucun incident signalé. En cas de problème, cliquez sur « Signaler ».</p>
        ) : (
          <div className="divide-y">
            {incidents.map((i) => {
              const st = STATUS[i.status] ?? STATUS.open
              return (
                <div key={i.id} className="py-2.5 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-[#1a2744]">
                      {i.category}
                      {i.urgency === "high" && <span className="ml-2 text-xs text-red-600 font-semibold">Urgent</span>}
                    </p>
                    <p className="text-xs text-gray-500 truncate">{i.description ?? ""} · {formatDateFR(i.created_at)}</p>
                  </div>
                  <Badge className={st.cls}>{st.label}</Badge>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
