import { serve } from "https://deno.land/std@0.177.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

serve(async () => {
  const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!)

  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
  const dateStr = sevenDaysAgo.toISOString().split("T")[0]

  // Toutes les échéances en retard > 7 jours, groupées par org
  const { data: lateSchedules } = await supabase
    .from("rent_schedules")
    .select("org_id, amount_fcfa, leases(tenants(first_name, last_name), units(unit_number, properties(name)))")
    .eq("status", "late")
    .lte("due_date", dateStr)

  if (!lateSchedules?.length) return new Response(JSON.stringify({ sent: 0 }))

  // Grouper par org_id
  const byOrg: Record<string, typeof lateSchedules> = {}
  for (const sched of lateSchedules) {
    if (!byOrg[sched.org_id]) byOrg[sched.org_id] = []
    byOrg[sched.org_id].push(sched)
  }

  let sent = 0
  for (const [orgId, schedules] of Object.entries(byOrg)) {
    const { data: owner } = await supabase
      .from("users")
      .select("id")
      .eq("org_id", orgId)
      .eq("role", "owner")
      .single()

    // Obtenir le WhatsApp du propriétaire via auth
    const { data: org } = await supabase
      .from("organizations")
      .select("wave_number")
      .eq("id", orgId)
      .single()

    // Construire le message
    const total = schedules.reduce((sum, s) => sum + s.amount_fcfa, 0)
    const lines = schedules.slice(0, 5).map((s: any) => {
      const lease = s.leases
      const name = lease?.tenants ? `${lease.tenants.first_name} ${lease.tenants.last_name}` : "Inconnu"
      const bien = lease?.units?.properties?.name ?? ""
      return `- ${name} — ${bien} : ${new Intl.NumberFormat("fr-FR").format(s.amount_fcfa)} FCFA`
    })

    const message = `Alerte Locawave : ${schedules.length} loyer(s) impayé(s) :\n${lines.join("\n")}${schedules.length > 5 ? `\n... et ${schedules.length - 5} autres` : ""}\nTotal impayé : ${new Intl.NumberFormat("fr-FR").format(total)} FCFA\nConnexion : locawave.sn`

    // Log l'alerte (envoyer via WhatsApp si numéro propriétaire disponible)
    await supabase.from("activity_logs").insert({
      org_id: orgId,
      user_id: owner?.id ?? null,
      action: "alert_landlord_late",
      entity_type: "notification",
      metadata: { count: schedules.length, total, message },
    })

    sent++
  }

  return new Response(JSON.stringify({ sent }), { headers: { "Content-Type": "application/json" } })
})
