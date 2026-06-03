import { NextRequest, NextResponse } from "next/server"
import { getPspProvider, computeWebhookSignature } from "@/lib/psp"

export const dynamic = "force-dynamic"

/**
 * Déclenche le webhook PSP signé en MODE SIMULATION uniquement.
 * Reproduit la notification qu'enverrait un vrai PSP après paiement.
 * Désactivé si un vrai PSP est configuré (le webhook viendra alors du PSP).
 */
export async function POST(request: NextRequest) {
  if (getPspProvider() !== "simulation") {
    return NextResponse.json(
      { error: "Simulation désactivée (PSP réel configuré)" },
      { status: 403 }
    )
  }

  const { ref, amount } = await request.json().catch(() => ({}))
  if (!ref) return NextResponse.json({ error: "ref requis" }, { status: 400 })

  const secret = process.env.PSP_WEBHOOK_SECRET
  if (!secret) {
    return NextResponse.json({ error: "PSP_WEBHOOK_SECRET manquant" }, { status: 500 })
  }

  const event = {
    reference: ref,
    providerRef: `SIM-${ref}`,
    amount: Number(amount) || 0,
    status: "paid",
    provider: "simulation",
  }
  const rawBody = JSON.stringify(event)
  const signature = await computeWebhookSignature(rawBody, secret)

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const res = await fetch(`${supabaseUrl}/functions/v1/psp-webhook`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-psp-signature": signature,
      // Passe le gateway Supabase ; le webhook est déployé en --no-verify-jwt
      apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
    },
    body: rawBody,
  })

  const data = await res.json().catch(() => ({}))
  return NextResponse.json(data, { status: res.ok ? 200 : 502 })
}
