"use client"

import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { LogOut } from "lucide-react"

export function LogoutButton() {
  const router = useRouter()
  const supabase = createClient()

  async function logout() {
    await supabase.auth.signOut()
    router.push("/login")
    router.refresh()
  }

  return (
    <Button variant="outline" size="sm" onClick={logout}>
      <LogOut className="w-4 h-4 sm:mr-1" />
      <span className="hidden sm:inline">Déconnexion</span>
    </Button>
  )
}
