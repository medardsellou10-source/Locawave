"use client"

export const dynamic = "force-dynamic"

import { useEffect, useState, useCallback } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase"
import { formatFCFA, formatDateFR } from "@/lib/formatters"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { ArrowLeft, HardHat, Loader2, CheckCircle2, Wallet, Image as ImageIcon, Video, FileText, ShieldCheck } from "lucide-react"
import { toast } from "sonner"

type Project = { id: string; title: string; description: string | null; total_budget_fcfa: number | null; status: string; provider_id: string | null; owner_id: string }
type Milestone = { id: string; order_index: number; title: string; description: string | null; amount_fcfa: number; status: string; escrow_status: string; submitted_at: string | null; approved_at: string | null }
type Update = { id: string; milestone_id: string; kind: string; media_urls: string[] | null; note: string | null; taken_at: string; created_at: string }

const MS_STATUS: Record<string, { label: string; cls: string }> = {
  planned: { label: "Planifiée", cls: "bg-gray-100 text-gray-600" },
  funded: { label: "Financée (séquestre)", cls: "bg-indigo-100 text-indigo-700" },
  in_progress: { label: "En cours", cls: "bg-blue-100 text-blue-700" },
  submitted: { label: "Soumise à validation", cls: "bg-amber-100 text-amber-700" },
  approved: { label: "Validée & payée", cls: "bg-green-100 text-green-700" },
  rejected: { label: "Rejetée", cls: "bg-red-100 text-red-700" },
}

