"use client"

export const dynamic = "force-dynamic"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { loginSchema, type LoginInput } from "@/lib/schemas"
import { createClient } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import Link from "next/link"
import { Loader2, Mail } from "lucide-react"

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
import { Skeleton } from "@/components/ui/skeleton"

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()
  const [isLoading, setIsLoading] = useState(false)
  const [isMagicLinkLoading, setIsMagicLinkLoading] = useState(false)
  const [showMagicLink, setShowMagicLink] = useState(false)

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  })

  async function onSubmit(data: LoginInput) {
    setIsLoading(true)
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      })

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

      toast.success("Connexion reussie !")
      router.push("/dashboard")
    } catch {
      toast.error("Une erreur inattendue est survenue")
    } finally {
      setIsLoading(false)
    }
  }

  async function handleMagicLink() {
    const email = getValues("email")
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error("Veuillez entrer un email valide")
      return
    }

    setIsMagicLinkLoading(true)
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`,
        },
      })

      if (error) {
        toast.error(error.message)
        return
      }

      toast.success("Lien magique envoye ! Verifiez votre boite email.")
      setShowMagicLink(true)
    } catch {
      toast.error("Une erreur inattendue est survenue")
    } finally {
      setIsMagicLinkLoading(false)
    }
  }

  if (showMagicLink) {
    return (
      <Card className="w-full border-0 bg-white/95 shadow-2xl backdrop-blur">
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-[#f97316]/10">
            <Mail className="h-6 w-6 text-[#f97316]" />
          </div>
          <CardTitle className="text-xl">Verifiez votre email</CardTitle>
          <CardDescription>
            Un lien de connexion a ete envoye a votre adresse email. Cliquez
            dessus pour vous connecter.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            variant="outline"
            className="w-full"
            onClick={() => setShowMagicLink(false)}
          >
            Retour a la connexion
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full border-0 bg-white/95 shadow-2xl backdrop-blur">
      <CardHeader className="text-center">
        <CardTitle className="text-xl text-[#1a2744]">
          Connexion
        </CardTitle>
        <CardDescription>
          Connectez-vous a votre espace de gestion locative
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          {/* Email */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              disabled={isLoading}
              {...register("email")}
              aria-invalid={!!errors.email}
            />
            {errors.email && (
              <p className="text-xs text-red-500">{errors.email.message}</p>
            )}
          </div>

          {/* Password */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="password">Mot de passe</Label>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              disabled={isLoading}
              {...register("password")}
              aria-invalid={!!errors.password}
            />
            {errors.password && (
              <p className="text-xs text-red-500">{errors.password.message}</p>
            )}
          </div>

          {/* Submit */}
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

        {/* Separator */}
        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white/95 px-2 text-muted-foreground">ou</span>
          </div>
        </div>

        {/* Magic Link */}
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
            Creer un compte
          </Link>
        </p>
      </CardFooter>
    </Card>
  )
}
