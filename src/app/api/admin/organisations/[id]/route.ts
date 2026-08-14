import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"

import { getAdminContext, adminNotFound } from "@/lib/admin"
import { createServerClient } from "@/lib/supabase-server"

export const dynamic = "force-dynamic"

/**
 * Actions de support sur une organisation : changer de plan, prolonger
 * l'échéance. Comme pour les comptes, le travail se fait dans des fonctions SQL
 * gardées par is_admin() (migration 069), qui journalisent elles-mêmes.
 */

const bodySchema = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("plan"),
    plan: z.enum(["trial", "solo", "pro", "agence"]),
    mois: z.number().int().min(0).max(36),
  }),
  z.object({
    action: z.literal("prolonger"),
    jours: z.number().int().min(1).max(365),
  }),
])

function erreurSql(message: string) {
  const propre = message.replace(/^.*?ERROR:\s*/i, "").trim()
  const statut = /refus|impossible|réserv/i.test(propre)
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

  if (body.action === "plan") {
    const { data, error } = await supabase.rpc("admin_set_org_plan", {
      p_id: id,
      p_plan: body.plan,
      p_mois: body.mois,
    })
    if (error) return erreurSql(error.message)
    return NextResponse.json(data)
  }

  const { data, error } = await supabase.rpc("admin_extend_org", {
    p_id: id,
    p_jours: body.jours,
  })
  if (error) return erreurSql(error.message)
  return NextResponse.json(data)
}
