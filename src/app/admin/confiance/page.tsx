import Link from "next/link"
import { Scale, Wallet, ShieldAlert, AlertTriangle, ScrollText } from "lucide-react"

import { requireAdmin } from "@/lib/admin"
import { createServerClient } from "@/lib/supabase-server"
import { formatFCFA } from "@/lib/formatters"
import { StatCard } from "@/components/app/StatCard"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AdminLitiges, type Litige } from "@/components/app/AdminLitiges"

export const dynamic = "force-dynamic"

const STATUTS_CAUTION: Record<string, string> = {
  held: "retenue",
  partially_released: "partiellement rendue",
  released: "rendue",
  refunded: "remboursée",
}

type Trust = {
  litiges: Litige[]
  creances_contestees: {
    id: string
    montant: number
    etat: string
    type: string
    description: string | null
    client: string | null
    prestataire: string | null
    cree_le: string
  }[]
  cautions: {
    id: string
    montant: number
    libere: number | null
    statut: string
    note: string | null
    maj_le: string
    org: string | null
    org_id: string | null
    locataire: string | null
    bail_statut: string | null
    bail_fin: string | null
    a_regarder: boolean
  }[]
  journal: {
    entite: string
    entite_id: string | null
    action: string
    acteur: string | null
    le: string
    details: Record<string, unknown> | null
  }[]
  compteurs: {
    litiges_ouverts: number
    litiges_total: number
    montant_conteste: number
    cautions_retenues: number
    cautions_a_regarder: number
    incidents_ouverts: number
  }
}

function dateFr(v: string | null) {
  if (!v) return "—"
  return new Date(v).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
}

export default async function AdminConfiancePage() {
  await requireAdmin()

  const supabase = await createServerClient()
  const { data, error } = await supabase.rpc("admin_trust")

  if (error || !data) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="p-6 text-sm text-red-800">
          Lecture impossible : {error?.message ?? "réponse vide"}
        </CardContent>
      </Card>
    )
  }

  const t = data as unknown as Trust

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Confiance &amp; litiges
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Arbitrer ce que deux personnes se doivent, et surveiller ce qui n&apos;a pas
          bougé depuis trop longtemps.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Litiges à arbitrer"
          value={String(t.compteurs.litiges_ouverts)}
          icon={Scale}
          tone={t.compteurs.litiges_ouverts > 0 ? "orange" : "navy"}
          hint={`${t.compteurs.litiges_total} depuis l'origine`}
        />
        <StatCard
          label="Sommes contestées"
          value={formatFCFA(t.compteurs.montant_conteste)}
          icon={ShieldAlert}
          tone={t.compteurs.montant_conteste > 0 ? "red" : "navy"}
          hint="créances suspendues, pas des fonds détenus"
        />
        <StatCard
          label="Cautions retenues"
          value={formatFCFA(t.compteurs.cautions_retenues)}
          icon={Wallet}
          tone="blue"
          hint={`${t.compteurs.cautions_a_regarder} à regarder`}
        />
        <StatCard
          label="Incidents ouverts"
          value={String(t.compteurs.incidents_ouverts)}
          icon={AlertTriangle}
          tone={t.compteurs.incidents_ouverts > 0 ? "orange" : "navy"}
        />
      </div>

      <Card className="border-slate-200 bg-slate-50">
        <CardContent className="p-5 text-sm text-slate-600">
          Locawave ne détient jamais de fonds. Trancher un litige, c&apos;est dire si la
          somme reste due entre les parties — ce n&apos;est pas rendre de l&apos;argent.
          L&apos;état affiché est celui d&apos;une créance : exigible, contestée, réglée ou
          annulée.
        </CardContent>
      </Card>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          Litiges
        </h2>
        <AdminLitiges litiges={t.litiges} />
      </section>

      {t.creances_contestees.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            Créances suspendues par un litige
          </h2>
          <Card>
            <CardContent className="p-5">
              <ul className="space-y-2">
                {t.creances_contestees.map((c) => (
                  <li key={c.id} className="flex items-center justify-between text-sm">
                    <span className="text-slate-700">
                      {c.description ?? c.type} — {c.client ?? "?"} / {c.prestataire ?? "?"}
                    </span>
                    <span className="font-medium">{formatFCFA(c.montant)}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </section>
      )}

      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          Cautions
        </h2>
        {t.cautions.length === 0 ? (
          <Card>
            <CardContent className="p-10 text-center text-sm text-slate-500">
              Aucune caution enregistrée.
            </CardContent>
          </Card>
        ) : (
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-sm">
                <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-4 py-3 font-medium">Locataire</th>
                    <th className="px-4 py-3 font-medium">Organisation</th>
                    <th className="px-4 py-3 font-medium">État</th>
                    <th className="px-4 py-3 font-medium">Bail</th>
                    <th className="px-4 py-3 text-right font-medium">Montant</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {t.cautions.map((c) => (
                    <tr key={c.id} className={c.a_regarder ? "bg-amber-50" : ""}>
                      <td className="px-4 py-3 text-slate-800">{c.locataire ?? "—"}</td>
                      <td className="px-4 py-3">
                        {c.org_id ? (
                          <Link
                            href={`/admin/organisations/${c.org_id}`}
                            className="text-slate-700 hover:underline"
                          >
                            {c.org}
                          </Link>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant="outline">
                          {STATUTS_CAUTION[c.statut] ?? c.statut}
                        </Badge>
                        {c.a_regarder && (
                          <div className="mt-1 text-xs text-amber-700">
                            retenue alors que le bail n&apos;est plus actif
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {c.bail_statut ?? "—"}
                        {c.bail_fin && ` · fin ${dateFr(c.bail_fin)}`}
                      </td>
                      <td className="px-4 py-3 text-right font-medium text-slate-900">
                        {formatFCFA(c.montant)}
                        {c.libere ? (
                          <div className="text-xs text-slate-500">
                            {formatFCFA(c.libere)} rendus
                          </div>
                        ) : null}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}
        <p className="text-xs text-slate-400">
          Les cautions se pilotent depuis la fiche du bail, par le propriétaire. La console
          les regarde et signale ce qui cloche — elle ne décide pas à sa place.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-slate-500">
          <ScrollText className="h-4 w-4" />
          Journal métier
        </h2>
        <Card>
          <CardContent className="p-5">
            {t.journal.length === 0 ? (
              <p className="text-sm text-slate-500">Aucune trace.</p>
            ) : (
              <ul className="space-y-2">
                {t.journal.map((j, i) => (
                  <li
                    key={i}
                    className="flex flex-wrap items-baseline justify-between gap-2 border-b border-slate-100 pb-2 text-sm last:border-0"
                  >
                    <span className="text-slate-700">
                      <span className="font-medium">{j.entite}</span> · {j.action}
                      {j.acteur && <span className="text-slate-500"> par {j.acteur}</span>}
                    </span>
                    <span className="text-xs text-slate-400">
                      {new Date(j.le).toLocaleString("fr-FR", {
                        dateStyle: "short",
                        timeStyle: "short",
                      })}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  )
}
