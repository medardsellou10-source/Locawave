"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase"
import { useOrganization } from "@/hooks/useOrganization"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { CreditCard, Check, Star, Building2, Loader2 } from "lucide-react"
import type { Database } from "@/types/database"

type PlanId = "solo" | "pro" | "agence"

const PLANS: { id: PlanId; name: string; price: number; features: string[]; icon: typeof CreditCard; popular?: boolean }[] = [
  {
    id: "solo",
    name: "Solo",
    price: 10000,
    features: ["Jusqu'à 5 biens", "Rappels WhatsApp", "Quittances PDF", "1 utilisateur"],
    icon: CreditCard,
  },
  {
    id: "pro",
    name: "Pro",
    price: 20000,
    features: ["Jusqu'à 25 biens", "Rappels WhatsApp", "Quittances PDF", "Rapports mensuels", "3 utilisateurs", "Support prioritaire"],
    icon: Star,
    popular: true,
  },
  {
    id: "agence",
    name: "Agence",
    price: 45000,
    features: ["Biens illimités", "Tout dans Pro", "Utilisateurs illimités", "API & intégrations", "Support dédié"],
    icon: Building2,
  },
]

export default function BillingPage() {
  const { org } = useOrganization()
  const supabase = createClient()
  const [upgrading, setUpgrading] = useState<string | null>(null)

  const currentPlan = org?.plan ?? "trial"
  const expiresAt = org?.plan_expires_at ? new Date(org.plan_expires_at) : null

  async function handleUpgrade(planId: PlanId) {
    if (!org) return
    setUpgrading(planId)

    // En production : rediriger vers Wave/OM payment page
    // Pour l'instant : mise à jour directe (simulation)
    const expiryDate = new Date()
    expiryDate.setMonth(expiryDate.getMonth() + 1)

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase.from("organizations") as any)
      .update({ plan: planId, plan_expires_at: expiryDate.toISOString() })
      .eq("id", org.id)

    setUpgrading(null)

    if (error) {
      toast.error("Erreur lors de la mise à jour du plan")
      return
    }

    toast.success(`Plan ${planId.toUpperCase()} activé ! Expire le ${expiryDate.toLocaleDateString("fr-FR")}`)
    window.location.reload()
  }

  const fmt = (n: number) => new Intl.NumberFormat("fr-FR").format(n)

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#1a2744] mb-2">Facturation</h1>
      <p className="text-gray-500 mb-6">Gérez votre abonnement Locawave.</p>

      {/* Current plan */}
      <Card className="mb-8">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Plan actuel</p>
              <div className="flex items-center gap-3">
                <Badge className="text-lg px-4 py-1.5">{currentPlan.toUpperCase()}</Badge>
                {currentPlan === "trial" && (
                  <span className="text-sm text-orange-600 font-medium">Essai gratuit</span>
                )}
              </div>
            </div>
            {expiresAt && (
              <div className="text-right">
                <p className="text-sm text-gray-500">Expire le</p>
                <p className="font-medium text-[#1a2744]">
                  {expiresAt.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
                </p>
                {expiresAt < new Date() && (
                  <Badge variant="destructive" className="mt-1">Expiré</Badge>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Plans */}
      <div className="grid md:grid-cols-3 gap-6">
        {PLANS.map((plan) => {
          const isCurrent = currentPlan === plan.id
          return (
            <Card key={plan.id} className={`relative ${plan.popular ? "ring-2 ring-[#f97316]" : ""}`}>
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#f97316] text-white text-xs font-bold px-3 py-1 rounded-full">
                  POPULAIRE
                </div>
              )}
              <CardHeader>
                <div className="flex items-center gap-2">
                  <plan.icon className="w-5 h-5 text-[#f97316]" />
                  <CardTitle>{plan.name}</CardTitle>
                </div>
                <div className="flex items-baseline gap-1 mt-2">
                  <span className="text-3xl font-bold text-[#1a2744]">{fmt(plan.price)}</span>
                  <span className="text-sm text-gray-500">FCFA/mois</span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 mb-6">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-gray-600">
                      <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                {isCurrent ? (
                  <Button className="w-full" variant="outline" disabled>
                    Plan actuel
                  </Button>
                ) : (
                  <Button
                    className="w-full bg-[#f97316] hover:bg-[#ea580c] text-white"
                    onClick={() => handleUpgrade(plan.id)}
                    disabled={upgrading !== null}
                  >
                    {upgrading === plan.id ? (
                      <><Loader2 className="w-4 h-4 mr-1 animate-spin" /> Activation...</>
                    ) : (
                      `Passer au ${plan.name}`
                    )}
                  </Button>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Payment info */}
      <Card className="mt-8">
        <CardContent className="pt-6">
          <h3 className="font-semibold text-[#1a2744] mb-2">Modes de paiement acceptés</h3>
          <p className="text-sm text-gray-500 mb-4">
            Le paiement s'effectue par Wave ou Orange Money. Après validation, votre plan est activé immédiatement.
          </p>
          <div className="flex gap-4">
            <div className="bg-blue-50 rounded-lg px-4 py-2 text-sm font-medium text-blue-700">Wave</div>
            <div className="bg-orange-50 rounded-lg px-4 py-2 text-sm font-medium text-orange-700">Orange Money</div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
