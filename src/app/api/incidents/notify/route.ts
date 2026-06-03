import { NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase-server"

export const dynamic = "force-dynamic"

/**
 * Notifie le propriétaire d'un nouvel incident par WhatsApp (best effort).
 * Appelé après création de l'incident par le locataire.
 */
export async function POST(request: NextRequest) {
  const { incident_id } = await request.json().catch(() => ({}))
  if (!incident_id) return NextResponse.json({ error: "incident_id requis" }, { status: 400 })

  const admin = createAdminClient()

  const { data: incident } = await admin
    .from("incidents")
    .select("category, urgency, description, org_id, properties(name)")
    .eq("id", incident_id)
    .maybeSingle()
  if (!incident) return NextResponse.json({ error: "Incident introuvable" }, { status: 404 })

  // Propriétaire de l'organisation
  const { data: org } = await admin
    .from("organizations").select("owner_id, name").eq("id", incident.org_id).maybeSingle()
  if (!org?.owner_id) return NextResponse.json({ ok: true, notified: false })

  const { data: ownerProfile } = await admin
    .from("profiles").select("phone").eq("id", org.owner_id).maybeSingle()
  const phone = ownerProfile?.phone
  if (!phone) return NextResponse.json({ ok: true, notified: false, reason: "no_phone" })

  const urgencyLabel: Record<string, string> = { low: "faible", medium: "moyenne", high: "HAUTE" }
  // @ts-expect-error relation
  const propName = incident.properties?.name ?? ""
  const message =
    `🔔 Nouvel incident signalé${propName ? ` (${propName})` : ""}\n` +
    `Catégorie : ${incident.category}\nUrgence : ${urgencyLabel[incident.urgency] ?? incident.urgency}\n` +
    `${incident.description ?? ""}\nConnectez-vous à Locawave pour traiter.`

  let notified = false
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const res = await fetch(`${supabaseUrl}/functions/v1/send-whatsapp`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}` },
      body: JSON.stringify({ to: phone, message, org_id: incident.org_id }),
    })
    notified = res.ok
  } catch { notified = false }

  return NextResponse.json({ ok: true, notified })
}
