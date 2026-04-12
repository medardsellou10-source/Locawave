import { redirect } from "next/navigation"
import { createServerClient } from "@/lib/supabase-server"
import { DashboardShell } from "@/components/app/DashboardShell"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createServerClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/login")
  }

  return <DashboardShell>{children}</DashboardShell>
}