export default function ChantierDetailOwnerPage() {
  const params = useParams()
  const supabase = createClient()
  const projectId = params.id as string
  const [project, setProject] = useState<Project | null>(null)
  const [milestones, setMilestones] = useState<Milestone[]>([])
  const [updates, setUpdates] = useState<Update[]>([])
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState<string | null>(null)

  const load = useCallback(async () => {
    const { data: p } = await supabase.from("construction_projects")
      .select("id, title, description, total_budget_fcfa, status, provider_id, owner_id").eq("id", projectId).maybeSingle()
    setProject(p as Project)
    const { data: ms } = await supabase.from("project_milestones")
      .select("id, order_index, title, description, amount_fcfa, status, escrow_status, submitted_at, approved_at")
      .eq("project_id", projectId).order("order_index", { ascending: true })
    setMilestones((ms as Milestone[]) ?? [])
    const { data: up } = await supabase.from("milestone_updates")
      .select("id, milestone_id, kind, media_urls, note, taken_at, created_at")
      .eq("project_id", projectId).order("taken_at", { ascending: false })
    setUpdates((up as Update[]) ?? [])
    setLoading(false)
  }, [projectId])

  useEffect(() => { load() }, [load])

  // Temps réel : nouveaux médias terrain + changements de phase
  useEffect(() => {
    const ch = supabase
      .channel(`chantier-${projectId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "milestone_updates", filter: `project_id=eq.${projectId}` }, () => load())
      .on("postgres_changes", { event: "*", schema: "public", table: "project_milestones", filter: `project_id=eq.${projectId}` }, () => load())
      .subscribe()
    return () => { supabase.removeChannel(ch) }
  }, [projectId, load])

  async function fundMilestone(m: Milestone) {
    setBusy(m.id)
    // Simulation séquestre (en prod : lien PSP -> webhook). Fonds "held".
    const { error } = await supabase.from("project_milestones")
      .update({ escrow_status: "held", status: "funded" }).eq("id", m.id)
    setBusy(null)
    if (error) { toast.error("Erreur"); return }
    toast.success("Phase financée — fonds placés sous séquestre"); load()
  }

  async function approveMilestone(m: Milestone) {
    setBusy(m.id)
    const { error } = await supabase.from("project_milestones")
      .update({ status: "approved", escrow_status: "released", approved_at: new Date().toISOString() }).eq("id", m.id)
    setBusy(null)
    if (error) { toast.error("Erreur"); return }
    toast.success("Phase validée — paiement libéré au chef de chantier"); load()
  }

  async function rejectMilestone(m: Milestone) {
    setBusy(m.id)
    const { error } = await supabase.from("project_milestones").update({ status: "rejected" }).eq("id", m.id)
    setBusy(null)
    if (error) { toast.error("Erreur"); return }
    toast.success("Phase renvoyée au chef de chantier"); load()
  }

  async function completeProject() {
    const { error } = await supabase.from("construction_projects").update({ status: "completed" }).eq("id", projectId)
    if (error) { toast.error("Erreur"); return }
    toast.success("Chantier marqué comme terminé"); load()
  }

  if (loading) return <div className="space-y-3"><Skeleton className="h-8 w-64" /><Skeleton className="h-40" /></div>
  if (!project) return <div className="text-gray-500 py-10 text-center">Chantier introuvable</div>

  const held = milestones.filter((m) => m.escrow_status === "held").reduce((s, m) => s + m.amount_fcfa, 0)
  const released = milestones.filter((m) => m.escrow_status === "released").reduce((s, m) => s + m.amount_fcfa, 0)
  const planned = milestones.reduce((s, m) => s + m.amount_fcfa, 0)
  const budget = project.total_budget_fcfa ?? 0
  const allApproved = milestones.length > 0 && milestones.every((m) => m.status === "approved")

  return (
    <div>
      <Link href="/dashboard/chantiers" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-[#f97316] mb-3"><ArrowLeft className="w-4 h-4" /> Chantiers</Link>
      <div className="flex items-center justify-between gap-2 mb-1 flex-wrap">
        <h1 className="text-2xl font-bold text-[#1a2744] flex items-center gap-2"><HardHat className="w-6 h-6 text-[#f97316]" /> {project.title}</h1>
        {allApproved && project.status !== "completed" && (
          <Button onClick={completeProject} className="bg-green-600 hover:bg-green-700 text-white"><CheckCircle2 className="w-4 h-4 mr-1" /> Marquer terminé</Button>
        )}
      </div>
      {project.description && <p className="text-gray-500 text-sm mb-4">{project.description}</p>}

      {/* Budget */}
      <Card className="mb-5">
        <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><Wallet className="w-5 h-5 text-[#f97316]" /> Budget & séquestre</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div className="bg-gray-50 rounded-lg py-3"><p className="text-xs text-gray-500">Budget total</p><p className="font-bold text-[#1a2744]">{formatFCFA(budget)}</p></div>
            <div className="bg-gray-50 rounded-lg py-3"><p className="text-xs text-gray-500">Phases planifiées</p><p className="font-bold text-[#1a2744]">{formatFCFA(planned)}</p></div>
            <div className="bg-indigo-50 rounded-lg py-3"><p className="text-xs text-indigo-600">Sous séquestre</p><p className="font-bold text-indigo-700">{formatFCFA(held)}</p></div>
            <div className="bg-green-50 rounded-lg py-3"><p className="text-xs text-green-600">Libéré (payé)</p><p className="font-bold text-green-700">{formatFCFA(released)}</p></div>
          </div>
        </CardContent>
      </Card>

      {/* Phases */}
      <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">Phases du chantier</h2>
      <div className="space-y-3 mb-6">
        {milestones.length === 0 ? (
          <Card><CardContent className="py-6 text-center text-gray-400 text-sm">Le chef de chantier n'a pas encore défini de phases.</CardContent></Card>
        ) : milestones.map((m) => {
          const st = MS_STATUS[m.status] ?? MS_STATUS.planned
          const mUpdates = updates.filter((u) => u.milestone_id === m.id)
          return (
            <Card key={m.id}>
              <CardContent className="py-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold text-[#1a2744]">Phase {m.order_index + 1} — {m.title}</p>
                    {m.description && <p className="text-sm text-gray-500">{m.description}</p>}
                    <p className="text-sm font-medium text-[#1a2744] mt-1">{formatFCFA(m.amount_fcfa)}</p>
                  </div>
                  <Badge className={st.cls}>{st.label}</Badge>
                </div>

                {/* Médias terrain de la phase */}
                {mUpdates.length > 0 && (
                  <div className="mt-3 grid grid-cols-3 sm:grid-cols-4 gap-2">
                    {mUpdates.flatMap((u) => (u.media_urls ?? []).map((url, i) => (
                      u.kind === "video"
                        ? <video key={u.id + i} src={url} controls className="w-full h-24 object-cover rounded-lg bg-black" />
                        : <a key={u.id + i} href={url} target="_blank" rel="noreferrer"><img src={url} alt="" className="w-full h-24 object-cover rounded-lg" /></a>
                    )))}
                  </div>
                )}
                {mUpdates.some((u) => u.note) && (
                  <div className="mt-2 space-y-1">
                    {mUpdates.filter((u) => u.note).map((u) => (
                      <p key={u.id} className="text-xs text-gray-500">📝 {u.note} <span className="text-gray-400">· {formatDateFR(u.taken_at)}</span></p>
                    ))}
                  </div>
                )}

                {/* Actions propriétaire */}
                <div className="flex gap-2 mt-3 flex-wrap">
                  {(m.status === "planned" || m.status === "in_progress") && m.escrow_status === "none" && (
                    <Button size="sm" disabled={busy === m.id} onClick={() => fundMilestone(m)} className="bg-indigo-600 hover:bg-indigo-700 text-white">
                      {busy === m.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <><ShieldCheck className="w-4 h-4 mr-1" /> Financer la phase</>}
                    </Button>
                  )}
                  {m.status === "submitted" && (
                    <>
                      <Button size="sm" disabled={busy === m.id} onClick={() => approveMilestone(m)} className="bg-green-600 hover:bg-green-700 text-white">
                        {busy === m.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <><CheckCircle2 className="w-4 h-4 mr-1" /> Valider & libérer le paiement</>}
                      </Button>
                      <Button size="sm" variant="outline" disabled={busy === m.id} onClick={() => rejectMilestone(m)} className="text-red-600 border-red-200">Renvoyer</Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Fil d'activité temps réel */}
      <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">Fil d'activité (temps réel)</h2>
      <Card>
        <CardContent className="py-4">
          {updates.length === 0 ? <p className="text-sm text-gray-400 text-center py-4">Aucune mise à jour terrain pour le moment.</p> : (
            <div className="space-y-3">
              {updates.slice(0, 20).map((u) => (
                <div key={u.id} className="flex items-start gap-2 text-sm">
                  <span className="mt-0.5 text-[#f97316]">
                    {u.kind === "video" ? <Video className="w-4 h-4" /> : u.kind === "note" ? <FileText className="w-4 h-4" /> : <ImageIcon className="w-4 h-4" />}
                  </span>
                  <div>
                    <p className="text-gray-700">{u.note ?? (u.kind === "video" ? "Vidéo du chantier" : "Photos du chantier")}{(u.media_urls?.length ?? 0) > 0 ? ` (${u.media_urls!.length})` : ""}</p>
                    <p className="text-xs text-gray-400">{formatDateFR(u.taken_at)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
