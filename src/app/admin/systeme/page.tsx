import {
  Database,
  Lock,
  ShieldAlert,
  Timer,
  HardDrive,
  KeyRound,
  GitCommitHorizontal,
  CircleCheck,
  CircleX,
} from "lucide-react"

import { requireAdmin } from "@/lib/admin"
import { createServerClient } from "@/lib/supabase-server"
import { StatCard } from "@/components/app/StatCard"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export const dynamic = "force-dynamic"

/**
 * La salle des machines : ce que la base sait d'elle-même, plus ce que le
 * serveur sait de son environnement.
 *
 * Lecture seule, sans exception. Les variables d'environnement ne sont montrées
 * que par leur PRÉSENCE — jamais leur valeur : une console qui affiche un secret
 * le met dans un historique de navigateur, une capture d'écran, un partage.
 */

type Systeme = {
  tables: {
    nom: string
    rls: boolean
    policies: number
    lignes: number
    taille: string
    extension: boolean
  }[]
  fonctions_privilegiees: {
    nom: string
    search_path_fige: boolean
    executable_par_anon: boolean
    extension: boolean
  }[]
  buckets: { nom: string; public: boolean; fichiers: number }[]
  cron: {
    nom: string
    planification: string
    active: boolean
    commande: string
    dernier_passage: {
      statut: string
      le: string
      duree_s: number | null
      message: string | null
    } | null
    echecs_7j: number
  }[]
  migrations: { version: string; nom: string | null }[]
  extensions: { nom: string; version: string; schema: string }[]
  compteurs: {
    tables: number
    sans_rls: number
    rls_sans_policy: number
    policies: number
    definer_sans_path: number
    buckets_publics: number
    cron_actives: number
    cron_en_echec_7j: number
    migrations: number
    taille_base: string
  }
  lu_le: string
}

/** Ce qui doit être configuré pour que la plateforme tienne ses promesses. */
const VARIABLES = [
  { nom: "NEXT_PUBLIC_SUPABASE_URL", role: "Base de données", vital: true },
  { nom: "NEXT_PUBLIC_SUPABASE_ANON_KEY", role: "Accès client", vital: true },
  { nom: "SUPABASE_SERVICE_ROLE_KEY", role: "Invitations, liens de connexion", vital: false },
  { nom: "NEXT_PUBLIC_APP_URL", role: "Liens envoyés aux utilisateurs", vital: false },
  { nom: "TWILIO_ACCOUNT_SID", role: "Rappels WhatsApp", vital: false },
  { nom: "TWILIO_AUTH_TOKEN", role: "Rappels WhatsApp", vital: false },
  { nom: "WHATSAPP_FROM", role: "Numéro émetteur WhatsApp", vital: false },
  { nom: "PSP_PROVIDER", role: "Fournisseur de paiement", vital: false },
  { nom: "PSP_WEBHOOK_SECRET", role: "Signature des webhooks de paiement", vital: false },
  { nom: "GENIUSPAY_API_KEY", role: "Paiement GeniusPay", vital: false },
  { nom: "GENIUSPAY_WEBHOOK_SECRET", role: "Webhook GeniusPay", vital: false },
  { nom: "RESEND_API_KEY", role: "Emails transactionnels", vital: false },
  { nom: "SENTRY_DSN", role: "Remontée d'erreurs", vital: false },
]

function Oui({ v }: { v: boolean }) {
  return v ? (
    <CircleCheck className="h-4 w-4 text-green-600" />
  ) : (
    <CircleX className="h-4 w-4 text-red-500" />
  )
}

