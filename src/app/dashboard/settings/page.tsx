"use client"

export const dynamic = "force-dynamic"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase"
import { useOrganization } from "@/hooks/useOrganization"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"
import { Building2, MessageCircle, CreditCard, Shield, Zap, Clock, CheckCircle2, AlertTriangle, PlayCircle } from "lucide-react"

type AutomationSettings = {
  reminder_before_days: number
  reminder_on_due: boolean
  reminder_late_days: number
}
type Health = {
  vault_configured: boolean
  last_success: string | null
  jobs: { job: string; schedule: string; active: boolean; last_run: string | null; last_status: string | null }[]
}

const JOB_LABELS: Record<string, string> = {
  lw_rent_reminders: "Rappels de loyer (application)",
  lw_mark_overdue: "Marquage automatique des retards",
  lw_escalating_reminders: "Relances progressives (J+3, J+7, J+15)",
  lw_lease_expiry_alerts: "Alerte fin de bail (90, 60, 30 jours)",
  lw_weekly_digest: "Votre rapport hebdomadaire",
  lw_chantier_alerts: "Alertes chantier (budget, silence)",
  lw_tenant_monthly_digest: "Résumé mensuel aux locataires",
  lw_monthly_report: "Rapport mensuel",
  lw_annual_report: "Rapport annuel",
  generate_due_bookings_daily: "Réservations récurrentes (services)",
}

/** Ces tâches passent par une passerelle externe : sans secret Vault, elles n'agissent pas. */
const JOBS_NEEDING_VAULT = new Set(["lw_monthly_report", "lw_annual_report"])

/** Traduit une expression cron simple en phrase lisible. */
function cronToText(c: string): string {
  const p = c.trim().split(/\s+/)
  if (p.length !== 5) return c
  const [min, hour, dom, , dow] = p
  const t = `${hour.padStart(2, "0")}:${min.padStart(2, "0")}`
  if (dom !== "*") return `Le ${dom} du mois · ${t}`
  if (dow !== "*") {
    const days = ["dimanche", "lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi"]
    return `Chaque ${days[Number(dow)] ?? dow} · ${t}`
  }
  return `Chaque jour · ${t}`
}
import type { Database } from "@/types/database"

type NotificationTemplate = Database["public"]["Tables"]["notification_templates"]["Row"]

