/**
 * Abstraction PSP (Prestataire de Services de Paiement) — Phase 2.
 *
 * Objectif : encaisser les loyers via Wave / Orange Money par lien de paiement,
 * SANS jamais détenir les fonds ni stocker de donnée bancaire. On orchestre des
 * transactions chez un PSP agréé (PayDunya / CinetPay) et on pilote le statut.
 *
 * Tant qu'aucun compte PSP n'est branché, le provider "simulation" permet de
 * tester tout le flux (création de lien → webhook → quittance) de bout en bout.
 *
 * Pour brancher un vrai PSP : renseigner les secrets (voir .env.example) et
 * compléter les blocs createTransaction / verifySignature du provider choisi.
 */

export type PspProvider = "simulation" | "paydunya" | "cinetpay" | "geniuspay"

export function getPspProvider(): PspProvider {
  const p = (process.env.PSP_PROVIDER ?? "simulation").toLowerCase()
  if (p === "paydunya" || p === "cinetpay" || p === "geniuspay") return p
  return "simulation"
}

export interface CreateTransactionInput {
  reference: string // notre référence interne (= payment_link_ref)
  amountFcfa: number
  description: string
  customerName?: string
  customerPhone?: string
  returnUrl: string
  cancelUrl: string
  callbackUrl: string // webhook PSP → Edge Function psp-webhook
  appUrl?: string // domaine réel de l'app (pour le lien simulation)
}

export interface CreateTransactionResult {
  paymentUrl: string
  providerRef: string
  provider: PspProvider
}

/**
 * Crée une transaction de paiement chez le PSP et renvoie l'URL à présenter
 * au locataire. Le statut final arrive via webhook (psp-webhook).
 */
