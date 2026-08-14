"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Loader2, Gavel, Scale } from "lucide-react"
import { toast } from "sonner"

import { formatFCFA } from "@/lib/formatters"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"

/**
 * L'arbitrage des litiges. Quatre décisions, une seule question de fond : la
 * somme reste-t-elle due ? Locawave ne détient pas de fonds — trancher, c'est
 * dire ce que les parties se doivent, pas rendre de l'argent.
 */

export type Litige = {
  id: string
  statut: string
  motif: string
  description: string | null
  montant_gele: number
  ouvert_par: string | null
  ouvert_par_id: string | null
  contre: string | null
  contre_id: string | null
  org: string | null
  org_id: string | null
  mission_id: string | null
  mission_montant: number | null
  mission_etat_paiement: string | null
  issue: string | null
  resolution: string | null
  resolu_par: string | null
  ouvert_le: string
  resolu_le: string | null
  echeance_contestation: string | null
}

const STATUTS: Record<string, { label: string; classe: string }> = {
  open: { label: "Ouvert", classe: "bg-amber-100 text-amber-700 hover:bg-amber-100" },
  under_review: { label: "En examen", classe: "bg-blue-100 text-blue-700 hover:bg-blue-100" },
  resolved: { label: "Tranché", classe: "bg-green-100 text-green-700 hover:bg-green-100" },
  rejected: { label: "Rejeté", classe: "bg-slate-100 text-slate-600 hover:bg-slate-100" },
  cancelled: { label: "Annulé", classe: "bg-slate-100 text-slate-600 hover:bg-slate-100" },
}

const ETATS_PAIEMENT: Record<string, string> = {
  not_due: "pas encore exigible",
  due: "exigible",
  disputed: "contestée",
  settled: "réglée",
  cancelled: "annulée",
}

function dateFr(v: string | null) {
  if (!v) return "—"
  return new Date(v).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  })
}

export function AdminLitiges({ litiges }: { litiges: Litige[] }) {
  const router = useRouter()
  const [ouvert, setOuvert] = useState<string | null>(null)
  const [motivation, setMotivation] = useState("")
  const [enCours, setEnCours] = useState<string | null>(null)

  async function trancher(id: string, decision: string) {
    if (decision !== "examiner" && !motivation.trim()) {
      toast.error("Écris d'abord la motivation : les deux parties la liront.")
      return
    }
    setEnCours(decision)
    try {
      const res = await fetch("/api/admin/litiges", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, decision, resolution: motivation.trim() || undefined }),
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) {
        toast.error(json.error ?? "L'action a échoué.")
        return
      }
      toast.success(json.message ?? "C'est fait.")
      setOuvert(null)
      setMotivation("")
      router.refresh()
    } catch {
      toast.error("Le serveur n'a pas répondu.")
    } finally {
      setEnCours(null)
    }
  }

  if (litiges.length === 0) {
    return (
      <Card>
        <CardContent className="p-10 text-center text-sm text-slate-500">
          Aucun litige. Rien à arbitrer.
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-3">
      {litiges.map((l) => {
        const s = STATUTS[l.statut] ?? { label: l.statut, classe: "" }
        const encoreOuvert = l.statut === "open" || l.statut === "under_review"
        const deplie = ouvert === l.id

        return (
          <Card key={l.id} className={encoreOuvert ? "border-amber-200" : ""}>
            <CardContent className="space-y-3 p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Scale className="h-4 w-4 text-slate-400" />
                    <span className="font-medium text-slate-900">{l.motif}</span>
                    <Badge className={s.classe}>{s.label}</Badge>
                  </div>
                  <p className="mt-1 text-sm text-slate-500">
                    {l.ouvert_par_id ? (
                      <Link href={`/admin/comptes/${l.ouvert_par_id}`} className="hover:underline">
                        {l.ouvert_par}
                      </Link>
                    ) : (
                      l.ouvert_par
                    )}
                    {l.contre && (
                      <>
                        {" contre "}
                        {l.contre_id ? (
                          <Link href={`/admin/comptes/${l.contre_id}`} className="hover:underline">
                            {l.contre}
                          </Link>
                        ) : (
                          l.contre
                        )}
                      </>
                    )}
                    {" · ouvert le "}
                    {dateFr(l.ouvert_le)}
                    {l.org && " · "}
                    {l.org_id && (
                      <Link href={`/admin/organisations/${l.org_id}`} className="hover:underline">
                        {l.org}
                      </Link>
                    )}
                  </p>
                </div>
                {l.mission_montant !== null && (
                  <div className="text-right">
                    <p className="font-medium text-slate-900">{formatFCFA(l.mission_montant)}</p>
                    <p className="text-xs text-slate-500">
                      créance {ETATS_PAIEMENT[l.mission_etat_paiement ?? ""] ?? "—"}
                    </p>
                  </div>
                )}
              </div>

              {l.description && (
                <p className="rounded-lg bg-slate-50 p-3 text-sm text-slate-700">
                  {l.description}
                </p>
              )}

              {l.resolution && (
                <div className="rounded-lg border-l-2 border-slate-300 bg-slate-50 p-3">
                  <p className="text-sm text-slate-800">{l.resolution}</p>
                  <p className="mt-1 text-xs text-slate-400">
                    {l.resolu_par ?? "—"} · {dateFr(l.resolu_le)}
                    {l.issue &&
                      ` · issue : ${l.issue === "release" ? "somme due" : "somme annulée"}`}
                  </p>
                </div>
              )}

              {encoreOuvert &&
                (deplie ? (
                  <div className="space-y-3 rounded-lg border border-slate-200 p-3">
                    <div>
                      <label className="mb-1 block text-sm font-medium text-slate-700">
                        Motivation de la décision
                      </label>
                      <p className="mb-2 text-xs text-slate-500">
                        Les deux parties la liront. Sans elle, la décision est refusée.
                      </p>
                      <Textarea
                        value={motivation}
                        onChange={(e) => setMotivation(e.target.value)}
                        rows={3}
                        placeholder="Ce qui a été constaté, et ce qui est décidé."
                      />
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        size="sm"
                        disabled={enCours !== null}
                        onClick={() => trancher(l.id, "somme_due")}
                      >
                        {enCours === "somme_due" && (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        La somme reste due
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        disabled={enCours !== null}
                        onClick={() => trancher(l.id, "somme_annulee")}
                      >
                        {enCours === "somme_annulee" && (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        La somme n&apos;est plus due
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={enCours !== null}
                        onClick={() => trancher(l.id, "rejeter")}
                      >
                        Rejeter (non fondé)
                      </Button>
                      {l.statut === "open" && (
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={enCours !== null}
                          onClick={() => trancher(l.id, "examiner")}
                        >
                          Mettre en examen
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setOuvert(null)
                          setMotivation("")
                        }}
                      >
                        Annuler
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setOuvert(l.id)
                      setMotivation("")
                    }}
                  >
                    <Gavel className="mr-2 h-4 w-4" />
                    Trancher
                  </Button>
                ))}
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
