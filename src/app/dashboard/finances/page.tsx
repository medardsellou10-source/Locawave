"use client"

export const dynamic = "force-dynamic"

import { useEffect, useMemo, useState } from "react"
import { createClient } from "@/lib/supabase"
import { useOrganization } from "@/hooks/useOrganization"
import { formatFCFA, formatDateFR } from "@/lib/formatters"
import { ExpenseForm } from "@/components/app/ExpenseForm"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Plus, Download, TrendingUp, TrendingDown, Wallet, Trash2, Percent } from "lucide-react"
import { toast } from "sonner"

type PaymentRow = { amount_fcfa: number; paid_at: string; rent_schedules: { leases: { units: { property_id: string } | null } | null } | null }
type ExpenseRow = { id: string; category: string; amount_fcfa: number; date: string; description: string | null; property_id: string; properties: { name: string } | null }
type ScheduleRow = { amount_fcfa: number; status: string }
type PropertyRow = { id: string; name: string }
type CommissionRow = { source_type: string; base_fcfa: number; amount_fcfa: number; created_at: string }

const MONTHS = ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil", "Aoû", "Sep", "Oct", "Nov", "Déc"]

export default function FinancesPage() {
  const { org } = useOrganization()
  const supabase = createClient()

  const [year, setYear] = useState(() => new Date().getFullYear())
  const [loading, setLoading] = useState(true)
  const [payments, setPayments] = useState<PaymentRow[]>([])
  const [expenses, setExpenses] = useState<ExpenseRow[]>([])
  const [schedules, setSchedules] = useState<ScheduleRow[]>([])
  const [properties, setProperties] = useState<PropertyRow[]>([])
  const [commissions, setCommissions] = useState<CommissionRow[]>([])
  const [dialogOpen, setDialogOpen] = useState(false)

  async function fetchAll() {
    if (!org) return
    setLoading(true)
    const start = `${year}-01-01`
    const end = `${year}-12-31`

    const [{ data: pays }, { data: exps }, { data: scheds }, { data: props }, { data: comms }] = await Promise.all([
      supabase.from("payments")
        .select("amount_fcfa, paid_at, rent_schedules(leases(units(property_id)))")
        .eq("org_id", org.id).gte("paid_at", start).lte("paid_at", end + "T23:59:59"),
      supabase.from("expenses")
        .select("id, category, amount_fcfa, date, description, property_id, properties(name)")
        .eq("org_id", org.id).gte("date", start).lte("date", end).order("date", { ascending: false }),
      supabase.from("rent_schedules")
        .select("amount_fcfa, status").eq("org_id", org.id).gte("due_date", start).lte("due_date", end),
      supabase.from("properties").select("id, name").eq("org_id", org.id).order("name"),
      supabase.from("commissions")
        .select("source_type, base_fcfa, amount_fcfa, created_at")
        .eq("org_id", org.id).gte("created_at", start).lte("created_at", end + "T23:59:59")
        .order("created_at", { ascending: false }),
    ])

    setPayments((pays as PaymentRow[]) ?? [])
    setExpenses((exps as ExpenseRow[]) ?? [])
    setSchedules((scheds as ScheduleRow[]) ?? [])
    setProperties((props as PropertyRow[]) ?? [])
    setCommissions((comms as CommissionRow[]) ?? [])
    setLoading(false)
  }

  useEffect(() => { if (org) fetchAll() }, [org, year])

  const stats = useMemo(() => {
    const revenus = payments.reduce((s, p) => s + p.amount_fcfa, 0)
    const charges = expenses.reduce((s, e) => s + e.amount_fcfa, 0)
    const net = revenus - charges
    const due = schedules.reduce((s, r) => s + r.amount_fcfa, 0)
    const recouvrement = due > 0 ? Math.round((revenus / due) * 100) : 0

    // Revenus par mois
    const parMois = Array(12).fill(0)
    for (const p of payments) {
      const m = new Date(p.paid_at).getMonth()
      parMois[m] += p.amount_fcfa
    }

    // Par bien
    const nameById = new Map(properties.map((p) => [p.id, p.name]))
    const byProp = new Map<string, { revenus: number; charges: number }>()
    for (const p of payments) {
      const pid = p.rent_schedules?.leases?.units?.property_id
      if (!pid) continue
      const cur = byProp.get(pid) ?? { revenus: 0, charges: 0 }
      cur.revenus += p.amount_fcfa
      byProp.set(pid, cur)
    }
    for (const e of expenses) {
      const cur = byProp.get(e.property_id) ?? { revenus: 0, charges: 0 }
      cur.charges += e.amount_fcfa
      byProp.set(e.property_id, cur)
    }
    const parBien = Array.from(byProp.entries()).map(([id, v]) => ({
      id, name: nameById.get(id) ?? "Bien supprimé", ...v, net: v.revenus - v.charges,
    })).sort((a, b) => b.revenus - a.revenus)

    return { revenus, charges, net, recouvrement, parMois, parBien }
  }, [payments, expenses, schedules, properties])

  const maxMois = Math.max(1, ...stats.parMois)

  async function deleteExpense(id: string) {
    if (!confirm("Supprimer cette charge ?")) return
    const { error } = await supabase.from("expenses").delete().eq("id", id)
    if (error) { toast.error("Erreur lors de la suppression"); return }
    toast.success("Charge supprimée")
    fetchAll()
  }

  function exportAnnual() {
    if (!org) return
    window.open(`/api/export/annual?org_id=${org.id}&year=${year}`, "_blank")
  }

  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i)

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-6">
        <h1 className="text-2xl font-bold text-[#1a2744]">Finances</h1>
        <div className="flex gap-2">
          <select
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            className="h-10 rounded-md border border-input bg-background px-3 text-sm"
          >
            {years.map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
          <Button variant="outline" onClick={exportAnnual}>
            <Download className="w-4 h-4 mr-1" /> Relevé annuel
          </Button>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger>
              <Button className="bg-[#f97316] hover:bg-[#ea580c] text-white">
                <Plus className="w-4 h-4 mr-1" /> Charge
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Ajouter une charge</DialogTitle></DialogHeader>
              <ExpenseForm onSuccess={() => { setDialogOpen(false); fetchAll() }} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {loading ? (
        <div className="space-y-4"><Skeleton className="h-28" /><Skeleton className="h-64" /></div>
      ) : (
        <>
          {/* KPIs */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Card><CardContent className="pt-6">
              <p className="text-sm text-gray-500 mb-1">Revenus {year}</p>
              <p className="text-2xl font-bold text-green-600">{formatFCFA(stats.revenus)}</p>
            </CardContent></Card>
            <Card><CardContent className="pt-6">
              <p className="text-sm text-gray-500 mb-1">Charges {year}</p>
              <p className="text-2xl font-bold text-red-500">{formatFCFA(stats.charges)}</p>
            </CardContent></Card>
            <Card><CardContent className="pt-6">
              <p className="text-sm text-gray-500 mb-1">Résultat net</p>
              <p className={`text-2xl font-bold ${stats.net >= 0 ? "text-[#1a2744]" : "text-red-600"}`}>{formatFCFA(stats.net)}</p>
            </CardContent></Card>
            <Card><CardContent className="pt-6">
              <p className="text-sm text-gray-500 mb-1">Taux de recouvrement</p>
              <div className="flex items-center gap-2">
                <p className="text-2xl font-bold text-[#1a2744]">{stats.recouvrement}%</p>
                {stats.recouvrement >= 80 ? <TrendingUp className="w-5 h-5 text-green-500" /> : <TrendingDown className="w-5 h-5 text-red-500" />}
              </div>
            </CardContent></Card>
          </div>

          {/* Graphique revenus mensuels */}
          <Card className="mb-6">
            <CardHeader className="pb-2"><CardTitle className="text-base">Revenus mensuels {year}</CardTitle></CardHeader>
            <CardContent>
              <div className="flex items-end gap-1.5 h-40">
                {stats.parMois.map((v, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center justify-end gap-1">
                    <div className="w-full rounded-t bg-[#f97316]/80 transition-all"
                      style={{ height: `${(v / maxMois) * 100}%`, minHeight: v > 0 ? 4 : 0 }}
                      title={formatFCFA(v)} />
                    <span className="text-[10px] text-gray-400">{MONTHS[i]}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Commissions services & chantiers */}
          {commissions.length > 0 && (
            <Card className="mb-6">
              <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><Percent className="w-4 h-4 text-[#f97316]" /> Commissions services & chantiers {year}</CardTitle></CardHeader>
              <CardContent>
                <div className="flex flex-wrap items-end gap-6">
                  <div>
                    <p className="text-xs text-gray-500">Total prélevé (5%)</p>
                    <p className="text-2xl font-bold text-[#1a2744]">{formatFCFA(commissions.reduce((s, c) => s + c.amount_fcfa, 0))}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Sur un volume de</p>
                    <p className="text-lg font-semibold text-gray-700">{formatFCFA(commissions.reduce((s, c) => s + c.base_fcfa, 0))}</p>
                  </div>
                  <div className="flex gap-2">
                    <Badge variant="outline">{commissions.filter((c) => c.source_type === "milestone").length} chantier(s)</Badge>
                    <Badge variant="outline">{commissions.filter((c) => c.source_type === "work_order").length} service(s)</Badge>
                  </div>
                </div>
                <p className="text-[11px] text-gray-400 mt-3">Prélevée à la libération du séquestre. Aucune commission sur les loyers.</p>
              </CardContent>
            </Card>
          )}

          {/* Par bien */}
          <Card className="mb-6 overflow-hidden">
            <CardHeader className="pb-2"><CardTitle className="text-base">Par bien</CardTitle></CardHeader>
            <CardContent className="px-0">
              {stats.parBien.length === 0 ? (
                <p className="text-gray-400 text-center py-6 text-sm">Aucune donnée pour {year}</p>
              ) : (
                <div className="overflow-x-auto">
                  <Table className="min-w-[480px]">
                    <TableHeader><TableRow>
                      <TableHead>Bien</TableHead>
                      <TableHead className="text-right">Revenus</TableHead>
                      <TableHead className="text-right">Charges</TableHead>
                      <TableHead className="text-right">Net</TableHead>
                    </TableRow></TableHeader>
                    <TableBody>
                      {stats.parBien.map((b) => (
                        <TableRow key={b.id}>
                          <TableCell className="font-medium">{b.name}</TableCell>
                          <TableCell className="text-right text-green-600">{formatFCFA(b.revenus)}</TableCell>
                          <TableCell className="text-right text-red-500">{formatFCFA(b.charges)}</TableCell>
                          <TableCell className={`text-right font-medium ${b.net >= 0 ? "" : "text-red-600"}`}>{formatFCFA(b.net)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Charges détaillées */}
          <Card className="overflow-hidden">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2"><Wallet className="w-4 h-4 text-[#f97316]" /> Charges {year}</CardTitle>
            </CardHeader>
            <CardContent className="px-0">
              {expenses.length === 0 ? (
                <p className="text-gray-400 text-center py-6 text-sm">Aucune charge enregistrée. Cliquez sur « Charge » pour en ajouter.</p>
              ) : (
                <div className="overflow-x-auto">
                  <Table className="min-w-[560px]">
                    <TableHeader><TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Bien</TableHead>
                      <TableHead>Catégorie</TableHead>
                      <TableHead className="text-right">Montant</TableHead>
                      <TableHead></TableHead>
                    </TableRow></TableHeader>
                    <TableBody>
                      {expenses.map((e) => (
                        <TableRow key={e.id}>
                          <TableCell className="whitespace-nowrap">{formatDateFR(e.date)}</TableCell>
                          <TableCell>{e.properties?.name ?? "-"}</TableCell>
                          <TableCell><Badge variant="outline">{e.category}</Badge></TableCell>
                          <TableCell className="text-right font-medium">{formatFCFA(e.amount_fcfa)}</TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500" onClick={() => deleteExpense(e.id)}>
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
