"use client"

export const dynamic = "force-dynamic"

import { useEffect, useState, useCallback } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase"
import { formatFCFA, formatDateFR } from "@/lib/formatters"
import { MediaUploader } from "@/components/app/MediaUploader"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Skeleton } from "@/components/ui/skeleton"
import { ArrowLeft, HardHat, Plus, Send, Loader2 } from "lucide-react"
import { toast } from "sonner"

type Project = { id: string; title: string; description: string | null; total_budget_fcfa: number | null; status: string }
type Milestone = { id: string; order_index: number; title: string; description: string | null; amount_fcfa: number; status: string; escrow_status: string }
type Update = { id: string; milestone_id: string; kind: string; media_urls: string[] | null; note: string | null; taken_at: string }

const MS_STATUS: Record<string, { label: string; cls: string }> = {
  planned: { label: "Planifiée", cls: "bg-gray-100 text-gray-600" },
  funded: { label: "Financée", cls: "bg-indigo-100 text-indigo-700" },
  in_progress: { label: "En cours", cls: "bg-blue-100 text-blue-700" },
  submitted: { label: "Soumise", cls: "bg-amber-100 text-amber-700" },
  approved: { label: "Validée & payée", cls: "bg-green-100 text-green-700" },
  rejected: { label: "À corriger", cls: "bg-red-100 text-red-700" },
}

const isVideo = (url: string) => /\.(mp4|mov|webm|m4v|avi|mkv)(\?|$)/i.test(url)

