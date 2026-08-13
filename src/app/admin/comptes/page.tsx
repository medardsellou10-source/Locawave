import Link from "next/link"
import { Search, ShieldCheck, Lock, Ban } from "lucide-react"

import { requireAdmin } from "@/lib/admin"
import { createServerClient } from "@/lib/supabase-server"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export const dynamic = "force-dynamic"

const PAR_PAGE = 25

const ROLE_LABELS: Record<string, string> = {
  owner: "Propriétaire",
  tenant: "Locataire",
  provider: "Prestataire",
  seeker: "Chercheur",
}

const FILTRES = [
  { value: "", label: "Tous" },
  { value: "owner", label: "Propriétaires" },
  { value: "tenant", label: "Locataires" },
  { value: "provider", label: "Prestataires" },
  { value: "seeker", label: "Chercheurs" },
  { value: "admin", label: "Administrateurs" },
  { value: "suspendu", label: "Suspendus" },
]

function dateCourte(v: string | null) {
  if (!v) return "—"
  return new Date(v).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
}

function KycBadge({ statut }: { statut: string }) {
  if (statut === "verified")
    return (
      <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Vérifié</Badge>
    )
  if (statut === "pending")
    return (
      <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100">En attente</Badge>
    )
  if (statut === "rejected")
    return <Badge className="bg-red-100 text-red-700 hover:bg-red-100">Refusé</Badge>
  return <span className="text-xs text-slate-400">—</span>
}

export default async function AdminComptesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; role?: string; page?: string }>
}) {
  await requireAdmin()
  const sp = await searchParams

  const q = sp.q?.trim() ?? ""
  const role = sp.role ?? ""
  const page = Math.max(1, Number(sp.page) || 1)

  const supabase = await createServerClient()
  const { data, error } = await supabase.rpc("admin_accounts", {
    p_search: q || null,
    p_role: role || null,
    p_limit: PAR_PAGE,
    p_offset: (page - 1) * PAR_PAGE,
  })

  const lignes = data ?? []
  const total = lignes.length > 0 ? Number(lignes[0].total) : 0
  const pages = Math.max(1, Math.ceil(total / PAR_PAGE))

  const lien = (p: number) => {
    const params = new URLSearchParams()
    if (q) params.set("q", q)
    if (role) params.set("role", role)
    if (p > 1) params.set("page", String(p))
    const s = params.toString()
    return s ? `/admin/comptes?${s}` : "/admin/comptes"
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Comptes</h1>
        <p className="mt-1 text-sm text-slate-500">
          Tous les comptes de la plateforme, quel que soit leur rôle ou leur organisation.
        </p>
      </header>

      {/* Recherche : formulaire GET, l'URL porte l'état — partageable et rechargeable. */}
      <Card>
        <CardContent className="p-4">
          <form method="get" className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                name="q"
                defaultValue={q}
                placeholder="Nom, email, téléphone ou organisation…"
                className="pl-9"
              />
            </div>
            <select
              name="role"
              defaultValue={role}
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
            Aucun compte ne correspond.
          </CardContent>
        </Card>
      ) : (
        <>
          <p className="text-sm text-slate-500">
            {total} compte{total > 1 ? "s" : ""} — page {page} sur {pages}
          </p>

          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[820px] text-sm">
                <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-4 py-3 font-medium">Compte</th>
                    <th className="px-4 py-3 font-medium">Rôle</th>
                    <th className="px-4 py-3 font-medium">Organisation</th>
                    <th className="px-4 py-3 font-medium">KYC</th>
                    <th className="px-4 py-3 font-medium">Dernière connexion</th>
                    <th className="px-4 py-3 font-medium">Inscrit le</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {lignes.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3">
                        <Link
                          href={`/admin/comptes/${c.id}`}
                          className="font-medium text-slate-900 hover:underline"
                        >
                          {c.full_name}
                        </Link>
                        <div className="text-xs text-slate-500">{c.email ?? "—"}</div>
                        <div className="mt-1 flex flex-wrap gap-1">
                          {c.est_admin && (
                            <Badge className="bg-[#0f172a] text-white hover:bg-[#0f172a]">
                              <Lock className="mr-1 h-3 w-3" />
                              Admin
                            </Badge>
                          )}
                          {c.suspendu && (
                            <Badge className="bg-red-100 text-red-700 hover:bg-red-100">
                              <Ban className="mr-1 h-3 w-3" />
                              Suspendu
                            </Badge>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-700">
                        {ROLE_LABELS[c.role] ?? c.role}
                      </td>
                      <td className="px-4 py-3 text-slate-700">{c.org_nom ?? "—"}</td>
                      <td className="px-4 py-3">
                        <KycBadge statut={c.kyc_status} />
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {dateCourte(c.last_sign_in)}
                      </td>
                      <td className="px-4 py-3 text-slate-600">{dateCourte(c.created_at)}</td>
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

      <p className="flex items-center gap-2 text-xs text-slate-400">
        <ShieldCheck className="h-3.5 w-3.5" />
        Les emails et téléphones affichés ici ne sortent pas de cette console.
      </p>
    </div>
  )
}
