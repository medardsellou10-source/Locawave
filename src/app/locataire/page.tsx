import { redirect } from "next/navigation"
import Link from "next/link"
import { createServerClient } from "@/lib/supabase-server"
import { formatFCFA, formatDateFR } from "@/lib/formatters"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { PayNowButton } from "@/components/app/PayNowButton"
import { KycUpload } from "@/components/app/KycUpload"
import { TenantIncidents } from "@/components/app/TenantIncidents"
import { Inbox } from "@/components/app/Inbox"
import { Sparkles, FileText, Home, HeartPulse, Scale } from "lucide-react"

export const dynamic = "force-dynamic"

export default async function LocatairePage() {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  // Fiche locataire reliée à ce compte (RLS : tenant_reads_self)
  const { data: tenant } = await supabase
    .from("tenants")
    .select("id, first_name, last_name")
    .eq("profile_id", user.id)
    .maybeSingle()

  // Bail actif + unité + bien (RLS : tenant_reads_lease/unit/property)
  const { data: lease } = await supabase
    .from("leases")
    .select("id, org_id, rent_fcfa, start_date, end_date, status, units(property_id, unit_number, properties(name, address, city))")
    .order("start_date", { ascending: false })
    .limit(1)
    .maybeSingle()

  // Échéances (RLS : tenant_reads_schedule)
  const { data: schedules } = await supabase
    .from("rent_schedules")
    .select("id, due_date, amount_fcfa, status")
    .order("due_date", { ascending: true })

  // Quittances (RLS : tenant_reads_receipt + payment)
  const { data: receipts } = await supabase
    .from("receipts")
    .select("id, receipt_number, created_at, pdf_url, payments(amount_fcfa, paid_at)")
    .order("created_at", { ascending: false })

  // @ts-expect-error relation typée en tableau
  const unit = lease?.units
  const property = unit?.properties
  const pending = (schedules ?? []).filter((s) => s.status !== "paid")
  const nextDue = pending[0]

  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-gradient-to-br from-[#1a2744] to-[#1e3a5f] p-6 text-white shadow-sm">
        <h1 className="text-2xl font-bold">Bonjour {tenant?.first_name ?? ""} 👋</h1>
        <p className="text-sm text-gray-300">Votre espace locataire — loyers, quittances, incidents et services.</p>
        <div className="mt-4 flex gap-2 flex-wrap">
          <Link href="/avantages"><Button size="sm" className="bg-white/10 hover:bg-white/20 text-white border-0"><HeartPulse className="w-4 h-4 mr-1" /> Avantages</Button></Link>
          <Link href="/litiges"><Button size="sm" className="bg-white/10 hover:bg-white/20 text-white border-0"><Scale className="w-4 h-4 mr-1" /> Litiges</Button></Link>
          <Link href="/services"><Button size="sm" className="bg-[#f97316] hover:bg-[#ea580c] text-white"><Sparkles className="w-4 h-4 mr-1" /> Trouver un service</Button></Link>
        </div>
      </div>

      {/* Logement */}
      {lease && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Home className="w-4 h-4 text-[#f97316]" /> Mon logement
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-gray-600 space-y-1">
            <p className="font-medium text-[#1a2744]">
              {property?.name ?? "—"} {unit?.unit_number ? `· ${unit.unit_number}` : ""}
            </p>
            {property?.address && (
              <p>{[property.address, property.city].filter(Boolean).join(", ")}</p>
            )}
            <p>Loyer mensuel : <span className="font-medium">{formatFCFA(lease.rent_fcfa)}</span></p>
          </CardContent>
        </Card>
      )}

      {/* Prochaine échéance */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Prochain loyer</CardTitle>
        </CardHeader>
        <CardContent>
          {nextDue ? (
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div>
                <p className="text-2xl font-bold text-[#1a2744]">{formatFCFA(nextDue.amount_fcfa)}</p>
                <p className="text-sm text-gray-500">
                  Échéance du {formatDateFR(nextDue.due_date)}{" "}
                  {nextDue.status === "late" && (
                    <Badge variant="outline" className="border-red-300 text-red-600 ml-1">En retard</Badge>
                  )}
                </p>
              </div>
              <PayNowButton scheduleId={nextDue.id} />
            </div>
          ) : (
            <p className="text-gray-500 text-sm">Aucune échéance à payer. Vous êtes à jour ✅</p>
          )}
        </CardContent>
      </Card>

      {/* Historique des échéances */}
      {(schedules?.length ?? 0) > 0 && (
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base">Mes échéances</CardTitle></CardHeader>
          <CardContent className="divide-y">
            {schedules!.map((s) => (
              <div key={s.id} className="flex items-center justify-between py-2 text-sm">
                <span>{formatDateFR(s.due_date)}</span>
                <span className="font-medium">{formatFCFA(s.amount_fcfa)}</span>
                <Badge variant={s.status === "paid" ? "default" : s.status === "late" ? "outline" : "secondary"}
                  className={s.status === "late" ? "border-red-300 text-red-600" : ""}>
                  {s.status === "paid" ? "Payé" : s.status === "late" ? "En retard" : "À venir"}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Quittances */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <FileText className="w-4 h-4 text-[#f97316]" /> Mes quittances
          </CardTitle>
        </CardHeader>
        <CardContent>
          {(receipts?.length ?? 0) === 0 ? (
            <p className="text-gray-500 text-sm">Vos quittances apparaîtront ici après paiement.</p>
          ) : (
            <div className="divide-y">
              {receipts!.map((r) => (
                <div key={r.id} className="flex items-center justify-between py-2 text-sm">
                  <span className="font-medium">{r.receipt_number}</span>
                  <span className="text-gray-500">{formatDateFR(r.created_at ?? "")}</span>
                  {r.pdf_url ? (
                    <a href={r.pdf_url} target="_blank" rel="noopener noreferrer"
                      className="text-[#f97316] hover:underline">Télécharger</a>
                  ) : (
                    <span className="text-gray-400">Disponible</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Incidents (signalement + suivi temps réel) */}
      {lease && (
        <TenantIncidents orgId={lease.org_id} leaseId={lease.id} propertyId={unit?.property_id ?? null} />
      )}

      {/* Messagerie */}
      <Inbox />

      {/* Vérification d'identité (KYC) */}
      <KycUpload />
    </div>
  )
}
