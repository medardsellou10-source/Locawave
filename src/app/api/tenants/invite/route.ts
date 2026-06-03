import { NextRequest, NextResponse } from "next/server"
import { createServerClient, createAdminClient } from "@/lib/supabase-server"

export const dynamic = "force-dynamic"

/**
 * Invite un locataire à son espace : crée/associe un compte auth, le marque
 * role='tenant', relie tenants.profile_id et envoie un lien magique par WhatsApp.
 * Authentifié : seul un membre de l'organisation propriétaire de la fiche peut inviter (RLS).
 */
export async function POST(request: NextRequest) {
  const { tenant_id } = await request.json().catch(() => ({}))
  if (!tenant_id) {
    return NextResponse.json({ error: "tenant_id requis" }, { status: 400 })
  }

  // 1) Auth + lecture de la fiche locataire via RLS (org-isolation)
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 })

  const { data: tenant, error: tErr } = await supabase
    .from("tenants")
    .select("id, first_name, last_name, email, whatsapp, profile_id")
    .eq("id", tenant_id)
    .single()

  if (tErr || !tenant) {
    return NextResponse.json({ error: "Locataire introuvable" }, { status: 404 })
  }
  if (!tenant.email) {
    return NextResponse.json(
      { error: "Ajoutez d'abord un email au locataire pour l'inviter" },
      { status: 422 }
    )
  }

  const admin = createAdminClient()
  const base = process.env.NEXT_PUBLIC_APP_URL ?? new URL(request.url).origin
  const redirectTo = `${base}/locataire`

  // 2) Générer le lien magique (invite si nouveau, magiclink si déjà lié)
  const type = tenant.profile_id ? "magiclink" : "invite"
  const { data: linkData, error: linkErr } = await admin.auth.admin.generateLink({
    type: type as "invite" | "magiclink",
    email: tenant.email,
    options: { redirectTo },
  })

  if (linkErr || !linkData?.user) {
    return NextResponse.json(
      { error: `Échec de génération du lien : ${linkErr?.message ?? "inconnu"}` },
      { status: 500 }
    )
  }

  const invitedUserId = linkData.user.id
  const actionLink = linkData.properties?.action_link

  // 3) Marquer le profil comme locataire + relier la fiche
  await admin
    .from("profiles")
    .upsert(
      {
        id: invitedUserId,
        full_name: `${tenant.first_name} ${tenant.last_name}`,
        role: "tenant" as const,
        phone: tenant.whatsapp,
      },
      { onConflict: "id" }
    )

  await admin.from("tenants").update({ profile_id: invitedUserId }).eq("id", tenant.id)

  // 4) Envoyer le lien par WhatsApp
  let whatsappSent = false
  if (tenant.whatsapp && actionLink) {
    const message =
      `Bonjour ${tenant.first_name}, accédez à votre espace locataire Locawave ` +
      `(loyers, quittances, paiement en ligne) : ${actionLink}`
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
      const res = await fetch(`${supabaseUrl}/functions/v1/send-whatsapp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
        },
        body: JSON.stringify({ to: tenant.whatsapp, message }),
      })
      whatsappSent = res.ok
    } catch {
      whatsappSent = false
    }
  }

  return NextResponse.json({ success: true, whatsapp_sent: whatsappSent })
}
