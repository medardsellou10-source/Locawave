import { NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase-server"

export const dynamic = "force-dynamic"

function generateReferralCode(length = 8): string {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
  let code = ""
  for (let i = 0; i < length; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { user_id, full_name, email, property_count } = body

    if (!user_id || !full_name || !email) {
      return NextResponse.json(
        { error: "Champs requis manquants : user_id, full_name, email" },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()

    // Calculer la date d'expiration du plan trial (30 jours)
    const planExpiresAt = new Date()
    planExpiresAt.setDate(planExpiresAt.getDate() + 30)

    // 1. Creer l'organisation
    const { data: org, error: orgError } = await supabase
      .from("organizations")
      .insert({
        name: `${full_name} Immobilier`,
        owner_id: user_id,
        plan: "trial" as const,
        plan_expires_at: planExpiresAt.toISOString(),
        referral_code: generateReferralCode(),
      })
      .select("id")
      .single()

    if (orgError) {
      console.error("Erreur creation organisation:", orgError)
      return NextResponse.json(
        { error: "Erreur lors de la creation de l'organisation" },
        { status: 500 }
      )
    }

    // 2. Creer le user row
    const { error: userError } = await supabase.from("users").insert({
      id: user_id,
      org_id: org.id,
      email,
      full_name,
      role: "owner" as const,
    })

    if (userError) {
      console.error("Erreur creation utilisateur:", userError)
      // Tenter un rollback de l'organisation
      await supabase.from("organizations").delete().eq("id", org.id)
      return NextResponse.json(
        { error: "Erreur lors de la creation de l'utilisateur" },
        { status: 500 }
      )
    }

    // 3. Garantir le profil canonique (role owner pour ce funnel B2B).
    //    Idempotent : le trigger on_auth_user_created a déjà pu le créer.
    const { error: profileError } = await supabase
      .from("profiles")
      .upsert(
        { id: user_id, full_name, role: "owner" as const },
        { onConflict: "id" }
      )

    if (profileError) {
      // Non bloquant : l'org et le user existent ; on logue seulement.
      console.error("Avertissement upsert profil:", profileError)
    }

    return NextResponse.json({ org_id: org.id }, { status: 201 })
  } catch (error) {
    console.error("Erreur setup-org:", error)
    return NextResponse.json(
      { error: "Erreur serveur inattendue" },
      { status: 500 }
    )
  }
}
