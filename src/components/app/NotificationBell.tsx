"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase"
import { Bell, Check } from "lucide-react"

type Notif = {
  id: string
  kind: string
  title: string
  body: string | null
  link: string | null
  read_at: string | null
  created_at: string
}

const KIND_DOT: Record<string, string> = {
  reminder_j5: "bg-blue-500",
  reminder_j0: "bg-orange-500",
  reminder_j3_late: "bg-red-500",
  lease_expiry: "bg-amber-500",
  chantier: "bg-indigo-500",
  weekly_report: "bg-emerald-500",
}

function timeAgo(iso: string): string {
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000)
  if (s < 60) return "à l'instant"
  if (s < 3600) return `il y a ${Math.floor(s / 60)} min`
  if (s < 86400) return `il y a ${Math.floor(s / 3600)} h`
  const d = Math.floor(s / 86400)
  return d === 1 ? "hier" : `il y a ${d} jours`
}

/** Cloche de notifications : compteur non-lus, liste déroulante, marquage lu. */
export function NotificationBell({ tone = "light" }: { tone?: "light" | "dark" }) {
  const supabase = createClient()
  const router = useRouter()
  const [items, setItems] = useState<Notif[]>([])
  const [open, setOpen] = useState(false)
  const boxRef = useRef<HTMLDivElement>(null)

  const load = useCallback(async () => {
    const { data } = await supabase
      .from("notifications")
      .select("id, kind, title, body, link, read_at, created_at")
      .order("created_at", { ascending: false })
      .limit(20)
    setItems((data as Notif[]) ?? [])
  }, [])

  useEffect(() => { load() }, [load])

  // Temps réel : une nouvelle notification apparaît sans rechargement.
  useEffect(() => {
    const ch = supabase
      .channel("notif-bell")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "notifications" }, () => load())
      .subscribe()
    return () => { supabase.removeChannel(ch) }
  }, [load])

  // Fermeture au clic extérieur
  useEffect(() => {
    if (!open) return
    function onClick(e: MouseEvent) {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", onClick)
    return () => document.removeEventListener("mousedown", onClick)
  }, [open])

  const unread = items.filter((n) => !n.read_at).length

  async function markAllRead() {
    const ids = items.filter((n) => !n.read_at).map((n) => n.id)
    if (ids.length === 0) return
    setItems((prev) => prev.map((n) => (n.read_at ? n : { ...n, read_at: new Date().toISOString() })))
    await supabase.from("notifications").update({ read_at: new Date().toISOString() }).in("id", ids)
  }

  async function openItem(n: Notif) {
    if (!n.read_at) {
      setItems((prev) => prev.map((x) => (x.id === n.id ? { ...x, read_at: new Date().toISOString() } : x)))
      await supabase.from("notifications").update({ read_at: new Date().toISOString() }).eq("id", n.id)
    }
    setOpen(false)
    if (n.link) router.push(n.link)
  }

  const btnCls = tone === "dark"
    ? "text-white/80 hover:bg-white/10 hover:text-white"
    : "text-gray-500 hover:bg-gray-100 hover:text-[#1a2744]"

  return (
    <div className="relative" ref={boxRef}>
      <button
        onClick={() => setOpen((o) => !o)}
        className={`relative flex h-9 w-9 items-center justify-center rounded-lg transition-colors ${btnCls}`}
        aria-label={unread > 0 ? `${unread} notification(s) non lue(s)` : "Notifications"}
      >
        <Bell className="h-5 w-5" />
        {unread > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#f97316] px-1 text-[10px] font-bold text-white">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-80 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg sm:w-96">
          <div className="flex items-center justify-between border-b px-4 py-2.5">
            <p className="text-sm font-semibold text-[#1a2744]">Notifications</p>
            {unread > 0 && (
              <button onClick={markAllRead} className="flex items-center gap-1 text-xs text-[#f97316] hover:underline">
                <Check className="h-3.5 w-3.5" /> Tout marquer comme lu
              </button>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto">
            {items.length === 0 ? (
              <p className="px-4 py-8 text-center text-sm text-gray-400">Aucune notification pour le moment.</p>
            ) : (
              items.map((n) => (
                <button
                  key={n.id}
                  onClick={() => openItem(n)}
                  className={`flex w-full gap-3 border-b px-4 py-3 text-left transition-colors last:border-0 hover:bg-gray-50 ${n.read_at ? "" : "bg-orange-50/40"}`}
                >
                  <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${KIND_DOT[n.kind] ?? "bg-gray-400"}`} />
                  <span className="min-w-0 flex-1">
                    <span className={`block truncate text-sm ${n.read_at ? "text-gray-600" : "font-semibold text-[#1a2744]"}`}>
                      {n.title}
                    </span>
                    {n.body && <span className="mt-0.5 block line-clamp-2 text-xs text-gray-500">{n.body}</span>}
                    <span className="mt-1 block text-[11px] text-gray-400">{timeAgo(n.created_at)}</span>
                  </span>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
