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

/** Visuel de couverture selon le type de bien (photos libres de droits). */
const PROPERTY_COVER: Record<string, string> = {
  villa: "https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=1200&q=70",
  appartement: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=70",
  bureau: "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1200&q=70",
  local: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1200&q=70",
  default: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=70",
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

      {/* Bannière premium du bien */}
      <div className="relative overflow-hidden rounded-2xl text-white shadow-sm">
        <img
          src={PROPERTY_COVER[property.type] ?? PROPERTY_COVER.default}
          alt="" aria-hidden="true"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-[#1a2744]/95 via-[#1a2744]/85 to-[#1e3a5f]/70" />
        <div className="relative p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl font-bold">{property.name}</h1>
                <Badge className="bg-white/15 text-white border-0">{typeLabels[property.type] ?? property.type}</Badge>
              </div>
              {(property.address || property.neighborhood) && (
                <p className="mt-1 flex items-center gap-1.5 text-sm text-gray-200">
                  <MapPin className="w-4 h-4" />
                  {[property.address, property.neighborhood, property.city].filter(Boolean).join(", ")}
                </p>
              )}
              {property.notes && <p className="mt-2 max-w-xl text-sm text-gray-300">{property.notes}</p>}
            </div>
            <div className="flex gap-2">
              <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
                <DialogTrigger>
                  <Button size="sm" className="bg-white/10 hover:bg-white/20 text-white border-0"><Edit className="w-4 h-4 mr-1" /> Modifier</Button>
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

          {/* Statistiques du bien */}
          <div className="mt-5 grid grid-cols-3 gap-3 max-w-md">
            {[
              { label: "Unités", value: String(units.length) },
              { label: "Louées", value: String(units.filter((u) => u.status === "rented").length) },
              { label: "Vacantes", value: String(units.filter((u) => u.status === "vacant").length) },
            ].map((s) => (
              <div key={s.label} className="rounded-xl bg-white/10 px-3 py-2 backdrop-blur-sm">
                <p className="text-[11px] uppercase tracking-wide text-gray-300">{s.label}</p>
                <p className="text-xl font-bold">{s.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

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
