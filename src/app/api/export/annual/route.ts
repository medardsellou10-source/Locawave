import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase-server"

export const dynamic = "force-dynamic"

/**
 * Relevé annuel (CSV) : revenus / charges / net par bien pour une année.
 * Authentifié : la RLS limite automatiquement aux données de l'organisation de l'utilisateur.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const year = Number(searchParams.get("year")) || new Date().getFullYear()
  const start = `${year}-01-01`
  const end = `${year}-12-31`

  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 })

  const [{ data: payments }, { data: expenses }, { data: properties }] = await Promise.all([
    supabase.from("payments")
      .select("amount_fcfa, rent_schedules(leases(units(property_id)))")
      .gte("paid_at", start).lte("paid_at", end + "T23:59:59"),
    supabase.from("expenses")
      .select("amount_fcfa, property_id").gte("date", start).lte("date", end),
    supabase.from("properties").select("id, name"),
  ])

  const nameById = new Map((properties ?? []).map((p) => [p.id, p.name]))
  const agg = new Map<string, { revenus: number; charges: number }>()

  for (const p of (payments ?? []) as any[]) {
    const pid = p.rent_schedules?.leases?.units?.property_id
    if (!pid) continue
    const cur = agg.get(pid) ?? { revenus: 0, charges: 0 }
    cur.revenus += p.amount_fcfa
    agg.set(pid, cur)
  }
  for (const e of (expenses ?? []) as any[]) {
    const cur = agg.get(e.property_id) ?? { revenus: 0, charges: 0 }
    cur.charges += e.amount_fcfa
    agg.set(e.property_id, cur)
  }

  let totalR = 0, totalC = 0
  const lines = Array.from(agg.entries()).map(([id, v]) => {
    totalR += v.revenus; totalC += v.charges
    const name = (nameById.get(id) ?? "Bien supprimé").replace(/[,";\n]/g, " ")
    return `${name},${v.revenus},${v.charges},${v.revenus - v.charges}`
  })

  const header = `Releve annuel ${year}`
  const cols = "Bien,Revenus_FCFA,Charges_FCFA,Net_FCFA"
  const total = `TOTAL,${totalR},${totalC},${totalR - totalC}`
  const csv = [header, "", cols, ...lines, "", total].join("\n")

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename=locawave-releve-${year}.csv`,
    },
  })
}
