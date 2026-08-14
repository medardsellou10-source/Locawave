"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2, Copy, UserPlus, Link2 } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"

/**
 * Inviter quelqu'un dans la console.
 *
 * Le lien produit vaut accès : il n'est affiché qu'une fois, ne repasse jamais
 * par le serveur, et la base n'en garde que l'empreinte. Perdu, il ne se
 * retrouve pas — on en refait un.
 */

export type Invitation = {
  id: string
  email: string | null
  note: string | null
  creee_le: string
  creee_par: string | null
  expire_le: string
  utilisee_le: string | null
  utilisee_par: string | null
  revoquee_le: string | null
  etat: "en_attente" | "utilisee" | "revoquee" | "expiree"
}

const ETATS: Record<string, { label: string; classe: string }> = {
  en_attente: { label: "en attente", classe: "bg-blue-100 text-blue-700 hover:bg-blue-100" },
  utilisee: { label: "utilisée", classe: "bg-green-100 text-green-700 hover:bg-green-100" },
  revoquee: { label: "révoquée", classe: "bg-slate-100 text-slate-600 hover:bg-slate-100" },
  expiree: { label: "expirée", classe: "bg-slate-100 text-slate-600 hover:bg-slate-100" },
}

const DUREES = [
  { value: 24, label: "24 heures" },
  { value: 48, label: "48 heures" },
  { value: 168, label: "7 jours" },
  { value: 720, label: "30 jours" },
]

function dateFr(v: string | null) {
  if (!v) return "—"
  return new Date(v).toLocaleString("fr-FR", { dateStyle: "medium", timeStyle: "short" })
}

export function AdminInvitations({
  invitations,
  jeSuisSuper,
}: {
  invitations: Invitation[]
  jeSuisSuper: boolean
}) {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [heures, setHeures] = useState(48)
  const [note, setNote] = useState("")
  const [enCours, setEnCours] = useState<string | null>(null)
  const [lien, setLien] = useState<string | null>(null)

  async function inviter() {
    setEnCours("creation")
    try {
      const res = await fetch("/api/admin/invitations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "creer",
          email: email.trim() || undefined,
          heures,
          note: note.trim() || undefined,
        }),
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) {
        toast.error(json.error ?? "La création a échoué.")
        return
      }
      setLien(json.lien)
      setEmail("")
      setNote("")
      toast.success("Invitation créée. Copie le lien : il ne sera plus affiché.")
      router.refresh()
    } catch {
      toast.error("Le serveur n'a pas répondu.")
    } finally {
      setEnCours(null)
    }
  }

  async function revoquer(id: string) {
    if (!confirm("Révoquer cette invitation ? Le lien cessera immédiatement de valoir accès."))
      return
    setEnCours(id)
    try {
      const res = await fetch("/api/admin/invitations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "revoquer", id }),
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) {
        toast.error(json.error ?? "La révocation a échoué.")
        return
      }
      toast.success(json.message ?? "C'est fait.")
      router.refresh()
    } catch {
      toast.error("Le serveur n'a pas répondu.")
    } finally {
      setEnCours(null)
    }
  }

  return (
    <section className="space-y-3">
      <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-slate-500">
        <UserPlus className="h-4 w-4" />
        Inviter un administrateur
      </h2>

      {jeSuisSuper ? (
        <Card>
          <CardContent className="space-y-4 p-5">
            <p className="text-sm text-slate-600">
              Le lien produit vaut accès à toute la plateforme. Il ne sert qu&apos;une fois,
              expire seul, et la personne devra être connectée à son compte pour
              l&apos;utiliser — c&apos;est ainsi qu&apos;on sait exactement à qui l&apos;accès
              est donné.
            </p>

            <div className="flex flex-wrap items-end gap-3">
              <div className="min-w-[220px] flex-1">
                <label className="mb-1 block text-xs text-slate-500">
                  Email de la personne (recommandé)
                </label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="son.email@exemple.sn"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-slate-500">Valable</label>
                <select
                  value={heures}
                  onChange={(e) => setHeures(Number(e.target.value))}
                  className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-700"
                >
                  {DUREES.map((d) => (
                    <option key={d.value} value={d.value}>
                      {d.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="min-w-[180px] flex-1">
                <label className="mb-1 block text-xs text-slate-500">Note (facultative)</label>
                <Input
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Pourquoi cet accès"
                />
              </div>
              <Button disabled={enCours !== null} onClick={inviter}>
                {enCours === "creation" && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Créer l&apos;invitation
              </Button>
            </div>

            <p className="text-xs text-slate-400">
              Sans email, le lien fonctionne pour la première personne connectée qui
              l&apos;ouvre. Avec email, il est verrouillé sur cette adresse — même
              intercepté, il ne sert à personne d&apos;autre.
            </p>

            {lien && (
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
                <p className="flex items-center gap-1.5 text-xs font-medium text-amber-900">
                  <Link2 className="h-3.5 w-3.5" />
                  Lien d&apos;invitation — affiché une seule fois
                </p>
                <div className="mt-2 flex items-center gap-2">
                  <code className="flex-1 overflow-x-auto whitespace-nowrap rounded bg-white px-2 py-1 text-xs text-slate-700">
                    {lien}
                  </code>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      navigator.clipboard.writeText(lien)
                      toast.success("Lien copié.")
                    }}
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </Button>
                </div>
                <p className="mt-2 text-xs text-amber-800">
                  Transmets-le par un canal sûr. Si tu le perds, révoque cette invitation
                  et crées-en une autre.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-5 text-sm text-slate-600">
            Inviter un administrateur est réservé au super-admin.
          </CardContent>
        </Card>
      )}

      {invitations.length > 0 && (
        <Card>
          <CardContent className="p-5">
            <ul className="space-y-3">
              {invitations.map((i) => {
                const e = ETATS[i.etat] ?? { label: i.etat, classe: "" }
                return (
                  <li
                    key={i.id}
                    className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3 last:border-0 last:pb-0"
                  >
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-medium text-slate-900">
                          {i.email ?? "lien ouvert (sans email)"}
                        </span>
                        <Badge className={e.classe}>{e.label}</Badge>
                      </div>
                      <p className="text-xs text-slate-500">
                        créée le {dateFr(i.creee_le)}
                        {i.creee_par ? ` par ${i.creee_par}` : ""} · expire le{" "}
                        {dateFr(i.expire_le)}
                        {i.utilisee_le &&
                          ` · utilisée le ${dateFr(i.utilisee_le)} par ${i.utilisee_par ?? "?"}`}
                      </p>
                      {i.note && <p className="text-xs text-slate-400">{i.note}</p>}
                    </div>
                    {jeSuisSuper && i.etat === "en_attente" && (
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={enCours !== null}
                        onClick={() => revoquer(i.id)}
                      >
                        {enCours === i.id && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Révoquer
                      </Button>
                    )}
                  </li>
                )
              })}
            </ul>
          </CardContent>
        </Card>
      )}
    </section>
  )
}
