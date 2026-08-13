import Link from "next/link"
import {
  Wallet,
  TrendingDown,
  Receipt,
  Percent,
  Search,
  Download,
  Link2,
} from "lucide-react"

import { requireAdmin } from "@/lib/admin"
import { createServerClient } from "@/lib/supabase-server"
import { formatFCFA } from "@/lib/formatters"
import { StatCard } from "@/components/app/StatCard"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export const dynamic = "force-dynamic"

const PAR_PAGE = 50

const METHODES: Record<string, string> = {
  cash: "Espèces",
  wave: "Wave",
  orange_money: "Orange Money",
  psp: "Lien de paiement",
}

const TRANCHES: Record<string, string> = {
  "1_moins_30j": "moins de 30 jours",
  "2_31_60j": "31 à 60 jours",
  "3_61_90j": "61 à 90 jours",
  "4_plus_90j": "plus de 90 jours",
}

type Finances = {
  periode: { du: string; au: string }
  encaisse: {
    total: number
    nombre: number
    par_methode: Record<string, number>
    par_mois: { mois: string; montant: number; nombre: number }[]
    via_psp: number
  }
  attendu: { total: number; regle: number; nombre: number }
  impayes: { total: number; nombre: number; par_anciennete: Record<string, number> }
  quittances: { emises: number; avec_pdf: number; envoyees: number }
  revenus_locawave: {
    commissions: number
    commissions_nb: number
    commissions_par_source: Record<string, number>
    abonnements: number
    abonnements_attente: number
  }
  par_organisation: { id: string; nom: string; encaisse: number; impayes: number }[]
}

function jourMois(v: string) {
  const [a, m] = v.split("-")
  const noms = [
    "janv.", "févr.", "mars", "avr.", "mai", "juin",
    "juil.", "août", "sept.", "oct.", "nov.", "déc.",
  ]
  return `${noms[Number(m) - 1]} ${a}`
}

