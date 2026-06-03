"use client"

export const dynamic = "force-dynamic"

import { useEffect, useState, useCallback } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase"
import { formatFCFA } from "@/lib/formatters"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Building2, Loader2, HeartPulse, GraduationCap, CheckCircle2, Award } from "lucide-react"
import { toast } from "sonner"

type Enrollment = { id: string; kind: string; provider_name: string | null; monthly_fcfa: number | null; status: string }
type Module = { key: string; title: string; description: string | null; category: string | null; badge_label: string | null; sort_order: number }
type Progress = { module_key: string; progress: number; completed_at: string | null }

const KIND_LABEL: Record<string, string> = { cmu: "CMU (Couverture Maladie Universelle)", micro_sante: "Micro-assurance santé", accident: "Assurance accident", autre: "Autre" }
const STATUS_LABEL: Record<string, { label: string; cls: string }> = {
  pending: { label: "En attente", cls: "bg-orange-100 text-orange-700" },
  active: { label: "Active", cls: "bg-green-100 text-green-700" },
  expired: { label: "Expirée", cls: "bg-gray-100 text-gray-600" },
  cancelled: { label: "Annulée", cls: "bg-gray-100 text-gray-600" },
}

export default function AvantagesPage() {
  const supabase = createClient()
  const router = useRouter()
  const [uid, setUid] = useState<string | null>(null)
  const [enrollments, setEnrollments] = useState<Enrollment[]>([])
  const [modules, setModules] = useState<Module[]>([])
  const [progress, setProgress] = useState<Record<string, Progress>>({})
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)

  const [kind, setKind] = useState("cmu")
  const [providerName, setProviderName] = useState("")
  const [monthly, setMonthly] = useState("")

  const load = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push("/login"); return }
    setUid(user.id)
    const [{ data: enr }, { data: mods }, { data: prog }] = await Promise.all([
      supabase.from("insurance_enrollments").select("id, kind, provider_name, monthly_fcfa, status").order("created_at", { ascending: false }),
      supabase.from("training_modules").select("key, title, description, category, badge_label, sort_order").order("sort_order"),
      supabase.from("training_progress").select("module_key, progress, completed_at"),
    ])
    setEnrollments((enr as Enrollment[]) ?? [])
    setModules((mods as Module[]) ?? [])
    const pmap: Record<string, Progress> = {}
    for (const p of (prog as Progress[]) ?? []) pmap[p.module_key] = p
    setProgress(pmap)
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  async function enroll() {
    if (!uid) return
    setBusy(true)
    const { error } = await supabase.from("insurance_enrollments").insert({
      profile_id: uid, kind, provider_name: providerName || null,
      monthly_fcfa: monthly ? parseInt(monthly) : null, status: "pending",
      enrolled_at: new Date().toISOString().slice(0, 10),
    })
    setBusy(false)
    if (error) { toast.error("Erreur"); return }
    toast.success("Demande d'adhésion enregistrée"); setProviderName(""); setMonthly(""); load()
  }

  async function advance(m: Module) {
    if (!uid) return
    const cur = progress[m.key]?.progress ?? 0
    const next = Math.min(100, cur + 25)
    const completed = next >= 100 ? new Date().toISOString() : null
    const { error } = await supabase.from("training_progress").upsert(
      { profile_id: uid, module_key: m.key, progress: next, completed_at: completed },
      { onConflict: "profile_id,module_key" }
    )
    if (error) { toast.error("Erreur"); return }
    if (next >= 100) toast.success(`Module terminé — badge « ${m.badge_label} » obtenu !`)
    load()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b bg-white">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#f97316] rounded-lg flex items-center justify-center"><Building2 className="w-5 h-5 text-white" /></div>
            <span className="text-lg font-bold text-[#1a2744]">Locawave</span>
          </Link>
          <span className="text-sm text-gray-500">Avantages</span>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-[#1a2744]">Avantages & protection sociale</h1>
          <p className="text-gray-500 text-sm">Accédez à une couverture santé et montez en compétences pour gagner des badges.</p>
        </div>

        {loading ? <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 animate-spin text-[#f97316]" /></div> : (
        <>
          {/* Assurance */}
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><HeartPulse className="w-5 h-5 text-[#f97316]" /> Micro-assurance santé</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {enrollments.length > 0 && (
                <div className="divide-y">
                  {enrollments.map((e) => {
                    const st = STATUS_LABEL[e.status] ?? STATUS_LABEL.pending
                    return (
                      <div key={e.id} className="py-2 flex items-center justify-between text-sm">
                        <span>{KIND_LABEL[e.kind] ?? e.kind}{e.provider_name ? ` · ${e.provider_name}` : ""}{e.monthly_fcfa ? ` · ${formatFCFA(e.monthly_fcfa)}/mois` : ""}</span>
                        <Badge className={st.cls}>{st.label}</Badge>
                      </div>
                    )
                  })}
                </div>
              )}
              <div className="grid sm:grid-cols-3 gap-2">
                <select value={kind} onChange={(e) => setKind(e.target.value)} className="h-10 rounded-md border border-input bg-background px-3 text-sm">
                  {Object.entries(KIND_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
                <Input placeholder="Organisme (optionnel)" value={providerName} onChange={(e) => setProviderName(e.target.value)} />
                <Input type="number" placeholder="Cotisation FCFA/mois" value={monthly} onChange={(e) => setMonthly(e.target.value)} />
              </div>
              <Button onClick={enroll} disabled={busy} className="bg-[#f97316] hover:bg-[#ea580c] text-white">
                {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : "Demander l'adhésion"}
              </Button>
              <p className="text-[11px] text-gray-400">Locawave facilite la mise en relation ; l'adhésion est traitée par l'organisme partenaire.</p>
            </CardContent>
          </Card>

          {/* Formation */}
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><GraduationCap className="w-5 h-5 text-[#f97316]" /> Formation & badges</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {modules.map((m) => {
                const p = progress[m.key]?.progress ?? 0
                const done = p >= 100
                return (
                  <div key={m.key} className="border rounded-lg p-3">
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <p className="font-medium text-[#1a2744]">{m.title}</p>
                        {m.description && <p className="text-xs text-gray-500">{m.description}</p>}
                      </div>
                      {done && <Badge className="bg-green-100 text-green-700 gap-1 shrink-0"><Award className="w-3.5 h-3.5" /> {m.badge_label}</Badge>}
                    </div>
                    <div className="mt-2 h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-[#f97316] transition-all" style={{ width: `${p}%` }} />
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-gray-400">{p}%</span>
                      {done
                        ? <span className="text-xs text-green-600 flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> Terminé</span>
                        : <Button size="sm" variant="outline" onClick={() => advance(m)}>Continuer le module</Button>}
                    </div>
                  </div>
                )
              })}
            </CardContent>
          </Card>
        </>
        )}
      </main>
    </div>
  )
}
