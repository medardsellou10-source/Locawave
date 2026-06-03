"use client"

export const dynamic = "force-dynamic"

import { useEffect, useState, useCallback } from "react"
import Link from "next/link"
import { createClient } from "@/lib/supabase"
import { useOrganization } from "@/hooks/useOrganization"
import { formatFCFA } from "@/lib/formatters"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Skeleton } from "@/components/ui/skeleton"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { EmptyState } from "@/components/app/EmptyState"
import { HardHat, Plus, Loader2, ArrowRight } from "lucide-react"
import { toast } from "sonner"

type Project = {
  id: string; title: string; description: string | null; total_budget_fcfa: number | null
  status: string; provider_id: string | null
  milestones?: { amount_fcfa: number; status: string; escrow_status: string }[]
}
type Provider = { id: string; display_name: string | null }

const STATUS_UI: Record<string, { label: string; cls: string }> = {
  draft: { label: "Brouillon", cls: "bg-gray-100 text-gray-600" },
  active: { label: "En cours", cls: "bg-blue-100 text-blue-700" },
  paused: { label: "En pause", cls: "bg-amber-100 text-amber-700" },
  completed: { label: "Terminé", cls: "bg-green-100 text-green-700" },
  cancelled: { label: "Annulé", cls: "bg-red-100 text-red-700" },
}

export default function ChantiersPage() {
  const { org } = useOrganization()
  const supabase = createClient()
  const [uid, setUid] = useState<string | null>(null)
  const [projects, setProjects] = useState<Project[]>([])
  const [providers, setProviders] = useState<Provider[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)

  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [budget, setBudget] = useState("")
  const [providerId, setProviderId] = useState("")

  const load = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    setUid(user.id)
    const { data } = await supabase
      .from("construction_projects")
      .select("id, title, description, total_budget_fcfa, status, provider_id, milestones:project_milestones(amount_fcfa, status, escrow_status)")
      .order("created_at", { ascending: false })
    setProjects((data as Project[]) ?? [])
    const { data: provs } = await supabase.from("provider_profiles").select("id, display_name").eq("is_verified", true)
    setProviders((provs as Provider[]) ?? [])
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  async function createProject() {
    if (!uid) return
    if (!title) { toast.error("Titre requis"); return }
    setSaving(true)
    const { error } = await supabase.from("construction_projects").insert({
      owner_id: uid, org_id: org?.id ?? null, title, description: description || null,
      total_budget_fcfa: budget ? parseInt(budget) : 0, provider_id: providerId || null, status: "active",
    })
    setSaving(false)
    if (error) { toast.error("Erreur lors de la création"); return }
    toast.success("Chantier créé")
    setOpen(false); setTitle(""); setDescription(""); setBudget(""); setProviderId("")
    load()
  }

  function metrics(p: Project) {
    const ms = p.milestones ?? []
    const released = ms.filter((m) => m.escrow_status === "released").reduce((s, m) => s + (m.amount_fcfa || 0), 0)
    const approved = ms.filter((m) => m.status === "approved").length
    const progress = ms.length ? Math.round((approved / ms.length) * 100) : 0
    return { released, progress, count: ms.length }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-2xl font-bold text-[#1a2744] flex items-center gap-2"><HardHat className="w-6 h-6 text-[#f97316]" /> Chantiers</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger render={<Button className="bg-[#f97316] hover:bg-[#ea580c] text-white" />}>
            <Plus className="w-4 h-4 mr-1" /> Nouveau chantier
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>Nouveau chantier</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div><Label>Titre</Label><Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Construction R+1 à Diamniadio" /></div>
              <div><Label>Description</Label><Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Budget total FCFA</Label><Input type="number" value={budget} onChange={(e) => setBudget(e.target.value)} /></div>
                <div><Label>Chef de chantier</Label>
                  <select value={providerId} onChange={(e) => setProviderId(e.target.value)} className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm">
                    <option value="">— Choisir un prestataire vérifié —</option>
                    {providers.map((p) => <option key={p.id} value={p.id}>{p.display_name ?? "Prestataire"}</option>)}
                  </select>
                </div>
              </div>
              <Button onClick={createProject} disabled={saving} className="w-full bg-[#f97316] hover:bg-[#ea580c] text-white">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Créer le chantier"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      <p className="text-gray-500 text-sm mb-4">Suivez vos travaux phase par phase : photos/vidéos en temps réel, validation et paiement sécurisé par jalon.</p>

      {loading ? <Skeleton className="h-40" /> : projects.length === 0 ? (
        <EmptyState icon={HardHat} title="Aucun chantier" description="Créez votre premier projet de construction ou rénovation et suivez-le phase par phase." />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {projects.map((p) => {
            const st = STATUS_UI[p.status] ?? STATUS_UI.active
            const m = metrics(p)
            return (
              <Link key={p.id} href={`/dashboard/chantiers/${p.id}`}>
                <Card className="cursor-pointer hover:border-[#f97316]/50 transition-colors">
                  <CardContent className="py-4">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-semibold text-[#1a2744]">{p.title}</p>
                      <Badge className={st.cls}>{st.label}</Badge>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">{m.count} phase(s) · {formatFCFA(p.total_budget_fcfa ?? 0)}</p>
                    <div className="mt-2 h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-[#f97316]" style={{ width: `${m.progress}%` }} />
                    </div>
                    <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                      <span>{m.progress}% validé · {formatFCFA(m.released)} libérés</span>
                      <span className="flex items-center gap-1 text-[#f97316]">Ouvrir <ArrowRight className="w-3.5 h-3.5" /></span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
