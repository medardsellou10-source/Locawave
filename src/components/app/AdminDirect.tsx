"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import Link from "next/link"
import {
  AlertTriangle,
  Scale,
  Star,
  UserPlus,
  ShieldCheck,
  FileText,
  Wallet,
  CreditCard,
  Radio,
  Check,
} from "lucide-react"
import { toast } from "sonner"

import { createClient } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

/**
 * Le flux en direct.
 *
 * La console écoute une seule table, admin_events, alimentée par des triggers.
 * S'abonner aux tables métier ne donnerait rien : Realtime respecte la RLS, et
 * l'administrateur les lit par des fonctions, pas par des policies.
 *
 * Un événement qui arrive s'insère en tête sans rechargement, et un incident
 * urgent ou un litige lève une alerte visible même si l'onglet est ailleurs.
 */

export type Evenement = {
  id: string
  at: string
  type: string
  severite: "info" | "attention" | "urgent"
  titre: string
  detail: string | null
  org_id: string | null
  org_nom: string | null
  acteur_id: string | null
  acteur_nom: string | null
  cible_type: string | null
  cible_id: string | null
  lu_at: string | null
}

const ICONES: Record<string, typeof AlertTriangle> = {
  "incident.nouveau": AlertTriangle,
  "litige.ouvert": Scale,
  "avis.depose": Star,
  "compte.nouveau": UserPlus,
  "kyc.depose": ShieldCheck,
  "candidature.recue": FileText,
  "paiement.recu": Wallet,
  "abonnement.paye": CreditCard,
}

const TONS: Record<string, string> = {
  urgent: "border-red-200 bg-red-50",
  attention: "border-amber-200 bg-amber-50",
  info: "border-slate-200 bg-white",
}

const PASTILLES: Record<string, string> = {
  urgent: "bg-red-100 text-red-700",
  attention: "bg-amber-100 text-amber-700",
  info: "bg-slate-100 text-slate-600",
}

function quand(v: string) {
  const d = new Date(v)
  const secondes = Math.floor((Date.now() - d.getTime()) / 1000)
  if (secondes < 60) return "à l'instant"
  if (secondes < 3600) return `il y a ${Math.floor(secondes / 60)} min`
  if (secondes < 86400) return `il y a ${Math.floor(secondes / 3600)} h`
  return d.toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "short" })
}

/** Là où l'événement se traite, quand on sait où c'est. */
function lienUtile(e: Evenement) {
  if (e.type === "compte.nouveau" || e.type === "kyc.depose") {
    return e.cible_id ? `/admin/comptes/${e.cible_id}` : null
  }
  if (e.type === "litige.ouvert") return "/admin/confiance"
  if (e.type === "avis.depose" || e.type === "candidature.recue") return "/admin/moderation"
  if (e.type === "paiement.recu") return "/admin/finances"
  if (e.type === "abonnement.paye" && e.org_id) return `/admin/organisations/${e.org_id}`
  return null
}

export function AdminDirect({
  initiaux,
  nonLus,
}: {
  initiaux: Evenement[]
  nonLus: number
}) {
  const supabase = createClient()
  const [evenements, setEvenements] = useState<Evenement[]>(initiaux)
  const [compteur, setCompteur] = useState(nonLus)
  const [connecte, setConnecte] = useState(false)
  const titreOriginal = useRef<string>("")

  useEffect(() => {
    // Capturé une seule fois, et débarrassé d'un éventuel compteur : en
    // développement React rejoue les effets, et sans cette précaution le titre
    // devenait « (1) (1) Console… ».
    if (!titreOriginal.current) {
      titreOriginal.current = document.title.replace(/^\(\d+\)\s*/, "")
    }
  }, [])

  // Le nombre non lu passe dans le titre de l'onglet : on le voit sans revenir
  // sur la page.
  useEffect(() => {
    if (!titreOriginal.current) return
    document.title = compteur > 0 ? `(${compteur}) ${titreOriginal.current}` : titreOriginal.current
  }, [compteur])

  useEffect(() => {
    const canal = supabase
      .channel("admin-direct")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "admin_events" },
        (charge) => {
          const e = charge.new as Evenement
          setEvenements((liste) => [e, ...liste].slice(0, 100))
          setCompteur((n) => n + 1)
          if (e.severite === "urgent") {
            toast.error(e.titre, { description: e.detail ?? undefined, duration: 10000 })
          } else if (e.severite === "attention") {
            toast.warning(e.titre, { description: e.detail ?? undefined })
          } else {
            toast(e.titre, { description: e.detail ?? undefined })
          }
        }
      )
      .subscribe((statut) => setConnecte(statut === "SUBSCRIBED"))

    return () => {
      supabase.removeChannel(canal)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const toutMarquer = useCallback(async () => {
    const { error } = await supabase.rpc("admin_events_mark_read", { p_id: undefined })
    if (error) {
      toast.error("Impossible de marquer comme lu.")
      return
    }
    const maintenant = new Date().toISOString()
    setEvenements((liste) => liste.map((e) => ({ ...e, lu_at: e.lu_at ?? maintenant })))
    setCompteur(0)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm">
          <span
            className={`flex h-2.5 w-2.5 rounded-full ${
              connecte ? "animate-pulse bg-green-500" : "bg-slate-300"
            }`}
          />
          <span className={connecte ? "text-green-700" : "text-slate-500"}>
            {connecte ? "En écoute — les événements arrivent tout seuls" : "Connexion…"}
          </span>
        </div>
        {compteur > 0 && (
          <Button variant="outline" size="sm" onClick={toutMarquer}>
            <Check className="mr-2 h-4 w-4" />
            Tout marquer comme lu ({compteur})
          </Button>
        )}
      </div>

      {evenements.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Radio className="mx-auto mb-3 h-8 w-8 text-slate-300" />
            <p className="text-sm text-slate-500">
              Rien pour l&apos;instant. Le premier signalement, avis ou compte créé
              apparaîtra ici sans que tu aies à rafraîchir.
            </p>
          </CardContent>
        </Card>
      ) : (
        <ul className="space-y-2">
          {evenements.map((e) => {
            const Icone = ICONES[e.type] ?? Radio
            const lien = lienUtile(e)
            const corps = (
              <div className="flex items-start gap-3">
                <span
                  className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                    PASTILLES[e.severite]
                  }`}
                >
                  <Icone className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <p className="font-medium text-slate-900">{e.titre}</p>
                    <span className="text-xs text-slate-400">{quand(e.at)}</span>
                  </div>
                  {e.detail && (
                    <p className="mt-0.5 line-clamp-2 text-sm text-slate-600">{e.detail}</p>
                  )}
                  <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                    <Badge variant="outline" className="font-mono text-[11px]">
                      {e.type}
                    </Badge>
                    {e.acteur_nom && <span>{e.acteur_nom}</span>}
                    {e.org_nom && <span>· {e.org_nom}</span>}
                    {!e.lu_at && (
                      <span className="rounded-full bg-blue-100 px-2 text-[11px] text-blue-700">
                        nouveau
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )

            return (
              <li key={e.id}>
                <Card className={TONS[e.severite]}>
                  <CardContent className="p-4">
                    {lien ? (
                      <Link href={lien} className="block hover:opacity-80">
                        {corps}
                      </Link>
                    ) : (
                      corps
                    )}
                  </CardContent>
                </Card>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
