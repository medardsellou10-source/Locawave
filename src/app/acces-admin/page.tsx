"use client"

export const dynamic = "force-dynamic"

import { Suspense, useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Loader2, Lock, CheckCircle2, XCircle } from "lucide-react"

import { createClient } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

/**
 * Page d'acceptation d'une invitation à la console.
 *
 * Elle vit hors de /admin, sinon elle serait invisible pour l'invité — qui n'est
 * pas encore administrateur. Elle exige une session : c'est ce qui garantit
 * qu'on sait à qui l'accès est donné. Le jeton reste dans l'URL et n'est envoyé
 * qu'à la base, au moment de l'acceptation.
 */

type Etat = "verification" | "sans_session" | "pret" | "succes" | "erreur"

function Contenu() {
  const router = useRouter()
  const params = useSearchParams()
  const supabase = createClient()
  const jeton = params.get("jeton") ?? ""

  const [etat, setEtat] = useState<Etat>("verification")
  const [message, setMessage] = useState("")
  const [enCours, setEnCours] = useState(false)

  useEffect(() => {
    async function verifier() {
      if (!jeton) {
        setEtat("erreur")
        setMessage("Ce lien est incomplet. Demande une nouvelle invitation.")
        return
      }
      const {
        data: { user },
      } = await supabase.auth.getUser()
      setEtat(user ? "pret" : "sans_session")
    }
    verifier()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jeton])

  async function accepter() {
    setEnCours(true)
    const { data, error } = await supabase.rpc("admin_accept_invitation", { p_token: jeton })
    setEnCours(false)
    if (error) {
      setEtat("erreur")
      setMessage(error.message.replace(/^.*?ERROR:\s*/i, "").trim())
      return
    }
    setEtat("succes")
    setMessage((data as unknown as { message: string }).message)
    setTimeout(() => router.push("/admin"), 1500)
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
      <Card className="w-full max-w-md">
        <CardContent className="p-8 text-center">
          <span className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#0f172a]">
            {etat === "succes" ? (
              <CheckCircle2 className="h-6 w-6 text-white" />
            ) : etat === "erreur" ? (
              <XCircle className="h-6 w-6 text-white" />
            ) : (
              <Lock className="h-6 w-6 text-white" />
            )}
          </span>

          {etat === "verification" && (
            <p className="text-sm text-slate-500">
              <Loader2 className="mx-auto mb-2 h-5 w-5 animate-spin" />
              Vérification…
            </p>
          )}

          {etat === "sans_session" && (
            <>
              <h1 className="text-xl font-bold text-slate-900">Connectez-vous d&apos;abord</h1>
              <p className="mt-3 text-sm text-slate-600">
                Cette invitation donne accès à la console d&apos;administration. Elle doit
                être rattachée à un compte : connectez-vous, vous reviendrez ici
                automatiquement.
              </p>
              <Link href={`/login?next=${encodeURIComponent(`/acces-admin?jeton=${jeton}`)}`}>
                <Button className="mt-6 w-full">Se connecter</Button>
              </Link>
            </>
          )}

          {etat === "pret" && (
            <>
              <h1 className="text-xl font-bold text-slate-900">
                Invitation à la console Locawave
              </h1>
              <p className="mt-3 text-sm text-slate-600">
                En acceptant, vous obtenez accès à l&apos;administration de la plateforme :
                comptes, organisations, finances, litiges. Chacune de vos actions y sera
                enregistrée.
              </p>
              <Button className="mt-6 w-full" disabled={enCours} onClick={accepter}>
                {enCours && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Accepter l&apos;invitation
              </Button>
            </>
          )}

          {etat === "succes" && (
            <>
              <h1 className="text-xl font-bold text-slate-900">C&apos;est fait</h1>
              <p className="mt-3 text-sm text-slate-600">{message}</p>
              <p className="mt-2 text-xs text-slate-400">Redirection vers la console…</p>
            </>
          )}

          {etat === "erreur" && (
            <>
              <h1 className="text-xl font-bold text-slate-900">Invitation refusée</h1>
              <p className="mt-3 text-sm text-slate-600">{message}</p>
              <Link href="/">
                <Button variant="outline" className="mt-6 w-full">
                  Retour à l&apos;accueil
                </Button>
              </Link>
            </>
          )}
        </CardContent>
      </Card>
    </main>
  )
}

export default function AccesAdminPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
        </main>
      }
    >
      <Contenu />
    </Suspense>
  )
}
