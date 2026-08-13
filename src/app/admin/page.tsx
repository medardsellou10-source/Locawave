import Link from "next/link"
import {
  Users,
  UserPlus,
  Activity,
  Building2,
  Clock,
  Home,
  FileSignature,
  Megaphone,
  Wallet,
  TrendingDown,
  ShieldCheck,
  Wrench,
  Scale,
  AlertTriangle,
  Database,
  ScrollText,
  Lock,
} from "lucide-react"

import { requireAdmin } from "@/lib/admin"
import { createServerClient } from "@/lib/supabase-server"
import { formatFCFA } from "@/lib/formatters"
import { StatCard } from "@/components/app/StatCard"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export const dynamic = "force-dynamic"

type Overview = {
  comptes: {
    total: number
    proprietaires: number
    locataires: number
    prestataires: number
    chercheurs: number
    nouveaux_30j: number
    actifs_7j: number
  }
  organisations: {
    total: number
    essai: number
    payantes: number
    essai_expire: number
    essai_bientot: number
    par_plan: Record<string, number>
  }
  parc: { biens: number; lots: number; baux_actifs: number; annonces: number }
  argent: {
    encaisse_30j: number
    encaisse_total: number
    impayes_fcfa: number
    impayes_nb: number
    commissions: number
    abo_encaisse: number
  }
  confiance: {
    kyc_attente: number
    prestataires_attente: number
    litiges_ouverts: number
    incidents_ouverts: number
    candidatures: number
  }
  systeme: {
    tables: number
    tables_sans_rls: number
    admins: number
    actions_admin_7j: number
    audit_7j: number
    notifs_echec_7j: number
  }
  genere_le: string
}

const PLAN_LABELS: Record<string, string> = {
  trial: "Essai",
  solo: "Solo",
  pro: "Pro",
  agence: "Agence",
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">{title}</h2>
      {children}
    </section>
  )
}