export default async function AdminSystemePage() {
  await requireAdmin()

  const supabase = await createServerClient()
  const { data, error } = await supabase.rpc("admin_system")

  if (error || !data) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="p-6 text-sm text-red-800">
          Lecture impossible : {error?.message ?? "réponse vide"}
        </CardContent>
      </Card>
    )
  }

  const s = data as unknown as Systeme

  // Présence seulement : la valeur ne sort jamais du serveur.
  const env = VARIABLES.map((v) => ({
    ...v,
    presente: Boolean(process.env[v.nom]?.trim()) && process.env[v.nom] !== "TO_BE_SET",
  }))
  const manquantesVitales = env.filter((v) => v.vital && !v.presente)

  const version = process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ?? "local"
  const environnement = process.env.VERCEL_ENV ?? "développement"
  const branche = process.env.VERCEL_GIT_COMMIT_REF ?? "—"

  const tablesNotres = s.tables.filter((t) => !t.extension)
  const aRegarder = tablesNotres.filter((t) => !t.rls || t.policies === 0)
  // Les fonctions installées par une extension (PostGIS) ne sont pas les nôtres :
  // on les compte à part plutôt que de les signaler comme un défaut à corriger.
  const fonctionsNotres = s.fonctions_privilegiees.filter((f) => !f.extension)
  const definerSansPath = fonctionsNotres.filter((f) => !f.search_path_fige)
  const definerAnon = fonctionsNotres.filter((f) => f.executable_par_anon)

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Base &amp; sécurité</h1>
        <p className="mt-1 text-sm text-slate-500">
          Ce que la base sait d&apos;elle-même, lu à l&apos;instant —{" "}
          {new Date(s.lu_le).toLocaleString("fr-FR", {
            dateStyle: "long",
            timeStyle: "short",
          })}
          .
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Tables (hors extensions)"
          value={String(s.compteurs.tables)}
          icon={Database}
          tone="navy"
          hint={`${s.compteurs.policies} policies · base de ${s.compteurs.taille_base}`}
        />
        <StatCard
          label="Tables sans RLS"
          value={String(s.compteurs.sans_rls)}
          icon={Lock}
          tone={s.compteurs.sans_rls > 0 ? "red" : "green"}
          hint={
            s.compteurs.rls_sans_policy > 0
              ? `${s.compteurs.rls_sans_policy} avec RLS mais aucune policy`
              : "toutes protégées"
          }
        />
        <StatCard
          label="Fonctions à privilèges"
          value={String(fonctionsNotres.length)}
          icon={ShieldAlert}
          tone={s.compteurs.definer_sans_path > 0 ? "orange" : "green"}
          hint={`${s.compteurs.definer_sans_path} sans search_path figé`}
        />
        <StatCard
          label="Tâches planifiées"
          value={String(s.compteurs.cron_actives)}
          icon={Timer}
          tone={s.compteurs.cron_en_echec_7j > 0 ? "red" : "green"}
          hint={
            s.compteurs.cron_en_echec_7j > 0
              ? `${s.compteurs.cron_en_echec_7j} en échec sur 7 jours`
              : "aucun échec sur 7 jours"
          }
        />
      </div>

      {/* ===== Version déployée ===== */}
      <Card>
        <CardContent className="p-5">
          <h2 className="flex items-center gap-2 pb-3 font-semibold text-slate-800">
            <GitCommitHorizontal className="h-4 w-4" />
            Version en service
          </h2>
          <div className="flex flex-wrap gap-x-8 gap-y-2 text-sm">
            <span className="text-slate-600">
              Commit <code className="font-medium text-slate-900">{version}</code>
            </span>
            <span className="text-slate-600">
              Branche <b className="text-slate-900">{branche}</b>
            </span>
            <span className="text-slate-600">
              Environnement <b className="text-slate-900">{environnement}</b>
            </span>
            <span className="text-slate-600">
              Migrations appliquées <b className="text-slate-900">{s.compteurs.migrations}</b>
            </span>
          </div>
        </CardContent>
      </Card>

      {/* ===== Variables d'environnement ===== */}
      <Card>
        <CardContent className="p-5">
          <h2 className="flex items-center gap-2 pb-1 font-semibold text-slate-800">
            <KeyRound className="h-4 w-4" />
            Configuration
          </h2>
          <p className="pb-3 text-xs text-slate-400">
            Présence uniquement. Aucune valeur n&apos;est lue ni affichée : un secret montré
            dans une console finit dans un historique ou une capture d&apos;écran.
          </p>
          {manquantesVitales.length > 0 && (
            <p className="mb-3 rounded-lg bg-red-50 p-3 text-sm text-red-800">
              Manque l&apos;essentiel : {manquantesVitales.map((v) => v.nom).join(", ")}
            </p>
          )}
          <ul className="grid gap-x-8 gap-y-2 sm:grid-cols-2">
            {env.map((v) => (
              <li key={v.nom} className="flex items-center justify-between gap-3 text-sm">
                <span className="min-w-0">
                  <code className="text-xs text-slate-700">{v.nom}</code>
                  <span className="block text-xs text-slate-400">{v.role}</span>
                </span>
                <Oui v={v.presente} />
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* ===== Tâches planifiées ===== */}
      <Card>
        <CardContent className="p-5">
          <h2 className="pb-3 font-semibold text-slate-800">Tâches planifiées</h2>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[680px] text-sm">
              <thead className="text-left text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="pb-2 font-medium">Tâche</th>
                  <th className="pb-2 font-medium">Planification</th>
                  <th className="pb-2 font-medium">Dernier passage</th>
                  <th className="pb-2 font-medium">État</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {s.cron.map((c) => (
                  <tr key={c.nom}>
                    <td className="py-2 font-medium text-slate-800">{c.nom}</td>
                    <td className="py-2">
                      <code className="text-xs text-slate-600">{c.planification}</code>
                    </td>
                    <td className="py-2 text-slate-600">
                      {c.dernier_passage
                        ? new Date(c.dernier_passage.le).toLocaleString("fr-FR", {
                            dateStyle: "short",
                            timeStyle: "short",
                          })
                        : "jamais"}
                    </td>
                    <td className="py-2">
                      {!c.active ? (
                        <Badge variant="outline" className="text-slate-500">
                          désactivée
                        </Badge>
                      ) : c.echecs_7j > 0 ? (
                        <Badge className="bg-red-100 text-red-700 hover:bg-red-100">
                          {c.echecs_7j} échec(s) / 7 j
                        </Badge>
                      ) : c.dernier_passage?.statut === "succeeded" ? (
                        <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                          passée
                        </Badge>
                      ) : (
                        <Badge variant="outline">en attente</Badge>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* ===== Stockage ===== */}
      <Card>
        <CardContent className="p-5">
          <h2 className="flex items-center gap-2 pb-3 font-semibold text-slate-800">
            <HardDrive className="h-4 w-4" />
            Stockage
          </h2>
          <ul className="space-y-2">
            {s.buckets.map((b) => (
              <li key={b.nom} className="flex items-center justify-between text-sm">
                <span className="text-slate-700">
                  {b.nom}
                  <span className="ml-2 text-xs text-slate-400">
                    {b.fichiers} fichier{b.fichiers > 1 ? "s" : ""}
                  </span>
                </span>
                {b.public ? (
                  <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100">
                    public
                  </Badge>
                ) : (
                  <Badge className="bg-green-100 text-green-700 hover:bg-green-100">privé</Badge>
                )}
              </li>
            ))}
          </ul>
          <p className="mt-3 text-xs text-slate-400">
            Un bucket public sert des fichiers à qui connaît l&apos;URL, sans authentification.
            Seules les photos d&apos;annonces ont vocation à l&apos;être.
          </p>
        </CardContent>
      </Card>

      {/* ===== Tables & RLS ===== */}
      <Card>
        <CardContent className="p-5">
          <h2 className="pb-1 font-semibold text-slate-800">Tables et isolation</h2>
          <p className="pb-3 text-xs text-slate-400">
            Une table sans RLS est lisible par quiconque a la clé publique. Une table avec
            RLS mais sans policy est l&apos;inverse : fermée à tout le monde. Les deux se
            voient ici.
          </p>
          {aRegarder.length > 0 && (
            <p className="mb-3 rounded-lg bg-amber-50 p-3 text-sm text-amber-900">
              À regarder : {aRegarder.map((t) => t.nom).join(", ")}
            </p>
          )}
          <div className="max-h-96 overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-white text-left text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="pb-2 font-medium">Table</th>
                  <th className="pb-2 font-medium">RLS</th>
                  <th className="pb-2 font-medium">Policies</th>
                  <th className="pb-2 text-right font-medium">Lignes</th>
                  <th className="pb-2 text-right font-medium">Taille</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {tablesNotres.map((t) => (
                  <tr key={t.nom} className={!t.rls || t.policies === 0 ? "bg-amber-50" : ""}>
                    <td className="py-1.5 text-slate-800">{t.nom}</td>
                    <td className="py-1.5">
                      <Oui v={t.rls} />
                    </td>
                    <td className="py-1.5 text-slate-600">{t.policies}</td>
                    <td className="py-1.5 text-right text-slate-600">{t.lignes}</td>
                    <td className="py-1.5 text-right text-slate-500">{t.taille}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* ===== Fonctions à privilèges ===== */}
      <Card>
        <CardContent className="p-5">
          <h2 className="pb-1 font-semibold text-slate-800">
            Fonctions à privilèges ({fonctionsNotres.length})
          </h2>
          <p className="pb-3 text-xs text-slate-400">
            Elles s&apos;exécutent avec les droits de leur propriétaire. Sans search_path
            figé, un schéma glissé devant peut détourner ce qu&apos;elles appellent.
            {s.fonctions_privilegiees.length - fonctionsNotres.length > 0 && (
              <>
                {" "}
                {s.fonctions_privilegiees.length - fonctionsNotres.length} autres
                appartiennent à une extension (PostGIS) et ne sont pas comptées ici.
              </>
            )}
          </p>
          {definerAnon.length > 0 && (
            <p className="mb-3 rounded-lg bg-red-50 p-3 text-sm text-red-800">
              Exécutables sans être connecté : {definerAnon.map((f) => f.nom).join(", ")}
            </p>
          )}
          {definerSansPath.length === 0 ? (
            <p className="text-sm text-green-700">
              Toutes ont un search_path figé.
            </p>
          ) : (
            <p className="rounded-lg bg-amber-50 p-3 text-sm text-amber-900">
              Sans search_path figé : {definerSansPath.map((f) => f.nom).join(", ")}
            </p>
          )}
        </CardContent>
      </Card>

      {/* ===== Migrations ===== */}
      <Card>
        <CardContent className="p-5">
          <h2 className="pb-3 font-semibold text-slate-800">
            Dernières migrations appliquées
          </h2>
          <ul className="space-y-1 text-sm">
            {s.migrations.slice(0, 12).map((m) => (
              <li key={m.version} className="flex items-baseline gap-3">
                <code className="text-xs text-slate-400">{m.version}</code>
                <span className="text-slate-700">{m.nom ?? "—"}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <p className="text-xs text-slate-400">
        Cette page est en lecture seule, et le restera. Une console qui laisserait exécuter
        du SQL arbitraire ne serait plus une console d&apos;administration mais une porte
        dérobée : le jour où une session d&apos;administrateur fuite, elle donne la base
        entière.
      </p>
    </div>
  )
}
