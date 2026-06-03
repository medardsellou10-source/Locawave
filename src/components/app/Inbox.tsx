"use client"

import { useEffect, useState, useCallback } from "react"
import { createClient } from "@/lib/supabase"
import { MessageThread } from "@/components/app/MessageThread"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MessageCircle, ChevronLeft } from "lucide-react"

type Conv = { otherId: string; name: string; lastBody: string }

export function Inbox() {
  const supabase = createClient()
  const [uid, setUid] = useState<string | null>(null)
  const [convs, setConvs] = useState<Conv[]>([])
  const [open, setOpen] = useState<Conv | null>(null)
  const [loaded, setLoaded] = useState(false)

  const load = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setLoaded(true); return }
    setUid(user.id)
    const { data: msgs } = await supabase
      .from("messages")
      .select("sender_id, recipient_id, body, created_at")
      .order("created_at", { ascending: false })
    const map = new Map<string, string>()
    for (const m of msgs ?? []) {
      const other = m.sender_id === user.id ? m.recipient_id : m.sender_id
      if (!map.has(other)) map.set(other, m.body)
    }
    const otherIds = Array.from(map.keys())
    const nameById = new Map<string, string>()
    if (otherIds.length) {
      const { data: provs } = await supabase.from("provider_profiles").select("id, display_name").in("id", otherIds)
      for (const p of provs ?? []) if (p.display_name) nameById.set(p.id, p.display_name)
    }
    setConvs(otherIds.map((id) => ({ otherId: id, name: nameById.get(id) ?? "Utilisateur", lastBody: map.get(id) ?? "" })))
    setLoaded(true)
  }, [])

  useEffect(() => { load() }, [load])

  if (loaded && convs.length === 0 && !open) return null

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          {open && <button onClick={() => setOpen(null)}><ChevronLeft className="w-4 h-4" /></button>}
          <MessageCircle className="w-4 h-4 text-[#f97316]" /> {open ? open.name : "Messages"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {open ? (
          <MessageThread otherId={open.otherId} otherName={open.name} />
        ) : (
          <div className="divide-y">
            {convs.map((c) => (
              <button key={c.otherId} onClick={() => setOpen(c)} className="w-full text-left py-2.5 flex items-center justify-between hover:bg-gray-50 rounded px-1">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-[#1a2744]">{c.name}</p>
                  <p className="text-xs text-gray-500 truncate">{c.lastBody}</p>
                </div>
                <Button size="sm" variant="ghost">Ouvrir</Button>
              </button>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
