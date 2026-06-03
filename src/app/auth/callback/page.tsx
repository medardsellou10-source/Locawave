"use client"

export const dynamic = "force-dynamic"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase"
import { Loader2 } from "lucide-react"

/**
 * Callback d'authentification (liens magiques / invitations).
 * - Flux PKCE (?code) : échange code → session.
 * - Flux implicite (#access_token) : détecté automatiquement par le client navigateur.
 * Puis aiguillage par rôle (tenant → /locataire, sinon → next/dashboard).
 */
export default function AuthCallbackPage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const supabase = createClient()

    async function finish() {
      const url = new URL(window.location.href)
      const code = url.searchParams.get("code")
      const next = url.searchParams.get("next")

      // PKCE : échange explicite si un code est présent
      if (code) {
        await supabase.auth.exchangeCodeForSession(code).catch(() => {})
      }

      // Implicite (#access_token) : laisser le client le détecter, avec quelques tentatives
      let session = null
      for (let i = 0; i < 5; i++) {
        const { data } = await supabase.auth.getSession()
        session = data.session
        if (session) break
        await new Promise((r) => setTimeout(r, 300))
      }

      if (!session) {
        setError("Lien invalide ou expiré. Veuillez vous reconnecter.")
        setTimeout(() => router.replace("/login"), 2500)
        return
      }

      // Aiguillage par rôle
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", session.user.id)
        .single()

      if (profile?.role === "tenant") {
        router.replace("/locataire")
      } else if (next && next.startsWith("/") && !next.startsWith("//")) {
        router.replace(next)
      } else {
        router.replace("/dashboard")
      }
    }

    finish()
  }, [router])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4 text-center">
      {error ? (
        <p className="text-red-600 max-w-sm">{error}</p>
      ) : (
        <>
          <Loader2 className="w-8 h-8 text-[#f97316] animate-spin mb-3" />
          <p className="text-gray-600">Connexion en cours…</p>
        </>
      )}
    </div>
  )
}
