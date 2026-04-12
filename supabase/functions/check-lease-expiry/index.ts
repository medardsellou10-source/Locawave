import { serve } from "https://deno.land/std@0.177.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

serve(async () => {
  const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!)

  const now = new Date()
  const in60d = new Date(now); in60d.setDate(in60d.getDate() + 60)
  const in30d = new Date(now); in30d.setDate(in30d.getDate() + 30)
  const date60 = in60d.toISOString().split("T")[0]
  const date30 = in30d.toISOString().split("T")[0]

  let sent = 0

  // 60 jours avant fin
  const { data: leases60 } = await supabase
    .from("leases")
    .select("id, org_id, end_date, alert_60d_sent_at, tenants(first_name, last_name), units(unit_number, properties(name))")
    .eq("status", "active")
    .eq("end_date", date60)
    .is("alert_60d_sent_at", null)

  for (const lease of leases60 ?? []) {
    const tenant = (lease as any).tenants
    const unit = (lease as any).units
    const message = `Votre bail avec ${tenant?.first_name} ${tenant?.last_name} pour ${unit?.properties?.name} ${unit?.unit_number} se termine dans 60 jours (${new Date(lease.end_date).toLocaleDateString("fr-FR")}). Pensez au renouvellement.`

    await supabase.from("activity_logs").insert({
      org_id: lease.org_id, action: "alert_lease_expiry_60d",
      entity_type: "lease", entity_id: lease.id, metadata: { message },
    })

    await supabase.from("leases").update({ alert_60d_sent_at: new Date().toISOString() }).eq("id", lease.id)
    sent++
  }

  // 30 jours avant fin
  const { data: leases30 } = await supabase
    .from("leases")
    .select("id, org_id, end_date, alert_30d_sent_at, tenants(first_name, last_name), units(unit_number, properties(name))")
    .eq("status", "active")
    .eq("end_date", date30)
    .is("alert_30d_sent_at", null)

  for (const lease of leases30 ?? []) {
    const tenant = (lease as any).tenants
    const unit = (lease as any).units
    const message = `Votre bail avec ${tenant?.first_name} ${tenant?.last_name} pour ${unit?.properties?.name} ${unit?.unit_number} se termine dans 30 jours (${new Date(lease.end_date).toLocaleDateString("fr-FR")}). Pensez au renouvellement.`

    await supabase.from("activity_logs").insert({
      org_id: lease.org_id, action: "alert_lease_expiry_30d",
      entity_type: "lease", entity_id: lease.id, metadata: { message },
    })

    await supabase.from("leases").update({ alert_30d_sent_at: new Date().toISOString() }).eq("id", lease.id)
    sent++
  }

  return new Response(JSON.stringify({ sent }), { headers: { "Content-Type": "application/json" } })
})
