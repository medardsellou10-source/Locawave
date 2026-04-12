"use client"

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
import { CreditCard, Plus, Download } from "lucide-react"

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

const methodLabels: Record<string, string> = {
  wave: "Wave", orange_money: "Orange Money", cash: "Espèces",
}

export default function PaymentsPage() {
  const [payments, setPayments] = useState<PaymentRow[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [filterMonth, setFilterMonth] = useState(() => new Date().toISOString().slice(0, 7))
  const { org } = useOrganization()
  const supabase = createClient()

  async function fetchPayments() {
    if (!org) return
    const startDate = `${filterMonth}-01`
    const endDate = new Date(Number(filterMonth.split("-")[0]), Number(filterMonth.split("-")[1]), 0).toISOString().split("T")[0]

    const { data } = await supabase
      .from("payments")
      .select("id, amount_fcfa, method, reference, paid_at, rent_schedules(due_date, leases(tenants(first_name, last_name), units(unit_number, properties(name))))")
      .eq("org_id", org.id)
      .gte("paid_at", startDate)
      .lte("paid_at", endDate + "T23:59:59")
      .order("paid_at", { ascending: false })

    setPayments((data as PaymentRow[]) ?? [])
    setLoading(false)
  }

  useEffect(() => { if (org) fetchPayments() }, [org, filterMonth])

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[#1a2744]">Paiements</h1>
        <div className="flex gap-2">
          <Input
            type="month"
            value={filterMonth}
            onChange={(e) => setFilterMonth(e.target.value)}
            className="w-40"
          />
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger>
              <Button className="bg-[#f97316] hover:bg-[#ea580c] text-white">
                <Plus className="w-4 h-4 mr-2" /> Encaisser
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader><DialogTitle>Enregistrer un paiement</DialogTitle></DialogHeader>
              <PaymentForm onSuccess={() => { setDialogOpen(false); fetchPayments() }} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {loading ? (
        <Skeleton className="h-64" />
      ) : payments.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <CreditCard className="w-16 h-16 text-gray-300 mb-4" />
          <h2 className="text-xl font-semibold text-gray-600 mb-2">Aucun paiement ce mois</h2>
          <p className="text-gray-400">Les paiements enregistrés apparaîtront ici</p>
        </div>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Locataire</TableHead>
                <TableHead>Bien / Unité</TableHead>
                <TableHead>Montant</TableHead>
                <TableHead>Méthode</TableHead>
                <TableHead>Référence</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payments.map((p) => {
                const lease = p.rent_schedules?.leases
                return (
                  <TableRow key={p.id}>
                    <TableCell>{formatDateFR(p.paid_at)}</TableCell>
                    <TableCell className="font-medium">
                      {lease?.tenants ? `${lease.tenants.first_name} ${lease.tenants.last_name}` : "-"}
                    </TableCell>
                    <TableCell>
                      {lease?.units?.properties?.name ?? "-"} — {lease?.units?.unit_number ?? "-"}
                    </TableCell>
                    <TableCell className="font-medium text-green-600">{formatFCFA(p.amount_fcfa)}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{methodLabels[p.method] ?? p.method}</Badge>
                    </TableCell>
                    <TableCell className="text-gray-500">{p.reference ?? "-"}</TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  )
}
