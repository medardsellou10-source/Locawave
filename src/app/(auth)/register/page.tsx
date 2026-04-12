"use client"

export const dynamic = "force-dynamic"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { registerSchema, type RegisterInput } from "@/lib/schemas"
import { createClient } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import Link from "next/link"
import { Loader2 } from "lucide-react"

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
  { label: "1 a 5 biens", value: "1-5", numericValue: 5 },
  { label: "6 a 20 biens", value: "6-20", numericValue: 20 },
  { label: "Plus de 20 biens", value: "20+", numericValue: 50 },
] as const

export default function RegisterPage() {
  const router = useRouter()
  const supabase = createClient()
  const [isLoading, setIsLoading] = useState(false)
  const [selectedPropertyRange, setSelectedPropertyRange] = useState("")

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: { full_name: "", email: "", password: "", confirm_password: "" },
  })

  function handlePropertyCountChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const rangeValue = e.target.value
    setSelectedPropertyRange(rangeValue)
    const option = PROPERTY_COUNT_OPTIONS.find((o) => o.value === rangeValue)
    if (option) {
      setValue("property_count", option.numericValue, { shouldValidate: true })
    }
  }

  async function onSubmit(data: RegisterInput) {
    setIsLoading(true)
    try {
      // 1. Inscription Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            full_name: data.full_name,
          },
        },
      })

      if (authError) {
        if (authError.message.includes("already registered")) {
          toast.error("Cet email est deja utilise. Connectez-vous ou utilisez un autre email.")
        } else {
          toast.error(authError.message)
        }
        return
      }

      if (!authData.user) {
        toast.error("Erreur lors de la creation du compte")
        return
      }

      // 2. Appel API pour creer l'organisation et le user row
      const setupRes = await fetch("/api/auth/setup-org", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: authData.user.id,
          full_name: data.full_name,
          email: data.email,
          property_count: data.property_count ?? 5,
        }),
      })

      if (!setupRes.ok) {
        const errorBody = await setupRes.json().catch(() => null)
        toast.error(
          errorBody?.error ?? "Erreur lors de la configuration du compte"
        )
        return
      }

      toast.success("Compte cree avec succes ! Bienvenue sur Locawave.")
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
        <CardTitle className="text-xl text-[#1a2744]">
          Creer un compte
        </CardTitle>
        <CardDescription>
          Commencez a gerer vos biens locatifs en quelques minutes
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          {/* Nom complet */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="full_name">Nom complet</Label>
            <Input
              id="full_name"
              type="text"
              autoComplete="name"
              disabled={isLoading}
              {...register("full_name")}
              aria-invalid={!!errors.full_name}
            />
            {errors.full_name && (
              <p className="text-xs text-red-500">
                {errors.full_name.message}
              </p>
            )}
          </div>

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
              autoComplete="new-password"
              disabled={isLoading}
              {...register("password")}
              aria-invalid={!!errors.password}
            />
            {errors.password && (
              <p className="text-xs text-red-500">{errors.password.message}</p>
            )}
          </div>

          {/* Confirm password */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="confirm_password">Confirmer le mot de passe</Label>
            <Input
              id="confirm_password"
              type="password"
              autoComplete="new-password"
              disabled={isLoading}
              {...register("confirm_password")}
              aria-invalid={!!errors.confirm_password}
            />
            {errors.confirm_password && (
              <p className="text-xs text-red-500">
                {errors.confirm_password.message}
              </p>
            )}
          </div>

          {/* Nombre de biens */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="property_count">Nombre de biens a gerer</Label>
            <select
              id="property_count"
              value={selectedPropertyRange}
              onChange={handlePropertyCountChange}
              disabled={isLoading}
              className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="" disabled>
                Selectionnez une tranche
              </option>
              {PROPERTY_COUNT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Submit */}
          <Button
            type="submit"
            disabled={isLoading}
            className="mt-2 h-10 w-full bg-[#f97316] text-white hover:bg-[#ea6c0e]"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creation en cours...
              </>
            ) : (
              "Creer mon compte"
            )}
          </Button>
        </form>
      </CardContent>

      <CardFooter className="justify-center">
        <p className="text-sm text-muted-foreground">
          Vous avez deja un compte ?{" "}
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
