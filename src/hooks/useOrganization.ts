"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase"
import type { Database } from "@/types/database"

type Organization = Database["public"]["Tables"]["organizations"]["Row"]

export function useOrganization() {
  const [org, setOrg] = useState<Organization | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function fetchOrg() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        setLoading(false)
        return
      }

      const { data: user } = await supabase
        .from("users")
        .select("org_id")
        .eq("id", session.user.id)
        .single()

      if (user) {
        const { data: organization } = await supabase
          .from("organizations")
          .select("*")
          .eq("id", user.org_id)
          .single()

        setOrg(organization)
      }
      setLoading(false)
    }

    fetchOrg()
  }, [])

  return { org, loading }
}
