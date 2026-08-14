// Edge Function: abonnement-webhook
//
// Reçoit la confirmation de règlement d'un ABONNEMENT Locawave et active le
// plan de l'organisation.
//
// Pourquoi une fonction séparée de psp-webhook, qui encaisse les loyers :
// l'adresse de rappel est fixée transaction par transaction, donc rien n'oblige
// les deux flux à partager la même porte. Les garder séparés évite de toucher à
// un encaissement de loyer éprouvé pour ajouter une fonctionnalité, et une
// panne d'un côté ne renverse pas l'autre.
//
// Toute la règle métier (prolongation, non-régression du temps déjà payé,
// idempotence) vit dans la fonction SQL abonnement_regle(). Ici on vérifie la
// signature, on constate le statut, et on transmet.

import { serve } from "https://deno.land/std@0.177.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
const WEBHOOK_SECRET = Deno.env.get("PSP_WEBHOOK_SECRET") ?? ""
const GENIUSPAY_WEBHOOK_SECRET = Deno.env.get("GENIUSPAY_WEBHOOK_SECRET") ?? ""

async function hmacHex(data: string, secret: string): Promise<string> {
  const enc = new TextEncoder()
  const key = await crypto.subtle.importKey(
    "raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]
  )
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(data))
  return Array.from(new Uint8Array(sig)).map((b) => b.toString(16).padStart(2, "0")).join("")
}

/** Comparaison à temps constant : une comparaison naïve fuit la signature. */
function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let diff = 0
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i)
  return diff === 0
}

type Evenement = { reference: string; providerRef: string; status: string; provider?: string }

serve(async (req: Request) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 })
  }

  const rawBody = await req.text()
  const estGeniusPay =
    req.headers.has("x-webhook-signature") && req.headers.has("x-webhook-event")

  let evenement: Evenement

  if (estGeniusPay) {
    if (!GENIUSPAY_WEBHOOK_SECRET) {
      console.error("geniuspay: secret absent de l'environnement")
      return new Response(JSON.stringify({ error: "Webhook non configuré" }), { status: 500 })
    }
    const signature = (req.headers.get("x-webhook-signature") ?? "").toLowerCase()
    const timestamp = req.headers.get("x-webhook-timestamp") ?? ""
    if (!signature || !timestamp) {
      return new Response(JSON.stringify({ error: "Signature manquante" }), { status: 401 })
    }
    const attendue = await hmacHex(`${timestamp}.${rawBody}`, GENIUSPAY_WEBHOOK_SECRET)
    if (!safeEqual(signature, attendue)) {
      console.error(`geniuspay: signature invalide (reçue ${signature.slice(0, 8)}…)`)
      return new Response(JSON.stringify({ error: "Signature invalide" }), { status: 401 })
    }
    // Fenêtre anti-rejeu : une signature valide capturée hier ne doit pas
    // pouvoir être renvoyée aujourd'hui.
    const ecart = Math.abs(Math.floor(Date.now() / 1000) - Number(timestamp))
    if (!Number.isFinite(ecart) || ecart > 300) {
      return new Response(JSON.stringify({ error: "Horodatage hors fenêtre" }), { status: 401 })
    }

    let charge: {
      event?: string
      data?: {
        reference?: string
        status?: string
        provider?: string
        metadata?: { locawave_reference?: string }
      }
    }
    try {
      charge = JSON.parse(rawBody)
    } catch {
      return new Response(JSON.stringify({ error: "JSON invalide" }), { status: 400 })
    }

    // Test d'intégration du tableau de bord : signature valide, aucune
    // transaction. On répond 200 sans rien activer.
    if (charge.event === "webhook.test") {
      return new Response(JSON.stringify({ ok: true, test: true }), {
        headers: { "Content-Type": "application/json" },
      })
    }

    const d = charge.data
    const notreRef = d?.metadata?.locawave_reference
    if (!d || !notreRef || !d.status || !d.reference) {
      console.error(`geniuspay: charge utile incomplète (référence ${notreRef ?? "absente"})`)
      return new Response(JSON.stringify({ error: "Charge utile incomplète" }), { status: 400 })
    }
    evenement = {
      reference: notreRef,
      providerRef: d.reference,
      status: d.status,
      provider: d.provider ?? "geniuspay",
    }
  } else {
    if (!WEBHOOK_SECRET) {
      return new Response(JSON.stringify({ error: "Webhook non configuré" }), { status: 500 })
    }
    const fournie =
      req.headers.get("x-psp-signature") ??
      req.headers.get("x-paydunya-signature") ??
      req.headers.get("x-token") ??
      ""
    const attendue = await hmacHex(rawBody, WEBHOOK_SECRET)
    if (!fournie || !safeEqual(fournie.toLowerCase(), attendue)) {
      return new Response(JSON.stringify({ error: "Signature invalide" }), { status: 401 })
    }
    try {
      evenement = JSON.parse(rawBody)
    } catch {
      return new Response(JSON.stringify({ error: "JSON invalide" }), { status: 400 })
    }
  }

  const supabase = createClient(SUPABASE_URL, SERVICE_KEY)

  const { data: abonnement } = await supabase
    .from("subscription_payments")
    .select("id, org_id, status")
    .eq("reference", evenement.reference)
    .maybeSingle()

  if (!abonnement) {
    console.error(`abonnement inconnu pour la référence ${evenement.reference}`)
    return new Response(JSON.stringify({ error: "Abonnement inconnu" }), { status: 404 })
  }

  await supabase.from("activity_logs").insert({
    org_id: abonnement.org_id,
    action: "psp_webhook_abonnement",
    entity_type: "subscription_payment",
    entity_id: abonnement.id,
    metadata: {
      status: evenement.status,
      providerRef: evenement.providerRef,
      provider: evenement.provider ?? null,
    },
  })

  // Seul un règlement abouti active quoi que ce soit. Un statut intermédiaire
  // se journalise et s'arrête là.
  const abouti = evenement.status === "paid" || evenement.status === "completed"
  if (!abouti) {
    return new Response(JSON.stringify({ ok: true, ignore: evenement.status }), {
      headers: { "Content-Type": "application/json" },
    })
  }

  const { data: resultat, error } = await supabase.rpc("abonnement_regle", {
    p_reference: evenement.reference,
    p_psp_reference: evenement.providerRef,
  })

  if (error) {
    // Répondre 2xx ici ferait croire au PSP que c'est activé et l'empêcherait de
    // réessayer. On renvoie 500 pour qu'il relivre.
    console.error(`activation refusée pour ${evenement.reference} : ${error.message}`)
    return new Response(
      JSON.stringify({ error: "Activation impossible", detail: error.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    )
  }

  return new Response(JSON.stringify({ ok: true, abonnement: resultat }), {
    headers: { "Content-Type": "application/json" },
  })
})
