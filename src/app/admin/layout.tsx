import type { Metadata } from "next"
import { requireAdmin } from "@/lib/admin"
import { AdminShell } from "@/components/app/AdminShell"

/**
 * Deuxième verrou de l'espace admin. Le middleware filtre déjà /admin, mais un
 * layout serveur n'est pas contournable : c'est lui qui fait foi.
 * requireAdmin() renvoie un vrai 404 — l'espace ne doit pas se laisser deviner.
 */

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Console Locawave",
  robots: { index: false, follow: false, nocache: true },
}

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const admin = await requireAdmin()

  return (
    <AdminShell
      adminName={admin.fullName}
      adminEmail={admin.email}
      isSuper={admin.isSuper}
    >
      {children}
    </AdminShell>
  )
}
