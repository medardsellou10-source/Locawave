"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase"
import { useOrganization } from "@/hooks/useOrganization"
import { TenantForm } from "@/components/app/TenantForm"
import { formatFCFA, formatDateFR, whatsappLink } from "@/lib/formatters"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ArrowLeft, Edit, Trash2, MessageCircle, Phone, Mail, Briefcase, CreditCard } from "lucide-react"
import { toast } from "sonner"
import type { Database } from "@/types/database"

type Tenant = Database["public"]["Tables"]["tenants"]["Row"]
type LeaseWithDetails = {
  id: string
  start_date: string
  end_date: string
  rent_fcfa: number
  status: string
  units: { unit_number: string; properties: { name: string } | null } | null
}

export default function TenantDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { org } = useOrganization()
  const supabase = createClient()

  const [tenant, setTenant] = useState<Tenant | null>(null)
  const [leases, setLeases] = useState<LeaseWithDetails[]>([])
  const [loading, setLoading] = useState(true)
  const [editDialogOpen, setEditDialogOpen] = useState(false)

  async function fetchData() {
    if (!org || !params.id) return

    const { data: t } = await supabase
      .from("tenants")
      .select("*")
      .eq("id", params.id as string)
      .single()

    const { data: l } = await supabase
      .from("leases")
      .select("id, start_date, end_date, rent_fcfa, status, units(unit_number, properties(name))")
      .eq("tenant_id", params.id as string)
      .order("start_date", { ascending: false })

    setTenant(t)
    setLeases((l as LeaseWithDetails[]) ?? [])
    setLoading(false)
  }

  useEffect(() => {
    if (org) fetchData()
  }, [org, params.id])

  async function deleteTenant() {
    if (!tenant || !confirm("Supprimer ce locataire ?")) return
    const { error } = await supabase.from("tenants").delete().eq("id", tenant.id)
    if (error) { toast.error("Erreur : ce locataire a peut-être des baux actifs"); return }
    toast.success("Locataire supprimé")
    router.push("/dashboard/tenants")
  }

  if (loading) {
    return <div className="space-y-4"><Skeleton className="h-8 w-48" /><Skeleton className="h-48" /><Skeleton className="h-64" /></div>
  }

  if (!tenant) {
    return <div className="text-center py-20 text-gray-500">Locataire introuvable</div>
  }

  const initials = `${tenant.first_name[0]}${tenant.last_name[0]}`.toUpperCase()

  const idDocLabels: Record<string, string> = {
    cni: "CNI", passeport: "Passeport", carte_consulaire: "Carte consulaire", autre: "Autre",
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <button onClick={() => router.push("/dashboard/tenants")} className="hover:text-[#f97316] flex items-center gap-1">
          <ArrowLeft className="w-4 h-4" /> Locataires
        </button>
        <span>/</span>
        <span className="text-[#1a2744] font-medium">{tenant.first_name} {tenant.last_name}</span>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Avatar className="w-14 h-14 bg-[#1a2744]">
            <AvatarFallback className="bg-[#1a2744] text-white text-lg">{initials}</AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-2xl font-bold text-[#1a2744]">{tenant.first_name} {tenant.last_name}</h1>
            <p className="text-gray-500">{tenant.whatsapp}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            className="bg-[#25D366] hover:bg-[#1da851] text-white"
            onClick={() => window.open(whatsappLink(tenant.whatsapp), "_blank")}
          >
            <MessageCircle className="w-4 h-4 mr-1" /> WhatsApp
          </Button>
          <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm"><Edit className="w-4 h-4 mr-1" /> Modifier</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Modifier le locataire</DialogTitle></DialogHeader>
              <TenantForm tenant={tenant} onSuccess={() => { setEditDialogOpen(false); fetchData() }} />
            </DialogContent>
          </Dialog>
          <Button variant="destructive" size="sm" onClick={deleteTenant}>
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-lg">Informations</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center gap-2 text-sm">
            <Phone className="w-4 h-4 text-gray-400" />
            <span className="text-gray-600">WhatsApp :</span>
            <span className="font-medium">{tenant.whatsapp}</span>
          </div>
          {tenant.email && (
            <div className="flex items-center gap-2 text-sm">
              <Mail className="w-4 h-4 text-gray-400" />
              <span className="text-gray-600">Email :</span>
              <span className="font-medium">{tenant.email}</span>
            </div>
          )}
          {tenant.id_document_type && (
            <div className="flex items-center gap-2 text-sm">
              <CreditCard className="w-4 h-4 text-gray-400" />
              <span className="text-gray-600">{idDocLabels[tenant.id_document_type] ?? tenant.id_document_type} :</span>
              <span className="font-medium">{tenant.id_document_number ?? "N/A"}</span>
            </div>
          )}
          {tenant.employer && (
            <div className="flex items-center gap-2 text-sm">
              <Briefcase className="w-4 h-4 text-gray-400" />
              <span className="text-gray-600">Employeur :</span>
              <span className="font-medium">{tenant.employer}</span>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-lg">Historique des baux</CardTitle></CardHeader>
        <CardContent>
          {leases.length === 0 ? (
            <p className="text-center text-gray-400 py-6">Aucun bail enregistré</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Bien</TableHead>
                  <TableHead>Unité</TableHead>
                  <TableHead>Loyer</TableHead>
                  <TableHead>Début</TableHead>
                  <TableHead>Fin</TableHead>
                  <TableHead>Statut</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leases.map((lease) => (
                  <TableRow key={lease.id}>
                    <TableCell>{lease.units?.properties?.name ?? "-"}</TableCell>
                    <TableCell>{lease.units?.unit_number ?? "-"}</TableCell>
                    <TableCell className="font-medium">{formatFCFA(lease.rent_fcfa)}</TableCell>
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
          )}
        </CardContent>
      </Card>
    </div>
  )
}
