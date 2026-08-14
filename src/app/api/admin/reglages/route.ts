import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"

import { getAdminContext, adminNotFound } from "@/lib/admin"
import { createServerClient } from "@/lib/supabase-server"

export const dynamic = "force-dynamic"

/**
 * Bascule d'un interrupteur de plateforme. La fonction SQL réserve le mode
 * maintenance au super-admin et journalise l'état d'avant et celui d'après.
 */

const bodySchema = z.object({
  cle: z.enum([
    "maintenance_mode",
    "signups_open",
    "listings_public",
    "whatsapp_reminders",
    "psp_enabled",
  ]),
  actif: z.boolean(),
  message: z.string().max(500).optional(),
})

export async function POST(request: NextRequest) {
  const admin = await getAdminContext()
  if (!admin) return adminNotFound()

  const parsed = bodySchema.safeParse(await request.json().catch(() => ({})))
  if (!parsed.success) {
    return NextResponse.json({ error: "Requête invalide" }, { status: 400 })
  }
  const { cle, actif, message } = parsed.data

  const supabase = await createServerClient()
  const { data, error } = await supabase.rpc("admin_set_setting", {
    p_key: cle,
    p_active: actif,
    p_message: message ?? null,
  })

  if (error) {
    const propre = error.message.replace(/^.*?ERROR:\s*/i, "").trim()
    const statut = /refus|réserv/i.test(propre) ? 403 : /inconnu/i.test(propre) ? 404 : 422
    return NextResponse.json({ error: propre }, { status: statut })
  }

  return NextResponse.json(data)
}
