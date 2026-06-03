"use client"

import { useEffect, useState, useRef, useCallback } from "react"
import { createClient } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2, Send } from "lucide-react"

type Message = { id: string; sender_id: string; recipient_id: string; body: string; created_at: string }

export function MessageThread({ otherId, otherName }: { otherId: string; otherName: string }) {
  const supabase = createClient()
  const [uid, setUid] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [body, setBody] = useState("")
  const [sending, setSending] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  const fetchMessages = useCallback(async (me: string) => {
    const { data } = await supabase
      .from("messages")
      .select("id, sender_id, recipient_id, body, created_at")
      .or(`and(sender_id.eq.${me},recipient_id.eq.${otherId}),and(sender_id.eq.${otherId},recipient_id.eq.${me})`)
      .order("created_at", { ascending: true })
    setMessages((data as Message[]) ?? [])
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 50)
  }, [otherId])

  useEffect(() => {
    let channel: ReturnType<typeof supabase.channel> | null = null
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return
      setUid(user.id)
      fetchMessages(user.id)
      channel = supabase.channel(`msg-${user.id}-${otherId}`)
        .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages", filter: `recipient_id=eq.${user.id}` },
          () => fetchMessages(user.id))
        .subscribe()
    })
    return () => { if (channel) supabase.removeChannel(channel) }
  }, [otherId, fetchMessages])

  async function send() {
    if (!uid || !body.trim()) return
    setSending(true)
    const { error } = await supabase.from("messages").insert({ sender_id: uid, recipient_id: otherId, body: body.trim() })
    setSending(false)
    if (!error) { setBody(""); fetchMessages(uid) }
  }

  return (
    <div className="flex flex-col h-80">
      <div className="flex-1 overflow-y-auto space-y-2 p-2 bg-gray-50 rounded-lg">
        {messages.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-8">Démarrez la conversation avec {otherName}.</p>
        ) : messages.map((m) => (
          <div key={m.id} className={`max-w-[75%] rounded-lg px-3 py-1.5 text-sm ${m.sender_id === uid ? "ml-auto bg-[#f97316] text-white" : "bg-white border"}`}>
            {m.body}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
      <div className="flex gap-2 mt-2">
        <Input value={body} onChange={(e) => setBody(e.target.value)} placeholder="Votre message…"
          onKeyDown={(e) => { if (e.key === "Enter") send() }} />
        <Button onClick={send} disabled={sending} className="bg-[#f97316] hover:bg-[#ea580c] text-white">
          {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        </Button>
      </div>
    </div>
  )
}
