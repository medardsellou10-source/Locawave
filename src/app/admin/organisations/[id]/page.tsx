import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft, AlertTriangle, Users, Home, Wallet, Building2 } from "lucide-react"

import { requireAdmin } from "@/lib/admin"
import { createServerClient } from "@/lib/supabase-server"
import { formatFCFA } from "@/lib/formatters"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AdminOrgActions } from "@/components/app/AdminOrgActions"

export const dynamic = "force-dynamic"

const PLAN_LABELS: Record<string, string> = {
  trial: "Essai",
  solo: "Solo",
  pro: "Pro",
  agence: "Agence",
}

const ROLE_ORG: Record<string, string> = {
  owner: "propriétaire",
  manager: "gestionnaire",
  viewer: "lecture seule",
}

type Detail = {
  organisation: {
    id: string
    nom: string
    plan: string
    expire_le: string | null
    expire: boolean
    creee_le: string
    onboarding_fait: boolean
    code_parrainage: string | null
    wave: string | null
    om: string | null
    adresse: string | null
    proprietaire: { id: string | null; nom: string | null; email: string | null }
  }
  membres: { id: string; nom: string | null; email: string | null; role: string }[]
  parc: {
    biens: number
    lots: number
    baux_actifs: number
    baux_total: number
    locataires: number
    annonces: number
  }
  loyers: {
    encaisse_total: number
    encaisse_12m: number
    impayes: number
    impayes_nb: number
    charges: number
  }
  revenus_locawave: { abonnements: number; commissions: number }
  abonnements: {
    id: string
    plan: string
    montant: number
    mois: number
    statut: string
    paye_le: string | null
    debut: string | null
    fin: string | null
    fournisseur: string | null
  }[]
  activite: { action: string; entite: string; le: string }[]
  actions_admin: { action: string; resume: string | null; par: string | null; le: string }[]
}

