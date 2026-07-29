// Edge Function: psp-webhook
// Reçoit les notifications du PSP (GeniusPay / PayDunya / CinetPay / simulation),
// vérifie la signature, et — de façon IDEMPOTENTE — encaisse l'échéance : crée le
// paiement, passe l'échéance à 'paid', génère la quittance et notifie par WhatsApp.
//
// GeniusPay a son propre schéma de signature (timestamp + corps, secret whsec_...)
// et est détecté/vérifié séparément via verifyGeniusPay() avant d'être normalisé
// vers la forme PspEvent partagée par le reste de la fonction.
//
// Sécurité : aucune donnée bancaire n'est stockée ; la signature HMAC est
// obligatoire (refus si secret absent). Une même référence PSP n'encaisse qu'une fois.

import { serve } from "https://deno.land/std@0.177.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
const WEBHOOK_SECRET = Deno.env.get("PSP_WEBHOOK_SECRET") ?? ""
// GeniusPay a son propre secret de webhook (whsec_...) et son propre schéma de
// signature — distinct du schéma générique ci-dessus. Voir normalizeGeniusPay().
const GENIUSPAY_WEBHOOK_SECRET = Deno.env.get("GENIUSPAY_WEBHOOK_SECRET") ?? ""

interface PspEvent {
  reference: string // = rent_schedules.payment_link_ref
  providerRef: string // référence côté PSP (idempotence)
  amount: number
  status: string // 'paid' | 'completed' | 'failed' | 'cancelled' | 'refunded'
  provider?: string
}

async function hmacHex(rawBody: string, secret: string): Promise<string> {
  const enc = new TextEncoder()
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  )
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(rawBody))
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
}

function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let diff = 0
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i)
  return diff === 0
}

// Statuts GeniusPay -> statuts internes attendus par la suite de la fonction.
// Doc : pending | processing | completed | failed | cancelled | refunded | expired.
function normalizeGeniusPayStatus(status: string): string {
  return status === "completed" ? "completed" : status
}

/**
 * Vérifie et normalise un webhook GeniusPay vers la forme PspEvent partagée.
 * Schéma propre à ce fournisseur (différent du schéma générique ci-dessus) :
 *   - en-têtes X-Webhook-Signature / X-Webhook-Timestamp / X-Webhook-Event
 *   - signature = HMAC-SHA256(timestamp + "." + corps_json, whsec_secret)
 *   - fenêtre anti-rejeu de 5 minutes sur le timestamp
 * Renvoie `null` si la signature ou le timestamp sont invalides.
 */
async function verifyGeniusPay(req: Request, rawBody: string): Promise<PspEvent | null> {
  if (!GENIUSPAY_WEBHOOK_SECRET) return null

  const signature = req.headers.get("x-webhook-signature") ?? ""
  const timestamp = req.headers.get("x-webhook-timestamp") ?? ""
  if (!signature || !timestamp) return null

  const expected = await hmacHex(`${timestamp}.${rawBody}`, GENIUSPAY_WEBHOOK_SECRET)
  if (!safeEqual(signature.toLowerCase(), expected)) return null

  const skewSeconds = Math.abs(Math.floor(Date.now() / 1000) - Number(timestamp))
  if (!Number.isFinite(skewSeconds) || skewSeconds > 300) return null

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
    return null
  }
  const d = payload.data
  const ourRef = d?.metadata?.locawave_reference
  if (!d || !ourRef || !d.status || !d.reference) return null

  return {
    reference: ourRef,
    providerRef: d.reference,
    amount: d.amount ?? 0,
    status: normalizeGeniusPayStatus(d.status),
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
    // GeniusPay a un schéma de signature distinct (timestamp + corps) : on ne
    // peut pas le vérifier avec le HMAC générique ci-dessous.
    const normalized = await verifyGeniusPay(req, rawBody)
    if (!normalized) {
      return new Response(JSON.stringify({ error: "Signature GeniusPay invalide" }), { status: 401 })
    }
    event = normalized
  } else {
    // Secret obligatoire : sans lui, on ne peut pas vérifier l'authenticité → refus.
    if (!WEBHOOK_SECRET) {
      return new Response(JSON.stringify({ error: "Webhook non configuré" }), { status: 500 })
    }
    // Vérification de signature (HMAC-SHA256 du corps brut)
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

  // On ne traite que les paiements aboutis ; les autres sont journalisés.
  const succeeded = event.status === "paid" || event.status === "completed"

  // 2) Retrouver l'échéance par notre référence
  const { data: schedule } = await supabase
    .from("rent_schedules")
    .select("id, org_id, amount_fcfa")
    .eq("payment_link_ref", event.reference)
    .maybeSingle()

  if (!schedule) {
    return new Response(JSON.stringify({ error: "Échéance inconnue" }), { status: 404 })
  }

  // Journaliser tout évènement
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

  // 3) Idempotence : cette référence PSP a-t-elle déjà encaissé ?
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

  // 4) Créer le paiement
  const { data: payment, error: payErr } = await supabase
    .from("payments")
    .insert({
      org_id: schedule.org_id,
      rent_schedule_id: schedule.id,
      amount_fcfa: event.amount || schedule.amount_fcfa,
      method: "psp",
      psp_provider: event.provider ?? "simulation",
      psp_reference: event.providerRef,
      reference: event.providerRef,
      paid_at: new Date().toISOString(),
    })
    .select()
    .single()

  if (payErr || !payment) {
    // Conflit d'unicité = course concurrente déjà encaissée → OK idempotent
    return new Response(JSON.stringify({ ok: true, race: true }), {
      headers: { "Content-Type": "application/json" },
    })
  }

  // 5) Passer l'échéance à 'paid'
  await supabase.from("rent_schedules").update({ status: "paid" }).eq("id", schedule.id)

  // 6) Générer la quittance (même format que l'encaissement manuel : LW-YYYY-NNNN)
  const { count } = await supabase
    .from("receipts")
    .select("*", { count: "exact", head: true })
    .eq("org_id", schedule.org_id)
  const seq = (count ?? 0) + 1
  const receiptNumber = `LW-${new Date().getFullYear()}-${String(seq).padStart(4, "0")}`
  await supabase
    .from("receipts")
    .insert({ org_id: schedule.org_id, payment_id: payment.id, receipt_number: receiptNumber })

  return new Response(
    JSON.stringify({ ok: true, payment_id: payment.id, receipt: receiptNumber }),
    { headers: { "Content-Type": "application/json" } }
  )
})