export default async function AdminFinancesPage({
  searchParams,
}: {
  searchParams: Promise<{
    du?: string
    au?: string
    q?: string
    methode?: string
    page?: string
  }>
}) {
  await requireAdmin()
  const sp = await searchParams

  const auDefaut = new Date().toISOString().slice(0, 10)
  const duDefaut = new Date(Date.now() - 365 * 86400_000).toISOString().slice(0, 10)
  const du = sp.du || duDefaut
  const au = sp.au || auDefaut
  const q = sp.q?.trim() ?? ""
  const methode = sp.methode ?? ""
  const page = Math.max(1, Number(sp.page) || 1)

  const supabase = await createServerClient()
  const [{ data: synth, error: errSynth }, { data: lignes, error: errLignes }] =
    await Promise.all([
      supabase.rpc("admin_finances", { p_du: du, p_au: au }),
      supabase.rpc("admin_payments", {
        p_search: q || null,
        p_methode: methode || null,
        p_du: du,
        p_au: au,
        p_limit: PAR_PAGE,
        p_offset: (page - 1) * PAR_PAGE,
      }),
    ])

  if (errSynth || !synth) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="p-6 text-sm text-red-800">
          Lecture impossible : {errSynth?.message ?? "réponse vide"}
        </CardContent>
      </Card>
    )
  }

  const f = synth as unknown as Finances
  const reglements = lignes ?? []
  const totalLignes = reglements.length > 0 ? Number(reglements[0].total) : 0
  const pages = Math.max(1, Math.ceil(totalLignes / PAR_PAGE))

  const recouvrement =
    f.attendu.total > 0 ? Math.round((f.attendu.regle / f.attendu.total) * 100) : 0
  const revenus = f.revenus_locawave.commissions + f.revenus_locawave.abonnements
  const maxMois = Math.max(1, ...f.encaisse.par_mois.map((m) => m.montant))

  const params = (extra: Record<string, string>) => {
    const p = new URLSearchParams()
    p.set("du", du)
    p.set("au", au)
    if (q) p.set("q", q)
    if (methode) p.set("methode", methode)
    Object.entries(extra).forEach(([k, v]) => (v ? p.set(k, v) : p.delete(k)))
    return p.toString()
  }

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Finances</h1>
          <p className="mt-1 text-sm text-slate-500">
            Tous les règlements de la plateforme, toutes organisations confondues.
          </p>
        </div>
        <Link href={`/api/admin/finances/export?${params({})}`}>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Exporter en CSV
          </Button>
        </Link>
      </header>

      {/* Période */}
      <Card>
        <CardContent className="p-4">
          <form method="get" className="flex flex-wrap items-end gap-3">
            <div>
              <label className="mb-1 block text-xs text-slate-500">Du</label>
              <Input type="date" name="du" defaultValue={du} className="w-auto" />
            </div>
            <div>
              <label className="mb-1 block text-xs text-slate-500">Au</label>
              <Input type="date" name="au" defaultValue={au} className="w-auto" />
            </div>
            <div className="min-w-[200px] flex-1">
              <label className="mb-1 block text-xs text-slate-500">Recherche</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  name="q"
                  defaultValue={q}
                  placeholder="Organisation, locataire, bien, référence, quittance…"
                  className="pl-9"
                />
              </div>
            </div>
            <div>
              <label className="mb-1 block text-xs text-slate-500">Méthode</label>
              <select
                name="methode"
                defaultValue={methode}
                className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-700"
              >
                <option value="">Toutes</option>
                {Object.entries(METHODES).map(([v, l]) => (
                  <option key={v} value={v}>
                    {l}
                  </option>
                ))}
              </select>
            </div>
            <Button type="submit">Appliquer</Button>
          </form>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Loyers encaissés"
          value={formatFCFA(f.encaisse.total)}
          icon={Wallet}
          tone="green"
          hint={`${f.encaisse.nombre} règlement${f.encaisse.nombre > 1 ? "s" : ""} sur la période`}
        />
        <StatCard
          label="Taux de recouvrement"
          value={`${recouvrement} %`}
          icon={Percent}
          tone={recouvrement >= 80 ? "green" : recouvrement >= 50 ? "orange" : "red"}
          progress={recouvrement}
          hint={`${formatFCFA(f.attendu.regle)} réglés sur ${formatFCFA(f.attendu.total)} dus`}
        />
        <StatCard
          label="Impayés échus"
          value={formatFCFA(f.impayes.total)}
          icon={TrendingDown}
          tone={f.impayes.total > 0 ? "red" : "navy"}
          hint={`${f.impayes.nombre} échéance${f.impayes.nombre > 1 ? "s" : ""}, à aujourd'hui`}
        />
        <StatCard
          label="Revenus Locawave"
          value={formatFCFA(revenus)}
          icon={Percent}
          tone="indigo"
          hint={`${formatFCFA(f.revenus_locawave.abonnements)} d'abonnements + ${formatFCFA(f.revenus_locawave.commissions)} de commissions`}
        />
      </div>

      {/* Encaissements par mois */}
      {f.encaisse.par_mois.length > 0 && (
        <Card>
          <CardContent className="p-5">
            <h2 className="pb-4 font-semibold text-slate-800">Encaissements par mois</h2>
            <div className="space-y-2">
              {f.encaisse.par_mois.map((m) => (
                <div key={m.mois} className="flex items-center gap-3">
                  <span className="w-24 shrink-0 text-sm text-slate-500">
                    {jourMois(m.mois)}
                  </span>
                  <div className="h-6 flex-1 overflow-hidden rounded bg-slate-100">
                    <div
                      className="h-full rounded bg-[#1a2744]"
                      style={{ width: `${Math.max(2, (m.montant / maxMois) * 100)}%` }}
                    />
                  </div>
                  <span className="w-32 shrink-0 text-right text-sm font-medium text-slate-800">
                    {formatFCFA(m.montant)}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardContent className="p-5">
            <h2 className="pb-3 font-semibold text-slate-800">Par méthode</h2>
            {Object.keys(f.encaisse.par_methode).length === 0 ? (
              <p className="text-sm text-slate-500">Aucun règlement sur la période.</p>
            ) : (
              <ul className="space-y-2">
                {Object.entries(f.encaisse.par_methode)
                  .sort((a, b) => b[1] - a[1])
                  .map(([m, montant]) => (
                    <li key={m} className="flex items-center justify-between text-sm">
                      <span className="text-slate-700">{METHODES[m] ?? m}</span>
                      <span className="font-medium">{formatFCFA(montant)}</span>
                    </li>
                  ))}
              </ul>
            )}
            <p className="mt-3 flex items-center gap-1.5 text-xs text-slate-400">
              <Link2 className="h-3.5 w-3.5" />
              {f.encaisse.via_psp} règlement{f.encaisse.via_psp > 1 ? "s" : ""} passé
              {f.encaisse.via_psp > 1 ? "s" : ""} par un lien de paiement ; le reste est
              saisi à la main ou lu sur une capture Wave / Orange Money.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <h2 className="pb-3 font-semibold text-slate-800">Ancienneté des impayés</h2>
            {Object.keys(f.impayes.par_anciennete).length === 0 ? (
              <p className="text-sm text-slate-500">Aucun impayé. C&apos;est rare, profites-en.</p>
            ) : (
              <ul className="space-y-2">
                {Object.entries(f.impayes.par_anciennete)
                  .sort()
                  .map(([t, montant]) => (
                    <li key={t} className="flex items-center justify-between text-sm">
                      <span className="text-slate-700">{TRANCHES[t] ?? t}</span>
                      <span
                        className={`font-medium ${t === "4_plus_90j" ? "text-red-600" : ""}`}
                      >
                        {formatFCFA(montant)}
                      </span>
                    </li>
                  ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardContent className="p-5">
            <h2 className="flex items-center gap-2 pb-3 font-semibold text-slate-800">
              <Receipt className="h-4 w-4" />
              Quittances
            </h2>
            <ul className="space-y-2 text-sm">
              <li className="flex justify-between">
                <span className="text-slate-700">Émises</span>
                <span className="font-medium">{f.quittances.emises}</span>
              </li>
              <li className="flex justify-between">
                <span className="text-slate-700">Avec PDF généré</span>
                <span className="font-medium">{f.quittances.avec_pdf}</span>
              </li>
              <li className="flex justify-between">
                <span className="text-slate-700">Envoyées au locataire</span>
                <span className="font-medium">{f.quittances.envoyees}</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <h2 className="pb-3 font-semibold text-slate-800">Revenus Locawave</h2>
            <ul className="space-y-2 text-sm">
              <li className="flex justify-between">
                <span className="text-slate-700">Abonnements encaissés</span>
                <span className="font-medium">
                  {formatFCFA(f.revenus_locawave.abonnements)}
                </span>
              </li>
              <li className="flex justify-between">
                <span className="text-slate-700">
                  Commissions ({f.revenus_locawave.commissions_nb})
                </span>
                <span className="font-medium">
                  {formatFCFA(f.revenus_locawave.commissions)}
                </span>
              </li>
              {Object.entries(f.revenus_locawave.commissions_par_source).map(([s, m]) => (
                <li key={s} className="flex justify-between pl-4 text-xs text-slate-500">
                  <span>{s === "work_order" ? "interventions" : "chantiers"}</span>
                  <span>{formatFCFA(m)}</span>
                </li>
              ))}
              {f.revenus_locawave.abonnements_attente > 0 && (
                <li className="flex justify-between text-amber-700">
                  <span>Paiements d&apos;abonnement en attente</span>
                  <span className="font-medium">
                    {f.revenus_locawave.abonnements_attente}
                  </span>
                </li>
              )}
            </ul>
          </CardContent>
        </Card>
      </div>

      {f.par_organisation.length > 0 && (
        <Card>
          <CardContent className="p-5">
            <h2 className="pb-3 font-semibold text-slate-800">Par organisation</h2>
            <ul className="space-y-2">
              {f.par_organisation.map((o) => (
                <li key={o.id} className="flex items-center justify-between text-sm">
                  <Link
                    href={`/admin/organisations/${o.id}`}
                    className="text-slate-800 hover:underline"
                  >
                    {o.nom}
                  </Link>
                  <span className="flex items-center gap-3">
                    <span className="font-medium">{formatFCFA(o.encaisse)}</span>
                    {o.impayes > 0 && (
                      <span className="text-xs text-red-600">
                        {formatFCFA(o.impayes)} impayés
                      </span>
                    )}
                  </span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Les règlements, ligne à ligne */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          Règlements ({totalLignes})
        </h2>

        {errLignes ? (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-5 text-sm text-red-800">
              {errLignes.message}
            </CardContent>
          </Card>
        ) : reglements.length === 0 ? (
          <Card>
            <CardContent className="p-10 text-center text-sm text-slate-500">
              Aucun règlement sur cette période.
            </CardContent>
          </Card>
        ) : (
          <>
            <Card className="overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[900px] text-sm">
                  <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                    <tr>
                      <th className="px-4 py-3 font-medium">Date</th>
                      <th className="px-4 py-3 font-medium">Organisation</th>
                      <th className="px-4 py-3 font-medium">Locataire / bien</th>
                      <th className="px-4 py-3 font-medium">Méthode</th>
                      <th className="px-4 py-3 font-medium">Quittance</th>
                      <th className="px-4 py-3 text-right font-medium">Montant</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {reglements.map((p) => (
                      <tr key={p.id} className="hover:bg-slate-50">
                        <td className="px-4 py-3 text-slate-600">
                          {p.paye_le
                            ? new Date(p.paye_le).toLocaleDateString("fr-FR")
                            : "—"}
                        </td>
                        <td className="px-4 py-3">
                          {p.org_id ? (
                            <Link
                              href={`/admin/organisations/${p.org_id}`}
                              className="text-slate-800 hover:underline"
                            >
                              {p.org_nom}
                            </Link>
                          ) : (
                            <span className="text-slate-400">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-slate-700">
                          {p.locataire ?? "—"}
                          <div className="text-xs text-slate-400">{p.bien ?? "—"}</div>
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant="outline">
                            {METHODES[p.methode] ?? p.methode}
                          </Badge>
                          {p.psp && (
                            <div className="mt-1 text-xs text-slate-400">{p.psp}</div>
                          )}
                        </td>
                        <td className="px-4 py-3 text-xs text-slate-500">
                          {p.quittance ?? "—"}
                        </td>
                        <td className="px-4 py-3 text-right font-medium text-slate-900">
                          {formatFCFA(p.montant)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>

            {pages > 1 && (
              <div className="flex items-center justify-between">
                {page > 1 ? (
                  <Link href={`/admin/finances?${params({ page: String(page - 1) })}`}>
                    <Button variant="outline">Précédent</Button>
                  </Link>
                ) : (
                  <span />
                )}
                <span className="text-sm text-slate-500">
                  page {page} sur {pages}
                </span>
                {page < pages ? (
                  <Link href={`/admin/finances?${params({ page: String(page + 1) })}`}>
                    <Button variant="outline">Suivant</Button>
                  </Link>
                ) : (
                  <span />
                )}
              </div>
            )}
          </>
        )}
      </section>

      <p className="text-xs text-slate-400">
        Cette page ne modifie rien. Un règlement constaté se corrige là où il a été
        saisi, par celui qui l&apos;a saisi — sinon la comptabilité du propriétaire cesse
        d&apos;être la sienne.
      </p>
    </div>
  )
}
