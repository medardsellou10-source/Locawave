import { NextRequest, NextResponse } from "next/server"

import { getAdminContext, adminNotFound, logAdminAction } from "@/lib/admin"
import { createServerClient } from "@/lib/supabase-server"

export const dynamic = "force-dynamic"

/**
 * Export CSV des règlements de la plateforme, sur la période et les filtres
 * affichés à l'écran. L'export est une sortie de données : il est journalisé
 * comme une action admin, avec le nombre de lignes emportées.
 */

const METHODES: Record<string, string> = {
  cash: "Espèces",
  wave: "Wave",
  orange_money: "Orange Money",
  psp: "Lien de paiement",
}

/** Neutralise les caractères qui casseraient le CSV, et les formules Excel. */
function cellule(v: unknown): string {
  const s = v === null || v === undefined ? "" : String(v)
  const propre = s.replace(/[\r\n]+/g, " ").replace(/"/g, '""')
  // Une cellule commençant par =, +, - ou @ est interprétée comme une formule
  // par Excel et LibreOffice : on la préfixe d'une apostrophe.
  const sur = /^[=+\-@]/.test(propre) ? `'${propre}` : propre
  return `"${sur}"`
}

export async function GET(request: NextRequest) {
  const admin = await getAdminContext()
  if (!admin) return adminNotFound()

  const sp = request.nextUrl.searchParams
  const du = sp.get("du") || null
  const au = sp.get("au") || null
  const q = sp.get("q") || null
  const methode = sp.get("methode") || null

  const supabase = await createServerClient()
  const { data, error } = await supabase.rpc("admin_payments", {
    p_search: q,
    p_methode: methode,
    p_du: du,
    p_au: au,
    p_limit: 500,
    p_offset: 0,
  })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const lignes = data ?? []
  const entete = [
    "Date",
    "Organisation",
    "Locataire",
    "Bien",
    "Méthode",
    "Fournisseur",
    "Référence",
    "Quittance",
    "Échéance",
    "Montant FCFA",
  ]

  const corps = lignes.map((p) =>
    [
      p.paye_le ? new Date(p.paye_le).toLocaleDateString("fr-FR") : "",
      p.org_nom,
      p.locataire,
      p.bien,
      METHODES[p.methode] ?? p.methode,
      p.psp,
      p.reference,
      p.quittance,
      p.echeance_le,
      p.montant,
    ]
      .map(cellule)
      .join(",")
  )

  const total = lignes.reduce((s, p) => s + (p.montant ?? 0), 0)
  const csv = [
    entete.map(cellule).join(","),
    ...corps,
    "",
    [cellule("TOTAL"), "", "", "", "", "", "", "", "", cellule(total)].join(","),
  ].join("\n")

  await logAdminAction({
    action: "finances.export",
    targetType: "export",
    summary: `Export CSV de ${lignes.length} règlement(s)${du || au ? ` du ${du ?? "origine"} au ${au ?? "aujourd'hui"}` : ""}`,
    after: { lignes: lignes.length, total, du, au, methode, recherche: q },
  })

  const nom = `locawave-reglements-${du ?? "origine"}_${au ?? "aujourdhui"}.csv`

  // BOM UTF-8 : sans lui, Excel sous Windows lit le fichier en ANSI et affiche
  // « Espèces » en « EspÃ¨ces ». Écrit par son code plutôt qu'en caractère
  // invisible dans la source, qu'un copier-coller perdrait sans prévenir.
  const BOM = String.fromCharCode(0xfeff)

  return new NextResponse(BOM + csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${nom}"`,
      "Cache-Control": "no-store",
    },
  })
}
