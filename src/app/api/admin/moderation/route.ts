import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"

import { getAdminContext, adminNotFound } from "@/lib/admin"
import { createServerClient } from "@/lib/supabase-server"

export const dynamic = "force-dynamic"

/**
 * Les quatre décisions de modération. Comme ailleurs dans la console, la route
 * authentifie puis transmet : les fonctions SQL (migration 071) portent les
 * règles — motif obligatoire pour tout refus, identité vérifiée avant de
 * vérifier un prestataire — et journalisent.
 */

const uuid = z.string().uuid()

const bodySchema = z.discriminatedUnion("cible", [
  z.object({
    cible: z.literal("kyc"),
    id: uuid,
    valider: z.boolean(),
    note: z.string().max(500).optional(),
  }),
  z.object({
    cible: z.literal("prestataire"),
    id: uuid,
    verifie: z.boolean(),
    motif: z.string().max(500).optional(),
  }),
  z.object({
    cible: z.literal("annonce"),
    id: uuid,
    publier: z.boolean(),
    motif: z.string().max(500).optional(),
  }),
  z.object({
    cible: z.literal("avis"),
    id: uuid,
    masquer: z.boolean(),
    motif: z.string().max(500).optional(),
  }),
])

function erreurSql(message: string) {
  const propre = message.replace(/^.*?ERROR:\s*/i, "").trim()
  const statut = /refus[ée]/i.test(propre)
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

  switch (b.cible) {
    case "kyc": {
      const { data, error } = await supabase.rpc("admin_decide_kyc", {
        p_id: b.id,
        p_valider: b.valider,
        p_note: b.note ?? null,
      })
      if (error) return erreurSql(error.message)
      return NextResponse.json(data)
    }
    case "prestataire": {
      const { data, error } = await supabase.rpc("admin_set_provider_verified", {
        p_id: b.id,
        p_verifie: b.verifie,
        p_motif: b.motif ?? null,
      })
      if (error) return erreurSql(error.message)
      return NextResponse.json(data)
    }
    case "annonce": {
      const { data, error } = await supabase.rpc("admin_set_listing_published", {
        p_id: b.id,
        p_publier: b.publier,
        p_motif: b.motif ?? null,
      })
      if (error) return erreurSql(error.message)
      return NextResponse.json(data)
    }
    case "avis": {
      const { data, error } = await supabase.rpc("admin_set_review_hidden", {
        p_id: b.id,
        p_masquer: b.masquer,
        p_motif: b.motif ?? null,
      })
      if (error) return erreurSql(error.message)
      return NextResponse.json(data)
    }
  }
}
