"use client"

export const dynamic = "force-dynamic"

import { useEffect, useState } from "react"
import Link from "next/link"
import { createClient } from "@/lib/supabase"
import { useOrganization } from "@/hooks/useOrganization"
import { useUser } from "@/hooks/useUser"
import { formatFCFA, formatDateFR } from "@/lib/formatters"
import { PaymentForm } from "@/components/app/PaymentForm"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ArrowRight, Wallet, Clock, AlertTriangle, TrendingUp, CreditCard } from "lucide-react"

type KPIData = {
  collected: number
  pending: number
  late: number
  recoveryRate: number
}

type ScheduleRow = {
  id: string
  due_date: string
  amount_fcfa: number
  status: string
  leases: {
    tenants: { first_name: string; last_name: string } | null
    units: { unit_number: string; properties: { name: string } | null } | null
  } | null
}

export default function DashboardPage() {
  const { org, loading: orgLoading } = useOrganization()
  const { appUser, loading: userLoading } = useUser()
  const supabase = createClient()

  const [kpis, setKpis] = useState<KPIData | null>(null)
  const [schedules, setSchedules] = useState<ScheduleRow[]>([])
  const [kpiLoading, setKpiLoading] = useState(true)
  const [payDialogOpen, setPayDialogOpen] = useState(false)
  const [selectedScheduleId, setSelectedScheduleId] = useState<string>("")

  async function fetchKPIs() {
    if (!org) return

    const now = new Date()
    const startOfMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split("T")[0]

    // Paiements du mois
    const { data: payments } = await supabase
      .from("payments")
      .select("amount_fcfa")
      .eq("org_id", org.id)
      .gte("paid_at", startOfMonth)
      .lte("paid_at", endOfMonth + "T23:59:59")

    const collected = payments?.reduce((sum, p) => sum + p.amount_fcfa, 0) ?? 0

    // Échéances pending du mois
    const { data: pendingSchedules } = await supabase
      .from("rent_schedules")
      .select("amount_fcfa")
      .eq("org_id", org.id)
      .eq("status", "pending")
      .gte("due_date", startOfMonth)
      .lte("due_date", endOfMonth)

    const pending = pendingSchedules?.reduce((sum, s) => sum + s.amount_fcfa, 0) ?? 0

    // Échéances en retard (toutes)
    const { data: lateSchedules } = await supabase
      .from("rent_schedules")
      .select("amount_fcfa")
      .eq("org_id", org.id)
      .eq("status", "late")

    const late = lateSchedules?.reduce((sum, s) => sum + s.amount_fcfa, 0) ?? 0

    const total = collected + pending + late
    const recoveryRate = total > 0 ? Math.round((collected / total) * 100) : 0

    setKpis({ collected, pending, late, recoveryRate })

    // Échéances du mois (pour le tableau)
    const { data: monthSchedules } = await supabase
      .from("rent_schedules")
      .select("id, due_date, amount_fcfa, status, leases(tenants(first_name, last_name), units(unit_number, properties(name)))")
      .eq("org_id", org.id)
      .gte("due_date", startOfMonth)
      .lte("due_date", endOfMonth)
      .order("due_date")

    setSchedules((monthSchedules as ScheduleRow[]) ?? [])
    setKpiLoading(false)
  }

  useEffect(() => {
    if (org) fetchKPIs()
  }, [org])

  // Temps réel via Supabase subscriptions
  useEffect(() => {
    if (!org) return

    const channel = supabase
      .channel("dashboard-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "payments", filter: `org_id=eq.${org.id}` }, () => fetchKPIs())
      .on("postgres_changes", { event: "*", schema: "public", table: "rent_schedules", filter: `org_id=eq.${org.id}` }, () => fetchKPIs())
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [org])

  const statusConfig: Record<string, { label: string; color: string }> = {
    paid: { label: "Payé", color: "bg-green-100 text-green-700" },
    pending: { label: "En attente", color: "bg-orange-100 text-orange-700" },
    late: { label: "En retard", color: "bg-red-100 text-red-700" },
  }

  return (
    <div className="space-y-6">
      {/* Onboarding banner */}
      {!orgLoading && org && !org.onboarding_completed && (
        <div className="rounded-lg border border-orange-200 bg-orange-50 p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="font-semibold text-orange-900">Complétez votre configuration</h3>
              <p className="text-sm text-orange-700">Configurez votre organisation pour profiter pleinement de Locawave.</p>
            </div>
            <Link href="/dashboard/onboarding">
              <Button size="sm" className="gap-1 bg-[#f97316] hover:bg-[#ea580c] text-white">
                Configurer <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      )}

      {/* Welcome */}
      {!userLoading && appUser && (
        <div>
          <h2 className="text-2xl font-bold text-[#1a2744]">
            Bienvenue{appUser.full_name ? `, ${appUser.full_name.split(" ")[0]}` : ""}
          </h2>
          <p className="text-sm text-gray-500">Voici un aperçu de votre activité locative.</p>
        </div>
      )}

      {/* 4 KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpiLoading ? (
          [1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardHeader className="pb-2"><Skeleton className="h-4 w-24" /></CardHeader>
              <CardContent><Skeleton className="h-8 w-32 mb-2" /><Skeleton className="h-3 w-16" /></CardContent>
            </Card>
          ))
        ) : kpis ? (
          <>
            <Card>
              <CardHeader className="pb-2 flex flex-row items-center justify-between">
                <CardTitle className="text-sm font-medium text-gray-500">Encaissé ce mois</CardTitle>
                <Wallet className="w-4 h-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-green-600">{formatFCFA(kpis.collected)}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2 flex flex-row items-center justify-between">
                <CardTitle className="text-sm font-medium text-gray-500">En attente</CardTitle>
                <Clock className="w-4 h-4 text-orange-500" />
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-orange-600">{formatFCFA(kpis.pending)}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2 flex flex-row items-center justify-between">
                <CardTitle className="text-sm font-medium text-gray-500">En retard</CardTitle>
                <AlertTriangle className="w-4 h-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-red-600">{formatFCFA(kpis.late)}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2 flex flex-row items-center justify-between">
                <CardTitle className="text-sm font-medium text-gray-500">Taux recouvrement</CardTitle>
                <TrendingUp className="w-4 h-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-[#1a2744]">{kpis.recoveryRate}%</p>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div className="bg-[#f97316] h-2 rounded-full" style={{ width: `${kpis.recoveryRate}%` }} />
                </div>
              </CardContent>
            </Card>
          </>
        ) : null}
      </div>

      {/* Échéances du mois */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg text-[#1a2744]">Échéances du mois</CardTitle>
        </CardHeader>
        <CardContent>
          {schedules.length === 0 ? (
            <p className="text-center text-gray-400 py-6">Aucune échéance ce mois</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Locataire</TableHead>
                  <TableHead>Bien / Unité</TableHead>
                  <TableHead>Montant</TableHead>
                  <TableHead>Échéance</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {schedules.map((s) => {
                  const lease = s.leases
                  const status = statusConfig[s.status] ?? statusConfig.pending
                  return (
                    <TableRow key={s.id}>
                      <TableCell className="font-medium">
                        {lease?.tenants ? `${lease.tenants.first_name} ${lease.tenants.last_name}` : "-"}
                      </TableCell>
                      <TableCell>{lease?.units?.properties?.name ?? "-"} — {lease?.units?.unit_number ?? "-"}</TableCell>
                      <TableCell className="font-medium">{formatFCFA(s.amount_fcfa)}</TableCell>
                      <TableCell>{formatDateFR(s.due_date)}</TableCell>
                      <TableCell><Badge className={status.color}>{status.label}</Badge></TableCell>
                      <TableCell className="text-right">
                        {s.status !== "paid" && (
                          <Button
                            size="sm"
                            className="bg-[#f97316] hover:bg-[#ea580c] text-white"
                            onClick={() => { setSelectedScheduleId(s.id); setPayDialogOpen(true) }}
                          >
                            <CreditCard className="w-3 h-3 mr-1" /> Encaisser
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Dialog paiement rapide */}
      <Dialog open={payDialogOpen} onOpenChange={setPayDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Enregistrer un paiement</DialogTitle></DialogHeader>
          <PaymentForm
            scheduleId={selectedScheduleId}
            onSuccess={() => { setPayDialogOpen(false); fetchKPIs() }}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}
