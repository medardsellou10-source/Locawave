"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase"
import type { Database } from "@/types/database"
import type { User as AuthUser } from "@supabase/supabase-js"

type AppUser = Database["public"]["Tables"]["users"]["Row"]

export function useUser() {
  const [authUser, setAuthUser] = useState<AuthUser | null>(null)
  const [appUser, setAppUser] = useState<AppUser | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function fetchUser() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        setLoading(false)
        return
      }

      setAuthUser(session.user)

      const { data } = await supabase
        .from("users")
        .select("*")
        .eq("id", session.user.id)
        .single()

      setAppUser(data)
      setLoading(false)
    }

    fetchUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setAuthUser(session?.user ?? null)
      if (!session) {
        setAppUser(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  return { authUser, appUser, loading }
}
