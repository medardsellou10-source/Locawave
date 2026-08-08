// Edge Function: psp-webhook
// Reçoit les notifications du PSP (GeniusPay / PayDunya / CinetPay / simulation),
// vérifie la signature, et — de façon IDEMPOTENTE — encaisse l'échéance : crée le
// paiement, passe l'échéance à 'paid' et génère la quittance.
//
// GeniusPay a son propre schéma de signature, confirmé expérimentalement contre
// l'API réelle : HMAC-SHA256 HEXADÉCIMAL sur `timestamp + "." + corps_BRUT`,
// avec le secret COMPLET (préfixe whsec_ inclus). La doc du fournisseur illustre
// la vérification sur un corps ré-encodé (json_encode côté PHP) : les deux
// coïncident tant que GeniusPay émet du JSON compact, ce qui est le cas.
//
// Sécurité : aucune donnée bancaire n'est stockée ; la signature est obligatoire
// (refus si secret absent). Une même référence PSP n'encaisse qu'une seule fois.

import { serve } from "https://deno.land/std@0.177.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
const WEBHOOK_SECRET = Deno.env.get("PSP_WEBHOOK_SECRET") ?? ""
const GENIUSPAY_WEBHOOK_SECRET = Deno.env.get("GENIUSPAY_WEBHOOK_SECRET") ?? ""

interface PspEvent {
  reference: string // = rent_schedules.payment_link_ref
  providerRef: string // référence côté PSP (idempotence)
  amount: number
  status: string
  provider?: string
}

async function hmacHex(data: string, secret: string): Promise<string> {
  const enc = new TextEncoder()
  const key = await crypto.subtle.importKey(
    "raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]
  )
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(data))
  return Array.from(new Uint8Array(sig)).map((b) => b.toString(16).padStart(2, "0")).join("")
}

function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let diff = 0
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i)
  return diff === 0
}

/** Vrai si la signature GeniusPay du corps brut est valide. */
async function geniusPaySignatureValide(req: Request, rawBody: string): Promise<boolean> {
  if (!GENIUSPAY_WEBHOOK_SECRET) return false
  const signature = (req.headers.get("x-webhook-signature") ?? "").toLowerCase()
  const timestamp = req.headers.get("x-webhook-timestamp") ?? ""
  if (!signature || !timestamp) return false
  const expected = await hmacHex(`${timestamp}.${rawBody}`, GENIUSPAY_WEBHOOK_SECRET)
  return safeEqual(signature, expected)
}

/**
 * Vérifie un webhook GeniusPay et le normalise vers PspEvent.
 * Renvoie `null` si la signature ou la charge utile sont inexploitables ; le motif
 * exact est journalisé (jamais le secret) pour rendre les refus diagnosticables.
 */
async function verifyGeniusPay(req: Request, rawBody: string): Promise<PspEvent | null> {
  if (!GENIUSPAY_WEBHOOK_SECRET) {
    console.error("geniuspay: GENIUSPAY_WEBHOOK_SECRET absent de l'environnement")
    return null
  }

  const signature = (req.headers.get("x-webhook-signature") ?? "").toLowerCase()
  const timestamp = req.headers.get("x-webhook-timestamp") ?? ""
  if (!signature || !timestamp) {
    console.error("geniuspay: en-tête de signature ou de timestamp manquant")
    return null
  }

  if (!(await geniusPaySignatureValide(req, rawBody))) {
    // On journalise les 8 premiers caractères de chaque signature : suffisant pour
    // diagnostiquer un mauvais secret, insuffisant pour le reconstituer.
    const expected = await hmacHex(`${timestamp}.${rawBody}`, GENIUSPAY_WEBHOOK_SECRET)
    console.error(
      `geniuspay: signature invalide (reçue ${signature.slice(0, 8)}…, ` +
      `attendue ${expected.slice(0, 8)}…, corps ${rawBody.length} octets)`
    )
    return null
  }

  const skewSeconds = Math.abs(Math.floor(Date.now() / 1000) - Number(timestamp))
  if (!Number.isFinite(skewSeconds) || skewSeconds > 300) {
    console.error(`geniuspay: timestamp hors fenêtre anti-rejeu (écart ${skewSeconds}s)`)
    return null
  }

  let payload: {
    event?: string
    data?: {
      reference?: string
      amount?: number
      status?: string
      provider?: string
      metadata?: { locawave_reference?: string }
    }
  }
  try {
    payload = JSON.parse(rawBody)
  } catch {
    console.error("geniuspay: corps JSON illisible")
    return null
  }

  const d = payload.data
  const ourRef = d?.metadata?.locawave_reference
  if (!d || !ourRef || !d.status || !d.reference) {
    console.error(
      `geniuspay: charge utile incomplète (event=${payload.event ?? "?"}, ` +
      `référence interne=${ourRef ?? "absente"}, statut=${d?.status ?? "absent"})`
    )
    return null
  }

  return {
    reference: ourRef,
    providerRef: d.reference,
    amount: d.amount ?? 0,
    status: d.status,
    provider: d.provider ?? "geniuspay",
  }
}

