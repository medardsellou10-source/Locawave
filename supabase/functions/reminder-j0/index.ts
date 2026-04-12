import { serve } from "https://deno.land/std@0.177.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

serve(async () => {
  const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!)
  const today = new Date().toISOString().split("T")[0]

  const { data: schedules } = await supabase
    .from("rent_schedules")
    .select("id, amount_fcfa, due_date, org_id, reminder_count, leases(tenants(first_name, whatsapp), units(unit_number, properties(name)))")
    .eq("due_date", today)
    .eq("status", "pending")

  if (!schedules?.length) return new Response(JSON.stringify({ sent: 0 }))

  let sent = 0
  for (const sched of schedules) {
    const lease = (sched as any).leases
    const tenant = lease?.tenants
    if (!tenant?.whatsapp) continue

    const { data: template } = await supabase
      .from("notification_templates").select("message_template")
      .eq("org_id", sched.org_id).eq("type", "reminder_j0").eq("is_active", true).single()

    const { data: org } = await supabase.from("organizations").select("wave_number").eq("id", sched.org_id).single()

    let message = template?.message_template ??
      "Bonjour {prenom}, votre loyer de {montant} FCFA est dû aujourd'hui. Merci de régler via Wave au {wave_number}."

    message = message
      .replace("{prenom}", tenant.first_name)
      .replace("{montant}", new Intl.NumberFormat("fr-FR").format(sched.amount_fcfa))
      .replace("{wave_number}", org?.wave_number ?? "")

    try {
      await fetch(`${Deno.env.get("SUPABASE_URL")}/functions/v1/send-whatsapp`, {
        method: "POST",
        headers: { Authorization: `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`, "Content-Type": "application/json" },
        body: JSON.stringify({ to: tenant.whatsapp, message, org_id: sched.org_id }),
      })

      await supabase.from("rent_schedules").update({
        reminder_count: (sched.reminder_count ?? 0) + 1,
        reminder_sent_at: new Date().toISOString(),
      }).eq("id", sched.id)

      sent++
    } catch (e) { console.error(e) }
  }

  return new Response(JSON.stringify({ sent }), { headers: { "Content-Type": "application/json" } })
})
