"use client"

export const dynamic = "force-dynamic"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Wrench, Check, Loader2 } from "lucide-react"
import { toast } from "sonner"

type Row = {
  id: string; bio: string | null; trades: string[]; quartier: string | null; city: string | null
  is_verified: boolean; profiles: { full_name: string } | null
}

export default function AdminProvidersPage() {
  const router = useRouter()
  const supabase = createClient()
  const [allowed, setAllowed] = useState<boolean | null>(null)
  const [rows, setRows] = useState<Row[]>([])
  const [loading, setLoading] = useState(true)
  const [acting, setActing] = useState<string | null>(null)

  async function load() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.replace("/login"); return }
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()
    if (profile?.role !== "admin") { setAllowed(false); return }
    setAllowed(true)
    const { data } = await supabase
      .from("provider_profiles")
      .select("id, bio, trades, quartier, city, is_verified, profiles!id(full_name)")
      .eq("is_verified", false)
      .order("created_at", { ascending: true })
    setRows((data as Row[]) ?? [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function verify(row: Row) {
    setActing(row.id)
    const { error } = await supabase.from("provider_profiles").update({ is_verified: true }).eq("id", row.id)
    if (error) { toast.error("Erreur"); setActing(null); return }
    const { data: { user } } = await supabase.auth.getUser()
    await supabase.from("audit_log").insert({ entity: "provider_profiles", entity_id: row.id, action: "verified", actor_id: user?.id ?? null })
    toast.success("Prestataire vérifié")
    setActing(null); load()
  }

  if (allowed === false) return <div className="text-center py-20 text-gray-500">Accès réservé aux administrateurs.</div>

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#1a2744] mb-2 flex items-center gap-2"><Wrench className="w-6 h-6 text-[#f97316]" /> Vérification prestataires</h1>
      <p className="text-gray-500 text-sm mb-6">Prestataires en attente de validation.</p>
      {loading || allowed === null ? <Skeleton className="h-40" /> : rows.length === 0 ? (
        <div className="text-center py-16 text-gray-400">Aucun prestataire en attente 🎉</div>
      ) : (
        <div className="space-y-3">
          {rows.map((r) => (
            <Card key={r.id}><CardContent className="py-4 flex items-center justify-between gap-3 flex-wrap">
              <div>
                <p className="font-medium text-[#1a2744]">{r.profiles?.full_name ?? "Prestataire"}</p>
                <p className="text-sm text-gray-500">{(r.trades ?? []).join(", ") || "—"} · {r.quartier ?? ""} {r.city ?? ""}</p>
                {r.bio && <p className="text-xs text-gray-400 mt-1 max-w-lg">{r.bio}</p>}
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="border-orange-300 text-orange-600">Non vérifié</Badge>
                <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white" disabled={acting === r.id} onClick={() => verify(r)}>
                  {acting === r.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Check className="w-4 h-4 mr-1" /> Vérifier</>}
                </Button>
              </div>
            </CardContent></Card>
          ))}
        </div>
      )}
    </div>
  )
}
