import Link from "next/link"
import { Search, AlertTriangle } from "lucide-react"

import { requireAdmin } from "@/lib/admin"
import { createServerClient } from "@/lib/supabase-server"
import { formatFCFA } from "@/lib/formatters"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export const dynamic = "force-dynamic"

const PAR_PAGE = 25

const PLAN_LABELS: Record<string, string> = {
  trial: "Essai",
  solo: "Solo",
  pro: "Pro",
  agence: "Agence",
}

const FILTRES = [
  { value: "", label: "Toutes" },
  { value: "trial", label: "En essai" },
  { value: "solo", label: "Solo" },
  { value: "pro", label: "Pro" },
  { value: "agence", label: "Agence" },
  { value: "bientot", label: "Expire sous 7 jours" },
  { value: "expire", label: "Échéance dépassée" },
]

function dateCourte(v: string | null) {
  if (!v) return "sans échéance"
  return new Date(v).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
}

export default async function AdminOrganisationsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; plan?: string; page?: string }>
}) {
  await requireAdmin()
  const sp = await searchParams

  const q = sp.q?.trim() ?? ""
  const plan = sp.plan ?? ""
  const page = Math.max(1, Number(sp.page) || 1)

  const supabase = await createServerClient()
  const { data, error } = await supabase.rpc("admin_organizations", {
    p_search: q || null,
    p_plan: plan || null,
    p_limit: PAR_PAGE,
    p_offset: (page - 1) * PAR_PAGE,
  })

  const lignes = data ?? []
  const total = lignes.length > 0 ? Number(lignes[0].total) : 0
  const pages = Math.max(1, Math.ceil(total / PAR_PAGE))

  const lien = (p: number) => {
    const params = new URLSearchParams()
    if (q) params.set("q", q)
    if (plan) params.set("plan", plan)
    if (p > 1) params.set("page", String(p))
    const s = params.toString()
    return s ? `/admin/organisations?${s}` : "/admin/organisations"
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Organisations</h1>
        <p className="mt-1 text-sm text-slate-500">
          Les comptes professionnels, leur plan et leur échéance.
        </p>
      </header>

      <Card>
        <CardContent className="p-4">
          <form method="get" className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                name="q"
                defaultValue={q}
                placeholder="Nom de l'organisation, du propriétaire ou email…"
                className="pl-9"
              />
            </div>
            <select
              name="plan"
              defaultValue={plan}
              className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-700"
            >
              {FILTRES.map((f) => (
                <option key={f.value} value={f.value}>
                  {f.label}
                </option>
              ))}
            </select>
            <Button type="submit">Rechercher</Button>
          </form>
        </CardContent>
      </Card>

      {error ? (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-5 text-sm text-red-800">
            Lecture impossible : {error.message}
          </CardContent>
        </Card>
      ) : lignes.length === 0 ? (
        <Card>
          <CardContent className="p-10 text-center text-sm text-slate-500">
            Aucune organisation ne correspond.
          </CardContent>
        </Card>
      ) : (
        <>
          <p className="text-sm text-slate-500">
            {total} organisation{total > 1 ? "s" : ""} — page {page} sur {pages}
          </p>

          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] text-sm">
                <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-4 py-3 font-medium">Organisation</th>
                    <th className="px-4 py-3 font-medium">Plan</th>
                    <th className="px-4 py-3 font-medium">Échéance</th>
                    <th className="px-4 py-3 font-medium">Parc</th>
                    <th className="px-4 py-3 text-right font-medium">Loyers encaissés</th>
                    <th className="px-4 py-3 text-right font-medium">Versé à Locawave</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {lignes.map((o) => (
                    <tr key={o.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3">
                        <Link
                          href={`/admin/organisations/${o.id}`}
                          className="font-medium text-slate-900 hover:underline"
                        >
                          {o.nom}
                        </Link>
                        <div className="text-xs text-slate-500">
                          {o.proprietaire ?? "—"} · {o.email ?? "—"}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant="outline">{PLAN_LABELS[o.plan] ?? o.plan}</Badge>
                      </td>
                      <td className="px-4 py-3">
                        {o.expire ? (
                          <span className="inline-flex items-center gap-1 text-red-700">
                            <AlertTriangle className="h-3.5 w-3.5" />
                            {dateCourte(o.expire_le)}
                          </span>
                        ) : (
                          <span className="text-slate-600">{dateCourte(o.expire_le)}</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {o.biens} bien{Number(o.biens) > 1 ? "s" : ""} ·{" "}
                        {Number(o.baux_actifs) > 1
                          ? `${o.baux_actifs} baux actifs`
                          : `${o.baux_actifs} bail actif`}
                      </td>
                      <td className="px-4 py-3 text-right text-slate-700">
                        {formatFCFA(Number(o.loyers_encaisses))}
                        {Number(o.impayes) > 0 && (
                          <div className="text-xs text-red-600">
                            {formatFCFA(Number(o.impayes))} impayés
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right font-medium text-slate-900">
                        {formatFCFA(Number(o.paye_a_locawave))}
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
                <Link href={lien(page - 1)}>
                  <Button variant="outline">Précédent</Button>
                </Link>
              ) : (
                <span />
              )}
              {page < pages ? (
                <Link href={lien(page + 1)}>
                  <Button variant="outline">Suivant</Button>
                </Link>
              ) : (
                <span />
              )}
            </div>
          )}
        </>
      )}

      <p className="text-xs text-slate-400">
        « Loyers encaissés » est l&apos;argent du propriétaire, jamais le nôtre : Locawave
        ne détient pas ces fonds. « Versé à Locawave » additionne l&apos;abonnement et les
        commissions.
      </p>
    </div>
  )
}
