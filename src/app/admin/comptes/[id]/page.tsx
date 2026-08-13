import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft, Lock, Ban, Building2, Home, Wrench, ShieldCheck } from "lucide-react"

import { requireAdmin } from "@/lib/admin"
import { createServerClient } from "@/lib/supabase-server"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AdminCompteActions } from "@/components/app/AdminCompteActions"

export const dynamic = "force-dynamic"

const ROLE_LABELS: Record<string, string> = {
  owner: "Propriétaire",
  tenant: "Locataire",
  provider: "Prestataire",
  seeker: "Chercheur",
  admin: "Admin (héritage)",
}

type Detail = {
  compte: {
    id: string
    full_name: string
    email: string | null
    role: string
    kyc_status: string
    phone: string | null
    country: string
    created_at: string
    last_sign_in: string | null
    email_confirme: boolean
    suspendu: boolean
    est_admin: boolean
    est_super_admin: boolean
  }
  organisation: {
    id: string
    nom: string
    plan: string
    expire_le: string | null
    role_dans_org: string
    proprietaire: boolean
  } | null
  parc: { biens: number; baux: number }
  locataire: { fiche_id: string; nom: string; baux_actifs: number } | null
  prestataire: {
    verifie: boolean
    metiers: string[] | null
    note_confiance: number | null
    missions: number | null
  } | null
  kyc: { id: string; type: string; statut: string; depose_le: string; note: string | null }[]
  actions_admin: { action: string; resume: string | null; par: string | null; le: string }[]
  journal_metier: { entite: string; action: string; le: string }[]
}

function dateLongue(v: string | null) {
  if (!v) return "jamais"
  return new Date(v).toLocaleString("fr-FR", { dateStyle: "long", timeStyle: "short" })
}

function Ligne({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-slate-100 py-2 last:border-0">
      <span className="text-sm text-slate-500">{label}</span>
      <span className="text-sm font-medium text-slate-900">{children}</span>
    </div>
  )
}