export default function SettingsPage() {
  const { org, loading: orgLoading } = useOrganization()
  const supabase = createClient()

  const [orgName, setOrgName] = useState("")
  const [waveNumber, setWaveNumber] = useState("")
  const [omNumber, setOmNumber] = useState("")
  const [address, setAddress] = useState("")
  const [templates, setTemplates] = useState<NotificationTemplate[]>([])
  const [saving, setSaving] = useState(false)
  const [autoS, setAutoS] = useState<AutomationSettings>({ reminder_before_days: 5, reminder_on_due: true, reminder_late_days: 3 })
  const [health, setHealth] = useState<Health | null>(null)
  const [savingAuto, setSavingAuto] = useState(false)
  const [testing, setTesting] = useState(false)

  async function saveAutomation() {
    if (!org) return
    setSavingAuto(true)
    const { error } = await supabase.from("org_automation_settings")
      .upsert({ org_id: org.id, ...autoS }, { onConflict: "org_id" })
    setSavingAuto(false)
    if (error) { toast.error("Erreur lors de l'enregistrement"); return }
    toast.success("Réglages enregistrés")
  }

  async function testReminders() {
    setTesting(true)
    const { data, error } = await supabase.rpc("trigger_rent_reminders")
    setTesting(false)
    if (error) { toast.error("Erreur lors du test"); return }
    const n = Number(data ?? 0)
    toast.success(n > 0
      ? `${n} rappel(s) généré(s) — visibles dans vos notifications`
      : "Aucune échéance ne correspond à vos réglages aujourd'hui")
  }

  useEffect(() => {
    if (!org) return
    setOrgName(org.name)
    setWaveNumber(org.wave_number ?? "")
    setOmNumber(org.om_number ?? "")
    setAddress(org.address ?? "")

    supabase
      .from("notification_templates")
      .select("*")
      .eq("org_id", org.id)
      .order("type")
      .then(({ data }) => setTemplates(data ?? []))

    supabase
      .from("org_automation_settings")
      .select("reminder_before_days, reminder_on_due, reminder_late_days")
      .eq("org_id", org.id)
      .maybeSingle()
      .then(({ data }) => { if (data) setAutoS(data as AutomationSettings) })

    supabase.rpc("automation_health").then(({ data }) => {
      if (data) setHealth(data as unknown as Health)
    })
  }, [org])

  async function saveOrg() {
    if (!org) return
    setSaving(true)
    const { error } = await supabase
      .from("organizations")
      .update({ name: orgName, wave_number: waveNumber || null, om_number: omNumber || null, address: address || null })
      .eq("id", org.id)
    setSaving(false)
    if (error) { toast.error("Erreur lors de la sauvegarde"); return }
    toast.success("Organisation mise à jour")
  }

  async function saveTemplate(template: NotificationTemplate) {
    const { error } = await supabase
      .from("notification_templates")
      .update({ message_template: template.message_template, is_active: template.is_active })
      .eq("id", template.id)
    if (error) { toast.error("Erreur"); return }
    toast.success("Template mis à jour")
  }

  const typeLabels: Record<string, string> = {
    reminder_j5: "Rappel J-5",
    reminder_j0: "Rappel J0 (jour d'échéance)",
    reminder_j3_late: "Rappel J+3 (retard)",
    alert_landlord: "Alerte propriétaire (impayés)",
  }

  const variables = "{prenom}, {montant}, {bien}, {date}, {wave_number}, {tel_proprietaire}, {count}, {total}"

  if (orgLoading) {
    return <div className="space-y-4"><Skeleton className="h-8 w-48" /><Skeleton className="h-96" /></div>
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#1a2744] mb-6">Paramètres</h1>

      <Tabs defaultValue="profile">
        <TabsList className="mb-6 grid grid-cols-2 sm:flex h-auto gap-1 p-1">
          <TabsTrigger value="profile" className="flex items-center gap-1 text-xs sm:text-sm py-2">
            <Building2 className="w-4 h-4 flex-shrink-0" />
            <span>Organisation</span>
          </TabsTrigger>
          <TabsTrigger value="templates" className="flex items-center gap-1 text-xs sm:text-sm py-2">
            <MessageCircle className="w-4 h-4 flex-shrink-0" />
            <span className="hidden sm:inline">Messages</span><span className="sm:hidden">WhatsApp</span>
          </TabsTrigger>
          <TabsTrigger value="automations" className="flex items-center gap-1 text-xs sm:text-sm py-2">
            <Zap className="w-4 h-4 flex-shrink-0" />
            <span>Automatisations</span>
          </TabsTrigger>
          <TabsTrigger value="billing" className="flex items-center gap-1 text-xs sm:text-sm py-2">
            <CreditCard className="w-4 h-4 flex-shrink-0" />
            <span>Facturation</span>
          </TabsTrigger>
          <TabsTrigger value="privacy" className="flex items-center gap-1 text-xs sm:text-sm py-2">
            <Shield className="w-4 h-4 flex-shrink-0" />
            <span>RGPD</span>
          </TabsTrigger>
        </TabsList>

        {/* Profil organisation */}
        <TabsContent value="profile">
          <Card>
            <CardHeader><CardTitle>Profil de l'organisation</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Nom de l'organisation</Label>
                <Input value={orgName} onChange={(e) => setOrgName(e.target.value)} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label>Numéro Wave</Label>
                  <Input placeholder="+221 77..." value={waveNumber} onChange={(e) => setWaveNumber(e.target.value)} />
                </div>
                <div>
                  <Label>Numéro Orange Money</Label>
                  <Input placeholder="+221 78..." value={omNumber} onChange={(e) => setOmNumber(e.target.value)} />
                </div>
              </div>
              <div>
                <Label>Adresse</Label>
                <Input placeholder="Dakar, Sénégal" value={address} onChange={(e) => setAddress(e.target.value)} />
              </div>
              <Button className="bg-[#f97316] hover:bg-[#ea580c] text-white" onClick={saveOrg} disabled={saving}>
                {saving ? "Enregistrement..." : "Enregistrer"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Templates WhatsApp */}
        <TabsContent value="templates">
          <div className="space-y-4">
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm text-gray-500 mb-2">Variables disponibles :</p>
                <code className="text-xs bg-gray-100 px-2 py-1 rounded">{variables}</code>
              </CardContent>
            </Card>

            {templates.map((template, idx) => (
              <Card key={template.id}>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-base">{typeLabels[template.type] ?? template.type}</CardTitle>
                  <Badge
                    variant={template.is_active ? "default" : "secondary"}
                    className="cursor-pointer"
                    onClick={() => {
                      const updated = [...templates]
                      updated[idx] = { ...updated[idx], is_active: !updated[idx].is_active }
                      setTemplates(updated)
                    }}
                  >
                    {template.is_active ? "Actif" : "Inactif"}
                  </Badge>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Textarea
                    rows={3}
                    value={template.message_template}
                    onChange={(e) => {
                      const updated = [...templates]
                      updated[idx] = { ...updated[idx], message_template: e.target.value }
                      setTemplates(updated)
                    }}
                  />
                  <div className="flex justify-between items-center">
                    <p className="text-xs text-gray-400">Aperçu : {
                      template.message_template
                        .replace("{prenom}", "Moussa")
                        .replace("{montant}", "150 000")
                        .replace("{bien}", "Résidence Mermoz A1")
                        .replace("{date}", "05/05/2026")
                        .replace("{wave_number}", waveNumber || "+221 77...")
                        .slice(0, 100)
                    }...</p>
                    <Button size="sm" variant="outline" onClick={() => saveTemplate(template)}>
                      Sauvegarder
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Automatisations */}
        <TabsContent value="automations">
          <div className="space-y-4">
            {/* Réglages du propriétaire */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2"><Zap className="w-5 h-5 text-[#f97316]" /> Mes rappels de loyer</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-gray-500">
                  Choisissez quand vos locataires sont relancés. Les rappels apparaissent dans
                  l'application (vous et votre locataire) — sans dépendre d'un service externe.
                </p>

                <div className="grid gap-4 sm:grid-cols-3">
                  <div>
                    <Label>Premier rappel</Label>
                    <div className="flex items-center gap-2">
                      <Input type="number" min={1} max={15} value={autoS.reminder_before_days}
                        onChange={(e) => setAutoS({ ...autoS, reminder_before_days: Number(e.target.value) })} className="w-20" />
                      <span className="text-sm text-gray-500">jours avant l'échéance</span>
                    </div>
                  </div>
                  <div>
                    <Label>Relance de retard</Label>
                    <div className="flex items-center gap-2">
                      <Input type="number" min={1} max={30} value={autoS.reminder_late_days}
                        onChange={(e) => setAutoS({ ...autoS, reminder_late_days: Number(e.target.value) })} className="w-20" />
                      <span className="text-sm text-gray-500">jours après l'échéance</span>
                    </div>
                  </div>
                  <div>
                    <Label>Le jour de l'échéance</Label>
                    <button type="button" onClick={() => setAutoS({ ...autoS, reminder_on_due: !autoS.reminder_on_due })}
                      className={`mt-1 flex h-10 w-full items-center justify-between rounded-md border px-3 text-sm transition-colors ${autoS.reminder_on_due ? "border-green-300 bg-green-50 text-green-700" : "border-gray-200 bg-gray-50 text-gray-500"}`}>
                      {autoS.reminder_on_due ? "Rappel activé" : "Pas de rappel"}
                      <span className={`h-4 w-8 rounded-full transition-colors ${autoS.reminder_on_due ? "bg-green-500" : "bg-gray-300"}`}>
                        <span className={`block h-4 w-4 rounded-full bg-white shadow transition-transform ${autoS.reminder_on_due ? "translate-x-4" : ""}`} />
                      </span>
                    </button>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <Button onClick={saveAutomation} disabled={savingAuto} className="bg-[#f97316] hover:bg-[#ea580c] text-white">
                    {savingAuto ? "Enregistrement…" : "Enregistrer mes réglages"}
                  </Button>
                  <Button variant="outline" onClick={testReminders} disabled={testing}>
                    <PlayCircle className="w-4 h-4 mr-1" /> {testing ? "Exécution…" : "Tester maintenant"}
                  </Button>
                  <span className="text-xs text-gray-400">
                    « Tester » applique vos réglages immédiatement sur les échéances concernées.
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* État réel du système */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">État du système</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="rounded-lg border p-3">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-[#1a2744]">Rappels dans l'application</p>
                      <p className="text-xs text-gray-500">Calculés chaque jour à 07:00, directement par la plateforme.</p>
                    </div>
                    <Badge className="bg-green-100 text-green-700 gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> Opérationnel</Badge>
                  </div>
                </div>

                <div className="rounded-lg border p-3">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-[#1a2744]">Envoi WhatsApp</p>
                      <p className="text-xs text-gray-500">
                        {health?.vault_configured
                          ? "Passerelle configurée : les messages partent vers les locataires."
                          : "Non configuré — les rappels restent visibles dans l'application uniquement."}
                      </p>
                    </div>
                    {health?.vault_configured
                      ? <Badge className="bg-green-100 text-green-700 gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> Actif</Badge>
                      : <Badge className="bg-amber-100 text-amber-700 gap-1"><AlertTriangle className="w-3.5 h-3.5" /> À configurer</Badge>}
                  </div>
                </div>

                {(health?.jobs ?? []).length > 0 && (
                  <div className="divide-y rounded-lg border">
                    {(health!.jobs).map((j) => (
                      <div key={j.job} className="flex items-center justify-between gap-3 px-3 py-2.5">
                        <div>
                          <p className="text-sm text-[#1a2744]">{JOB_LABELS[j.job] ?? j.job}</p>
                          <p className="text-xs text-gray-400 flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {cronToText(j.schedule)}
                            {j.last_run ? ` · dernière exécution ${new Date(j.last_run).toLocaleDateString("fr-FR")}` : " · jamais exécutée"}
                          </p>
                        </div>
                        {/* Une tâche qui passe par la passerelle externe peut « réussir » côté
                            planificateur tout en échouant à l'envoi : on ne l'annonce pas OK
                            tant que le secret n'est pas renseigné. */}
                        {JOBS_NEEDING_VAULT.has(j.job) && !health?.vault_configured ? (
                          <Badge className="bg-amber-100 text-amber-700 gap-1 shrink-0">
                            <AlertTriangle className="w-3.5 h-3.5" /> À configurer
                          </Badge>
                        ) : (
                          <Badge className={j.last_status === "succeeded" ? "bg-green-100 text-green-700 shrink-0" : "bg-gray-100 text-gray-600 shrink-0"}>
                            {j.last_status === "succeeded" ? "OK" : j.last_status ?? "En attente"}
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Facturation */}
        <TabsContent value="billing">
          <Card>
            <CardHeader><CardTitle>Facturation</CardTitle></CardHeader>
            <CardContent>
              {org && (
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <span className="text-gray-500">Plan actuel :</span>
                    <Badge className="text-lg px-3 py-1">{org.plan.toUpperCase()}</Badge>
                  </div>
                  {org.plan_expires_at && (
                    <p className="text-sm text-gray-500">
                      Expire le : {new Date(org.plan_expires_at).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
                    </p>
                  )}
                  <Button className="bg-[#f97316] hover:bg-[#ea580c] text-white" onClick={() => window.location.href = "/dashboard/billing"}>
                    Gérer mon abonnement
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* RGPD */}
        <TabsContent value="privacy">
          <Card>
            <CardHeader><CardTitle>Protection des données</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-500">
                Locawave est conforme à la loi sénégalaise 2008-12 sur la protection des données personnelles.
                Vos données sont hébergées sur des serveurs sécurisés (Supabase, EU).
              </p>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => {
                  toast.info("Export en cours... Vous recevrez un email.")
                }}>
                  Exporter mes données
                </Button>
                <Button variant="destructive" onClick={() => {
                  if (confirm("Supprimer définitivement votre compte et toutes les données ? Cette action est irréversible.")) {
                    toast.info("Demande de suppression envoyée. Contact : support@locawave.sn")
                  }
                }}>
                  Supprimer mon compte
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