export default async function AdminOverviewPage() {
  const admin = await requireAdmin()

  // Lecture avec la session de l'administrateur : la fonction admin_overview()
  // est gardée par is_admin() côté base. Aucune clé service_role n'intervient ici.
  const supabase = await createServerClient()
  const { data, error } = await supabase.rpc("admin_overview")

  if (error || !data) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="p-6">
          <p className="font-medium text-red-800">Les chiffres n&apos;ont pas pu être lus.</p>
          <p className="mt-1 text-sm text-red-700">
            {error?.message ?? "Réponse vide de la base."}
          </p>
        </CardContent>
      </Card>
    )
  }

  const o = data as unknown as Overview

  // Ce qui demande une action de ta part, et rien d'autre.
  const alertes = [
    { n: o.confiance.kyc_attente, label: "pièce(s) d'identité à vérifier" },
    { n: o.confiance.prestataires_attente, label: "prestataire(s) en attente de validation" },
    { n: o.confiance.litiges_ouverts, label: "litige(s) ouvert(s)" },
    { n: o.organisations.essai_expire, label: "essai(s) expiré(s)" },
    { n: o.systeme.tables_sans_rls, label: "table(s) sans RLS" },
    { n: o.systeme.notifs_echec_7j, label: "notification(s) en échec (7 j)" },
  ].filter((a) => a.n > 0)

  const genere = new Date(o.genere_le).toLocaleString("fr-FR", {
    dateStyle: "long",
    timeStyle: "short",
  })

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Vue d&apos;ensemble</h1>
        <p className="mt-1 text-sm text-slate-500">
          Toute la plateforme, toutes organisations confondues — {genere}.
        </p>
      </header>

      {alertes.length > 0 ? (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="p-5">
            <div className="flex items-start gap-3">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
              <div>
                <p className="font-medium text-amber-900">À traiter</p>
                <ul className="mt-2 space-y-1 text-sm text-amber-800">
                  {alertes.map((a) => (
                    <li key={a.label}>
                      <span className="font-semibold">{a.n}</span> {a.label}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-5 text-sm text-green-800">
            Rien à traiter : aucune vérification en attente, aucun litige ouvert, aucune
            alerte système.
          </CardContent>
        </Card>
      )}

      <Section title="Comptes">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Comptes au total" value={String(o.comptes.total)} icon={Users} tone="navy" />
          <StatCard
            label="Nouveaux (30 j)"
            value={String(o.comptes.nouveaux_30j)}
            icon={UserPlus}
            tone="green"
          />
          <StatCard
            label="Connectés (7 j)"
            value={String(o.comptes.actifs_7j)}
            icon={Activity}
            tone="blue"
          />
          <StatCard
            label="Administrateurs"
            value={String(o.systeme.admins)}
            icon={Lock}
            tone="indigo"
            hint="Comptes ayant accès à cette console"
          />
        </div>
        <Card>
          <CardContent className="flex flex-wrap gap-x-8 gap-y-3 p-5 text-sm">
            <span className="text-slate-600">
              Propriétaires <b className="text-slate-900">{o.comptes.proprietaires}</b>
            </span>
            <span className="text-slate-600">
              Locataires <b className="text-slate-900">{o.comptes.locataires}</b>
            </span>
            <span className="text-slate-600">
              Prestataires <b className="text-slate-900">{o.comptes.prestataires}</b>
            </span>
            <span className="text-slate-600">
              Chercheurs <b className="text-slate-900">{o.comptes.chercheurs}</b>
            </span>
          </CardContent>
        </Card>
      </Section>

      <Section title="Organisations & abonnements">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Organisations" value={String(o.organisations.total)} icon={Building2} tone="navy" />
          <StatCard label="Abonnements payants" value={String(o.organisations.payantes)} icon={Wallet} tone="green" />
          <StatCard label="En essai" value={String(o.organisations.essai)} icon={Clock} tone="blue" />
          <StatCard
            label="Essais expirés"
            value={String(o.organisations.essai_expire)}
            icon={AlertTriangle}
            tone={o.organisations.essai_expire > 0 ? "red" : "navy"}
            hint={`${o.organisations.essai_bientot} expire(nt) sous 7 jours`}
          />
        </div>
        <Card>
          <CardContent className="flex flex-wrap items-center gap-2 p-5">
            {Object.entries(o.organisations.par_plan).length === 0 ? (
              <span className="text-sm text-slate-500">Aucune organisation.</span>
            ) : (
              Object.entries(o.organisations.par_plan).map(([plan, n]) => (
                <Badge key={plan} variant="outline" className="text-slate-700">
                  {PLAN_LABELS[plan] ?? plan} · {n}
                </Badge>
              ))
            )}
          </CardContent>
        </Card>
      </Section>

      <Section title="Parc immobilier">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Biens" value={String(o.parc.biens)} icon={Home} tone="navy" />
          <StatCard label="Lots" value={String(o.parc.lots)} icon={Building2} tone="navy" />
          <StatCard label="Baux actifs" value={String(o.parc.baux_actifs)} icon={FileSignature} tone="green" />
          <StatCard label="Annonces publiées" value={String(o.parc.annonces)} icon={Megaphone} tone="indigo" />
        </div>
      </Section>

      <Section title="Argent (tous comptes)">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Encaissé (30 j)"
            value={formatFCFA(o.argent.encaisse_30j)}
            icon={Wallet}
            tone="green"
            hint={`${formatFCFA(o.argent.encaisse_total)} depuis l'origine`}
          />
          <StatCard
            label="Impayés échus"
            value={formatFCFA(o.argent.impayes_fcfa)}
            icon={TrendingDown}
            tone={o.argent.impayes_fcfa > 0 ? "red" : "navy"}
            hint={`${o.argent.impayes_nb} échéance(s)`}
          />
          <StatCard
            label="Abonnements encaissés"
            value={formatFCFA(o.argent.abo_encaisse)}
            icon={Building2}
            tone="blue"
          />
          <StatCard
            label="Commissions"
            value={formatFCFA(o.argent.commissions)}
            icon={TrendingDown}
            tone="indigo"
          />
        </div>
        <p className="text-xs text-slate-400">
          Locawave ne détient jamais les fonds : ces montants retracent les règlements
          constatés, pas une trésorerie.
        </p>
      </Section>

      <Section title="Confiance">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="KYC en attente"
            value={String(o.confiance.kyc_attente)}
            icon={ShieldCheck}
            tone={o.confiance.kyc_attente > 0 ? "orange" : "navy"}
          />
          <StatCard
            label="Prestataires à vérifier"
            value={String(o.confiance.prestataires_attente)}
            icon={Wrench}
            tone={o.confiance.prestataires_attente > 0 ? "orange" : "navy"}
          />
          <StatCard
            label="Litiges ouverts"
            value={String(o.confiance.litiges_ouverts)}
            icon={Scale}
            tone={o.confiance.litiges_ouverts > 0 ? "red" : "navy"}
          />
          <StatCard
            label="Incidents ouverts"
            value={String(o.confiance.incidents_ouverts)}
            icon={AlertTriangle}
            tone="blue"
            hint={`${o.confiance.candidatures} candidature(s) en attente`}
          />
        </div>
      </Section>

      <Section title="Système">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Tables en base"
            value={String(o.systeme.tables)}
            icon={Database}
            tone="navy"
          />
          <StatCard
            label="Tables sans RLS"
            value={String(o.systeme.tables_sans_rls)}
            icon={Lock}
            tone={o.systeme.tables_sans_rls > 0 ? "red" : "green"}
          />
          <StatCard
            label="Actions admin (7 j)"
            value={String(o.systeme.actions_admin_7j)}
            icon={ScrollText}
            tone="indigo"
          />
          <StatCard
            label="Journal métier (7 j)"
            value={String(o.systeme.audit_7j)}
            icon={ScrollText}
            tone="blue"
            hint={`${o.systeme.notifs_echec_7j} notification(s) en échec`}
          />
        </div>
      </Section>

      <Card className="border-slate-200 bg-white">
        <CardContent className="p-5 text-sm text-slate-600">
          <p className="font-medium text-slate-800">Connecté en tant que {admin.fullName}</p>
          <p className="mt-1">
            {admin.isSuper
              ? "Super-administrateur : tu peux nommer et révoquer les administrateurs."
              : "Administrateur : lecture complète, actions courantes."}{" "}
            Chaque action faite ici est enregistrée dans le journal.
          </p>
          <p className="mt-3">
            <Link href="/dashboard" className="font-medium text-[#1a2744] underline">
              Retourner à l&apos;application
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
