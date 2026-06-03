"use client"

export const dynamic = "force-dynamic"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase"
import { formatDateFR } from "@/lib/formatters"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { ShieldCheck, Eye, Check, X, Loader2 } from "lucide-react"
import { toast } from "sonner"

type KycRow = {
  id: string
  doc_type: string
  doc_url: string
  status: string
  created_at: string
  profile_id: string
  profiles: { full_name: string; role: string } | null
}

const DOC_LABELS: Record<string, string> = {
  cni: "CNI", passeport: "Passeport", carte_consulaire: "Carte consulaire", autre: "Autre",
}

export default function AdminKycPage() {
  const router = useRouter()
  const supabase = createClient()
  const [allowed, setAllowed] = useState<boolean | null>(null)
  const [rows, setRows] = useState<KycRow[]>([])
  const [loading, setLoading] = useState(true)
  const [acting, setActing] = useState<string | null>(null)

  async function load() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.replace("/login"); return }
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()
    if (profile?.role !== "admin") { setAllowed(false); return }
    setAllowed(true)

    const { data } = await supabase
      .from("kyc_documents")
      .select("id, doc_type, doc_url, status, created_at, profile_id, profiles(full_name, role)")
      .eq("status", "pending")
      .order("created_at", { ascending: true })
    setRows((data as KycRow[]) ?? [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function viewDoc(path: string) {
    const { data } = await supabase.storage.from("kyc").createSignedUrl(path, 120)
    if (data?.signedUrl) window.open(data.signedUrl, "_blank")
    else toast.error("Impossible d'ouvrir le document")
  }

  async function decide(row: KycRow, status: "verified" | "rejected") {
    let note: string | null = null
    if (status === "rejected") {
      note = window.prompt("Motif du refus (visible par l'utilisateur) :") || "Document non conforme"
    }
    setActing(row.id)
    const { data: { user } } = await supabase.auth.getUser()
    const { error } = await supabase.from("kyc_documents")
      .update({ status, note, reviewed_by: user?.id ?? null, reviewed_at: new Date().toISOString() })
      .eq("id", row.id)
    if (error) { toast.error("Erreur lors de la décision"); setActing(null); return }

    await supabase.from("audit_log").insert({
      entity: "kyc_documents", entity_id: row.id, action: status,
      actor_id: user?.id ?? null, payload: { profile_id: row.profile_id },
    })
    toast.success(status === "verified" ? "Identité validée" : "Document refusé")
    setActing(null)
    load()
  }

  if (allowed === false) {
    return <div className="text-center py-20 text-gray-500">Accès réservé aux administrateurs.</div>
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#1a2744] mb-2 flex items-center gap-2">
        <ShieldCheck className="w-6 h-6 text-[#f97316]" /> Validation KYC
      </h1>
      <p className="text-gray-500 text-sm mb-6">Pièces d'identité en attente de vérification.</p>

      {loading || allowed === null ? (
        <Skeleton className="h-40" />
      ) : rows.length === 0 ? (
        <div className="text-center py-16 text-gray-400">Aucune pièce en attente 🎉</div>
      ) : (
        <div className="space-y-3">
          {rows.map((r) => (
            <Card key={r.id}>
              <CardContent className="py-4 flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
                <div>
                  <p className="font-medium text-[#1a2744]">{r.profiles?.full_name ?? "Utilisateur"}</p>
                  <p className="text-sm text-gray-500">
                    <Badge variant="outline" className="mr-2">{DOC_LABELS[r.doc_type] ?? r.doc_type}</Badge>
                    {r.profiles?.role ?? ""} · {formatDateFR(r.created_at)}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => viewDoc(r.doc_url)}>
                    <Eye className="w-4 h-4 mr-1" /> Voir
                  </Button>
                  <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white"
                    disabled={acting === r.id} onClick={() => decide(r, "verified")}>
                    {acting === r.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Check className="w-4 h-4 mr-1" /> Valider</>}
                  </Button>
                  <Button size="sm" variant="destructive" disabled={acting === r.id} onClick={() => decide(r, "rejected")}>
                    <X className="w-4 h-4 mr-1" /> Refuser
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
