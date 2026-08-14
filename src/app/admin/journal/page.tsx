import Link from "next/link"
import { Search } from "lucide-react"

import { requireAdmin } from "@/lib/admin"
import { createServerClient } from "@/lib/supabase-server"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export const dynamic = "force-dynamic"

const PAR_PAGE = 50

/** Familles d'actions, pour filtrer sans connaître les codes par cœur. */
const FAMILLES = [
  { value: "", label: "Toutes les actions" },
  { value: "compte", label: "Comptes" },
  { value: "admin", label: "Administrateurs" },
  { value: "org", label: "Organisations" },
  { value: "kyc", label: "Identités" },
  { value: "prestataire", label: "Prestataires" },
  { value: "annonce", label: "Annonces" },
  { value: "avis", label: "Avis" },
  { value: "litige", label: "Litiges" },
  { value: "reglage", label: "Réglages" },
  { value: "finances", label: "Exports" },
]

/** Une cible cliquable quand on sait où elle mène. */
function lienCible(type: string | null, id: string | null) {
  if (!id) return null
  if (type === "profile") return `/admin/comptes/${id}`
  if (type === "organization") return `/admin/organisations/${id}`
  return null
}

export default async function AdminJournalPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; famille?: string; du?: string; au?: string; page?: string }>
}) {
  await requireAdmin()
  const sp = await searchParams

  const q = sp.q?.trim() ?? ""
  const famille = sp.famille ?? ""
  const du = sp.du || ""
  const au = sp.au || ""
  const page = Math.max(1, Number(sp.page) || 1)

  const supabase = await createServerClient()
  const { data, error } = await supabase.rpc("admin_journal", {
    p_search: q || null,
    p_action: famille || null,
    p_du: du || null,
    p_au: au || null,
    p_limit: PAR_PAGE,
    p_offset: (page - 1) * PAR_PAGE,
  })

  const lignes = data ?? []
  const total = lignes.length > 0 ? Number(lignes[0].total) : 0
  const pages = Math.max(1, Math.ceil(total / PAR_PAGE))

  const lien = (p: number) => {
    const params = new URLSearchParams()
    if (q) params.set("q", q)
    if (famille) params.set("famille", famille)
    if (du) params.set("du", du)
    if (au) params.set("au", au)
    if (p > 1) params.set("page", String(p))
    const s = params.toString()
    return s ? `/admin/journal?${s}` : "/admin/journal"
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Journal</h1>
        <p className="mt-1 text-sm text-slate-500">
          Tout ce qui a été fait depuis cette console, avec l&apos;état d&apos;avant et
          celui d&apos;après. En ajout seul : rien ne s&apos;y modifie ni ne s&apos;y
          efface.
        </p>
      </header>

      <Card>
        <CardContent className="p-4">
          <form method="get" className="flex flex-wrap items-end gap-3">
            <div className="min-w-[220px] flex-1">
              <label className="mb-1 block text-xs text-slate-500">Recherche</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  name="q"
                  defaultValue={q}
                  placeholder="Résumé, administrateur, action, identifiant de cible…"
                  className="pl-9"
                />
              </div>
            </div>
            <div>
              <label className="mb-1 block text-xs text-slate-500">Famille</label>
              <select
                name="famille"
                defaultValue={famille}
                className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-700"
              >
                {FAMILLES.map((f) => (
                  <option key={f.value} value={f.value}>
                    {f.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs text-slate-500">Du</label>
              <Input type="date" name="du" defaultValue={du} className="w-auto" />
            </div>
            <div>
              <label className="mb-1 block text-xs text-slate-500">Au</label>
              <Input type="date" name="au" defaultValue={au} className="w-auto" />
            </div>
            <Button type="submit">Filtrer</Button>
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
            Aucune action ne correspond.
          </CardContent>
        </Card>
      ) : (
        <>
          <p className="text-sm text-slate-500">
            {total} action{total > 1 ? "s" : ""} — page {page} sur {pages}
          </p>

          <div className="space-y-2">
            {lignes.map((a) => {
              const cible = lienCible(a.cible_type, a.cible_id)
              return (
                <Card key={a.id}>
                  <CardContent className="p-4">
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <p className="font-medium text-slate-900">{a.resume ?? a.action}</p>
                      <span className="text-xs text-slate-400">
                        {new Date(a.au_moment).toLocaleString("fr-FR", {
                          dateStyle: "short",
                          timeStyle: "medium",
                        })}
                      </span>
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                      <Badge variant="outline" className="font-mono text-[11px]">
                        {a.action}
                      </Badge>
                      <span>{a.admin_nom ?? a.admin_email}</span>
                      {a.ip && <span className="text-slate-400">depuis {a.ip}</span>}
                      {cible && (
                        <Link href={cible} className="text-slate-600 hover:underline">
                          voir la cible
                        </Link>
                      )}
                    </div>
                    {(a.avant || a.apres) && (
                      <p className="mt-2 font-mono text-xs text-slate-500">
                        {a.avant ? JSON.stringify(a.avant) : "—"} →{" "}
                        {a.apres ? JSON.stringify(a.apres) : "—"}
                      </p>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>

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
    </div>
  )
}
