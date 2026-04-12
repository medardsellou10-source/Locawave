import { serve } from "https://deno.land/std@0.177.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

serve(async () => {
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  )

  // Cherche les échéances dues dans 5 jours, status=pending
  const targetDate = new Date()
  targetDate.setDate(targetDate.getDate() + 5)
  const dateStr = targetDate.toISOString().split("T")[0]

  const { data: schedules } = await supabase
    .from("rent_schedules")
    .select(`
      id, amount_fcfa, due_date, org_id,
      leases(
        tenants(first_name, whatsapp),
        units(unit_number, properties(name))
      )
    `)
    .eq("due_date", dateStr)
    .eq("status", "pending")

  if (!schedules || schedules.length === 0) {
    return new Response(JSON.stringify({ sent: 0 }))
  }

  let sent = 0

  for (const sched of schedules) {
    const lease = (sched as any).leases
    const tenant = lease?.tenants
    const unit = lease?.units
    const property = unit?.properties

    if (!tenant?.whatsapp) continue

    // Chercher le template personnalisé
    const { data: template } = await supabase
      .from("notification_templates")
      .select("message_template")
      .eq("org_id", sched.org_id)
      .eq("type", "reminder_j5")
      .eq("is_active", true)
      .single()

    // Obtenir le numéro Wave de l'org
    const { data: org } = await supabase
      .from("organizations")
      .select("wave_number")
      .eq("id", sched.org_id)
      .single()

    let message = template?.message_template ??
      "Bonjour {prenom}, votre loyer de {montant} FCFA pour {bien} est dû dans 5 jours (le {date}). Wave : {wave_number}. Merci"

    message = message
      .replace("{prenom}", tenant.first_name)
      .replace("{montant}", new Intl.NumberFormat("fr-FR").format(sched.amount_fcfa))
      .replace("{bien}", `${property?.name ?? ""} ${unit?.unit_number ?? ""}`)
      .replace("{date}", new Date(sched.due_date).toLocaleDateString("fr-FR"))
      .replace("{wave_number}", org?.wave_number ?? "")

    // Envoyer via send-whatsapp
    try {
      await fetch(`${Deno.env.get("SUPABASE_URL")}/functions/v1/send-whatsapp`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ to: tenant.whatsapp, message, org_id: sched.org_id }),
      })
      sent++
    } catch (e) {
      console.error(`Erreur envoi ${tenant.whatsapp}:`, e)
    }
  }

  return new Response(JSON.stringify({ sent, total: schedules.length }), {
    headers: { "Content-Type": "application/json" },
  })
})
