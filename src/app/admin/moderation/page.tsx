import { requireAdmin } from "@/lib/admin"
import { createServerClient } from "@/lib/supabase-server"
import { Card, CardContent } from "@/components/ui/card"
import { AdminModeration, type ModerationData } from "@/components/app/AdminModeration"

export const dynamic = "force-dynamic"

export default async function AdminModerationPage() {
  await requireAdmin()

  const supabase = await createServerClient()
  const { data, error } = await supabase.rpc("admin_moderation")

  if (error || !data) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="p-6 text-sm text-red-800">
          Lecture impossible : {error?.message ?? "réponse vide"}
        </CardContent>
      </Card>
    )
  }

  const d = data as unknown as ModerationData

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Annonces &amp; modération
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Ce qui engage la confiance : une identité validée, un prestataire vérifié, une
          annonce visible du public.
        </p>
      </header>

      <AdminModeration data={d} />

      <p className="text-xs text-slate-400">
        Tout refus demande un motif, et il est transmis à la personne concernée. Un avis
        n&apos;est jamais supprimé, seulement masqué : effacer la parole d&apos;un client
        sans trace n&apos;est pas de la modération.
      </p>
    </div>
  )
}