function dateLongue(v: string | null) {
  if (!v) return "—"
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

export default async function AdminOrganisationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  await requireAdmin()
  const { id } = await params

  const supabase = await createServerClient()
  const { data, error } = await supabase.rpc("admin_organization_detail", { p_id: id })
  if (error || !data) notFound()

  const d = data as unknown as Detail
  const o = d.organisation

  return (
    <div className="space-y-6">
      <Link
        href="/admin/organisations"
        className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900"
      >
        <ArrowLeft className="h-4 w-4" />
        Toutes les organisations
      </Link>

      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">{o.nom}</h1>
          <p className="mt-1 text-sm text-slate-500">
            {o.proprietaire.id ? (
              <Link
                href={`/admin/comptes/${o.proprietaire.id}`}
                className="hover:underline"
              >
                {o.proprietaire.nom} · {o.proprietaire.email}
              </Link>
            ) : (
              "sans propriétaire rattaché"
            )}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline">{PLAN_LABELS[o.plan] ?? o.plan}</Badge>
          {o.expire && (
            <Badge className="bg-red-100 text-red-700 hover:bg-red-100">
              <AlertTriangle className="mr-1 h-3 w-3" />
              Échéance dépassée
            </Badge>
          )}
        </div>
      </header>

      {o.expire && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="p-5 text-sm text-amber-900">
            L&apos;échéance est passée le {dateLongue(o.expire_le)}. Tant qu&apos;elle
            l&apos;est, le propriétaire est renvoyé vers la page d&apos;abonnement à chaque
            visite du tableau de bord.
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-6">
          <Card>
            <CardContent className="p-5">
              <h2 className="flex items-center gap-2 pb-2 font-semibold text-slate-800">
                <Building2 className="h-4 w-4" />
                Abonnement
              </h2>
              <Ligne label="Plan">{PLAN_LABELS[o.plan] ?? o.plan}</Ligne>
              <Ligne label="Échéance">
                {o.expire_le ? dateLongue(o.expire_le) : "sans échéance"}
              </Ligne>
              <Ligne label="Créée le">{dateLongue(o.creee_le)}</Ligne>
              <Ligne label="Onboarding">{o.onboarding_fait ? "terminé" : "non terminé"}</Ligne>
              <Ligne label="Code de parrainage">{o.code_parrainage ?? "—"}</Ligne>
              <Ligne label="Wave / Orange Money">
                {[o.wave, o.om].filter(Boolean).join(" · ") || "non renseignés"}
              </Ligne>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <h2 className="flex items-center gap-2 pb-2 font-semibold text-slate-800">
                <Home className="h-4 w-4" />
                Parc
              </h2>
              <Ligne label="Biens">{d.parc.biens}</Ligne>
              <Ligne label="Lots">{d.parc.lots}</Ligne>
              <Ligne label="Baux actifs">
                {d.parc.baux_actifs} sur {d.parc.baux_total}
              </Ligne>
              <Ligne label="Locataires">{d.parc.locataires}</Ligne>
              <Ligne label="Annonces publiées">{d.parc.annonces}</Ligne>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <h2 className="flex items-center gap-2 pb-2 font-semibold text-slate-800">
                <Wallet className="h-4 w-4" />
                Argent
              </h2>
              <p className="pb-2 text-xs text-slate-400">
                Les loyers appartiennent au propriétaire — Locawave ne détient pas ces
                fonds. Seules les deux dernières lignes sont nos revenus.
              </p>
              <Ligne label="Loyers encaissés (12 mois)">
                {formatFCFA(d.loyers.encaisse_12m)}
              </Ligne>
              <Ligne label="Loyers encaissés (total)">
                {formatFCFA(d.loyers.encaisse_total)}
              </Ligne>
              <Ligne label="Impayés échus">
                <span className={d.loyers.impayes > 0 ? "text-red-600" : ""}>
                  {formatFCFA(d.loyers.impayes)} ({d.loyers.impayes_nb})
                </span>
              </Ligne>
              <Ligne label="Charges saisies">{formatFCFA(d.loyers.charges)}</Ligne>
              <Ligne label="Abonnements versés à Locawave">
                {formatFCFA(d.revenus_locawave.abonnements)}
              </Ligne>
              <Ligne label="Commissions Locawave">
                {formatFCFA(d.revenus_locawave.commissions)}
              </Ligne>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <h2 className="flex items-center gap-2 pb-3 font-semibold text-slate-800">
                <Users className="h-4 w-4" />
                Membres
              </h2>
              {d.membres.length === 0 ? (
                <p className="text-sm text-slate-500">Aucun membre rattaché.</p>
              ) : (
                <ul className="space-y-2">
                  {d.membres.map((m) => (
                    <li key={m.id} className="flex items-center justify-between text-sm">
                      <Link
                        href={`/admin/comptes/${m.id}`}
                        className="text-slate-800 hover:underline"
                      >
                        {m.nom ?? m.email}
                      </Link>
                      <Badge variant="outline">{ROLE_ORG[m.role] ?? m.role}</Badge>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <AdminOrgActions orgId={o.id} planActuel={o.plan} />

          <Card>
            <CardContent className="p-5">
              <h2 className="pb-3 font-semibold text-slate-800">Paiements d&apos;abonnement</h2>
              {d.abonnements.length === 0 ? (
                <p className="text-sm text-slate-500">
                  Aucun paiement d&apos;abonnement enregistré.
                </p>
              ) : (
                <ul className="space-y-2">
                  {d.abonnements.map((s) => (
                    <li key={s.id} className="flex items-center justify-between text-sm">
                      <span className="text-slate-700">
                        {PLAN_LABELS[s.plan] ?? s.plan} · {s.mois} mois
                      </span>
                      <span className="flex items-center gap-2">
                        <span className="font-medium">{formatFCFA(s.montant)}</span>
                        <Badge variant="outline">{s.statut}</Badge>
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <h2 className="pb-3 font-semibold text-slate-800">Actions administratives</h2>
              {d.actions_admin.length === 0 ? (
                <p className="text-sm text-slate-500">
                  Rien n&apos;a encore été fait sur cette organisation depuis la console.
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
              <h2 className="pb-3 font-semibold text-slate-800">Activité récente</h2>
              {d.activite.length === 0 ? (
                <p className="text-sm text-slate-500">Aucune activité enregistrée.</p>
              ) : (
                <ul className="space-y-2">
                  {d.activite.map((a, i) => (
                    <li key={i} className="flex items-center justify-between text-sm">
                      <span className="text-slate-700">
                        {a.entite} · {a.action}
                      </span>
                      <span className="text-xs text-slate-400">
                        {new Date(a.le).toLocaleDateString("fr-FR")}
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
