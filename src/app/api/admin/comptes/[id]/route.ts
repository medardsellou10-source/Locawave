import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"

import { getAdminContext, adminNotFound, logAdminAction } from "@/lib/admin"
import { createServerClient, createAdminClient } from "@/lib/supabase-server"

export const dynamic = "force-dynamic"

/**
 * Actions administratives sur un compte.
 *
 * Le vrai travail se fait dans des fonctions SQL (migration 068) : ce sont elles
 * qui revérifient les droits, appliquent le changement et journalisent, en une
 * transaction. Cette route ne fait qu'authentifier l'appelant et transmettre —
 * de sorte qu'un contournement du code Next ne contourne rien du tout.
 *
 * Seule exception : le lien de réinitialisation, qui exige l'API Auth admin
 * (donc la clé service_role) — impossible à faire depuis SQL.
 */

const ROLES = ["owner", "tenant", "provider", "seeker"] as const

const bodySchema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("role"), role: z.enum(ROLES) }),
  z.object({ action: z.literal("suspension"), suspendre: z.boolean() }),
  z.object({ action: z.literal("lien_connexion") }),
  z.object({ action: z.literal("administrateur"), accorder: z.boolean() }),
])

/** Les messages d'erreur des fonctions SQL sont déjà écrits pour être lus. */
function erreurSql(message: string) {
  const propre = message.replace(/^.*?ERROR:\s*/i, "").trim()
  const statut = /refus|impossible|réserv|super-admin/i.test(propre)
    ? 403
    : /introuvable/i.test(propre)
      ? 404
      : 422
  return NextResponse.json({ error: propre }, { status: statut })
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await getAdminContext()
  if (!admin) return adminNotFound()

  const { id } = await params
  if (!z.string().uuid().safeParse(id).success) {
    return NextResponse.json({ error: "Identifiant invalide" }, { status: 400 })
  }

  const parsed = bodySchema.safeParse(await request.json().catch(() => ({})))
  if (!parsed.success) {
    return NextResponse.json({ error: "Requête invalide" }, { status: 400 })
  }
  const body = parsed.data

  const supabase = await createServerClient()

  switch (body.action) {
    case "role": {
      const { data, error } = await supabase.rpc("admin_set_account_role", {
        p_id: id,
        p_role: body.role,
      })
      if (error) return erreurSql(error.message)
      return NextResponse.json(data)
    }

    case "suspension": {
      const { data, error } = await supabase.rpc("admin_set_account_suspension", {
        p_id: id,
        p_suspendre: body.suspendre,
      })
      if (error) return erreurSql(error.message)
      return NextResponse.json(data)
    }

    case "administrateur": {
      const { data, error } = await supabase.rpc("admin_set_platform_admin", {
        p_id: id,
        p_accorder: body.accorder,
      })
      if (error) return erreurSql(error.message)
      return NextResponse.json(data)
    }

    case "lien_connexion": {
      if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
        return NextResponse.json(
          {
            error:
              "Génération de lien indisponible : la variable SUPABASE_SERVICE_ROLE_KEY n'est pas configurée sur cet environnement.",
          },
          { status: 503 }
        )
      }
      if (id === admin.userId) {
        return NextResponse.json(
          { error: "Impossible d'agir sur son propre compte depuis la console." },
          { status: 403 }
        )
      }

      const db = createAdminClient()
      const { data: authUser } = await db.auth.admin.getUserById(id)
      const email = authUser?.user?.email
      if (!email) {
        return NextResponse.json(
          { error: "Ce compte n'a pas d'adresse email." },
          { status: 422 }
        )
      }

      const base = request.nextUrl.origin || process.env.NEXT_PUBLIC_APP_URL || ""
      const { data: link, error } = await db.auth.admin.generateLink({
        type: "recovery",
        email,
        options: { redirectTo: `${base}/auth/callback?next=/reset-password` },
      })
      if (error || !link?.properties?.action_link) {
        return NextResponse.json(
          { error: `Échec de génération du lien : ${error?.message ?? "inconnu"}` },
          { status: 500 }
        )
      }

      await logAdminAction({
        action: "compte.lien_reinitialisation",
        targetType: "profile",
        targetId: id,
        summary: `Lien de réinitialisation généré pour ${email}`,
      })

      // Le lien n'est pas envoyé : à toi de le transmettre par un canal sûr.
      // Il vaut connexion — il ne doit pas traîner.
      return NextResponse.json({
        lien: link.properties.action_link,
        message: `Lien valable une fois, à transmettre à ${email}.`,
      })
    }
  }
}
