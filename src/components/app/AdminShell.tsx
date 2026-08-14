"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import {
  Gauge,
  Radio,
  Users,
  Building2,
  Wallet,
  Megaphone,
  ShieldCheck,
  Database,
  ScrollText,
  SlidersHorizontal,
  ArrowLeft,
  Menu,
  Lock,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet"

/**
 * Console d'administration. Volontairement sombre et distincte du tableau de
 * bord propriétaire : on doit voir au premier coup d'œil qu'on est dans la
 * salle des machines, et pas dans l'application vendue aux clients.
 */

type NavItem = {
  href: string
  label: string
  icon: typeof Gauge
  /** Rubrique prévue, pas encore construite : affichée, mais inerte. */
  soon?: boolean
}

const NAV: { label: string; items: NavItem[] }[] = [
  {
    label: "Pilotage",
    items: [
      { href: "/admin", label: "Vue d'ensemble", icon: Gauge },
      { href: "/admin/direct", label: "En direct", icon: Radio },
    ],
  },
  {
    label: "Personnes",
    items: [
      { href: "/admin/comptes", label: "Comptes", icon: Users },
      { href: "/admin/organisations", label: "Organisations", icon: Building2 },
    ],
  },
  {
    label: "Activité",
    items: [
      { href: "/admin/finances", label: "Finances", icon: Wallet },
      { href: "/admin/moderation", label: "Annonces & modération", icon: Megaphone },
      { href: "/admin/confiance", label: "Confiance & litiges", icon: ShieldCheck },
    ],
  },
  {
    label: "Système",
    items: [
      { href: "/admin/systeme", label: "Base & sécurité", icon: Database },
      { href: "/admin/journal", label: "Journal", icon: ScrollText },
      { href: "/admin/reglages", label: "Réglages", icon: SlidersHorizontal },
    ],
  },
]

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname()

  return (
    <nav className="space-y-6">
      {NAV.map((section) => (
        <div key={section.label}>
          <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            {section.label}
          </p>
          <ul className="space-y-1">
            {section.items.map((item) => {
              const Icon = item.icon
              const active = pathname === item.href

              if (item.soon) {
                return (
                  <li key={item.href}>
                    <span
                      className="flex cursor-not-allowed items-center gap-3 rounded-lg px-3 py-2 text-sm text-slate-600"
                      title="Rubrique en cours de construction"
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      <span className="truncate">{item.label}</span>
                      <span className="ml-auto text-[10px] uppercase tracking-wide text-slate-600">
                        bientôt
                      </span>
                    </span>
                  </li>
                )
              }

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={onNavigate}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                      active
                        ? "bg-white/10 font-medium text-white"
                        : "text-slate-300 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    <span className="truncate">{item.label}</span>
                  </Link>
                </li>
              )
            })}
          </ul>
        </div>
      ))}
    </nav>
  )
}

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <div className="flex h-full flex-col">
      <div className="px-3 pb-6 pt-1">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10">
            <Lock className="h-4 w-4 text-white" />
          </span>
          <div>
            <p className="text-sm font-semibold text-white">Console Locawave</p>
            <p className="text-[11px] text-slate-400">Administration plateforme</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <NavLinks onNavigate={onNavigate} />
      </div>

      <div className="border-t border-white/10 pt-4">
        <Link
          href="/dashboard"
          className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-slate-300 transition-colors hover:bg-white/5 hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour à l&apos;application
        </Link>
      </div>
    </div>
  )
}

export function AdminShell({
  children,
  adminName,
  adminEmail,
  isSuper,
}: {
  children: React.ReactNode
  adminName: string
  adminEmail: string
  isSuper: boolean
}) {
  const [open, setOpen] = useState(false)

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Colonne fixe en desktop */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col bg-[#0f172a] p-4 lg:flex">
        <SidebarContent />
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-slate-200 bg-white px-4">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger
              render={<Button variant="ghost" size="icon" className="lg:hidden" />}
            >
              <Menu className="h-5 w-5" />
              <span className="sr-only">Menu</span>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 border-0 bg-[#0f172a] p-4">
              <SheetTitle className="sr-only">Navigation administration</SheetTitle>
              <SidebarContent onNavigate={() => setOpen(false)} />
            </SheetContent>
          </Sheet>

          <Badge className="bg-[#0f172a] text-white hover:bg-[#0f172a]">Admin</Badge>
          {isSuper && (
            <Badge variant="outline" className="border-amber-300 text-amber-700">
              Super-admin
            </Badge>
          )}

          <div className="ml-auto text-right leading-tight">
            <p className="text-sm font-medium text-slate-800">{adminName}</p>
            <p className="text-xs text-slate-500">{adminEmail}</p>
          </div>
        </header>

        <main className="p-4 sm:p-6">{children}</main>
      </div>
    </div>
  )
}
