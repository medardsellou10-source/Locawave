import Link from "next/link"
import { Wrench } from "lucide-react"

export const dynamic = "force-dynamic"

export const metadata = {
  title: "Maintenance en cours",
  robots: { index: false, follow: false },
}

export default function MaintenancePage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
      <div className="max-w-md text-center">
        <span className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#1a2744]">
          <Wrench className="h-6 w-6 text-white" />
        </span>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Locawave revient dans un instant
        </h1>
        <p className="mt-3 text-slate-600">
          Nous effectuons une intervention technique. Vos données ne sont pas affectées :
          loyers, quittances et messages vous attendent au retour.
        </p>
        <p className="mt-6 text-sm text-slate-500">
          Une urgence ?{" "}
          <Link href="/contact" className="font-medium text-[#1a2744] underline">
            Écrivez-nous
          </Link>
          .
        </p>
      </div>
    </main>
  )
}
