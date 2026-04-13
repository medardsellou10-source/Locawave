"use client"

export const dynamic = "force-dynamic"

import { useState, useEffect, Suspense } from "react"
import { createClient } from "@/lib/supabase"
import { useRouter, useSearchParams } from "next/navigation"
import { toast } from "sonner"
import Link from "next/link"
import { Loader2, Check } from "lucide-react"

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

const PROPERTY_COUNT_OPTIONS = [
  { label: "1 à 5 biens", value: "1-5", numericValue: 5 },
  { label: "6 à 20 biens", value: "6-20", numericValue: 20 },
  { label: "Plus de 20 biens", value: "20+", numericValue: 50 },
] as const

const PLAN_CONFIG: Record<string, { label: string; range: string; count: number; color: string; emoji: string }> = {
  solo: { label: "Solo", range: "1-5", count: 5, color: "bg-blue-50 border-blue-200 text-blue-700", emoji: "👤" },
  pro: { label: "Pro", range: "6-20", count: 20, color: "bg-orange-50 border-orange-300 text-orange-700", emoji: "⭐" },
  agence: { label: "Agence", range: "20+", count: 50, color: "bg-amber-50 border-amber-300 text-amber-700", emoji: "🏢" },
}

// Inner component that uses useSearchParams — must be wrapped in Suspense
function RegisterForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()
  const [isLoading, setIsLoading] = useState(false)

  const planParam = searchParams.get("plan") ?? ""
  const selectedPlan = PLAN_CONFIG[planParam] ?? null

  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [propertyRange, setPropertyRange] = useState("")
  const [propertyCount, setPropertyCount] = useState(5)

  const [errors, setErrors] = useState<{
    full_name?: string
    email?: string
    password?: string
    confirm_password?: string
  }>({})

  // Pre-select plan from URL param
  useEffect(() => {
    if (selectedPlan) {
      setPropertyRange(selectedPlan.range)
      setPropertyCount(selectedPlan.count)
    }
  }, [planParam]) // eslint-disable-line react-hooks/exhaustive-deps

  function validate() {
    const errs: typeof errors = {}
    if (!fullName || fullName.trim().length < 2) {
      errs.full_name = "Le nom doit contenir au moins 2 caractères"
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errs.email = "Email invalide"
    }
    if (!password || password.length < 6) {
      errs.password = "Le mot de passe doit contenir au moins 6 caractères"
    }
    if (password !== confirmPassword) {
      errs.confirm_password = "Les mots de passe ne correspondent pas"
    }
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return

    setIsLoading(true)
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName } },
      })

      if (authError) {
        if (authError.message.includes("already registered")) {
          toast.error("Cet email est déjà utilisé. Connectez-vous ou utilisez un autre email.")
        } else {
          toast.error(authError.message)
        }
        return
      }

      if (!authData.user) {
        toast.error("Erreur lors de la création du compte")
        return
      }

      const setupRes = await fetch("/api/auth/setup-org", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: authData.user.id,
          full_name: fullName,
          email,
          property_count: propertyCount,
        }),
      })

      if (!setupRes.ok) {
        const errorBody = await setupRes.json().catch(() => null)
        toast.error(errorBody?.error ?? "Erreur lors de la configuration du compte")
        return
      }

      toast.success("Compte créé avec succès ! Bienvenue sur Locawave.")
      router.push("/dashboard/onboarding")
    } catch {
      toast.error("Une erreur inattendue est survenue")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full border-0 bg-white/95 shadow-2xl backdrop-blur">
      <CardHeader className="text-center">
        <CardTitle className="text-xl text-[#1a2744]">Créer un compte</CardTitle>
        <CardDescription>
          Commencez à gérer vos biens locatifs en quelques minutes
        </CardDescription>
        {selectedPlan && (
          <div className={`mt-3 inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm font-medium ${selectedPlan.color}`}>
            <span>{selectedPlan.emoji}</span>
            <span>Plan <strong>{selectedPlan.label}</strong> sélectionné</span>
            <Check className="w-4 h-4" />
          </div>
        )}
      </CardHeader>

      <CardContent>
        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="full_name">Nom complet</Label>
            <Input
              id="full_name"
              type="text"
              autoComplete="name"
              disabled={isLoading}
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              aria-invalid={!!errors.full_name}
            />
            {errors.full_name && (
              <p className="text-xs text-red-500">{errors.full_name}</p>
            )}
          </div>

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
            <Label htmlFor="password">Mot de passe</Label>
            <Input
              id="password"
              type="password"
              autoComplete="new-password"
              disabled={isLoading}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              aria-invalid={!!errors.password}
            />
            {errors.password && (
              <p className="text-xs text-red-500">{errors.password}</p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="confirm_password">Confirmer le mot de passe</Label>
            <Input
              id="confirm_password"
              type="password"
              autoComplete="new-password"
              disabled={isLoading}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              aria-invalid={!!errors.confirm_password}
            />
            {errors.confirm_password && (
              <p className="text-xs text-red-500">{errors.confirm_password}</p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="property_count">Nombre de biens à gérer</Label>
            <select
              id="property_count"
              value={propertyRange}
              onChange={(e) => {
                setPropertyRange(e.target.value)
                const opt = PROPERTY_COUNT_OPTIONS.find((o) => o.value === e.target.value)
                if (opt) setPropertyCount(opt.numericValue)
              }}
              disabled={isLoading}
              className="h-10 w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm transition-colors outline-none focus-visible:border-ring disabled:pointer-events-none disabled:opacity-50"
            >
              <option value="" disabled>
                Sélectionnez une tranche
              </option>
              {PROPERTY_COUNT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="mt-2 h-10 w-full bg-[#f97316] text-white hover:bg-[#ea6c0e]"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Création en cours...
              </>
            ) : (
              "Créer mon compte"
            )}
          </Button>
        </form>
      </CardContent>

      <CardFooter className="justify-center">
        <p className="text-sm text-muted-foreground">
          Vous avez déjà un compte ?{" "}
          <Link
            href="/login"
            className="font-medium text-[#f97316] underline-offset-4 hover:underline"
          >
            Se connecter
          </Link>
        </p>
      </CardFooter>
    </Card>
  )
}

// Outer page wraps the form in Suspense (required for useSearchParams)
export default function RegisterPage() {
  return (
    <Suspense fallback={
      <Card className="w-full border-0 bg-white/95 shadow-2xl backdrop-blur">
        <CardHeader className="text-center">
          <CardTitle className="text-xl text-[#1a2744]">Créer un compte</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-[#f97316]" />
        </CardContent>
      </Card>
    }>
      <RegisterForm />
    </Suspense>
  )
}
