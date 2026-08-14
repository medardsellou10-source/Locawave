"use client"

export const dynamic = "force-dynamic"

import { useState } from "react"
import { createClient } from "@/lib/supabase"
import { useOrganization } from "@/hooks/useOrganization"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { CreditCard, Check, Star, Building2, Loader2, Percent } from "lucide-react"
import { PLANS, COMMISSION_LABEL, type PlanId } from "@/lib/plans"

const PLAN_ICONS: Record<PlanId, typeof CreditCard> = { solo: CreditCard, pro: Star, agence: Building2 }

export default function BillingPage() {
  const { org } = useOrganization()
  const supabase = createClient()
  const [upgrading, setUpgrading] = useState<string | null>(null)
  // Payer plusieurs mois d'avance est fréquent au Sénégal, et évite autant de
  // passages par le paiement mobile.
  const [mois, setMois] = useState(1)

  const currentPlan = org?.plan ?? "trial"
  const expiresAt = org?.plan_expires_at ? new Date(org.plan_expires_at) : null

  /**
   * S'abonner, pour de vrai.
   *
   * L'ancienne version écrivait le plan directement depuis le navigateur : un
   * clic suffisait à s'offrir l'Agence sans rien payer. Désormais on demande un
   * lien de paiement au serveur, et c'est le webhook du fournisseur qui
   * activera l'abonnement une fois le règlement confirmé.
   */
  async function handleUpgrade(planId: PlanId) {
    if (!org) return
    setUpgrading(planId)

    try {
      const res = await fetch("/api/billing/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: planId, mois }),
      })
      const data = await res.json().catch(() => ({}))

      if (!res.ok || !data.url) {
        toast.error(data.error ?? "Impossible d'ouvrir le paiement.")
        setUpgrading(null)
        return
      }

      if (data.simulation) {
        toast.info("Mode simulation : aucun franc ne sera débité.")
      }
      window.location.href = data.url
    } catch {
      toast.error("Le serveur n'a pas répondu.")
      setUpgrading(null)
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#1a2744] mb-2">Facturation</h1>
      <p className="text-gray-500 mb-6">Abonnement <strong>par biens gérés</strong> + {COMMISSION_LABEL}.</p>

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

      {/* Durée */}
      <div className="mb-6 flex flex-wrap items-center gap-2">
        <span className="text-sm text-gray-600">Je paie d&apos;avance :</span>
        {[1, 3, 6, 12].map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => setMois(m)}
            className={`rounded-lg border px-3 py-1.5 text-sm transition-colors ${
              mois === m
                ? "border-[#1a2744] bg-[#1a2744] text-white"
                : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
            }`}
          >
            {m} mois
          </button>
        ))}
      </div>

      {/* Plans */}
      <div className="grid md:grid-cols-3 gap-6">
        {PLANS.map((plan) => {
          const isCurrent = currentPlan === plan.id
          const popular = plan.id === "pro"
          const Icon = PLAN_ICONS[plan.id]
          return (
            <Card key={plan.id} className={`relative ${popular ? "ring-2 ring-[#f97316]" : ""}`}>
              {popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#f97316] text-white text-xs font-bold px-3 py-1 rounded-full">
                  POPULAIRE
                </div>
              )}
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Icon className="w-5 h-5 text-[#f97316]" />
                  <CardTitle>{plan.name}</CardTitle>
                </div>
                <p className="text-xs text-gray-500">{plan.description}</p>
                <div className="flex items-baseline gap-1 mt-2">
                  <span className="text-3xl font-bold text-[#1a2744]">{plan.price}</span>
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
                      `Passer au ${plan.name} — ${(plan.priceFcfa * mois).toLocaleString("fr-FR")} FCFA`
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
          <div className="mt-4 flex items-start gap-2 rounded-lg bg-slate-50 p-3 text-sm text-gray-600">
            <Percent className="w-4 h-4 text-[#f97316] mt-0.5 shrink-0" />
            <span>En plus de l'abonnement, une commission de <strong>5%</strong> s'applique uniquement sur les <strong>transactions de services et de chantiers</strong> réalisées dans l'app (prélevée lorsque la phase est validée et réglée). Aucune commission sur les loyers.</span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
