import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"

import { createServerClient, createAdminClient } from "@/lib/supabase-server"
import { createPspTransaction } from "@/lib/psp"
import { getPlan } from "@/lib/plans"

export const dynamic = "force-dynamic"

/**
 * « Je clique pour m'abonner. »
 *
 * On enregistre l'intention (subscription_payments en attente), on demande un
 * lien de paiement au PSP, et on renvoie l'adresse où payer. Rien n'est activé
 * ici : c'est le webhook, à la confirmation du PSP, qui prolongera
 * l'organisation. Un client ne doit jamais pouvoir déclarer son propre
 * abonnement réglé.
 */

const bodySchema = z.object({
  plan: z.enum(["solo", "pro", "agence"]),
  // Un an d'avance est le maximum : au-delà, on parle de contrat, pas de clic.
  mois: z.number().int().min(1).max(12).default(1),
})

export async function POST(request: NextRequest) {
  const parsed = bodySchema.safeParse(await request.json().catch(() => ({})))
  if (!parsed.success) {
    return NextResponse.json({ error: "Requête invalide" }, { status: 400 })
  }
  const { plan: planId, mois } = parsed.data

  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 })
  }

  // Interrupteur « Paiement en ligne » : coupé, aucun nouveau lien n'est fabriqué.
  const { data: pspActif } = await supabase.rpc("reglage_actif", { p_key: "psp_enabled" })
  if (pspActif === false) {
    return NextResponse.json(
      { error: "Le paiement en ligne est momentanément indisponible. Réessayez plus tard." },
      { status: 503 }
    )
  }

  // L'organisation vient de la session, jamais du corps de la requête : sinon
  // n'importe qui pourrait faire prolonger l'abonnement d'un autre.
  const { data: membre } = await supabase
    .from("users")
    .select("org_id, organizations(name, plan)")
    .eq("id", user.id)
    .maybeSingle()

  if (!membre?.org_id) {
    return NextResponse.json({ error: "Aucune organisation rattachée à ce compte" }, { status: 403 })
  }

  const plan = getPlan(planId)
  if (!plan) {
    return NextResponse.json({ error: "Plan inconnu" }, { status: 400 })
  }

  const montant = plan.priceFcfa * mois
  const reference = `SUB-${membre.org_id.slice(0, 8)}-${Date.now().toString(36)}`
  const base = request.nextUrl.origin || process.env.NEXT_PUBLIC_APP_URL || ""

  // Écrit en service_role : la table n'accepte aucune écriture par un client,
  // et c'est voulu — une intention de paiement se pose côté serveur.
  const admin = createAdminClient()
  const { data: sub, error: insErr } = await admin
    .from("subscription_payments")
    .insert({
      org_id: membre.org_id,
      plan: planId,
      amount_fcfa: montant,
      months: mois,
      reference,
      status: "pending",
      created_by: user.id,
    })
    .select("id")
    .single()

  if (insErr || !sub) {
    return NextResponse.json(
      { error: `Impossible d'enregistrer la demande : ${insErr?.message ?? "inconnu"}` },
      { status: 500 }
    )
  }

  const org = membre.organizations as unknown as { name: string } | null

  try {
    const transaction = await createPspTransaction({
      reference,
      amountFcfa: montant,
      description: `Abonnement Locawave ${plan.name} — ${mois} mois`,
      customerName: org?.name ?? "Client Locawave",
      returnUrl: `${base}/dashboard/billing?abonnement=merci`,
      cancelUrl: `${base}/dashboard/billing?abonnement=annule`,
      // Le PSP rappelle une fonction Edge dédiée aux abonnements — celle des
      // loyers reste séparée, pour qu'une panne d'un côté ne renverse pas
      // l'autre. L'adresse est fixée transaction par transaction, rien
      // n'oblige les deux flux à partager la même porte.
      callbackUrl: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/abonnement-webhook`,
      appUrl: base,
    })

    await admin
      .from("subscription_payments")
      .update({
        psp_provider: transaction.provider,
        psp_reference: transaction.providerRef,
        checkout_url: transaction.paymentUrl,
      })
      .eq("id", sub.id)

    return NextResponse.json({
      url: transaction.paymentUrl,
      reference,
      montant,
      fournisseur: transaction.provider,
      // En simulation, aucun franc ne bouge : l'interface doit le dire.
      simulation: transaction.provider === "simulation",
    })
  } catch (e) {
    // La demande reste en attente : elle apparaîtra dans la console comme un
    // abonnement non abouti, ce qui est une information utile.
    const message = e instanceof Error ? e.message : "inconnu"
    return NextResponse.json(
      { error: `Le fournisseur de paiement n'a pas répondu : ${message}` },
      { status: 502 }
    )
  }
}