export async function createPspTransaction(
  input: CreateTransactionInput
): Promise<CreateTransactionResult> {
  const provider = getPspProvider()

  if (provider === "paydunya") {
    // PayDunya — agrège Wave + Orange Money + cartes. Secrets requis :
    // PAYDUNYA_MASTER_KEY, PAYDUNYA_PRIVATE_KEY, PAYDUNYA_TOKEN, PAYDUNYA_MODE (test|live), PAYDUNYA_STORE_NAME.
    const master = process.env.PAYDUNYA_MASTER_KEY
    const priv = process.env.PAYDUNYA_PRIVATE_KEY
    const token = process.env.PAYDUNYA_TOKEN
    if (!master || !priv || !token) {
      throw new Error("PayDunya non configuré : renseigner PAYDUNYA_MASTER_KEY / PAYDUNYA_PRIVATE_KEY / PAYDUNYA_TOKEN")
    }
    const mode = (process.env.PAYDUNYA_MODE ?? "test").toLowerCase()
    const apiBase = mode === "live"
      ? "https://app.paydunya.com/api/v1"
      : "https://app.paydunya.com/sandbox-api/v1"

    const res = await fetch(`${apiBase}/checkout-invoice/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "PAYDUNYA-MASTER-KEY": master,
        "PAYDUNYA-PRIVATE-KEY": priv,
        "PAYDUNYA-TOKEN": token,
      },
      body: JSON.stringify({
        invoice: { total_amount: input.amountFcfa, description: input.description },
        store: { name: process.env.PAYDUNYA_STORE_NAME ?? "Locawave" },
        actions: {
          callback_url: input.callbackUrl,
          return_url: input.returnUrl,
          cancel_url: input.cancelUrl,
        },
        custom_data: { reference: input.reference },
      }),
    })
    const data = await res.json()
    if (data?.response_code !== "00" || !data?.token) {
      throw new Error(`PayDunya: création échouée (${data?.response_text ?? res.status})`)
    }
    const checkoutBase = mode === "live"
      ? "https://paydunya.com/checkout/invoice"
      : "https://paydunya.com/sandbox-checkout/invoice"
    return {
      provider: "paydunya",
      providerRef: data.token,
      paymentUrl: `${checkoutBase}/${data.token}`,
    }
  }

  if (provider === "geniuspay") {
    // GeniusPay — agrégateur (Wave, Orange Money, MTN, cartes) — https://geniuspay.ci
    // Secrets requis : GENIUSPAY_API_KEY (pk_...), GENIUSPAY_API_SECRET (sk_...).
    // Phase 1 : verrouillé sur Wave. GeniusPay n'a AUCUN mécanisme de séquestre —
    // c'est un encaissement direct (pending → completed), pas un hold. Ne pas
    // présenter ce provider comme un séquestre dans l'UI ou la communication.
    const apiKey = process.env.GENIUSPAY_API_KEY
    const apiSecret = process.env.GENIUSPAY_API_SECRET
    if (!apiKey || !apiSecret) {
      throw new Error("GeniusPay non configuré : renseigner GENIUSPAY_API_KEY / GENIUSPAY_API_SECRET")
    }
    const base = process.env.GENIUSPAY_BASE_URL ?? "https://geniuspay.ci/api/v1/merchant"

    const res = await fetch(`${base}/payments`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": apiKey,
        "X-API-Secret": apiSecret,
      },
      body: JSON.stringify({
        amount: input.amountFcfa,
        currency: "XOF",
        payment_method: "wave",
        // `gateway` ET `customer.country` sont indispensables : testé en sandbox,
        // avec le seul `payment_method` GeniusPay route quand même vers Orange
        // Money et géolocalise le client sur l'IP de l'appelant (on obtenait
        // country=MA pour un numéro +221). Les deux champs forcent Wave/Sénégal.
        gateway: "wave",
        description: input.description.slice(0, 500),
        customer: {
          name: input.customerName,
          phone: input.customerPhone,
          country: process.env.GENIUSPAY_COUNTRY ?? "SN",
        },
        success_url: input.returnUrl,
        error_url: input.cancelUrl,
        // GeniusPay génère sa propre `reference` (MTX-...) ; c'est via metadata
        // que NOTRE référence interne fait l'aller-retour jusqu'au webhook.
        metadata: { locawave_reference: input.reference },
      }),
    })
    const data = await res.json()
    if (!res.ok || data?.success !== true || !data?.data) {
      throw new Error(`GeniusPay: création échouée (${data?.error?.message ?? res.status})`)
    }
    const paymentUrl: string | undefined = data.data.payment_url ?? data.data.checkout_url
    if (!paymentUrl) {
      throw new Error("GeniusPay: réponse sans URL de paiement")
    }
    return {
      provider: "geniuspay",
      providerRef: data.data.reference, // MTX-xxxxxxxxxx
      paymentUrl,
    }
  }

  if (provider === "cinetpay") {
    // === À COMPLÉTER avec un compte CinetPay ===
    // Secrets requis : CINETPAY_API_KEY, CINETPAY_SITE_ID
    // POST https://api-checkout.cinetpay.com/v2/payment
    //   body: { apikey, site_id, transaction_id: reference, amount, currency: 'XOF',
    //           description, notify_url: callbackUrl, return_url, channels: 'MOBILE_MONEY',
    //           customer_name, customer_phone_number }
    // → renvoie data.payment_url + data.payment_token.
    throw new Error("CinetPay non configuré : renseigner les secrets CINETPAY_*")
  }

  // === Mode simulation (par défaut, aucun compte requis) ===
  // Génère une page de paiement factice interne ; le webhook peut être simulé.
  const base = input.appUrl ?? process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"
  return {
    provider: "simulation",
    providerRef: `SIM-${input.reference}`,
    paymentUrl: `${base}/pay/simulation?ref=${encodeURIComponent(input.reference)}&amount=${input.amountFcfa}`,
  }
}

/**
 * Construit la signature attendue d'un webhook (HMAC-SHA256 hex du corps brut).
 * Utilisé côté simulation ; pour un vrai PSP, adapter au schéma de signature
 * du fournisseur (header + algorithme documentés par PayDunya/CinetPay).
 */
export async function computeWebhookSignature(
  rawBody: string,
  secret: string
): Promise<string> {
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

/**
 * Signature webhook GeniusPay — schéma propre à ce fournisseur, DIFFÉRENT du
 * schéma générique ci-dessus : HMAC-SHA256(timestamp + "." + corps_json, secret),
 * documenté sur https://geniuspay.ci/docs/api#webhooks.
 */
export async function computeGeniusPaySignature(
  timestamp: string,
  rawBody: string,
  secret: string
): Promise<string> {
  return computeWebhookSignature(`${timestamp}.${rawBody}`, secret)
}

/** Comparaison constante (anti-timing) de deux signatures hex. */
export function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let diff = 0
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i)
  return diff === 0
}
