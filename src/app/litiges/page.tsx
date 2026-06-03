"use client"

export const dynamic = "force-dynamic"

import { useEffect, useState, useCallback } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase"
import { formatFCFA, formatDateFR } from "@/lib/formatters"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { EmptyState } from "@/components/app/EmptyState"
import { Building2, Loader2, ShieldAlert, Scale } from "lucide-react"
import { toast } from "sonner"

type Dispute = {
  id: string; reason: string; description: string | null; status: string
  amount_frozen_fcfa: number | null; opened_by: string; work_order_id: string | null
  resolution: string | null; created_at: string
}

const STATUS: Record<string, { label: string; cls: string }> = {
  open: { label: "Ouvert", cls: "bg-orange-100 text-orange-700" },
  under_review: { label: "En médiation", cls: "bg-blue-100 text-blue-700" },
  resolved: { label: "Résolu", cls: "bg-green-100 text-green-700" },
  rejected: { label: "Rejeté", cls: "bg-red-100 text-red-700" },
  cancelled: { label: "Annulé", cls: "bg-gray-100 text-gray-600" },
}

export default function LitigesPage() {
  const supabase = createClient()
  const router = useRouter()
  const [uid, setUid] = useState<string | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [disputes, setDisputes] = useState<Dispute[]>([])
  const [loading, setLoading] = useState(true)
  const [resolutions, setResolutions] = useState<Record<string, string>>({})
  const [busy, setBusy] = useState<string | null>(null)

  const load = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push("/login"); return }
    setUid(user.id)
    const { data: prof } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle()
    setIsAdmin(prof?.role === "admin")
    const { data } = await supabase.from("disputes")
      .select("id, reason, description, status, amount_frozen_fcfa, opened_by, work_order_id, resolution, created_at")
      .order("created_at", { ascending: false })
    setDisputes((data as Dispute[]) ?? [])
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  async function cancelDispute(d: Dispute) {
    setBusy(d.id)
    // Le dégel du séquestre (disputed -> held) est fait par le trigger DB.
    const { error } = await supabase.from("disputes").update({ status: "cancelled" }).eq("id", d.id)
    setBusy(null)
    if (error) { toast.error("Erreur"); return }
    toast.success("Litige annulé"); load()
  }

  async function resolve(d: Dispute, outcome: "client" | "provider") {
    setBusy(d.id)
    const resolution = resolutions[d.id] || (outcome === "client" ? "Litige tranché en faveur du client : remboursement." : "Litige tranché en faveur du prestataire : libération des fonds.")
    // Le mouvement du séquestre est piloté par le trigger via escrow_outcome (RLS-safe).
    const { error } = await supabase.from("disputes")
      .update({ status: "resolved", resolution, escrow_outcome: outcome === "client" ? "refund" : "release", resolved_by: uid, resolved_at: new Date().toISOString() })
      .eq("id", d.id)
    setBusy(null)
    if (error) { toast.error("Erreur"); return }
    toast.success("Litige résolu — séquestre " + (outcome === "client" ? "remboursé" : "libéré")); load()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b bg-white">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#f97316] rounded-lg flex items-center justify-center"><Building2 className="w-5 h-5 text-white" /></div>
            <span className="text-lg font-bold text-[#1a2744]">Locawave</span>
          </Link>
          <span className="text-sm text-gray-500">Litiges & médiation</span>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold text-[#1a2744] flex items-center gap-2 mb-1"><Scale className="w-6 h-6 text-[#f97316]" /> Litiges</h1>
        <p className="text-gray-500 text-sm mb-5">Suivi des litiges et gel des fonds en séquestre pendant la médiation.{isAdmin && " Vous êtes médiateur (admin)."}</p>

        {loading ? <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 animate-spin text-[#f97316]" /></div>
          : disputes.length === 0 ? <EmptyState icon={Scale} title="Aucun litige" description="Tout roule 👍 Les litiges éventuels et leur médiation apparaîtront ici." />
          : (
          <div className="space-y-3">
            {disputes.map((d) => {
              const st = STATUS[d.status] ?? STATUS.open
              const active = d.status === "open" || d.status === "under_review"
              return (
                <Card key={d.id}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between gap-2">
                      <CardTitle className="text-base flex items-center gap-2"><ShieldAlert className="w-4 h-4 text-red-500" /> {d.reason}</CardTitle>
                      <Badge className={st.cls}>{st.label}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    {d.description && <p className="text-gray-600">{d.description}</p>}
                    <p className="text-xs text-gray-400">
                      Ouvert le {formatDateFR(d.created_at)}
                      {d.amount_frozen_fcfa ? ` · ${formatFCFA(d.amount_frozen_fcfa)} gelés` : ""}
                    </p>
                    {d.resolution && <p className="text-green-700 bg-green-50 rounded p-2 text-xs">Résolution : {d.resolution}</p>}

                    {active && d.opened_by === uid && (
                      <Button size="sm" variant="outline" disabled={busy === d.id} onClick={() => cancelDispute(d)}>
                        {busy === d.id ? <Loader2 className="w-4 h-4 animate-spin" /> : "Retirer le litige"}
                      </Button>
                    )}

                    {active && isAdmin && (
                      <div className="border-t pt-2 space-y-2">
                        <Textarea placeholder="Décision de médiation…" rows={2}
                          value={resolutions[d.id] ?? ""} onChange={(e) => setResolutions((p) => ({ ...p, [d.id]: e.target.value }))} />
                        <div className="flex gap-2 flex-wrap">
                          <Button size="sm" disabled={busy === d.id} onClick={() => resolve(d, "client")} className="bg-blue-600 hover:bg-blue-700 text-white">Rembourser le client</Button>
                          <Button size="sm" disabled={busy === d.id} onClick={() => resolve(d, "provider")} className="bg-green-600 hover:bg-green-700 text-white">Libérer au prestataire</Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
