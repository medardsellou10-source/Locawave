"use client"

export const dynamic = "force-dynamic"

import { useEffect, useState, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase"
import { useOrganization } from "@/hooks/useOrganization"
import { formatFCFA, formatDateFR } from "@/lib/formatters"
import { InspectionForm } from "@/components/app/InspectionForm"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { ArrowLeft, ShieldCheck, ClipboardList, Plus, Lock } from "lucide-react"
import { toast } from "sonner"

type Lease = {
  id: string; org_id: string; start_date: string; end_date: string
  rent_fcfa: number; deposit_fcfa: number; status: string
  tenants: { first_name: string; last_name: string } | null
  units: { unit_number: string; properties: { name: string } | null } | null
}
type Deposit = { id: string; amount_fcfa: number; released_amount_fcfa: number; status: string; note: string | null }
type Room = { room: string; state: string; note: string }
type Inspection = { id: string; type: string; rooms: Room[]; meter_readings: Record<string, string | null>; notes: string | null; done_at: string; tenant_signature: string | null; owner_signature: string | null }

const DEPOSIT_STATUS: Record<string, { label: string; cls: string }> = {
  held: { label: "Sous séquestre", cls: "bg-blue-100 text-blue-700" },
  partially_released: { label: "Partiellement libérée", cls: "bg-orange-100 text-orange-700" },
  released: { label: "Libérée (propriétaire)", cls: "bg-gray-200 text-gray-700" },
  refunded: { label: "Restituée au locataire", cls: "bg-green-100 text-green-700" },
}

export default function LeaseDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { org } = useOrganization()
  const supabase = createClient()
  const leaseId = params.id as string

  const [lease, setLease] = useState<Lease | null>(null)
  const [deposit, setDeposit] = useState<Deposit | null>(null)
  const [inspections, setInspections] = useState<Inspection[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [busy, setBusy] = useState(false)

  const fetchData = useCallback(async () => {
    if (!org) return
    const [{ data: l }, { data: d }, { data: insp }] = await Promise.all([
      supabase.from("leases").select("id, org_id, start_date, end_date, rent_fcfa, deposit_fcfa, status, tenants(first_name, last_name), units(unit_number, properties(name))").eq("id", leaseId).single(),
      supabase.from("deposits").select("id, amount_fcfa, released_amount_fcfa, status, note").eq("lease_id", leaseId).maybeSingle(),
      supabase.from("inspections").select("id, type, rooms, meter_readings, notes, done_at, tenant_signature, owner_signature").eq("lease_id", leaseId).order("done_at", { ascending: true }),
    ])
    setLease(l as Lease)
    setDeposit((d as Deposit) ?? null)
    setInspections((insp as Inspection[]) ?? [])
    setLoading(false)
  }, [org, leaseId])

  useEffect(() => { if (org) fetchData() }, [org, fetchData])

  async function audit(action: string, payload: object) {
    const { data: { user } } = await supabase.auth.getUser()
    await supabase.from("audit_log").insert({ entity: "deposits", entity_id: deposit?.id ?? null, action, actor_id: user?.id ?? null, payload })
  }

  async function createDeposit() {
    if (!lease) return
    setBusy(true)
    const { error } = await supabase.from("deposits").insert({
      org_id: lease.org_id, lease_id: lease.id, amount_fcfa: lease.deposit_fcfa, status: "held",
    })
    if (!error) { await audit("held", { amount: lease.deposit_fcfa }); toast.success("Caution placée sous séquestre") }
    else toast.error("Erreur")
    setBusy(false); fetchData()
  }

  async function setDepositStatus(status: string, released = 0, note?: string) {
    if (!deposit) return
    setBusy(true)
    const { error } = await supabase.from("deposits")
      .update({ status, released_amount_fcfa: released, note: note ?? deposit.note }).eq("id", deposit.id)
    if (!error) {
      const { data: { user } } = await supabase.auth.getUser()
      await supabase.from("audit_log").insert({ entity: "deposits", entity_id: deposit.id, action: status, actor_id: user?.id ?? null, payload: { released } })
      toast.success("Séquestre mis à jour")
    } else toast.error("Erreur")
    setBusy(false); fetchData()
  }

  function partialRelease() {
    if (!deposit) return
    const v = window.prompt(`Montant à conserver par le propriétaire (max ${deposit.amount_fcfa} FCFA) :`)
    const amt = Number(v)
    if (!amt || amt <= 0 || amt > deposit.amount_fcfa) { toast.error("Montant invalide"); return }
    setDepositStatus("partially_released", amt)
  }

  if (loading) return <div className="space-y-4"><Skeleton className="h-8 w-48" /><Skeleton className="h-40" /><Skeleton className="h-64" /></div>
  if (!lease) return <div className="text-center py-20 text-gray-500">Bail introuvable</div>

  const entry = inspections.find((i) => i.type === "entry")
  const exit = inspections.find((i) => i.type === "exit")
  const ds = deposit ? DEPOSIT_STATUS[deposit.status] : null

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <button onClick={() => router.push("/dashboard/leases")} className="hover:text-[#f97316] flex items-center gap-1">
          <ArrowLeft className="w-4 h-4" /> Baux
        </button>
        <span>/</span>
        <span className="text-[#1a2744] font-medium">
          {lease.tenants ? `${lease.tenants.first_name} ${lease.tenants.last_name}` : "Bail"}
        </span>
      </div>

      <div>
        <h1 className="text-2xl font-bold text-[#1a2744]">
          {lease.units?.properties?.name ?? ""} — {lease.units?.unit_number ?? ""}
        </h1>
        <p className="text-gray-500 text-sm">
          {lease.tenants ? `${lease.tenants.first_name} ${lease.tenants.last_name}` : ""} ·
          Loyer {formatFCFA(lease.rent_fcfa)} · {formatDateFR(lease.start_date)} → {formatDateFR(lease.end_date)}
        </p>
      </div>

      {/* Caution / séquestre */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2"><Lock className="w-4 h-4 text-[#f97316]" /> Caution & séquestre</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-gray-600">Montant de la caution : <span className="font-semibold">{formatFCFA(lease.deposit_fcfa)}</span></p>
          {!deposit ? (
            lease.deposit_fcfa > 0 ? (
              <Button onClick={createDeposit} disabled={busy} className="bg-[#1a2744] hover:bg-[#0f1a2e] text-white">
                <ShieldCheck className="w-4 h-4 mr-2" /> Placer la caution sous séquestre
              </Button>
            ) : <p className="text-sm text-gray-400">Aucune caution définie sur ce bail.</p>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Badge className={ds?.cls}>{ds?.label}</Badge>
                {deposit.released_amount_fcfa > 0 && (
                  <span className="text-sm text-gray-500">Retenu : {formatFCFA(deposit.released_amount_fcfa)}</span>
                )}
              </div>
              <p className="text-xs text-gray-400">
                Les fonds restent chez le PSP agréé — Locawave ne pilote que le statut (jamais de détention de fonds).
              </p>
              {deposit.status === "held" && (
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white" disabled={busy}
                    onClick={() => setDepositStatus("refunded", 0)}>Restituer au locataire</Button>
                  <Button size="sm" variant="outline" disabled={busy} onClick={partialRelease}>Restitution partielle</Button>
                  <Button size="sm" variant="outline" disabled={busy}
                    onClick={() => setDepositStatus("released", deposit.amount_fcfa)}>Retenue totale (propriétaire)</Button>
                </div>
              )}
              {deposit.status === "partially_released" && (
                <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white" disabled={busy}
                  onClick={() => setDepositStatus("refunded", deposit.released_amount_fcfa)}>Solder (restituer le reste)</Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* États des lieux */}
      <Card>
        <CardHeader className="pb-2 flex flex-row items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2"><ClipboardList className="w-4 h-4 text-[#f97316]" /> États des lieux</CardTitle>
          <div className="flex gap-2">
            {entry && exit && (
              <Button size="sm" variant="outline" onClick={() => window.print()}>Imprimer / PDF</Button>
            )}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger>
                <Button size="sm" className="bg-[#f97316] hover:bg-[#ea580c] text-white"><Plus className="w-4 h-4 mr-1" /> Nouvel EDL</Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader><DialogTitle>Nouvel état des lieux</DialogTitle></DialogHeader>
                <InspectionForm orgId={lease.org_id} leaseId={lease.id} onSuccess={() => { setDialogOpen(false); fetchData() }} />
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {inspections.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-4">Aucun état des lieux. Créez l'EDL d'entrée puis de sortie.</p>
          ) : entry && exit ? (
            // Vue comparative entrée vs sortie
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="text-left text-gray-500 border-b">
                  <th className="py-2">Pièce</th><th>Entrée ({formatDateFR(entry.done_at)})</th><th>Sortie ({formatDateFR(exit.done_at)})</th>
                </tr></thead>
                <tbody>
                  {Array.from(new Set([...entry.rooms, ...exit.rooms].map((r) => r.room))).map((room) => {
                    const e = entry.rooms.find((r) => r.room === room)
                    const x = exit.rooms.find((r) => r.room === room)
                    const changed = e?.state !== x?.state
                    return (
                      <tr key={room} className="border-b">
                        <td className="py-2 font-medium">{room}</td>
                        <td>{e?.state ?? "-"}{e?.note ? ` (${e.note})` : ""}</td>
                        <td className={changed ? "text-orange-600 font-medium" : ""}>{x?.state ?? "-"}{x?.note ? ` (${x.note})` : ""}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
              <p className="text-xs text-gray-400 mt-2">Les différences d'état entre l'entrée et la sortie sont surlignées (base des retenues sur caution).</p>
            </div>
          ) : (
            <div className="space-y-2">
              {inspections.map((i) => (
                <div key={i.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg text-sm">
                  <span className="font-medium">{i.type === "entry" ? "Entrée" : "Sortie"}</span>
                  <span className="text-gray-500">{i.rooms.length} pièce(s)</span>
                  <span className="text-gray-400">{formatDateFR(i.done_at)}</span>
                </div>
              ))}
              <p className="text-xs text-gray-400">Ajoutez l'état des lieux de {entry ? "sortie" : "d'entrée"} pour obtenir le comparatif.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