export default async function AdminCompteDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const admin = await requireAdmin()
  const { id } = await params

  const supabase = await createServerClient()
  const { data, error } = await supabase.rpc("admin_account_detail", { p_id: id })
  if (error || !data) notFound()

  const d = data as unknown as Detail
  const c = d.compte

  return (
    <div className="space-y-6">
      <Link
        href="/admin/comptes"
        className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900"
      >
        <ArrowLeft className="h-4 w-4" />
        Tous les comptes
      </Link>

      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">{c.full_name}</h1>
          <p className="mt-1 text-sm text-slate-500">{c.email ?? "sans email"}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline">{ROLE_LABELS[c.role] ?? c.role}</Badge>
          {c.est_admin && (
            <Badge className="bg-[#0f172a] text-white hover:bg-[#0f172a]">
              <Lock className="mr-1 h-3 w-3" />
              {c.est_super_admin ? "Super-admin" : "Admin"}
            </Badge>
          )}
          {c.suspendu && (
            <Badge className="bg-red-100 text-red-700 hover:bg-red-100">
              <Ban className="mr-1 h-3 w-3" />
              Suspendu
            </Badge>
          )}
          {c.kyc_status === "verified" && (
            <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
              <ShieldCheck className="mr-1 h-3 w-3" />
              KYC vérifié
            </Badge>
          )}
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-6">
          <Card>
            <CardContent className="p-5">
              <h2 className="pb-2 font-semibold text-slate-800">Identité</h2>
              <Ligne label="Téléphone">{c.phone ?? "—"}</Ligne>
              <Ligne label="Pays">{c.country}</Ligne>
              <Ligne label="Email confirmé">{c.email_confirme ? "oui" : "non"}</Ligne>
              <Ligne label="Inscrit le">{dateLongue(c.created_at)}</Ligne>
              <Ligne label="Dernière connexion">{dateLongue(c.last_sign_in)}</Ligne>
              <Ligne label="Identifiant">
                <code className="text-xs text-slate-500">{c.id}</code>
              </Ligne>
            </CardContent>
          </Card>

          {d.organisation && (
            <Card>
              <CardContent className="p-5">
                <h2 className="flex items-center gap-2 pb-2 font-semibold text-slate-800">
                  <Building2 className="h-4 w-4" />
                  Organisation
                </h2>
                <Ligne label="Nom">{d.organisation.nom}</Ligne>
                <Ligne label="Plan">{d.organisation.plan}</Ligne>
                <Ligne label="Rôle dans l'organisation">
                  {d.organisation.proprietaire ? "propriétaire" : d.organisation.role_dans_org}
                </Ligne>
                <Ligne label="Biens gérés">
                  <span className="inline-flex items-center gap-1">
                    <Home className="h-3.5 w-3.5 text-slate-400" />
                    {d.parc.biens}
                  </span>
                </Ligne>
                <Ligne label="Baux">{d.parc.baux}</Ligne>
              </CardContent>
            </Card>
          )}

          {d.locataire && (
            <Card>
              <CardContent className="p-5">
                <h2 className="pb-2 font-semibold text-slate-800">Fiche locataire</h2>
                <Ligne label="Nom sur la fiche">{d.locataire.nom}</Ligne>
                <Ligne label="Baux actifs">{d.locataire.baux_actifs}</Ligne>
              </CardContent>
            </Card>
          )}

          {d.prestataire && (
            <Card>
              <CardContent className="p-5">
                <h2 className="flex items-center gap-2 pb-2 font-semibold text-slate-800">
                  <Wrench className="h-4 w-4" />
                  Prestataire
                </h2>
                <Ligne label="Vérifié">{d.prestataire.verifie ? "oui" : "non"}</Ligne>
                <Ligne label="Métiers">{d.prestataire.metiers?.join(", ") || "—"}</Ligne>
                <Ligne label="Note de confiance">{d.prestataire.note_confiance ?? "—"}</Ligne>
                <Ligne label="Missions réalisées">{d.prestataire.missions ?? 0}</Ligne>
              </CardContent>
            </Card>
          )}

          {d.kyc.length > 0 && (
            <Card>
              <CardContent className="p-5">
                <h2 className="pb-2 font-semibold text-slate-800">Pièces d&apos;identité</h2>
                <ul className="space-y-2">
                  {d.kyc.map((k) => (
                    <li key={k.id} className="flex items-center justify-between text-sm">
                      <span className="text-slate-700">{k.type}</span>
                      <span className="flex items-center gap-2">
                        <span className="text-xs text-slate-400">
                          {new Date(k.depose_le).toLocaleDateString("fr-FR")}
                        </span>
                        <Badge variant="outline">{k.statut}</Badge>
                      </span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <AdminCompteActions
            compteId={c.id}
            nom={c.full_name}
            roleActuel={c.role}
            suspendu={c.suspendu}
            estAdmin={c.est_admin}
            estSuperAdmin={c.est_super_admin}
            jeSuisSuperAdmin={admin.isSuper}
            cEstMoi={c.id === admin.userId}
          />

          <Card>
            <CardContent className="p-5">
              <h2 className="pb-3 font-semibold text-slate-800">Actions administratives</h2>
              {d.actions_admin.length === 0 ? (
                <p className="text-sm text-slate-500">
                  Rien n&apos;a encore été fait sur ce compte depuis la console.
                </p>
              ) : (
                <ul className="space-y-3">
                  {d.actions_admin.map((a, i) => (
                    <li key={i} className="border-l-2 border-slate-200 pl-3">
                      <p className="text-sm text-slate-800">{a.resume ?? a.action}</p>
                      <p className="text-xs text-slate-400">
                        {a.par} — {dateLongue(a.le)}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <h2 className="pb-3 font-semibold text-slate-800">Activité métier</h2>
              {d.journal_metier.length === 0 ? (
                <p className="text-sm text-slate-500">Aucune trace dans le journal métier.</p>
              ) : (
                <ul className="space-y-2">
                  {d.journal_metier.map((l, i) => (
                    <li key={i} className="flex items-center justify-between text-sm">
                      <span className="text-slate-700">
                        {l.entite} · {l.action}
                      </span>
                      <span className="text-xs text-slate-400">
                        {new Date(l.le).toLocaleDateString("fr-FR")}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
