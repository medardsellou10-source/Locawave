import Link from "next/link"
import { Megaphone } from "lucide-react"

import { reglageActif } from "@/lib/reglages"
import { createServerClient } from "@/lib/supabase-server"

export const dynamic = "force-dynamic"

/**
 * Interrupteur « Annonces publiques ». Fermé, la marketplace disparaît pour les
 * visiteurs non connectés — les comptes existants continuent d'y accéder, et
 * les propriétaires gardent leurs annonces intactes. Fermer une vitrine n'est
 * pas effacer ce qu'elle exposait.
 */
export default async function AnnoncesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const ouvert = await reglageActif("listings_public")

  if (!ouvert) {
    const supabase = await createServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return (
        <main className="flex min-h-[70vh] items-center justify-center p-6">
          <div className="max-w-md text-center">
            <span className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100">
              <Megaphone className="h-6 w-6 text-slate-500" />
            </span>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Les annonces reviennent bientôt
            </h1>
            <p className="mt-3 text-slate-600">
              La recherche de logements est momentanément fermée au public. Les annonces
              publiées ne sont pas perdues : elles réapparaîtront telles quelles.
            </p>
            <p className="mt-6 text-sm text-slate-500">
              Vous avez un compte ?{" "}
              <Link href="/login" className="font-medium text-[#1a2744] underline">
                Connectez-vous
              </Link>{" "}
              pour continuer.
            </p>
          </div>
        </main>
      )
    }
  }

  return <>{children}</>
}
