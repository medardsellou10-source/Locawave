import { NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase-server"

export async function POST(request: NextRequest) {
  const supabase = createAdminClient()
  const { payment_id } = await request.json()

  if (!payment_id) {
    return NextResponse.json({ error: "payment_id requis" }, { status: 400 })
  }

  // Récupérer les données du paiement + locataire + bien + org
  const { data: payment, error: payErr } = await supabase
    .from("payments")
    .select(`
      *,
      rent_schedules(
        due_date, amount_fcfa,
        leases(
          start_date, end_date, rent_fcfa,
          tenants(first_name, last_name, whatsapp),
          units(unit_number, properties(name, address, city))
        )
      ),
      receipts(receipt_number, pdf_url)
    `)
    .eq("id", payment_id)
    .single()

  if (payErr || !payment) {
    return NextResponse.json({ error: "Paiement introuvable" }, { status: 404 })
  }

  const { data: org } = await supabase
    .from("organizations")
    .select("name, address, wave_number")
    .eq("id", payment.org_id)
    .single()

  const lease = payment.rent_schedules?.leases
  const tenant = lease?.tenants
  const unit = lease?.units
  const property = unit?.properties
  const receipt = payment.receipts?.[0]

  const methodLabels: Record<string, string> = {
    wave: "Wave", orange_money: "Orange Money", cash: "Espèces",
  }

  // Données pour le PDF (sera utilisé par le frontend ou un service de génération)
  const receiptData = {
    receipt_number: receipt?.receipt_number ?? "N/A",
    date: new Date(payment.paid_at).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" }),
    owner: {
      name: org?.name ?? "Propriétaire",
      address: org?.address ?? "",
      wave: org?.wave_number ?? "",
    },
    tenant: {
      name: tenant ? `${tenant.first_name} ${tenant.last_name}` : "Locataire",
      whatsapp: tenant?.whatsapp ?? "",
    },
    property: {
      name: property?.name ?? "",
      unit: unit?.unit_number ?? "",
      address: [property?.address, property?.city].filter(Boolean).join(", "),
    },
    period: {
      due_date: payment.rent_schedules?.due_date ?? "",
      month: new Date(payment.rent_schedules?.due_date ?? "").toLocaleDateString("fr-FR", { month: "long", year: "numeric" }),
    },
    amount: {
      rent_fcfa: payment.amount_fcfa,
      formatted: new Intl.NumberFormat("fr-FR").format(payment.amount_fcfa) + " FCFA",
    },
    method: methodLabels[payment.method] ?? payment.method,
    reference: payment.reference ?? "",
    pdf_url: receipt?.pdf_url ?? null,
  }

  return NextResponse.json(receiptData)
}
