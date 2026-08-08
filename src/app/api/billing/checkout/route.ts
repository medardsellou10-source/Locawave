import { NextRequest, NextResponse } from "next/server"
import { createServerClient, createAdminClient } from "@/lib/supabase-server"
import { createPspTransaction } from "@/lib/psp"
import { PLANS, type PlanId } from "@/lib/plans"

export const dynamic = "force-dynamic"

/**
 * Ouvre le paiement d'un abonnement.
 *
 * L'écran Facturation activait auparavant le plan directement — un simple
 * UPDATE sur organizations — sans encaisser quoi que ce soit : cliquer
 * « Passer au Pro » suffisait à obtenir le plan gratuitement.
 *
 * Le plan n'est plus jamais activé ici. Cette route se contente d'enregistrer
 * une intention de paiement et de renvoyer l'URL de règlement ; c'est le
 * webhook PSP, et lui seul, qui bascule le statut à « paid » — ce qui déclenche
 * l'activation en base (trigger activer_abonnement).
 */
export async function POST(request: NextRequest) {
  const { plan_id, months } = await request.json().catch(() => ({}))

  const plan = PLANS.find((p) => p.id === plan_id)
  if (!plan) {
    return NextResponse.json({ error: "Plan inconnu" }, { status: 400 })
  }

  const mois = Number.isInteger(months) && months > 0 && months <= 12 ? months : 1

  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 })

  // L'organisation est lue via la RLS : on ne fait pas confiance à un org_id
  // envoyé par le client, qui pourrait payer pour l'organisation d'un autre.
  const { data: membre } = await supabase
    .from("users").select("org_id").eq("id", user.id).maybeSingle()
  if (!membre?.org_id) {
    return NextResponse.json({ error: "Aucune organisation rattachée" }, { status: 403 })
  }

  const { data: org } = await supabase
    .from("organizations").select("id, name").eq("id", membre.org_id).maybeSingle()
  if (!org) return NextResponse.json({ error: "Organisation introuvable" }, { status: 404 })

  const montant = plan.priceFcfa * mois
  const reference = `SUB-${org.id.slice(0, 8)}-${Date.now().toString(36).toUpperCase()}`
  const base = request.nextUrl.origin || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"

  const admin = createAdminClient()

  // On enregistre AVANT d'appeler le PSP : si le webhook arrive très vite, il
  // doit déjà trouver la ligne à mettre à jour.
  const { data: paiement, error: insErr } = await admin
    .from("subscription_payments")
    .insert({
      org_id: org.id, plan: plan.id as PlanId, amount_fcfa: montant,
      months: mois, reference, status: "pending", created_by: user.id,
    })
    .select("id")
    .single()

  if (insErr || !paiement) {
    return NextResponse.json(
      { error: `Enregistrement impossible : ${insErr?.message ?? "inconnu"}` },
      { status: 500 }
    )
  }

  let tx
  try {
    tx = await createPspTransaction({
      reference,
      amountFcfa: montant,
      description: `Abonnement Locawave ${plan.name} — ${mois} mois — ${org.name}`,
      customerName: org.name,
      customerPhone: undefined,
      returnUrl: `${base}/dashboard/billing?paiement=succes`,
      cancelUrl: `${base}/dashboard/billing?paiement=annule`,
      callbackUrl: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/psp-webhook`,
      appUrl: base,
    })
  } catch (e) {
    // L'intention reste en base au statut 'failed' : on garde la trace de la
    // tentative plutôt que de la faire disparaître.
    await admin.from("subscription_payments")
      .update({ status: "failed" }).eq("id", paiement.id)
    return NextResponse.json(
      { error: `Paiement indisponible : ${(e as Error).message}` },
      { status: 502 }
    )
  }

  await admin.from("subscription_payments")
    .update({
      psp_provider: tx.provider,
      psp_reference: tx.providerRef,
      checkout_url: tx.paymentUrl,
    })
    .eq("id", paiement.id)

  return NextResponse.json({
    checkout_url: tx.paymentUrl,
    reference,
    amount_fcfa: montant,
    months: mois,
    provider: tx.provider,
  })
}
