import { NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase-server"

export async function GET(request: NextRequest) {
  const supabase = createAdminClient()
  const { searchParams } = new URL(request.url)

  const startDate = searchParams.get("startDate")
  const endDate = searchParams.get("endDate")
  const propertyId = searchParams.get("propertyId")

  if (!startDate || !endDate) {
    return NextResponse.json({ error: "startDate et endDate requis" }, { status: 400 })
  }

  let query = supabase
    .from("payments")
    .select(`
      paid_at, amount_fcfa, method, reference,
      rent_schedules(
        due_date,
        leases(
          tenants(first_name, last_name),
          units(unit_number, properties(id, name))
        )
      )
    `)
    .gte("paid_at", startDate)
    .lte("paid_at", endDate + "T23:59:59")
    .order("paid_at", { ascending: false })

  const { data: payments, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const methodLabels: Record<string, string> = {
    wave: "Wave", orange_money: "Orange Money", cash: "Especes",
  }

  // Filtrer par propriété si spécifié
  let filtered = payments ?? []
  if (propertyId) {
    filtered = filtered.filter((p: any) => p.rent_schedules?.leases?.units?.properties?.id === propertyId)
  }

  // Générer CSV
  const header = "Date,Locataire,Bien,Unite,Montant_FCFA,Methode,Reference"
  const rows = filtered.map((p: any) => {
    const lease = p.rent_schedules?.leases
    const tenant = lease?.tenants
    const unit = lease?.units
    const property = unit?.properties

    return [
      new Date(p.paid_at).toLocaleDateString("fr-FR"),
      tenant ? `${tenant.first_name} ${tenant.last_name}` : "",
      property?.name ?? "",
      unit?.unit_number ?? "",
      p.amount_fcfa,
      methodLabels[p.method] ?? p.method,
      p.reference ?? "",
    ].join(",")
  })

  const csv = [header, ...rows].join("\n")
  const month = startDate.slice(0, 7)

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename=locawave-paiements-${month}.csv`,
    },
  })
}
