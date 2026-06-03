"use client"

export const dynamic = "force-dynamic"

import { useState } from "react"
import { createClient } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import Link from "next/link"
import { Loader2, Mail, ArrowLeft } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()
  const [isLoading, setIsLoading] = useState(false)
  const [isMagicLinkLoading, setIsMagicLinkLoading] = useState(false)
  const [showMagicLink, setShowMagicLink] = useState(false)
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  const [forgotEmail, setForgotEmail] = useState("")
  const [resetSent, setResetSent] = useState(false)
  const [isResetLoading, setIsResetLoading] = useState(false)

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({})

  function validate() {
    const errs: { email?: string; password?: string } = {}
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errs.email = "Email invalide"
    }
    if (!password || password.length < 6) {
      errs.password = "Le mot de passe doit contenir au moins 6 caractères"
    }
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return

    setIsLoading(true)
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password })

      if (error) {
        if (error.message.includes("Invalid login credentials")) {
          toast.error("Email ou mot de passe incorrect")
        } else if (error.message.includes("Email not confirmed")) {
          toast.error("Veuillez confirmer votre email avant de vous connecter")
        } else {
          toast.error(error.message)
        }
        return
      }

      toast.success("Connexion réussie !")
      router.push("/dashboard")
    } catch {
      toast.error("Une erreur inattendue est survenue")
    } finally {
      setIsLoading(false)
    }
  }

  async function handleForgotPassword() {
    if (!forgotEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(forgotEmail)) {
      toast.error("Veuillez entrer un email valide")
      return
    }
    setIsResetLoading(true)
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(forgotEmail, {
        redirectTo: `${window.location.origin}/reset-password`,
      })
      if (error) {
        toast.error(error.message)
        return
      }
      setResetSent(true)
    } catch {
      toast.error("Une erreur inattendue est survenue")
    } finally {
      setIsResetLoading(false)
    }
  }

  async function handleMagicLink() {
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setErrors({ email: "Veuillez entrer un email valide" })
      return
    }

    setIsMagicLinkLoading(true)
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: `${window.location.origin}/auth/callback?next=/dashboard` },
      })

      if (error) {
        toast.error(error.message)
        return
      }

      toast.success("Lien magique envoyé ! Vérifiez votre boite email.")
      setShowMagicLink(true)
    } catch {
      toast.error("Une erreur inattendue est survenue")
    } finally {
      setIsMagicLinkLoading(false)
    }
  }

  // ─── Forgot password view ───
  if (showForgotPassword) {
    if (resetSent) {
      return (
        <Card className="w-full border-0 bg-white/95 shadow-2xl backdrop-blur">
          <CardHeader className="text-center">
            <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
              <Mail className="h-6 w-6 text-green-600" />
            </div>
            <CardTitle className="text-xl">Email envoyé !</CardTitle>
            <CardDescription>
              Un lien de réinitialisation a été envoyé à <strong>{forgotEmail}</strong>.
              Vérifiez votre boîte mail (et les spams).
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full" onClick={() => {
              setShowForgotPassword(false)
              setResetSent(false)
              setForgotEmail("")
            }}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Retour à la connexion
            </Button>
          </CardContent>
        </Card>
      )
    }

    return (
      <Card className="w-full border-0 bg-white/95 shadow-2xl backdrop-blur">
        <CardHeader className="text-center">
          <CardTitle className="text-xl text-[#1a2744]">Mot de passe oublié</CardTitle>
          <CardDescription>
            Entrez votre email pour recevoir un lien de réinitialisation
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="forgot-email">Email</Label>
            <Input
              id="forgot-email"
              type="email"
              placeholder="vous@example.com"
              value={forgotEmail}
              onChange={(e) => setForgotEmail(e.target.value)}
              disabled={isResetLoading}
            />
          </div>
          <Button
            className="w-full bg-[#f97316] hover:bg-[#ea6c0e] text-white"
            onClick={handleForgotPassword}
            disabled={isResetLoading}
          >
            {isResetLoading ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Envoi en cours...</>
            ) : (
              "Envoyer le lien de réinitialisation"
            )}
          </Button>
          <Button variant="ghost" className="w-full" onClick={() => setShowForgotPassword(false)}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Retour à la connexion
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (showMagicLink) {
    return (
      <Card className="w-full border-0 bg-white/95 shadow-2xl backdrop-blur">
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-[#f97316]/10">
            <Mail className="h-6 w-6 text-[#f97316]" />
          </div>
          <CardTitle className="text-xl">Vérifiez votre email</CardTitle>
          <CardDescription>
            Un lien de connexion a été envoyé à votre adresse email. Cliquez
            dessus pour vous connecter.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            variant="outline"
            className="w-full"
            onClick={() => setShowMagicLink(false)}
          >
            Retour à la connexion
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full border-0 bg-white/95 shadow-2xl backdrop-blur">
      <CardHeader className="text-center">
        <CardTitle className="text-xl text-[#1a2744]">Connexion</CardTitle>
        <CardDescription>
          Connectez-vous à votre espace de gestion locative
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              disabled={isLoading}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              aria-invalid={!!errors.email}
            />
            {errors.email && (
              <p className="text-xs text-red-500">{errors.email}</p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Mot de passe</Label>
              <button
                type="button"
                onClick={() => { setForgotEmail(email); setShowForgotPassword(true) }}
                className="text-xs text-[#f97316] hover:underline"
              >
                Mot de passe oublié ?
              </button>
            </div>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              disabled={isLoading}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              aria-invalid={!!errors.password}
            />
            {errors.password && (
              <p className="text-xs text-red-500">{errors.password}</p>
            )}
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="h-10 w-full bg-[#f97316] text-white hover:bg-[#ea6c0e]"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Connexion en cours...
              </>
            ) : (
              "Se connecter"
            )}
          </Button>
        </form>

        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white/95 px-2 text-muted-foreground">ou</span>
          </div>
        </div>

        <Button
          type="button"
          variant="outline"
          className="h-10 w-full"
          disabled={isMagicLinkLoading}
          onClick={handleMagicLink}
        >
          {isMagicLinkLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Envoi en cours...
            </>
          ) : (
            <>
              <Mail className="mr-2 h-4 w-4" />
              Connexion par lien magique
            </>
          )}
        </Button>
      </CardContent>

      <CardFooter className="justify-center">
        <p className="text-sm text-muted-foreground">
          Pas encore de compte ?{" "}
          <Link
            href="/register"
            className="font-medium text-[#f97316] underline-offset-4 hover:underline"
          >
            Créer un compte
          </Link>
        </p>
      </CardFooter>
    </Card>
  )
}
