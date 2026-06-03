"use client"

export const dynamic = "force-dynamic"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import Link from "next/link"
import { Loader2, Building2, Home, Wrench } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle,
} from "@/components/ui/card"

type Role = "owner" | "tenant" | "provider"

const ROLES: { value: Role; label: string; desc: string; icon: typeof Building2 }[] = [
  { value: "owner", label: "Propriétaire / Agence", desc: "Gérer mes biens, loyers et locataires", icon: Building2 },
  { value: "tenant", label: "Locataire", desc: "Payer mon loyer, mes quittances, signaler un incident", icon: Home },
  { value: "provider", label: "Prestataire / Aidant", desc: "Recevoir des missions et proposer mes services", icon: Wrench },
]

const PROPERTY_COUNT_OPTIONS = [
  { label: "1 à 5 biens", value: "1-5", numericValue: 5 },
  { label: "6 à 20 biens", value: "6-20", numericValue: 20 },
  { label: "Plus de 20 biens", value: "20+", numericValue: 50 },
] as const

export default function RegisterPage() {
  const router = useRouter()
  const supabase = createClient()

  const [role, setRole] = useState<Role>("owner")
  const [isLoading, setIsLoading] = useState(false)
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [propertyRange, setPropertyRange] = useState("")
  const [propertyCount, setPropertyCount] = useState(5)
  const [errors, setErrors] = useState<{ full_name?: string; email?: string; password?: string; confirm_password?: string }>({})

  useEffect(() => {
    if (typeof window === "undefined") return
    const r = new URLSearchParams(window.location.search).get("role")
    if (r === "tenant" || r === "provider" || r === "owner") setRole(r)
  }, [])

  function validate() {
    const errs: typeof errors = {}
    if (!fullName || fullName.trim().length < 2) errs.full_name = "Le nom doit contenir au moins 2 caractères"
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = "Email invalide"
    if (!password || password.length < 6) errs.password = "Le mot de passe doit contenir au moins 6 caractères"
    if (password !== confirmPassword) errs.confirm_password = "Les mots de passe ne correspondent pas"
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return
    setIsLoading(true)
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email, password, options: { data: { full_name: fullName, role } },
      })
      if (authError) {
        toast.error(authError.message.includes("already registered")
          ? "Cet email est déjà utilisé. Connectez-vous ou utilisez un autre email."
          : authError.message)
        return
      }
      if (!authData.user) { toast.error("Erreur lors de la création du compte"); return }

      if (role === "owner") {
        const res = await fetch("/api/auth/setup-org", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ user_id: authData.user.id, full_name: fullName, email, property_count: propertyCount }),
        })
        if (!res.ok) { const b = await res.json().catch(() => null); toast.error(b?.error ?? "Erreur de configuration"); return }
        toast.success("Compte créé ! Bienvenue sur Locawave.")
        router.push("/dashboard/onboarding")
      } else {
        const res = await fetch("/api/auth/setup-role", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ user_id: authData.user.id, full_name: fullName, email, role }),
        })
        if (!res.ok) { const b = await res.json().catch(() => null); toast.error(b?.error ?? "Erreur de configuration"); return }
        toast.success("Compte créé ! Bienvenue sur Locawave.")
        router.push(role === "tenant" ? "/locataire" : "/prestataire")
      }
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
        <CardDescription>Choisissez votre profil pour accéder à votre espace</CardDescription>
      </CardHeader>

      <CardContent>
        {/* Choix du rôle */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-5">
          {ROLES.map((r) => {
            const active = role === r.value
            return (
              <button key={r.value} type="button" onClick={() => setRole(r.value)}
                className={`text-left rounded-lg border p-3 transition-colors ${active ? "border-[#f97316] bg-orange-50" : "border-gray-200 hover:border-gray-300"}`}>
                <r.icon className={`w-5 h-5 mb-1 ${active ? "text-[#f97316]" : "text-gray-400"}`} />
                <p className="text-sm font-medium text-[#1a2744]">{r.label}</p>
                <p className="text-[11px] text-gray-500 leading-tight mt-0.5">{r.desc}</p>
              </button>
            )
          })}
        </div>

        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="full_name">Nom complet</Label>
            <Input id="full_name" type="text" autoComplete="name" disabled={isLoading}
              value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Moussa Diallo" />
            {errors.full_name && <p className="text-xs text-red-500">{errors.full_name}</p>}
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" autoComplete="email" disabled={isLoading}
              value={email} onChange={(e) => setEmail(e.target.value)} placeholder="vous@example.com" />
            {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="password">Mot de passe</Label>
            <Input id="password" type="password" autoComplete="new-password" disabled={isLoading}
              value={password} onChange={(e) => setPassword(e.target.value)} placeholder="6 caractères minimum" />
            {errors.password && <p className="text-xs text-red-500">{errors.password}</p>}
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="confirm_password">Confirmer le mot de passe</Label>
            <Input id="confirm_password" type="password" autoComplete="new-password" disabled={isLoading}
              value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
            {errors.confirm_password && <p className="text-xs text-red-500">{errors.confirm_password}</p>}
          </div>

          {role === "owner" && (
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="property_count">Nombre de biens à gérer</Label>
              <select id="property_count" value={propertyRange}
                onChange={(e) => {
                  setPropertyRange(e.target.value)
                  const opt = PROPERTY_COUNT_OPTIONS.find((o) => o.value === e.target.value)
                  if (opt) setPropertyCount(opt.numericValue)
                }}
                disabled={isLoading}
                className="h-10 w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm outline-none focus-visible:border-ring">
                <option value="" disabled>Sélectionnez une tranche</option>
                {PROPERTY_COUNT_OPTIONS.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
              </select>
            </div>
          )}

          <Button type="submit" disabled={isLoading} className="mt-2 h-10 w-full bg-[#f97316] text-white hover:bg-[#ea6c0e]">
            {isLoading ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Création en cours...</>)
              : role === "owner" ? "Créer mon compte — 14 jours gratuits" : "Créer mon compte"}
          </Button>
          <p className="text-center text-xs text-gray-400">Sans engagement · Sans carte bancaire</p>
        </form>
      </CardContent>

      <CardFooter className="justify-center">
        <p className="text-sm text-muted-foreground">
          Vous avez déjà un compte ?{" "}
          <Link href="/login" className="font-medium text-[#f97316] underline-offset-4 hover:underline">Se connecter</Link>
        </p>
      </CardFooter>
    </Card>
  )
}
