"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase"
import { useOrganization } from "@/hooks/useOrganization"
import { formatFCFA, formatDateFR } from "@/lib/formatters"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { FileText, Plus } from "lucide-react"
import { LeaseForm } from "@/components/app/LeaseForm"

type LeaseWithDetails = {
  id: string
  start_date: string
  end_date: string
  rent_fcfa: number
  due_day: number
  deposit_fcfa: number
  status: string
  tenants: { first_name: string; last_name: string } | null
  units: { unit_number: string; properties: { name: string } | null } | null
}

export default function LeasesPage() {
  const [leases, setLeases] = useState<LeaseWithDetails[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const { org } = useOrganization()
  const supabase = createClient()

  async function fetchLeases() {
    if (!org) return
    const { data } = await supabase
      .from("leases")
      .select("id, start_date, end_date, rent_fcfa, due_day, deposit_fcfa, status, tenants(first_name, last_name), units(unit_number, properties(name))")
      .eq("org_id", org.id)
      .order("created_at", { ascending: false })
    setLeases((data as LeaseWithDetails[]) ?? [])
    setLoading(false)
  }

  useEffect(() => { if (org) fetchLeases() }, [org])

  if (loading) {
    return (
      <div>
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-[#1a2744]">Baux</h1>
        </div>
        <Skeleton className="h-64" />
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[#1a2744]">Baux</h1>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger>
            <Button className="bg-[#f97316] hover:bg-[#ea580c] text-white">
              <Plus className="w-4 h-4 mr-2" /> Créer un bail
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>Nouveau bail</DialogTitle></DialogHeader>
            <LeaseForm onSuccess={() => { setDialogOpen(false); fetchLeases() }} />
          </DialogContent>
        </Dialog>
      </div>

      {leases.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <FileText className="w-16 h-16 text-gray-300 mb-4" />
          <h2 className="text-xl font-semibold text-gray-600 mb-2">Aucun bail</h2>
          <p className="text-gray-400 mb-6">Créez votre premier bail pour commencer</p>
          <Button className="bg-[#f97316] hover:bg-[#ea580c] text-white" onClick={() => setDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" /> Créer un bail
          </Button>
        </div>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Locataire</TableHead>
                <TableHead>Bien / Unité</TableHead>
                <TableHead>Loyer</TableHead>
                <TableHead>Échéance</TableHead>
                <TableHead>Début</TableHead>
                <TableHead>Fin</TableHead>
                <TableHead>Statut</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {leases.map((lease) => (
                <TableRow key={lease.id}>
                  <TableCell className="font-medium">
                    {lease.tenants ? `${lease.tenants.first_name} ${lease.tenants.last_name}` : "-"}
                  </TableCell>
                  <TableCell>
                    {lease.units?.properties?.name ?? "-"} — {lease.units?.unit_number ?? "-"}
                  </TableCell>
                  <TableCell className="font-medium">{formatFCFA(lease.rent_fcfa)}</TableCell>
                  <TableCell>Le {lease.due_day} du mois</TableCell>
                  <TableCell>{formatDateFR(lease.start_date)}</TableCell>
                  <TableCell>{formatDateFR(lease.end_date)}</TableCell>
                  <TableCell>
                    <Badge variant={lease.status === "active" ? "default" : "secondary"}>
                      {lease.status === "active" ? "Actif" : "Terminé"}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  )
}
