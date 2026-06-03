import { NextRequest, NextResponse } from "next/server"
import { createServerClient, createAdminClient } from "@/lib/supabase-server"
import { createPspTransaction } from "@/lib/psp"

export const dynamic = "force-dynamic"

/**
 * Crée un lien de paiement PSP pour une échéance (rent_schedule) et l'envoie
 * au locataire par WhatsApp. Authentifié : l'utilisateur doit appartenir à
 * l'organisation propriétaire de l'échéance (vérifié via RLS).
 */
export async function POST(request: NextRequest) {
  const { rent_schedule_id } = await request.json().catch(() => ({}))
  if (!rent_schedule_id) {
    return NextResponse.json({ error: "rent_schedule_id requis" }, { status: 400 })
  }

  // 1) Auth + lecture de l'échéance via RLS (org-isolation garantie)
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 })
  }

  const { data: schedule, error: schedErr } = await supabase
    .from("rent_schedules")
    .select(
      `id, org_id, amount_fcfa, due_date, status,
       leases(tenants(first_name, last_name, whatsapp),
              units(unit_number, properties(name)))`
    )
    .eq("id", rent_schedule_id)
    .single()

  if (schedErr || !schedule) {
    return NextResponse.json({ error: "Échéance introuvable" }, { status: 404 })
  }
  if (schedule.status === "paid") {
    return NextResponse.json({ error: "Échéance déjà payée" }, { status: 409 })
  }

  // 2) Créer la transaction chez le PSP
  const ref = `RS-${schedule.id.slice(0, 8)}-${Date.now().toString(36)}`
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!

  // @ts-expect-error relations typées en tableau par le générateur
  const lease = schedule.leases
  const tenant = lease?.tenants
  const property = lease?.units?.properties

  let tx
  try {
    tx = await createPspTransaction({
      reference: ref,
      amountFcfa: schedule.amount_fcfa,
      description: `Loyer ${property?.name ?? ""} ${lease?.units?.unit_number ?? ""} — échéance ${schedule.due_date}`,
      customerName: tenant ? `${tenant.first_name} ${tenant.last_name}` : undefined,
      customerPhone: tenant?.whatsapp ?? undefined,
      returnUrl: `${base}/pay/merci`,
      cancelUrl: `${base}/pay/annule`,
      callbackUrl: `${supabaseUrl}/functions/v1/psp-webhook`,
    })
  } catch (e) {
    return NextResponse.json(
      { error: `PSP non disponible : ${(e as Error).message}` },
      { status: 502 }
    )
  }

  // 3) Stocker le lien sur l'échéance (admin : écriture contrôlée)
  const admin = createAdminClient()
  const expiresAt = new Date(Date.now() + 72 * 3600 * 1000).toISOString() // 72h
  const { error: updErr } = await admin
    .from("rent_schedules")
    .update({
      payment_link: tx.paymentUrl,
      payment_link_ref: ref,
      payment_link_expires_at: expiresAt,
    })
    .eq("id", schedule.id)

  if (updErr) {
    return NextResponse.json({ error: "Échec d'enregistrement du lien" }, { status: 500 })
  }

  // 4) Envoyer le lien par WhatsApp (réutilise l'Edge Function existante)
  let whatsappSent = false
  if (tenant?.whatsapp) {
    const message =
      `Bonjour ${tenant.first_name}, voici votre lien de paiement sécurisé pour le loyer ` +
      `de ${new Intl.NumberFormat("fr-FR").format(schedule.amount_fcfa)} FCFA ` +
      `(${property?.name ?? ""} ${lease?.units?.unit_number ?? ""}) : ${tx.paymentUrl}`
    try {
      const res = await fetch(`${supabaseUrl}/functions/v1/send-whatsapp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
        },
        body: JSON.stringify({
          to: tenant.whatsapp,
          message,
          org_id: schedule.org_id,
        }),
      })
      whatsappSent = res.ok
    } catch {
      whatsappSent = false
    }
  }

  return NextResponse.json({
    success: true,
    provider: tx.provider,
    payment_link: tx.paymentUrl,
    reference: ref,
    whatsapp_sent: whatsappSent,
  })
}
