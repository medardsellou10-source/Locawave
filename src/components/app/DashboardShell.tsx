"use client"

import { usePathname, useRouter } from "next/navigation"
import Link from "next/link"
import { useEffect, useState } from "react"
import {
  LayoutDashboard,
  Building2,
  Users,
  FileText,
  CreditCard,
  BarChart3,
  Wallet,
  ShieldCheck,
  AlertTriangle,
  Settings,
  LogOut,
  Menu,
} from "lucide-react"

import { useUser } from "@/hooks/useUser"
import { useOrganization } from "@/hooks/useOrganization"
import { createClient } from "@/lib/supabase"

import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet"

const NAV_ITEMS = [
  { href: "/dashboard", label: "Tableau de bord", icon: LayoutDashboard },
  { href: "/dashboard/properties", label: "Biens", icon: Building2 },
  { href: "/dashboard/tenants", label: "Locataires", icon: Users },
  { href: "/dashboard/leases", label: "Baux", icon: FileText },
  { href: "/dashboard/payments", label: "Paiements", icon: CreditCard },
  { href: "/dashboard/finances", label: "Finances", icon: Wallet },
  { href: "/dashboard/incidents", label: "Incidents", icon: AlertTriangle },
  { href: "/dashboard/reports", label: "Rapports", icon: BarChart3 },
  { href: "/dashboard/verification", label: "Vérification", icon: ShieldCheck },
  { href: "/dashboard/settings", label: "Paramètres", icon: Settings },
] as const

const PAGE_TITLES: Record<string, string> = {
  "/dashboard": "Tableau de bord",
  "/dashboard/properties": "Biens",
  "/dashboard/tenants": "Locataires",
  "/dashboard/leases": "Baux",
  "/dashboard/payments": "Paiements",
  "/dashboard/finances": "Finances",
  "/dashboard/incidents": "Incidents",
  "/dashboard/reports": "Rapports",
  "/dashboard/verification": "Vérification",
  "/dashboard/admin/kyc": "Validation KYC",
  "/dashboard/settings": "Paramètres",
  "/dashboard/onboarding": "Configuration",
  "/dashboard/billing": "Facturation",
  "/dashboard/referral": "Parrainage",
}


