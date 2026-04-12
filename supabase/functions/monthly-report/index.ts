import { serve } from "https://deno.land/std@0.177.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

serve(async () => {
  const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!)

  // Mois écoulé
  const now = new Date()
  const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const startDate = lastMonth.toISOString().split("T")[0]
  const endDate = new Date(now.getFullYear(), now.getMonth(), 0).toISOString().split("T")[0]
  const monthName = lastMonth.toLocaleDateString("fr-FR", { month: "long", year: "numeric" })

  // Toutes les orgs actives
  const { data: orgs } = await supabase
    .from("organizations")
    .select("id, name, wave_number")
    .neq("plan", "trial")

  let sent = 0
  for (const org of orgs ?? []) {
    // Total encaissé
    const { data: payments } = await supabase
      .from("payments")
      .select("amount_fcfa")
      .eq("org_id", org.id)
      .gte("paid_at", startDate)
      .lte("paid_at", endDate + "T23:59:59")

    const collected = payments?.reduce((s, p) => s + p.amount_fcfa, 0) ?? 0

    // Total attendu
    const { data: schedules } = await supabase
      .from("rent_schedules")
      .select("amount_fcfa")
      .eq("org_id", org.id)
      .gte("due_date", startDate)
      .lte("due_date", endDate)

    const expected = schedules?.reduce((s, r) => s + r.amount_fcfa, 0) ?? 0
    const rate = expected > 0 ? Math.round((collected / expected) * 100) : 0

    // Biens occupés
    const { data: units } = await supabase
      .from("units")
      .select("status")
      .eq("org_id", org.id)

    const totalUnits = units?.length ?? 0
    const occupiedUnits = units?.filter((u) => u.status === "rented").length ?? 0

    const fmt = (n: number) => new Intl.NumberFormat("fr-FR").format(n)

    const message = `Rapport Locawave — ${monthName}\nEncaissé : ${fmt(collected)} FCFA\nAttendu : ${fmt(expected)} FCFA\nTaux recouvrement : ${rate}%\nBiens occupés : ${occupiedUnits}/${totalUnits}\nDétails sur locawave.sn`

    await supabase.from("activity_logs").insert({
      org_id: org.id,
      action: "monthly_report",
      entity_type: "report",
      metadata: { month: monthName, collected, expected, rate, occupied: occupiedUnits, total: totalUnits, message },
    })

    sent++
  }

  return new Response(JSON.stringify({ sent }), { headers: { "Content-Type": "application/json" } })
})
