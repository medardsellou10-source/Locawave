import { NextRequest, NextResponse } from "next/server"
import { renderToBuffer } from "@react-pdf/renderer"
import { createServerClient, createAdminClient } from "@/lib/supabase-server"
import { Quittance, type DonneesQuittance } from "@/lib/pdf/documents"

// @react-pdf/renderer s'appuie sur des API Node : ce traitement ne peut pas
// tourner sur le runtime edge.
export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const MOYENS: Record<string, string> = {
  wave: "Wave", orange_money: "Orange Money", cash: "Espèces",
  psp: "Paiement en ligne", transfer: "Virement",
}

/**
 * Produit le PDF d'une quittance, l'archive et renvoie un lien signé.
 *
 * Remplace l'ancienne route « generate », qui ne générait rien : elle renvoyait
 * du JSON, et `receipts.pdf_url` est resté NULL sur toutes les quittances alors
 * que le produit et la campagne annonçaient des « quittances PDF automatiques ».
 *
 * Idempotent : si le PDF existe déjà, on renvoie un nouveau lien signé sans
 * régénérer le fichier — une quittance émise ne doit pas changer.
 */
export async function POST(request: NextRequest) {
  const { receipt_id } = await request.json().catch(() => ({}))
  if (!receipt_id) {
    return NextResponse.json({ error: "receipt_id requis" }, { status: 400 })
  }

  // Lecture sous l'identité de l'appelant : la RLS garantit qu'il ne peut
  // demander que les quittances de son organisation ou les siennes.
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 })

  const { data: receipt } = await supabase
    .from("receipts")
    .select(`
      id, receipt_number, pdf_url, created_at, org_id,
      payments(
        amount_fcfa, paid_at, method, reference,
        rent_schedules(
          due_date,
          leases(
            tenants(first_name, last_name, whatsapp),
            units(unit_number, properties(name, address, city))
          )
        )
      )
    `)
    .eq("id", receipt_id)
    .maybeSingle()

  if (!receipt) {
    return NextResponse.json({ error: "Quittance introuvable" }, { status: 404 })
  }

  const admin = createAdminClient()

  // Déjà produite : on se contente de re-signer le lien.
  if (receipt.pdf_url) {
    const { data: signe } = await admin.storage
      .from("documents").createSignedUrl(receipt.pdf_url, 3600)
    if (signe?.signedUrl) {
      return NextResponse.json({ url: signe.signedUrl, regenere: false })
    }
    // Le fichier référencé a disparu : on retombe sur une génération.
  }

  // Les relations sont typées en tableau par le générateur ; on lit la forme réelle.
  const paiement = receipt.payments as unknown as {
    amount_fcfa: number; paid_at: string; method: string; reference: string | null
    rent_schedules: {
      due_date: string
      leases: {
        tenants: { first_name: string; last_name: string; whatsapp: string | null } | null
        units: { unit_number: string; properties: { name: string; address: string | null; city: string | null } | null } | null
      } | null
    } | null
  } | null
  const bail = paiement?.rent_schedules?.leases
  const locataire = bail?.tenants
  const unite = bail?.units
  const bien = unite?.properties

  const { data: org } = await admin
    .from("organizations").select("name, address").eq("id", receipt.org_id).maybeSingle()

  const echeance = paiement?.rent_schedules?.due_date
  const donnees: DonneesQuittance = {
    numero: receipt.receipt_number,
    emisLe: receipt.created_at ?? new Date().toISOString(),
    bailleur: { nom: org?.name ?? "Bailleur", adresse: org?.address },
    locataire: {
      nom: locataire ? `${locataire.first_name} ${locataire.last_name}` : "Locataire",
      telephone: locataire?.whatsapp,
    },
    bien: {
      designation: [bien?.name, unite?.unit_number].filter(Boolean).join(" — ") || "Logement",
      adresse: [bien?.address, bien?.city].filter(Boolean).join(", ") || null,
    },
    periode: echeance
      ? new Date(echeance).toLocaleDateString("fr-FR", { month: "long", year: "numeric" })
      : "la période concernée",
    montantFcfa: paiement?.amount_fcfa ?? 0,
    moyen: MOYENS[paiement?.method ?? ""] ?? paiement?.method ?? "—",
    reference: paiement?.reference,
    payeLe: paiement?.paid_at ?? receipt.created_at ?? new Date().toISOString(),
  }

  let chemin: string
  try {
    const buffer = await renderToBuffer(<Quittance d={donnees} />)
    chemin = `${receipt.org_id}/quittances/${receipt.receipt_number}.pdf`

    const { error: upErr } = await admin.storage
      .from("documents")
      .upload(chemin, buffer, { contentType: "application/pdf", upsert: true })
    if (upErr) throw new Error(upErr.message)
  } catch (e) {
    // On ne prétend pas avoir produit un document qu'on n'a pas produit.
    console.error("quittance PDF:", (e as Error).message)
    return NextResponse.json(
      { error: `Génération impossible : ${(e as Error).message}` },
      { status: 500 }
    )
  }

  await admin.from("receipts").update({ pdf_url: chemin }).eq("id", receipt.id)

  const { data: signe } = await admin.storage.from("documents").createSignedUrl(chemin, 3600)
  return NextResponse.json({ url: signe?.signedUrl ?? null, regenere: true })
}
