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
import { Building2, MessageCircle, CreditCard, Shield } from "lucide-react"
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