export default function ChantierProviderPage() {
  const params = useParams()
  const supabase = createClient()
  const projectId = params.id as string
  const [uid, setUid] = useState<string | null>(null)
  const [project, setProject] = useState<Project | null>(null)
  const [milestones, setMilestones] = useState<Milestone[]>([])
  const [updates, setUpdates] = useState<Update[]>([])
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState<string | null>(null)

  // form nouvelle phase
  const [mTitle, setMTitle] = useState("")
  const [mDesc, setMDesc] = useState("")
  const [mAmount, setMAmount] = useState("")
  const [notes, setNotes] = useState<Record<string, string>>({})

  const load = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    setUid(user.id)
    const { data: p } = await supabase.from("construction_projects")
      .select("id, title, description, total_budget_fcfa, status").eq("id", projectId).maybeSingle()
    setProject(p as Project)
    const { data: ms } = await supabase.from("project_milestones")
      .select("id, order_index, title, description, amount_fcfa, status, escrow_status")
      .eq("project_id", projectId).order("order_index", { ascending: true })
    setMilestones((ms as Milestone[]) ?? [])
    const { data: up } = await supabase.from("milestone_updates")
      .select("id, milestone_id, kind, media_urls, note, taken_at").eq("project_id", projectId).order("taken_at", { ascending: false })
    setUpdates((up as Update[]) ?? [])
    setLoading(false)
  }, [projectId])

  useEffect(() => { load() }, [load])

  async function addMilestone() {
    if (!mTitle) { toast.error("Titre de la phase requis"); return }
    setBusy("new")
    const { error } = await supabase.from("project_milestones").insert({
      project_id: projectId, order_index: milestones.length, title: mTitle,
      description: mDesc || null, amount_fcfa: mAmount ? parseInt(mAmount) : 0, status: "planned",
    })
    setBusy(null)
    if (error) { toast.error("Erreur"); return }
    toast.success("Phase ajoutée"); setMTitle(""); setMDesc(""); setMAmount(""); load()
  }

  async function postMedia(m: Milestone, urls: string[]) {
    if (!uid) return
    const photos = urls.filter((u) => !isVideo(u))
    const videos = urls.filter((u) => isVideo(u))
    const rows = []
    if (photos.length) rows.push({ milestone_id: m.id, project_id: projectId, author_id: uid, kind: "photo", media_urls: photos })
    if (videos.length) rows.push({ milestone_id: m.id, project_id: projectId, author_id: uid, kind: "video", media_urls: videos })
    if (rows.length) {
      const { error } = await supabase.from("milestone_updates").insert(rows)
      if (error) { toast.error("Erreur enregistrement média"); return }
    }
    load()
  }

  async function postNote(m: Milestone) {
    const note = (notes[m.id] ?? "").trim()
    if (!uid || !note) return
    const { error } = await supabase.from("milestone_updates").insert({
      milestone_id: m.id, project_id: projectId, author_id: uid, kind: "note", note,
    })
    if (error) { toast.error("Erreur"); return }
    setNotes((p) => ({ ...p, [m.id]: "" })); toast.success("Note publiée"); load()
  }

  async function setStatus(m: Milestone, status: string) {
    setBusy(m.id)
    const patch: Record<string, unknown> = { status }
    if (status === "submitted") patch.submitted_at = new Date().toISOString()
    const { error } = await supabase.from("project_milestones").update(patch).eq("id", m.id)
    setBusy(null)
    if (error) { toast.error("Erreur"); return }
    toast.success(status === "submitted" ? "Phase soumise à validation" : "Phase démarrée"); load()
  }

  if (loading) return <div className="space-y-3"><Skeleton className="h-8 w-64" /><Skeleton className="h-40" /></div>
  if (!project) return <div className="text-gray-500 py-10 text-center">Chantier introuvable</div>

  return (
    <div className="space-y-5">
      <div>
        <Link href="/prestataire" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-[#f97316] mb-2"><ArrowLeft className="w-4 h-4" /> Mon espace</Link>
        <h1 className="text-2xl font-bold text-[#1a2744] flex items-center gap-2"><HardHat className="w-6 h-6 text-[#f97316]" /> {project.title}</h1>
        {project.description && <p className="text-gray-500 text-sm">{project.description}</p>}
        <p className="text-sm text-gray-500 mt-1">Budget : {formatFCFA(project.total_budget_fcfa ?? 0)}</p>
      </div>

      {/* Phases */}
      {milestones.map((m) => {
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

              {mUpdates.length > 0 && (
                <div className="mt-3 grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {mUpdates.flatMap((u) => (u.media_urls ?? []).map((url, i) => (
                    isVideo(url)
                      ? <video key={u.id + i} src={url} controls className="w-full h-24 object-cover rounded-lg bg-black" />
                      : <a key={u.id + i} href={url} target="_blank" rel="noreferrer"><img src={url} alt="" className="w-full h-24 object-cover rounded-lg" /></a>
                  )))}
                </div>
              )}

              {/* Outils chef de chantier */}
              {m.status !== "approved" && (
                <div className="mt-3 space-y-2 border-t pt-3">
                  <MediaUploader bucket="chantier" label="Photos / vidéos temps réel" onUploaded={(urls) => postMedia(m, urls)} />
                  <div className="flex gap-2">
                    <Input placeholder="Ajouter une note de chantier…" value={notes[m.id] ?? ""} onChange={(e) => setNotes((p) => ({ ...p, [m.id]: e.target.value }))} />
                    <Button variant="outline" size="sm" onClick={() => postNote(m)}>Note</Button>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    {m.status === "planned" || m.status === "funded" ? (
                      <Button size="sm" variant="outline" disabled={busy === m.id} onClick={() => setStatus(m, "in_progress")}>Démarrer</Button>
                    ) : null}
                    {(m.status === "in_progress" || m.status === "rejected" || m.status === "funded") && (
                      <Button size="sm" disabled={busy === m.id} onClick={() => setStatus(m, "submitted")} className="bg-[#f97316] hover:bg-[#ea580c] text-white">
                        {busy === m.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Send className="w-4 h-4 mr-1" /> Soumettre à validation</>}
                      </Button>
                    )}
                  </div>
                </div>
              )}
              {mUpdates.filter((u) => u.note).length > 0 && (
                <div className="mt-2 space-y-1">
                  {mUpdates.filter((u) => u.note).map((u) => (
                    <p key={u.id} className="text-xs text-gray-500">📝 {u.note} <span className="text-gray-400">· {formatDateFR(u.taken_at)}</span></p>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )
      })}

      {/* Ajouter une phase */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><Plus className="w-4 h-4 text-[#f97316]" /> Ajouter une phase</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          <Input placeholder="Titre (ex: Fondations)" value={mTitle} onChange={(e) => setMTitle(e.target.value)} />
          <Textarea placeholder="Description (optionnel)" rows={2} value={mDesc} onChange={(e) => setMDesc(e.target.value)} />
          <div className="flex gap-2">
            <Input type="number" placeholder="Montant FCFA" value={mAmount} onChange={(e) => setMAmount(e.target.value)} />
            <Button onClick={addMilestone} disabled={busy === "new"} className="bg-[#1a2744] hover:bg-[#0f1a2e] text-white shrink-0">
              {busy === "new" ? <Loader2 className="w-4 h-4 animate-spin" /> : "Ajouter"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
