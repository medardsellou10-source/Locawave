import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"

import { getAdminContext, adminNotFound } from "@/lib/admin"
import { createServerClient } from "@/lib/supabase-server"

export const dynamic = "force-dynamic"

/**
 * Arbitrage d'un litige. La fonction SQL admin_resolve_dispute porte les règles
 * (motivation obligatoire, litige déjà clos refusé) et laisse le trigger
 * trg_dispute — seul habilité — déplacer l'état de la créance.
 */

const bodySchema = z.object({
  id: z.string().uuid(),
  decision: z.enum(["examiner", "somme_due", "somme_annulee", "rejeter"]),
  resolution: z.string().max(2000).optional(),
})

export async function POST(request: NextRequest) {
  const admin = await getAdminContext()
  if (!admin) return adminNotFound()

  const parsed = bodySchema.safeParse(await request.json().catch(() => ({})))
  if (!parsed.success) {
    return NextResponse.json({ error: "Requête invalide" }, { status: 400 })
  }
  const { id, decision, resolution } = parsed.data

  const supabase = await createServerClient()
  const { data, error } = await supabase.rpc("admin_resolve_dispute", {
    p_id: id,
    p_decision: decision,
    p_resolution: resolution ?? null,
  })

  if (error) {
    const propre = error.message.replace(/^.*?ERROR:\s*/i, "").trim()
    const statut = /refus/i.test(propre) ? 403 : /introuvable/i.test(propre) ? 404 : 422
    return NextResponse.json({ error: propre }, { status: statut })
  }

  return NextResponse.json(data)
}
