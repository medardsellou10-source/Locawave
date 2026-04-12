"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase"
import { useOrganization } from "@/hooks/useOrganization"
import { useUser } from "@/hooks/useUser"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { Building2, Home, Users, ArrowRight, ArrowLeft, Check, Loader2 } from "lucide-react"
import { propertySchema, unitSchema, tenantSchema } from "@/lib/schemas"

const STEPS = [
  { icon: Building2, label: "Organisation" },
  { icon: Home, label: "Premier bien" },
  { icon: Users, label: "Premier locataire" },
]

export default function OnboardingPage() {
  const router = useRouter()
  const { org } = useOrganization()
  const { appUser } = useUser()
  const supabase = createClient()

  const [step, setStep] = useState(0)
  const [saving, setSaving] = useState(false)

  // Step 0 — Org
  const [orgName, setOrgName] = useState("")
  const [waveNumber, setWaveNumber] = useState("")

  // Step 1 — Property + Unit
  const [propertyName, setPropertyName] = useState("")
  const [propertyAddress, setPropertyAddress] = useState("")
  const [unitNumber, setUnitNumber] = useState("")
  const [unitRent, setUnitRent] = useState("")

  // Step 2 — Tenant
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [phone, setPhone] = useState("")

  async function handleFinish() {
    if (!org) return
    setSaving(true)

    try {
      // Update org
      if (orgName) {
        await supabase.from("organizations").update({
          name: orgName,
          wave_number: waveNumber || null,
        }).eq("id", org.id)
      }

      // Create property
      let propertyId: string | null = null
      if (propertyName) {
        const { data: prop, error: propErr } = await supabase
          .from("properties")
          .insert({ org_id: org.id, name: propertyName, address: propertyAddress || null, type: "appartement" })
          .select("id")
          .single()
        if (propErr) throw propErr
        propertyId = prop.id
      }

      // Create unit
      let unitId: string | null = null
      if (propertyId && unitNumber) {
        const { data: unit, error: unitErr } = await supabase
          .from("units")
          .insert({
            org_id: org.id,
            property_id: propertyId,
            unit_number: unitNumber,
            rent_fcfa: parseInt(unitRent) || 0,
            status: "vacant",
          })
          .select("id")
          .single()
        if (unitErr) throw unitErr
        unitId = unit.id
      }

      // Create tenant
      if (firstName && lastName && phone) {
        await supabase.from("tenants").insert({
          org_id: org.id,
          first_name: firstName,
          last_name: lastName,
          whatsapp: phone,
        })
      }

      // Mark onboarding complete
      await supabase.from("organizations").update({ onboarding_completed: true }).eq("id", org.id)

      toast.success("Configuration terminée !")
      router.push("/dashboard")
    } catch {
      toast.error("Erreur lors de la configuration")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto py-8">
      <h1 className="text-2xl font-bold text-[#1a2744] mb-2">Bienvenue sur Locawave !</h1>
      <p className="text-gray-500 mb-8">Configurons votre espace en quelques étapes.</p>

      {/* Progress */}
      <div className="flex items-center gap-2 mb-8">
        {STEPS.map((s, i) => (
          <div key={s.label} className="flex items-center gap-2 flex-1">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${
              i < step ? "bg-green-500 text-white" : i === step ? "bg-[#f97316] text-white" : "bg-gray-200 text-gray-500"
            }`}>
              {i < step ? <Check className="w-5 h-5" /> : <s.icon className="w-5 h-5" />}
            </div>
            <span className={`text-sm hidden sm:inline ${i === step ? "text-[#1a2744] font-medium" : "text-gray-400"}`}>{s.label}</span>
            {i < STEPS.length - 1 && <div className={`flex-1 h-0.5 ${i < step ? "bg-green-500" : "bg-gray-200"}`} />}
          </div>
        ))}
      </div>

      {/* Step 0 — Organisation */}
      {step === 0 && (
        <Card>
          <CardHeader><CardTitle>Votre organisation</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Nom de votre agence / société</Label>
              <Input placeholder="Ex: Agence Mermoz Immo" value={orgName} onChange={(e) => setOrgName(e.target.value)} />
            </div>
            <div>
              <Label>Numéro Wave (pour recevoir les paiements)</Label>
              <Input placeholder="+221 77 123 45 67" value={waveNumber} onChange={(e) => setWaveNumber(e.target.value)} />
            </div>
            <div className="flex justify-end">
              <Button className="bg-[#f97316] hover:bg-[#ea580c] text-white" onClick={() => setStep(1)}>
                Suivant <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 1 — Premier bien */}
      {step === 1 && (
        <Card>
          <CardHeader><CardTitle>Ajoutez votre premier bien</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Nom du bien</Label>
              <Input placeholder="Ex: Résidence Mermoz" value={propertyName} onChange={(e) => setPropertyName(e.target.value)} />
            </div>
            <div>
              <Label>Adresse</Label>
              <Input placeholder="Dakar, Mermoz" value={propertyAddress} onChange={(e) => setPropertyAddress(e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Numéro du lot</Label>
                <Input placeholder="A1" value={unitNumber} onChange={(e) => setUnitNumber(e.target.value)} />
              </div>
              <div>
                <Label>Loyer mensuel (FCFA)</Label>
                <Input type="number" placeholder="150000" value={unitRent} onChange={(e) => setUnitRent(e.target.value)} />
              </div>
            </div>
            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(0)}>
                <ArrowLeft className="w-4 h-4 mr-1" /> Retour
              </Button>
              <Button className="bg-[#f97316] hover:bg-[#ea580c] text-white" onClick={() => setStep(2)}>
                Suivant <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 2 — Premier locataire */}
      {step === 2 && (
        <Card>
          <CardHeader><CardTitle>Ajoutez votre premier locataire</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Prénom</Label>
                <Input placeholder="Moussa" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
              </div>
              <div>
                <Label>Nom</Label>
                <Input placeholder="Diallo" value={lastName} onChange={(e) => setLastName(e.target.value)} />
              </div>
            </div>
            <div>
              <Label>Téléphone WhatsApp</Label>
              <Input placeholder="+221 77 000 00 00" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(1)}>
                <ArrowLeft className="w-4 h-4 mr-1" /> Retour
              </Button>
              <Button className="bg-[#f97316] hover:bg-[#ea580c] text-white" onClick={handleFinish} disabled={saving}>
                {saving ? <><Loader2 className="w-4 h-4 mr-1 animate-spin" /> Enregistrement...</> : <>Terminer <Check className="w-4 h-4 ml-1" /></>}
              </Button>
            </div>
            <p className="text-xs text-gray-400 text-center">Vous pourrez ajouter d'autres biens et locataires depuis le tableau de bord.</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
