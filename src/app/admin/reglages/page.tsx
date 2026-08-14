import { requireAdmin } from "@/lib/admin"
import { createServerClient } from "@/lib/supabase-server"
import { Card, CardContent } from "@/components/ui/card"
import {
  AdminReglages,
  type Reglage,
  type Administrateur,
} from "@/components/app/AdminReglages"

export const dynamic = "force-dynamic"

type Vue = {
  reglages: Reglage[]
  administrateurs: Administrateur[]
  je_suis_super: boolean
}

export default async function AdminReglagesPage() {
  await requireAdmin()

  const supabase = await createServerClient()
  const { data, error } = await supabase.rpc("admin_settings_view")

  if (error || !data) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="p-6 text-sm text-red-800">
          Lecture impossible : {error?.message ?? "réponse vide"}
        </CardContent>
      </Card>
    )
  }

  const v = data as unknown as Vue

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Réglages</h1>
        <p className="mt-1 text-sm text-slate-500">
          Les interrupteurs de la plateforme, et la liste de ceux qui peuvent entrer ici.
        </p>
      </header>

      <AdminReglages
        reglages={v.reglages}
        administrateurs={v.administrateurs}
        jeSuisSuper={v.je_suis_super}
      />

      <p className="text-xs text-slate-400">
        Chaque bascule est enregistrée dans le journal, avec l&apos;état d&apos;avant et
        celui d&apos;après. Un interrupteur qui n&apos;éteindrait rien serait pire
        qu&apos;absent : chacun est lu à l&apos;endroit qui l&apos;applique.
      </p>
    </div>
  )
}
