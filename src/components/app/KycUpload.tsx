"use client"

import { useEffect, useRef, useState } from "react"
import { createClient } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ShieldCheck, Upload, Loader2, Clock, XCircle, CheckCircle2 } from "lucide-react"
import { toast } from "sonner"

const DOC_TYPES = [
  { value: "cni", label: "Carte nationale d'identité" },
  { value: "passeport", label: "Passeport" },
  { value: "carte_consulaire", label: "Carte consulaire" },
  { value: "autre", label: "Autre" },
] as const

const STATUS_UI: Record<string, { label: string; cls: string; icon: typeof Clock }> = {
  none: { label: "Non vérifié", cls: "bg-gray-100 text-gray-600", icon: ShieldCheck },
  pending: { label: "En cours de vérification", cls: "bg-orange-100 text-orange-700", icon: Clock },
  verified: { label: "Identité vérifiée", cls: "bg-green-100 text-green-700", icon: CheckCircle2 },
  rejected: { label: "Refusé — à renvoyer", cls: "bg-red-100 text-red-700", icon: XCircle },
}

export function KycUpload() {
  const supabase = createClient()
  const fileRef = useRef<HTMLInputElement>(null)
  const [status, setStatus] = useState<string>("none")
  const [docType, setDocType] = useState<string>("cni")
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [note, setNote] = useState<string | null>(null)

  async function refresh() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setLoading(false); return }
    const { data: profile } = await supabase.from("profiles").select("kyc_status").eq("id", user.id).single()
    setStatus(profile?.kyc_status ?? "none")
    const { data: doc } = await supabase
      .from("kyc_documents").select("note, status").eq("profile_id", user.id)
      .order("created_at", { ascending: false }).limit(1).maybeSingle()
    if (doc?.status === "rejected") setNote(doc.note ?? null)
    setLoading(false)
  }

  useEffect(() => { refresh() }, [])

  async function onUpload() {
    const file = fileRef.current?.files?.[0]
    if (!file) { toast.error("Choisissez un fichier"); return }
    if (file.size > 5 * 1024 * 1024) { toast.error("Fichier trop volumineux (max 5 Mo)"); return }

    setUploading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setUploading(false); return }

    const ext = file.name.split(".").pop() ?? "jpg"
    const path = `${user.id}/${Date.now()}.${ext}`
    const { error: upErr } = await supabase.storage.from("kyc").upload(path, file, { upsert: false })
    if (upErr) { toast.error("Échec de l'envoi du fichier"); setUploading(false); return }

    const { error: insErr } = await supabase.from("kyc_documents").insert({
      profile_id: user.id, doc_type: docType, doc_url: path,
    })
    setUploading(false)
    if (insErr) { toast.error("Erreur lors de l'enregistrement"); return }
    toast.success("Pièce envoyée — vérification en cours")
    setNote(null)
    refresh()
  }

  const ui = STATUS_UI[status] ?? STATUS_UI.none
  const Icon = ui.icon
  const canUpload = status === "none" || status === "rejected"

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-[#f97316]" /> Vérification d'identité (KYC)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading ? (
          <p className="text-sm text-gray-400">Chargement…</p>
        ) : (
          <>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Statut :</span>
              <Badge className={`${ui.cls} gap-1`}><Icon className="w-3.5 h-3.5" /> {ui.label}</Badge>
            </div>
            {note && <p className="text-sm text-red-600">Motif du refus : {note}</p>}

            {canUpload ? (
              <div className="space-y-3">
                <div>
                  <Label htmlFor="kyc-type">Type de pièce</Label>
                  <select id="kyc-type" value={docType} onChange={(e) => setDocType(e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                    {DOC_TYPES.map((d) => <option key={d.value} value={d.value}>{d.label}</option>)}
                  </select>
                </div>
                <div>
                  <Label htmlFor="kyc-file">Fichier (photo ou PDF, max 5 Mo)</Label>
                  <input id="kyc-file" ref={fileRef} type="file" accept="image/*,application/pdf"
                    className="block w-full text-sm text-gray-600 file:mr-3 file:rounded-md file:border-0 file:bg-[#1a2744] file:px-3 file:py-2 file:text-white" />
                </div>
                <Button onClick={onUpload} disabled={uploading} className="bg-[#f97316] hover:bg-[#ea580c] text-white">
                  {uploading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Envoi…</> : <><Upload className="w-4 h-4 mr-2" /> Envoyer ma pièce</>}
                </Button>
              </div>
            ) : status === "pending" ? (
              <p className="text-sm text-gray-500">Votre pièce a été reçue. Un administrateur la vérifiera sous peu.</p>
            ) : (
              <p className="text-sm text-green-700">Votre identité est vérifiée. Merci !</p>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}
