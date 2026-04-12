"use client"

export const dynamic = "force-dynamic"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase"
import { useOrganization } from "@/hooks/useOrganization"
import { PropertyForm } from "@/components/app/PropertyForm"
import { UnitForm } from "@/components/app/UnitForm"
import { formatFCFA } from "@/lib/formatters"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ArrowLeft, Edit, Trash2, Plus, MapPin } from "lucide-react"
import { toast } from "sonner"
import type { Database } from "@/types/database"

type Property = Database["public"]["Tables"]["properties"]["Row"]
type Unit = Database["public"]["Tables"]["units"]["Row"]

const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  vacant: { label: "Vacant", variant: "secondary" },
  rented: { label: "Loué", variant: "default" },
  maintenance: { label: "Maintenance", variant: "destructive" },
}

const typeLabels: Record<string, string> = {
  appartement: "Appartement", villa: "Villa", bureau: "Bureau", local: "Local commercial",
}

const unitTypeLabels: Record<string, string> = {
  studio: "Studio", f1: "F1", f2: "F2", f3: "F3", f4: "F4", commerce: "Commerce",
}

export default function PropertyDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { org } = useOrganization()
  const supabase = createClient()

  const [property, setProperty] = useState<Property | null>(null)
  const [units, setUnits] = useState<Unit[]>([])
  const [loading, setLoading] = useState(true)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [unitDialogOpen, setUnitDialogOpen] = useState(false)
  const [editingUnit, setEditingUnit] = useState<Unit | undefined>()

  async function fetchData() {
    if (!org || !params.id) return

    const { data: prop } = await supabase
      .from("properties")
      .select("*")
      .eq("id", params.id as string)
      .single()

    const { data: unitsList } = await supabase
      .from("units")
      .select("*")
      .eq("property_id", params.id as string)
      .order("unit_number")

    setProperty(prop)
    setUnits(unitsList ?? [])
    setLoading(false)
  }

  useEffect(() => {
    if (org) fetchData()
  }, [org, params.id])

  async function deleteProperty() {
    if (!property || !confirm("Supprimer ce bien et toutes ses unités ?")) return
    const { error } = await supabase.from("properties").delete().eq("id", property.id)
    if (error) {
      toast.error("Erreur lors de la suppression")
      return
    }
    toast.success("Bien supprimé")
    router.push("/dashboard/properties")
  }

  async function deleteUnit(unitId: string) {
    if (!confirm("Supprimer cette unité ?")) return
    const { error } = await supabase.from("units").delete().eq("id", unitId)
    if (error) {
      toast.error("Erreur lors de la suppression")
      return
    }
    toast.success("Unité supprimée")
    fetchData()
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-48" />
        <Skeleton className="h-64" />
      </div>
    )
  }

  if (!property) {
    return <div className="text-center py-20 text-gray-500">Bien introuvable</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <button onClick={() => router.push("/dashboard/properties")} className="hover:text-[#f97316] flex items-center gap-1">
          <ArrowLeft className="w-4 h-4" /> Biens
        </button>
        <span>/</span>
        <span className="text-[#1a2744] font-medium">{property.name}</span>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-[#1a2744]">{property.name}</h1>
          <Badge variant="secondary">{typeLabels[property.type] ?? property.type}</Badge>
        </div>
        <div className="flex gap-2">
          <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
            <DialogTrigger>
              <Button variant="outline" size="sm"><Edit className="w-4 h-4 mr-1" /> Modifier</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Modifier le bien</DialogTitle></DialogHeader>
              <PropertyForm property={property} onSuccess={() => { setEditDialogOpen(false); fetchData() }} />
            </DialogContent>
          </Dialog>
          <Button variant="destructive" size="sm" onClick={deleteProperty}>
            <Trash2 className="w-4 h-4 mr-1" /> Supprimer
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          {(property.address || property.neighborhood) && (
            <div className="flex items-center text-gray-600 mb-2">
              <MapPin className="w-4 h-4 mr-2" />
              {[property.address, property.neighborhood, property.city].filter(Boolean).join(", ")}
            </div>
          )}
          {property.notes && <p className="text-gray-500 text-sm mt-2">{property.notes}</p>}
        </CardContent>
      </Card>

      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-[#1a2744]">Unités ({units.length})</h2>
        <Dialog open={unitDialogOpen} onOpenChange={(open) => { setUnitDialogOpen(open); if (!open) setEditingUnit(undefined) }}>
          <DialogTrigger>
            <Button className="bg-[#f97316] hover:bg-[#ea580c] text-white" size="sm">
              <Plus className="w-4 h-4 mr-1" /> Ajouter une unité
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{editingUnit ? "Modifier l'unité" : "Nouvelle unité"}</DialogTitle></DialogHeader>
            <UnitForm
              propertyId={property.id}
              unit={editingUnit}
              onSuccess={() => { setUnitDialogOpen(false); setEditingUnit(undefined); fetchData() }}
            />
          </DialogContent>
        </Dialog>
      </div>

      {units.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-gray-400">
            Aucune unité. Ajoutez votre première unité.
          </CardContent>
        </Card>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Numéro</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Étage</TableHead>
                <TableHead>Surface</TableHead>
                <TableHead>Loyer</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {units.map((unit) => {
                const status = statusConfig[unit.status] ?? statusConfig.vacant
                return (
                  <TableRow key={unit.id}>
                    <TableCell className="font-medium">{unit.unit_number}</TableCell>
                    <TableCell>{unitTypeLabels[unit.type] ?? unit.type}</TableCell>
                    <TableCell>{unit.floor ?? "-"}</TableCell>
                    <TableCell>{unit.surface_m2 ? `${unit.surface_m2} m²` : "-"}</TableCell>
                    <TableCell className="font-medium">{formatFCFA(unit.rent_fcfa)}</TableCell>
                    <TableCell><Badge variant={status.variant}>{status.label}</Badge></TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost" size="sm"
                        onClick={() => { setEditingUnit(unit); setUnitDialogOpen(true) }}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => deleteUnit(unit.id)}>
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </TableCell>
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
