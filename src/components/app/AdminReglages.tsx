"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Loader2, Lock, ShieldPlus } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

/**
 * Les interrupteurs de la plateforme et la liste des administrateurs.
 *
 * Chaque interrupteur dit ce qu'il coupe réellement — un réglage dont on ne sait
 * pas ce qu'il fait ne sera jamais actionné, ou le sera à tort.
 */

export type Reglage = {
  cle: string
  libelle: string
  description: string | null
  actif: boolean
  message: string | null
  modifie_le: string
  modifie_par: string | null
}

export type Administrateur = {
  id: string
  nom: string | null
  email: string | null
  super: boolean
  note: string | null
  nomme_le: string
  nomme_par: string | null
  revoque_le: string | null
}

/** Ce que chaque interrupteur coupe, en clair. */
const EFFETS: Record<string, string> = {
  maintenance_mode:
    "Affiche une page de maintenance à tout le monde, sauf aux administrateurs, qui continuent de naviguer normalement.",
  signups_open: "Bloque la création de nouveaux comptes. Les comptes existants ne sont pas touchés.",
  listings_public:
    "Retire la marketplace aux visiteurs non connectés. Les propriétaires gardent leurs annonces.",
  whatsapp_reminders:
    "Empêche les deux tâches planifiées d'envoyer le moindre rappel de loyer, à la source.",
  psp_enabled: "Empêche la génération de nouveaux liens de paiement Wave / Orange Money.",
}

function dateFr(v: string | null) {
  if (!v) return "—"
  return new Date(v).toLocaleString("fr-FR", { dateStyle: "long", timeStyle: "short" })
}

export function AdminReglages({
  reglages,
  administrateurs,
  jeSuisSuper,
}: {
  reglages: Reglage[]
  administrateurs: Administrateur[]
  jeSuisSuper: boolean
}) {
  const router = useRouter()
  const [enCours, setEnCours] = useState<string | null>(null)

  async function basculer(r: Reglage) {
    const nouvelEtat = !r.actif
    if (r.cle === "maintenance_mode" && nouvelEtat) {
      if (
        !confirm(
          "Activer le mode maintenance ? Plus personne ne pourra utiliser l'application, sauf les administrateurs."
        )
      )
        return
    }
    setEnCours(r.cle)
    try {
      const res = await fetch("/api/admin/reglages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cle: r.cle, actif: nouvelEtat }),
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) {
        toast.error(json.error ?? "L'action a échoué.")
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

  // Pour tous les réglages, « désactivé » est l'état inhabituel — sauf pour la
  // maintenance, où c'est l'inverse : la voir allumée doit sauter aux yeux.
  const inhabituel = (r: Reglage) =>
    r.cle === "maintenance_mode" ? r.actif : !r.actif

  const actifs = administrateurs.filter((a) => !a.revoque_le)
  const anciens = administrateurs.filter((a) => a.revoque_le)

  return (
    <div className="space-y-6">
      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          Interrupteurs
        </h2>
        {reglages.map((r) => (
          <Card key={r.cle} className={inhabituel(r) ? "border-amber-300 bg-amber-50" : ""}>
            <CardContent className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-medium text-slate-900">{r.libelle}</span>
                  <Badge
                    className={
                      inhabituel(r)
                        ? "bg-amber-100 text-amber-700 hover:bg-amber-100"
                        : "bg-green-100 text-green-700 hover:bg-green-100"
                    }
                  >
                    {r.actif ? "actif" : "désactivé"}
                  </Badge>
                  {r.cle === "maintenance_mode" && !jeSuisSuper && (
                    <Badge variant="outline" className="text-slate-500">
                      super-admin requis
                    </Badge>
                  )}
                </div>
                <p className="mt-1 text-sm text-slate-600">{r.description}</p>
                <p className="mt-1 text-xs text-slate-400">
                  {r.cle === "maintenance_mode" ? "Quand il est actif : " : "Quand il est fermé : "}
                  {EFFETS[r.cle] ?? "—"}
                </p>
                {r.modifie_par && (
                  <p className="mt-1 text-xs text-slate-400">
                    Dernière modification : {r.modifie_par}, {dateFr(r.modifie_le)}
                  </p>
                )}
              </div>
              <Button
                variant={r.actif ? "outline" : "default"}
                disabled={enCours !== null || (r.cle === "maintenance_mode" && !jeSuisSuper)}
                onClick={() => basculer(r)}
              >
                {enCours === r.cle && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {r.actif ? "Désactiver" : "Activer"}
              </Button>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="space-y-3">
        <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-slate-500">
          <Lock className="h-4 w-4" />
          Qui a accès à cette console
        </h2>
        <Card>
          <CardContent className="p-5">
            <ul className="space-y-3">
              {actifs.map((a) => (
                <li key={a.id} className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <Link
                      href={`/admin/comptes/${a.id}`}
                      className="font-medium text-slate-900 hover:underline"
                    >
                      {a.nom ?? a.email}
                    </Link>
                    <p className="text-xs text-slate-500">
                      {a.email} · nommé le {dateFr(a.nomme_le)}
                      {a.nomme_par ? ` par ${a.nomme_par}` : ""}
                    </p>
                    {a.note && <p className="text-xs text-slate-400">{a.note}</p>}
                  </div>
                  {a.super ? (
                    <Badge className="bg-[#0f172a] text-white hover:bg-[#0f172a]">
                      <ShieldPlus className="mr-1 h-3 w-3" />
                      Super-admin
                    </Badge>
                  ) : (
                    <Badge variant="outline">Admin</Badge>
                  )}
                </li>
              ))}
            </ul>

            {anciens.length > 0 && (
              <div className="mt-4 border-t border-slate-100 pt-4">
                <p className="mb-2 text-xs uppercase tracking-wide text-slate-400">
                  Accès révoqués
                </p>
                <ul className="space-y-1">
                  {anciens.map((a) => (
                    <li key={a.id} className="text-sm text-slate-500">
                      {a.nom ?? a.email} — révoqué le {dateFr(a.revoque_le)}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <p className="mt-4 text-xs text-slate-400">
              Nommer ou révoquer un administrateur se fait depuis la fiche du compte
              concerné, et seulement par un super-admin. Cette liste est le miroir de la
              table qui fait autorité — aucune autre condition n&apos;ouvre la console.
            </p>
          </CardContent>
        </Card>
      </section>
    </div>
  )
}
