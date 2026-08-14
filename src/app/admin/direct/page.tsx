import { requireAdmin } from "@/lib/admin"
import { createServerClient } from "@/lib/supabase-server"
import { Card, CardContent } from "@/components/ui/card"
import { AdminDirect, type Evenement } from "@/components/app/AdminDirect"

export const dynamic = "force-dynamic"

type Flux = {
  evenements: Evenement[]
  non_lus: number
  urgents_non_lus: number
}

export default async function AdminDirectPage() {
  await requireAdmin()

  const supabase = await createServerClient()
  const { data, error } = await supabase.rpc("admin_events_list", {
    p_limit: 100,
    p_non_lus_seulement: false,
  })

  if (error || !data) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="p-6 text-sm text-red-800">
          Lecture impossible : {error?.message ?? "réponse vide"}
        </CardContent>
      </Card>
    )
  }

  const f = data as unknown as Flux

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">En direct</h1>
        <p className="mt-1 text-sm text-slate-500">
          Tout ce qui arrive sur la plateforme, au moment où ça arrive : signalements,
          litiges, avis, comptes créés, pièces d&apos;identité déposées, candidatures,
          règlements.
        </p>
      </header>

      <AdminDirect initiaux={f.evenements} nonLus={f.non_lus} />

      <p className="text-xs text-slate-400">
        Un incident urgent ou un litige lève une alerte visible ; le nombre d&apos;éléments
        non lus s&apos;affiche aussi dans le titre de l&apos;onglet, pour se voir depuis une
        autre page.
      </p>
    </div>
  )
}
