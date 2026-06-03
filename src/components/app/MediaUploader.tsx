"use client"

import { useRef, useState } from "react"
import { createClient } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Upload, Loader2 } from "lucide-react"
import { toast } from "sonner"

type Props = {
  bucket?: string
  accept?: string
  maxMb?: number
  label?: string
  multiple?: boolean
  onUploaded: (urls: string[]) => void | Promise<void>
}

/**
 * Upload réutilisable de fichiers (photos/vidéos) vers un bucket Storage public.
 * Renvoie les URLs publiques via onUploaded. Utilisé par le suivi de chantier et le portfolio.
 */
export function MediaUploader({
  bucket = "chantier",
  accept = "image/*,video/*",
  maxMb = 50,
  label = "Ajouter photos / vidéos",
  multiple = true,
  onUploaded,
}: Props) {
  const supabase = createClient()
  const fileRef = useRef<HTMLInputElement>(null)
  const [busy, setBusy] = useState(false)

  async function handle() {
    const files = fileRef.current?.files
    if (!files || files.length === 0) { toast.error("Choisissez un fichier"); return }
    setBusy(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setBusy(false); toast.error("Non authentifié"); return }

    const urls: string[] = []
    for (const file of Array.from(files)) {
      if (file.size > maxMb * 1024 * 1024) {
        toast.error(`${file.name} dépasse ${maxMb} Mo`); continue
      }
      const ext = file.name.split(".").pop() ?? "bin"
      const path = `${user.id}/${Date.now()}-${Math.floor(Number(String(file.size).slice(-4)) || 0)}.${ext}`
      const { error } = await supabase.storage.from(bucket).upload(path, file, { upsert: false })
      if (error) { toast.error(`Échec envoi ${file.name}`); continue }
      const { data } = supabase.storage.from(bucket).getPublicUrl(path)
      if (data?.publicUrl) urls.push(data.publicUrl)
    }
    setBusy(false)
    if (fileRef.current) fileRef.current.value = ""
    if (urls.length === 0) { toast.error("Aucun fichier envoyé"); return }
    await onUploaded(urls)
    toast.success(`${urls.length} fichier(s) envoyé(s)`)
  }

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <input
        ref={fileRef}
        type="file"
        accept={accept}
        multiple={multiple}
        className="block text-sm text-gray-600 file:mr-3 file:rounded-md file:border-0 file:bg-[#1a2744] file:px-3 file:py-2 file:text-white"
      />
      <Button type="button" onClick={handle} disabled={busy} className="bg-[#f97316] hover:bg-[#ea580c] text-white">
        {busy ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Envoi…</> : <><Upload className="w-4 h-4 mr-2" /> {label}</>}
      </Button>
    </div>
  )
}