serve(async (req: Request) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 })
  }

  const rawBody = await req.text()
  const isGeniusPay = req.headers.has("x-webhook-signature") && req.headers.has("x-webhook-event")

  let event: PspEvent

  if (isGeniusPay) {
    // `webhook.test` est l'évènement de vérification d'intégration du tableau de
    // bord GeniusPay : sa signature est valide mais il ne porte aucune
    // transaction. On répond 200 pour que le test s'affiche vert, sans encaisser.
    let estTest = false
    try { estTest = JSON.parse(rawBody)?.event === "webhook.test" } catch { /* corps non-JSON */ }
    if (estTest) {
      if (await geniusPaySignatureValide(req, rawBody)) {
        console.log("geniuspay: webhook.test reçu, signature valide")
        return new Response(JSON.stringify({ ok: true, test: true }), {
          headers: { "Content-Type": "application/json" },
        })
      }
      return new Response(JSON.stringify({ error: "Signature GeniusPay invalide" }), { status: 401 })
    }

    const normalized = await verifyGeniusPay(req, rawBody)
    if (!normalized) {
      return new Response(JSON.stringify({ error: "Signature GeniusPay invalide" }), { status: 401 })
    }
    event = normalized
  } else {
    if (!WEBHOOK_SECRET) {
      return new Response(JSON.stringify({ error: "Webhook non configuré" }), { status: 500 })
    }
    const provided =
      req.headers.get("x-psp-signature") ??
      req.headers.get("x-paydunya-signature") ??
      req.headers.get("x-token") ??
      ""
    const expected = await hmacHex(rawBody, WEBHOOK_SECRET)
    if (!provided || !safeEqual(provided.toLowerCase(), expected)) {
      return new Response(JSON.stringify({ error: "Signature invalide" }), { status: 401 })
    }
    try {
      event = JSON.parse(rawBody)
    } catch {
      return new Response(JSON.stringify({ error: "JSON invalide" }), { status: 400 })
    }
  }

  const supabase = createClient(SUPABASE_URL, SERVICE_KEY)

  // Statuts GeniusPay : pending | processing | completed | failed | cancelled |
  // refunded | expired. Seul un paiement abouti encaisse.
  const succeeded = event.status === "paid" || event.status === "completed"

  // ─── Abonnement ───
  // Nos références d'abonnement commencent par SUB-. Sans cet aiguillage, un
  // paiement d'abonnement serait cherché dans rent_schedules, introuvable, et
  // la route renverrait 404 : le client aurait payé sans jamais obtenir son plan.
  if (event.reference.startsWith("SUB-")) {
    const { data: abo } = await supabase
      .from("subscription_payments")
      .select("id, org_id, status, plan")
      .eq("reference", event.reference)
      .maybeSingle()

    if (!abo) {
      console.error(`abonnement inconnu pour la référence ${event.reference}`)
      return new Response(JSON.stringify({ error: "Abonnement inconnu" }), { status: 404 })
    }

    // Déjà encaissé : une seconde livraison du même webhook ne doit pas
    // prolonger l'abonnement une deuxième fois.
    if (abo.status === "paid") {
      return new Response(JSON.stringify({ ok: true, duplicate: true }), {
        headers: { "Content-Type": "application/json" },
      })
    }

    if (!succeeded) {
      await supabase.from("subscription_payments")
        .update({ status: event.status === "cancelled" ? "cancelled" : "failed", updated_at: new Date().toISOString() })
        .eq("id", abo.id)
      return new Response(JSON.stringify({ ok: true, ignored: event.status }), {
        headers: { "Content-Type": "application/json" },
      })
    }

    // Le passage à 'paid' déclenche activer_abonnement() : c'est le trigger,
    // et lui seul, qui met à jour le plan de l'organisation.
    const { error: majErr } = await supabase
      .from("subscription_payments")
      .update({
        status: "paid",
        psp_reference: event.providerRef,
        paid_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", abo.id)

    if (majErr) {
      console.error(`activation impossible pour ${event.reference} : ${majErr.message}`)
      return new Response(
        JSON.stringify({ error: "Activation impossible", detail: majErr.message }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      )
    }

    await supabase.from("activity_logs").insert({
      org_id: abo.org_id,
      action: "abonnement_paye",
      entity_type: "subscription_payment",
      entity_id: abo.id,
      metadata: { plan: abo.plan, providerRef: event.providerRef, amount: event.amount },
    })

    return new Response(JSON.stringify({ ok: true, abonnement: abo.plan }), {
      headers: { "Content-Type": "application/json" },
    })
  }

  const { data: schedule } = await supabase
    .from("rent_schedules")
    .select("id, org_id, amount_fcfa")
    .eq("payment_link_ref", event.reference)
    .maybeSingle()

  if (!schedule) {
    console.error(`échéance inconnue pour la référence interne ${event.reference}`)
    return new Response(JSON.stringify({ error: "Échéance inconnue" }), { status: 404 })
  }

  await supabase.from("activity_logs").insert({
    org_id: schedule.org_id,
    action: "psp_webhook",
    entity_type: "rent_schedule",
    entity_id: schedule.id,
    metadata: { status: event.status, providerRef: event.providerRef, provider: event.provider ?? null },
  })

  if (!succeeded) {
    return new Response(JSON.stringify({ ok: true, ignored: event.status }), {
      headers: { "Content-Type": "application/json" },
    })
  }

  const { data: existing } = await supabase
    .from("payments")
    .select("id")
    .eq("psp_reference", event.providerRef)
    .maybeSingle()

  if (existing) {
    return new Response(JSON.stringify({ ok: true, duplicate: true }), {
      headers: { "Content-Type": "application/json" },
    })
  }

  // `amount_fcfa` est un entier ; GeniusPay peut renvoyer un décimal (350000.00).
  const montant = Math.round(Number(event.amount)) || schedule.amount_fcfa

  const { data: payment, error: payErr } = await supabase
    .from("payments")
    .insert({
      org_id: schedule.org_id,
      rent_schedule_id: schedule.id,
      amount_fcfa: montant,
      method: "psp",
      psp_provider: event.provider ?? "simulation",
      psp_reference: event.providerRef,
      reference: event.providerRef,
      paid_at: new Date().toISOString(),
    })
    .select()
    .single()

  if (payErr || !payment) {
    // 23505 = violation d'unicité sur psp_reference : une autre livraison du même
    // webhook a déjà encaissé. C'est le seul cas réellement idempotent → 200.
    if (payErr?.code === "23505") {
      return new Response(JSON.stringify({ ok: true, duplicate: true }), {
        headers: { "Content-Type": "application/json" },
      })
    }
    // Tout autre échec est une VRAIE erreur. Répondre 2xx ici ferait croire au PSP
    // que l'encaissement a réussi et l'empêcherait de réessayer : on renvoie 500.
    console.error(
      `encaissement impossible pour ${event.providerRef} : ` +
      `${payErr?.message ?? "insertion sans ligne renvoyée"} ` +
      `(code=${payErr?.code ?? "?"}, details=${payErr?.details ?? "?"}, hint=${payErr?.hint ?? "?"})`
    )
    return new Response(
      JSON.stringify({ error: "Encaissement impossible", detail: payErr?.message ?? null }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    )
  }

  await supabase.from("rent_schedules").update({ status: "paid" }).eq("id", schedule.id)

  // Numérotation des quittances : déléguée à next_receipt_number(), qui sérialise
  // les émissions concurrentes d'une même organisation et dérive le numéro du
  // maximum réel. L'ancien calcul côté fonction comptait les lignes de
  // l'organisation alors que l'unicité était globale : le deuxième bailleur à
  // encaisser produisait un numéro déjà pris, et la quittance était perdue.
  const { data: receiptNumber, error: numErr } = await supabase
    .rpc("next_receipt_number", { p_org: schedule.org_id })

  let receipt: string | null = null
  if (numErr || !receiptNumber) {
    console.error(`numéro de quittance indisponible : ${numErr?.message ?? "aucun numéro renvoyé"}`)
  } else {
    const { error: recErr } = await supabase
      .from("receipts")
      .insert({ org_id: schedule.org_id, payment_id: payment.id, receipt_number: receiptNumber })
    if (recErr) {
      // Le paiement est encaissé : on ne renvoie pas d'erreur au PSP (il
      // réessaierait un encaissement déjà fait). On journalise pour rattrapage.
      console.error(
        `quittance non générée pour le paiement ${payment.id} ` +
        `(numéro ${receiptNumber}) : ${recErr.message} (code=${recErr.code ?? "?"})`
      )
    } else {
      receipt = receiptNumber as string
    }
  }

  return new Response(
    JSON.stringify({ ok: true, payment_id: payment.id, receipt }),
    { headers: { "Content-Type": "application/json" } }
  )
})
