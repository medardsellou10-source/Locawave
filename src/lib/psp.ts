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

export type PspProvider = "simulation" | "paydunya" | "cinetpay"

export function getPspProvider(): PspProvider {
  const p = (process.env.PSP_PROVIDER ?? "simulation").toLowerCase()
  if (p === "paydunya" || p === "cinetpay") return p
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
    // === À COMPLÉTER avec un compte PayDunya ===
    // Secrets requis : PAYDUNYA_MASTER_KEY, PAYDUNYA_PRIVATE_KEY, PAYDUNYA_TOKEN, PAYDUNYA_MODE
    // POST https://app.paydunya.com/api/v1/checkout-invoice/create
    //   headers: PAYDUNYA-MASTER-KEY, PAYDUNYA-PRIVATE-KEY, PAYDUNYA-TOKEN
    //   body: { invoice: { total_amount, description }, store: {...},
    //           actions: { callback_url, return_url, cancel_url },
    //           custom_data: { reference } }
    // → renvoie response_text (token) + checkout url.
    throw new Error("PayDunya non configuré : renseigner les secrets PAYDUNYA_*")
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

/** Comparaison constante (anti-timing) de deux signatures hex. */
export function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let diff = 0
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i)
  return diff === 0
}
