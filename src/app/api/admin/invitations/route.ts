import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"

import { getAdminContext, adminNotFound } from "@/lib/admin"
import { createServerClient } from "@/lib/supabase-server"

export const dynamic = "force-dynamic"

/**
 * Création et révocation des invitations à la console.
 *
 * Le jeton clair ne traverse cette route qu'une fois, pour être remis à
 * l'appelant sous forme de lien. Il n'est ni journalisé ni conservé : la base
 * n'en garde que l'empreinte.
 */

const bodySchema = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("creer"),
    email: z.string().email().optional(),
    heures: z.number().int().min(1).max(720).default(48),
    note: z.string().max(200).optional(),
  }),
  z.object({ action: z.literal("revoquer"), id: z.string().uuid() }),
])

function erreurSql(message: string) {
  const propre = message.replace(/^.*?ERROR:\s*/i, "").trim()
  const statut = /refus|réserv|Seul un super/i.test(propre)
    ? 403
    : /introuvable/i.test(propre)
      ? 404
      : 422
  return NextResponse.json({ error: propre }, { status: statut })
}

export async function POST(request: NextRequest) {
  const admin = await getAdminContext()
  if (!admin) return adminNotFound()

  const parsed = bodySchema.safeParse(await request.json().catch(() => ({})))
  if (!parsed.success) {
    return NextResponse.json({ error: "Requête invalide" }, { status: 400 })
  }
  const b = parsed.data
  const supabase = await createServerClient()

  if (b.action === "revoquer") {
    const { data, error } = await supabase.rpc("admin_revoke_invitation", { p_id: b.id })
    if (error) return erreurSql(error.message)
    return NextResponse.json(data)
  }

  const { data, error } = await supabase.rpc("admin_create_invitation", {
    p_email: b.email ?? null,
    p_heures: b.heures,
    p_note: b.note ?? null,
  })
  if (error) return erreurSql(error.message)

  const resultat = data as unknown as { jeton: string; expire_le: string; email: string | null }
  const base = request.nextUrl.origin || process.env.NEXT_PUBLIC_APP_URL || ""

  return NextResponse.json({
    lien: `${base}/acces-admin?jeton=${resultat.jeton}`,
    expire_le: resultat.expire_le,
    email: resultat.email,
  })
}
