"use client"

export const dynamic = "force-dynamic"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase"
import { useOrganization } from "@/hooks/useOrganization"
import { PropertyForm } from "@/components/app/PropertyForm"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Building2, Plus, MapPin } from "lucide-react"

type PropertyWithUnits = {
  id: string
  name: string
  type: string
  address: string | null
  neighborhood: string | null
  city: string
  notes: string | null
  units: { id: string; status: string }[]
}

export default function PropertiesPage() {
  const [properties, setProperties] = useState<PropertyWithUnits[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const { org } = useOrganization()
  const supabase = createClient()
  const router = useRouter()

  async function fetchProperties() {
    if (!org) return
    const { data } = await supabase
      .from("properties")
      .select("id, name, type, address, neighborhood, city, notes, units(id, status)")
      .eq("org_id", org.id)
      .order("created_at", { ascending: false })

    setProperties((data as PropertyWithUnits[]) ?? [])
    setLoading(false)
  }

  useEffect(() => {
    if (org) fetchProperties()
  }, [org])

  const typeLabels: Record<string, string> = {
    appartement: "Appartement",
    villa: "Villa",
    bureau: "Bureau",
    local: "Local commercial",
  }

  if (loading) {
    return (
      <div>
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-[#1a2744]">Biens immobiliers</h1>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-48 rounded-lg" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[#1a2744]">Biens immobiliers</h1>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger>
            <Button className="bg-[#f97316] hover:bg-[#ea580c] text-white">
              <Plus className="w-4 h-4 mr-2" /> Ajouter un bien
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nouveau bien</DialogTitle>
            </DialogHeader>
            <PropertyForm
              onSuccess={() => {
                setDialogOpen(false)
                fetchProperties()
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      {properties.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Building2 className="w-16 h-16 text-gray-300 mb-4" />
          <h2 className="text-xl font-semibold text-gray-600 mb-2">Aucun bien immobilier</h2>
          <p className="text-gray-400 mb-6">Ajoutez votre premier bien pour commencer</p>
          <Button className="bg-[#f97316] hover:bg-[#ea580c] text-white" onClick={() => setDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" /> Ajouter un bien
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {properties.map((property) => {
            const totalUnits = property.units.length
            const rentedUnits = property.units.filter((u) => u.status === "rented").length
            const occupancyRate = totalUnits > 0 ? Math.round((rentedUnits / totalUnits) * 100) : 0

            return (
              <Card
                key={property.id}
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => router.push(`/dashboard/properties/${property.id}`)}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{property.name}</CardTitle>
                    <Badge variant="secondary">{typeLabels[property.type] ?? property.type}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  {(property.address || property.neighborhood) && (
                    <div className="flex items-center text-sm text-gray-500 mb-3">
                      <MapPin className="w-3 h-3 mr-1" />
                      {[property.address, property.neighborhood, property.city].filter(Boolean).join(", ")}
                    </div>
                  )}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Unités</span>
                      <span className="font-medium">{rentedUnits}/{totalUnits} louées</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-[#f97316] h-2 rounded-full transition-all"
                        style={{ width: `${occupancyRate}%` }}
                      />
                    </div>
                    <div className="text-right text-sm font-medium text-[#f97316]">{occupancyRate}% occupation</div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
