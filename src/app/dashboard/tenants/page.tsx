"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase"
import { useOrganization } from "@/hooks/useOrganization"
import { TenantForm } from "@/components/app/TenantForm"
import { whatsappLink } from "@/lib/formatters"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Users, Plus, MessageCircle, Search } from "lucide-react"

type TenantWithLease = {
  id: string
  first_name: string
  last_name: string
  whatsapp: string
  email: string | null
  employer: string | null
  leases: { id: string; status: string; units: { unit_number: string; properties: { name: string } | null } | null }[]
}

export default function TenantsPage() {
  const [tenants, setTenants] = useState<TenantWithLease[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [search, setSearch] = useState("")
  const { org } = useOrganization()
  const supabase = createClient()
  const router = useRouter()

  async function fetchTenants() {
    if (!org) return
    const { data } = await supabase
      .from("tenants")
      .select("id, first_name, last_name, whatsapp, email, employer, leases(id, status, units(unit_number, properties(name)))")
      .eq("org_id", org.id)
      .order("created_at", { ascending: false })

    setTenants((data as TenantWithLease[]) ?? [])
    setLoading(false)
  }

  useEffect(() => {
    if (org) fetchTenants()
  }, [org])

  const filtered = tenants.filter((t) => {
    const q = search.toLowerCase()
    return (
      t.first_name.toLowerCase().includes(q) ||
      t.last_name.toLowerCase().includes(q) ||
      t.whatsapp.includes(q)
    )
  })

  if (loading) {
    return (
      <div>
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-[#1a2744]">Locataires</h1>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-40 rounded-lg" />)}
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[#1a2744]">Locataires</h1>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger>
            <Button className="bg-[#f97316] hover:bg-[#ea580c] text-white">
              <Plus className="w-4 h-4 mr-2" /> Ajouter un locataire
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Nouveau locataire</DialogTitle></DialogHeader>
            <TenantForm onSuccess={() => { setDialogOpen(false); fetchTenants() }} />
          </DialogContent>
        </Dialog>
      </div>

      {tenants.length > 0 && (
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Rechercher par nom ou WhatsApp..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      )}

      {tenants.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Users className="w-16 h-16 text-gray-300 mb-4" />
          <h2 className="text-xl font-semibold text-gray-600 mb-2">Aucun locataire</h2>
          <p className="text-gray-400 mb-6">Ajoutez votre premier locataire</p>
          <Button className="bg-[#f97316] hover:bg-[#ea580c] text-white" onClick={() => setDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" /> Ajouter un locataire
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((tenant) => {
            const activeLease = tenant.leases?.find((l) => l.status === "active")
            const initials = `${tenant.first_name[0]}${tenant.last_name[0]}`.toUpperCase()

            return (
              <Card
                key={tenant.id}
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => router.push(`/dashboard/tenants/${tenant.id}`)}
              >
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3">
                    <Avatar className="bg-[#1a2744]">
                      <AvatarFallback className="bg-[#1a2744] text-white text-sm">{initials}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-[#1a2744] truncate">
                        {tenant.first_name} {tenant.last_name}
                      </h3>
                      <p className="text-sm text-gray-500">{tenant.whatsapp}</p>
                      {tenant.email && <p className="text-sm text-gray-400 truncate">{tenant.email}</p>}
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between">
                    {activeLease?.units ? (
                      <Badge variant="default" className="bg-green-100 text-green-700">
                        {activeLease.units.properties?.name} — {activeLease.units.unit_number}
                      </Badge>
                    ) : (
                      <Badge variant="secondary">Sans bail actif</Badge>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-[#25D366] hover:text-[#25D366] hover:bg-green-50"
                      onClick={(e) => {
                        e.stopPropagation()
                        window.open(whatsappLink(tenant.whatsapp), "_blank")
                      }}
                    >
                      <MessageCircle className="w-4 h-4" />
                    </Button>
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
