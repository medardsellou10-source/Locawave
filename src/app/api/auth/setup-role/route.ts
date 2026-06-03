import { NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase-server"

export const dynamic = "force-dynamic"

/**
 * Configure un compte non-propriétaire (locataire / prestataire / chercheur) à
 * l'inscription : pose le rôle canonique et prépare son espace.
 * - tenant   : relie automatiquement une fiche locataire existante au même email.
 * - provider : crée un provider_profile vierge (à compléter, vérif admin ensuite).
 */
export async function POST(request: NextRequest) {
  const { user_id, full_name, email, role } = await request.json().catch(() => ({}))
  const allowed = ["tenant", "provider", "seeker"]
  if (!user_id || !full_name || !role || !allowed.includes(role)) {
    return NextResponse.json({ error: "Paramètres invalides" }, { status: 400 })
  }

  const admin = createAdminClient()

  const { error: profErr } = await admin
    .from("profiles")
    .upsert({ id: user_id, full_name, role }, { onConflict: "id" })
  if (profErr) {
    return NextResponse.json({ error: "Erreur lors de la création du profil" }, { status: 500 })
  }

  if (role === "tenant" && email) {
    // Réconciliation : rattacher une fiche locataire saisie par un propriétaire
    await admin
      .from("tenants")
      .update({ profile_id: user_id })
      .ilike("email", email)
      .is("profile_id", null)
  }

  if (role === "provider") {
    await admin
      .from("provider_profiles")
      .upsert({ id: user_id, display_name: full_name, is_verified: false }, { onConflict: "id" })
  }

  return NextResponse.json({ success: true, role })
}