function getPlanBadge(plan: string, expiresAt: string | null) {
  const labels: Record<string, string> = {
    solo: "Solo",
    pro: "Pro",
    agence: "Agence",
    trial: "Essai",
  }

  let label = labels[plan] || plan
  let colorClasses = ""

  switch (plan) {
    case "trial": {
      colorClasses = "bg-orange-500/20 text-orange-300 border-orange-500/30"
      if (expiresAt) {
        const daysLeft = Math.ceil(
          (new Date(expiresAt).getTime() - Date.now()) / 86400000
        )
        label = `Essai J-${Math.max(daysLeft, 0)}`
      }
      break
    }
    case "solo":
      colorClasses = "bg-blue-500/20 text-blue-300 border-blue-500/30"
      break
    case "pro":
      colorClasses = "bg-green-500/20 text-green-300 border-green-500/30"
      break
    case "agence":
      colorClasses = "bg-purple-500/20 text-purple-300 border-purple-500/30"
      break
    default:
      colorClasses = "bg-white/10 text-white/70 border-white/20"
  }

  return { label, colorClasses }
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

function SidebarContent({ pathname, onNavigate }: { pathname: string; onNavigate?: () => void }) {
  const { appUser, loading: userLoading } = useUser()
  const { org, loading: orgLoading } = useOrganization()
  const router = useRouter()
  const supabase = createClient()
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return
      supabase.from("profiles").select("role").eq("id", user.id).single()
        .then(({ data }) => setIsAdmin(data?.role === "admin"))
    })
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/login")
  }

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard"
    return pathname.startsWith(href)
  }

  return (
    <div className="flex h-full flex-col" style={{ backgroundColor: "#1a2744" }}>
      {/* Logo */}
      <div className="flex h-16 items-center px-6">
        <span className="text-xl font-bold">
          <span className="text-white">Loca</span>
          <span style={{ color: "#f97316" }}>wave</span>
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {NAV_ITEMS.map((item) => {
          const active = isActive(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                active
                  ? "border-l-3 bg-white/10 text-orange-400"
                  : "text-white/70 hover:bg-white/5 hover:text-white/90"
              }`}
              style={active ? { borderLeftColor: "#f97316" } : undefined}
            >
              <item.icon className="h-5 w-5 shrink-0" />
              {item.label}
            </Link>
          )
        })}
        {isAdmin && (
          <Link
            href="/dashboard/admin/kyc"
            onClick={onNavigate}
            className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
              pathname.startsWith("/dashboard/admin")
                ? "border-l-3 bg-white/10 text-orange-400"
                : "text-white/70 hover:bg-white/5 hover:text-white/90"
            }`}
            style={pathname.startsWith("/dashboard/admin") ? { borderLeftColor: "#f97316" } : undefined}
          >
            <ShieldCheck className="h-5 w-5 shrink-0" />
            Validation KYC
          </Link>
        )}
      </nav>

      <Separator className="bg-white/10" />

      {/* Plan badge */}
      <div className="px-4 py-3">
        {orgLoading ? (
          <Skeleton className="h-5 w-20 bg-white/10" />
        ) : org ? (
          (() => {
            const { label, colorClasses } = getPlanBadge(org.plan, org.plan_expires_at)
            return (
              <Link href="/dashboard/billing">
                <Badge
                  variant="outline"
                  className={`cursor-pointer text-xs ${colorClasses}`}
                >
                  {label}
                </Badge>
              </Link>
            )
          })()
        ) : null}
      </div>

      {/* User section */}
      <div className="border-t border-white/10 p-4">
        {userLoading ? (
          <div className="flex items-center gap-3">
            <Skeleton className="h-8 w-8 rounded-full bg-white/10" />
            <Skeleton className="h-4 w-24 bg-white/10" />
          </div>
        ) : appUser ? (
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-white/10 text-xs text-white">
                {getInitials(appUser.full_name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="truncate text-sm font-medium text-white">
                {appUser.full_name}
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLogout}
              className="h-8 w-8 shrink-0 text-white/70 hover:bg-white/10 hover:text-white"
              title="Se deconnecter"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        ) : null}
      </div>
    </div>
  )
}

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [sheetOpen, setSheetOpen] = useState(false)

  const pageTitle =
    PAGE_TITLES[pathname] ||
    Object.entries(PAGE_TITLES).find(([key]) => pathname.startsWith(key))?.[1] ||
    "Dashboard"

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar desktop */}
      <aside className="hidden lg:flex lg:w-[280px] lg:shrink-0">
        <div className="w-full">
          <SidebarContent pathname={pathname} />
        </div>
      </aside>

      {/* Main area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-gray-200 bg-white px-4 lg:px-6">
          <div className="flex items-center gap-3">
            {/* Mobile hamburger */}
            <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
              <SheetTrigger
                render={
                  <Button
                    variant="ghost"
                    size="icon"
                    className="lg:hidden"
                  />
                }
              >
                <Menu className="h-5 w-5" />
                <span className="sr-only">Menu</span>
              </SheetTrigger>
              <SheetContent side="left" className="w-[280px] p-0">
                <SheetTitle className="sr-only">Menu de navigation</SheetTitle>
                <SidebarContent
                  pathname={pathname}
                  onNavigate={() => setSheetOpen(false)}
                />
              </SheetContent>
            </Sheet>

            <h1 className="text-lg font-semibold text-gray-900">{pageTitle}</h1>
          </div>

        </header>

        {/* Content area */}
        <main
          className="flex-1 overflow-y-auto p-6"
          style={{ backgroundColor: "#f8fafc" }}
        >
          {children}
        </main>
      </div>
    </div>
  )
}
