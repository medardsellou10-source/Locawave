"use client"

export const dynamic = "force-dynamic"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase"
import { useOrganization } from "@/hooks/useOrganization"
import { formatFCFA, formatDateFR } from "@/lib/formatters"
import { PaymentForm } from "@/components/app/PaymentForm"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { CreditCard, Plus, Link2, Loader2, Check } from "lucide-react"
import { toast } from "sonner"

type PaymentRow = {
  id: string
  amount_fcfa: number
  method: string
  reference: string | null
  paid_at: string
  rent_schedules: {
    due_date: string
    leases: {
      tenants: { first_name: string; last_name: string } | null
      units: { unit_number: string; properties: { name: string } | null } | null
    } | null
  } | null
}

type ScheduleRow = {
  id: string
  due_date: string
  amount_fcfa: number
  status: string
  payment_link: string | null
  leases: {
    tenants: { first_name: string; last_name: string; whatsapp: string } | null
    units: { unit_number: string; properties: { name: string } | null } | null
  } | null
}

const methodLabels: Record<string, string> = {
  wave: "Wave", orange_money: "Orange Money", cash: "Espèces", psp: "Lien PSP",
}

export default function PaymentsPage() {
  const [payments, setPayments] = useState<PaymentRow[]>([])
  const [schedules, setSchedules] = useState<ScheduleRow[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [sendingId, setSendingId] = useState<string | null>(null)
  const [filterMonth, setFilterMonth] = useState(() => new Date().toISOString().slice(0, 7))
  const { org } = useOrganization()
  const supabase = createClient()

  async function fetchAll() {
    if (!org) return
    const startDate = `${filterMonth}-01`
    const endDate = new Date(Number(filterMonth.split("-")[0]), Number(filterMonth.split("-")[1]), 0).toISOString().split("T")[0]

    const [{ data: pays }, { data: scheds }] = await Promise.all([
      supabase
        .from("payments")
        .select("id, amount_fcfa, method, reference, paid_at, rent_schedules(due_date, leases(tenants(first_name, last_name), units(unit_number, properties(name))))")
        .eq("org_id", org.id)
        .gte("paid_at", startDate)
        .lte("paid_at", endDate + "T23:59:59")
        .order("paid_at", { ascending: false }),
      supabase
        .from("rent_schedules")
        .select("id, due_date, amount_fcfa, status, payment_link, leases(tenants(first_name, last_name, whatsapp), units(unit_number, properties(name)))")
        .eq("org_id", org.id)
        .in("status", ["pending", "late"])
        .order("due_date", { ascending: true }),
    ])

    setPayments((pays as PaymentRow[]) ?? [])
    setSchedules((scheds as ScheduleRow[]) ?? [])
    setLoading(false)
  }

  useEffect(() => { if (org) fetchAll() }, [org, filterMonth])

  async function sendPaymentLink(scheduleId: string) {
    setSendingId(scheduleId)
    try {
      const res = await fetch("/api/psp/create-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rent_schedule_id: scheduleId }),
      })
      const data = await res.json()
      if (res.ok && data.success) {
        toast.success(
          data.whatsapp_sent
            ? "Lien de paiement envoyé au locataire par WhatsApp"
            : "Lien de paiement généré"
        )
        fetchAll()
      } else {
        toast.error(data.error ?? "Échec de génération du lien")
      }
    } catch {
      toast.error("Erreur réseau")
    } finally {
      setSendingId(null)
    }
  }

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-6">
        <h1 className="text-2xl font-bold text-[#1a2744]">Paiements</h1>
        <div className="flex gap-2">
          <Input
            type="month"
            value={filterMonth}
            onChange={(e) => setFilterMonth(e.target.value)}
            className="w-36 sm:w-40"
          />
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger>
              <Button className="bg-[#f97316] hover:bg-[#ea580c] text-white whitespace-nowrap">
                <Plus className="w-4 h-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Encaisser</span>
                <span className="sm:hidden">+</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader><DialogTitle>Enregistrer un paiement</DialogTitle></DialogHeader>
              <PaymentForm onSuccess={() => { setDialogOpen(false); fetchAll() }} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Échéances à encaisser — envoi de lien de paiement (Wave/OM via PSP) */}
      {!loading && schedules.length > 0 && (
        <Card className="mb-6 overflow-hidden">
          <div className="px-4 py-3 border-b bg-orange-50/60">
            <h2 className="font-semibold text-[#1a2744]">À encaisser ({schedules.length})</h2>
            <p className="text-xs text-gray-500">Envoyez un lien de paiement sécurisé au locataire par WhatsApp.</p>
          </div>
          <div className="overflow-x-auto">
            <Table className="min-w-[560px]">
              <TableHeader>
                <TableRow>
                  <TableHead>Échéance</TableHead>
                  <TableHead>Locataire</TableHead>
                  <TableHead>Montant</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {schedules.map((s) => {
                  const lease = s.leases
                  return (
                    <TableRow key={s.id}>
                      <TableCell className="whitespace-nowrap">{formatDateFR(s.due_date)}</TableCell>
                      <TableCell className="font-medium">
                        {lease?.tenants ? `${lease.tenants.first_name} ${lease.tenants.last_name}` : "-"}
                      </TableCell>
                      <TableCell className="font-medium whitespace-nowrap">{formatFCFA(s.amount_fcfa)}</TableCell>
                      <TableCell>
                        {s.status === "late"
                          ? <Badge variant="outline" className="border-red-300 text-red-600">En retard</Badge>
                          : <Badge variant="outline">À venir</Badge>}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          variant={s.payment_link ? "outline" : "default"}
                          className={s.payment_link ? "" : "bg-[#1a2744] hover:bg-[#0f1a2e] text-white"}
                          disabled={sendingId === s.id}
                          onClick={() => sendPaymentLink(s.id)}
                        >
                          {sendingId === s.id ? (
                            <><Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" /> Envoi...</>
                          ) : s.payment_link ? (
                            <><Check className="w-3.5 h-3.5 mr-1" /> Renvoyer le lien</>
                          ) : (
                            <><Link2 className="w-3.5 h-3.5 mr-1" /> Lien de paiement</>
                          )}
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        </Card>
      )}

      {loading ? (
        <Skeleton className="h-64" />
      ) : payments.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <CreditCard className="w-16 h-16 text-gray-300 mb-4" />
          <h2 className="text-xl font-semibold text-gray-600 mb-2">Aucun paiement ce mois</h2>
          <p className="text-gray-400">Les paiements enregistrés apparaîtront ici</p>
        </div>
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <Table className="min-w-[560px]">
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Locataire</TableHead>
                  <TableHead className="hidden md:table-cell">Bien / Unité</TableHead>
                  <TableHead>Montant</TableHead>
                  <TableHead>Méthode</TableHead>
                  <TableHead className="hidden sm:table-cell">Référence</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.map((p) => {
                  const lease = p.rent_schedules?.leases
                  return (
                    <TableRow key={p.id}>
                      <TableCell className="whitespace-nowrap">{formatDateFR(p.paid_at)}</TableCell>
                      <TableCell className="font-medium">
                        {lease?.tenants ? `${lease.tenants.first_name} ${lease.tenants.last_name}` : "-"}
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {lease?.units?.properties?.name ?? "-"} — {lease?.units?.unit_number ?? "-"}
                      </TableCell>
                      <TableCell className="font-medium text-green-600 whitespace-nowrap">{formatFCFA(p.amount_fcfa)}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{methodLabels[p.method] ?? p.method}</Badge>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell text-gray-500">{p.reference ?? "-"}</TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        </Card>
      )}
    </div>
  )
}
