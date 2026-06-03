import { NextRequest, NextResponse } from "next/server"
import { createServerClient, createAdminClient } from "@/lib/supabase-server"

export const dynamic = "force-dynamic"

/**
 * Acceptation d'une candidature → génère le bail et dépublie l'annonce.
 * Boucle Trouver → Louer → Gérer. Authentifié : seul le propriétaire de l'annonce.
 */
export async function POST(request: NextRequest) {
  const { application_id } = await request.json().catch(() => ({}))
  if (!application_id) return NextResponse.json({ error: "application_id requis" }, { status: 400 })

  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 })

  // L'application + l'annonce, lisibles par l'owner via RLS
  const { data: app } = await supabase
    .from("applications")
    .select("id, applicant_id, listing_id, listings(id, owner_id, org_id, property_id, rent_fcfa, deposit_fcfa, available_from)")
    .eq("id", application_id)
    .maybeSingle()
  if (!app) return NextResponse.json({ error: "Candidature introuvable" }, { status: 404 })
  // @ts-expect-error relation
  const listing = app.listings
  if (!listing || listing.owner_id !== user.id) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 })
  }

  const admin = createAdminClient()

  // Profil du candidat
  const { data: prof } = await admin.from("profiles").select("full_name, phone").eq("id", app.applicant_id).maybeSingle()
  const parts = (prof?.full_name ?? "Locataire").trim().split(" ")
  const firstName = parts[0] || "Locataire"
  const lastName = parts.slice(1).join(" ") || "—"
  const orgId = listing.org_id

  if (!orgId) return NextResponse.json({ error: "Annonce sans organisation" }, { status: 400 })

  // Fiche locataire (réutilise si déjà liée à ce profil)
  let tenantId: string
  const { data: existingTenant } = await admin.from("tenants").select("id").eq("org_id", orgId).eq("profile_id", app.applicant_id).maybeSingle()
  if (existingTenant) tenantId = existingTenant.id
  else {
    const { data: t, error: tErr } = await admin.from("tenants")
      .insert({ org_id: orgId, first_name: firstName, last_name: lastName, whatsapp: prof?.phone ?? "+221000000000", profile_id: app.applicant_id })
      .select("id").single()
    if (tErr || !t) return NextResponse.json({ error: "Échec création fiche locataire" }, { status: 500 })
    tenantId = t.id
  }

  // Une unité du bien (1ère, sinon en créer une)
  let unitId: string | null = null
  if (listing.property_id) {
    const { data: u } = await admin.from("units").select("id").eq("property_id", listing.property_id).limit(1).maybeSingle()
    if (u) unitId = u.id
    else {
      const { data: nu } = await admin.from("units")
        .insert({ org_id: orgId, property_id: listing.property_id, unit_number: "Lot 1", type: "f2", rent_fcfa: listing.rent_fcfa, status: "rented" })
        .select("id").single()
      unitId = nu?.id ?? null
    }
  }
  if (!unitId) return NextResponse.json({ error: "Annonce sans bien/lot — impossible de créer le bail" }, { status: 400 })

  // Bail + 12 échéances mensuelles
  const start = listing.available_from ? new Date(listing.available_from) : new Date()
  const end = new Date(start); end.setFullYear(end.getFullYear() + 1)
  const dueDay = 5
  const { data: lease, error: lErr } = await admin.from("leases").insert({
    org_id: orgId, unit_id: unitId, tenant_id: tenantId,
    start_date: start.toISOString().slice(0, 10), end_date: end.toISOString().slice(0, 10),
    rent_fcfa: listing.rent_fcfa, due_day: dueDay, deposit_fcfa: listing.deposit_fcfa ?? 0, status: "active",
  }).select("id").single()
  if (lErr || !lease) return NextResponse.json({ error: "Échec création du bail" }, { status: 500 })

  const schedules = Array.from({ length: 12 }, (_, i) => {
    const d = new Date(start); d.setMonth(d.getMonth() + i); d.setDate(dueDay)
    return { org_id: orgId, lease_id: lease.id, due_date: d.toISOString().slice(0, 10), amount_fcfa: listing.rent_fcfa, status: "pending" as const }
  })
  await admin.from("rent_schedules").insert(schedules)

  // Mettre à jour candidatures + dépublier l'annonce
  await admin.from("applications").update({ status: "accepted" }).eq("id", application_id)
  await admin.from("applications").update({ status: "rejected" }).eq("listing_id", listing.id).neq("id", application_id).eq("status", "pending")
  await admin.from("listings").update({ status: "rented" }).eq("id", listing.id)
  await admin.from("units").update({ status: "rented" }).eq("id", unitId)

  return NextResponse.json({ success: true, lease_id: lease.id })
}
