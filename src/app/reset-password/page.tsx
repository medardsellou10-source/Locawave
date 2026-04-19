"use client"

export const dynamic = "force-dynamic"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase"
import { toast } from "sonner"
import { Loader2, Building2, Check } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export default function ResetPasswordPage() {
  const router = useRouter()
  const supabase = createClient()

  const [ready, setReady] = useState(false)
  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Supabase JS auto-détecte le token de récupération dans l'URL (hash ou ?code=)
    // et déclenche l'event PASSWORD_RECOVERY. On active le formulaire dès qu'une session est établie.
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN") {
        setReady(true)
      }
    })

    // Si la session est déjà posée (retour différé), on active aussi.
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setReady(true)
    })

    // Si ni code ni hash, on affiche une erreur après un court délai
    const timeout = setTimeout(() => {
      if (!ready && typeof window !== "undefined") {
        const hasRecovery =
          window.location.hash.includes("type=recovery") ||
          window.location.search.includes("code=")
        if (!hasRecovery) {
          setError("Lien invalide ou expiré. Demandez un nouveau lien depuis la page de connexion.")
        }
      }
    }, 1500)

    return () => {
      sub.subscription.unsubscribe()
      clearTimeout(timeout)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (password.length < 8) {
      toast.error("Le mot de passe doit contenir au moins 8 caractères")
      return
    }
    if (password !== confirm) {
      toast.error("Les mots de passe ne correspondent pas")
      return
    }
    setLoading(true)
    const { error: updateError } = await supabase.auth.updateUser({ password })
    setLoading(false)
    if (updateError) {
      toast.error(updateError.message)
      return
    }
    setDone(true)
    toast.success("Mot de passe mis à jour")
    setTimeout(() => router.push("/dashboard"), 1500)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a2744] via-[#1e3a5f] to-[#1a2744] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Link href="/" className="flex items-center justify-center gap-2 mb-6">
          <div className="w-9 h-9 bg-[#f97316] rounded-lg flex items-center justify-center">
            <Building2 className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold text-white">Locawave</span>
        </Link>

        <Card>
          <CardHeader>
            <CardTitle>Réinitialiser votre mot de passe</CardTitle>
            <CardDescription>
              Choisissez un nouveau mot de passe sécurisé (8 caractères minimum).
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-md p-3 mb-4">
                {error}
                <div className="mt-2">
                  <Link href="/login" className="text-[#f97316] font-medium hover:underline">
                    Retour à la connexion
                  </Link>
                </div>
              </div>
            )}

            {done ? (
              <div className="flex flex-col items-center text-center gap-3 py-4">
                <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                  <Check className="w-6 h-6 text-green-600" />
                </div>
                <p className="font-medium text-gray-800">Mot de passe mis à jour</p>
                <p className="text-sm text-gray-500">Redirection vers votre tableau de bord…</p>
              </div>
            ) : (
              <form onSubmit={onSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="password">Nouveau mot de passe</Label>
                  <Input
                    id="password"
                    type="password"
                    autoComplete="new-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={!ready || !!error}
                    required
                    minLength={8}
                  />
                </div>
                <div>
                  <Label htmlFor="confirm">Confirmer le mot de passe</Label>
                  <Input
                    id="confirm"
                    type="password"
                    autoComplete="new-password"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    disabled={!ready || !!error}
                    required
                    minLength={8}
                  />
                </div>
                <Button
                  type="submit"
                  disabled={loading || !ready || !!error}
                  className="w-full bg-[#f97316] hover:bg-[#ea580c] text-white"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Mise à jour…
                    </>
                  ) : (
                    "Mettre à jour le mot de passe"
                  )}
                </Button>
                {!ready && !error && (
                  <p className="text-xs text-gray-500 text-center">Vérification du lien de réinitialisation…</p>
                )}
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
