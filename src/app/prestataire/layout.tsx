import { redirect } from "next/navigation"
import Link from "next/link"
import { Wrench } from "lucide-react"
import { createServerClient } from "@/lib/supabase-server"
import { LogoutButton } from "@/components/app/LogoutButton"
import { BackButton } from "@/components/app/BackButton"

export const dynamic = "force-dynamic"

export default async function PrestataireLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: profile } = await supabase
    .from("profiles").select("role, full_name").eq("id", user.id).single()
  if (profile && profile.role !== "provider") redirect("/dashboard")

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b bg-white">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/prestataire" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#f97316] rounded-lg flex items-center justify-center">
              <Wrench className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold text-[#1a2744]">Locawave Pro</span>
          </Link>
          <div className="flex items-center gap-3">
            <BackButton rootPath="/prestataire" />
            <span className="text-sm text-gray-500 hidden sm:inline">{profile?.full_name ?? "Prestataire"}</span>
            <LogoutButton />
          </div>
        </div>
      </header>
      <main className="max-w-2xl mx-auto px-4 py-6">{children}</main>
    </div>
  )
}
