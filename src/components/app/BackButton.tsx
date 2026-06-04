"use client"

import { usePathname, useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"

/**
 * Bouton « Retour » réutilisable (revient à la page précédente).
 * Masqué quand on est sur la racine `rootPath` (pour éviter un retour vers le login).
 */
export function BackButton({ rootPath, className = "" }: { rootPath?: string; className?: string }) {
  const router = useRouter()
  const pathname = usePathname()
  if (rootPath && pathname === rootPath) return null
  return (
    <button
      onClick={() => router.back()}
      className={`inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50 hover:text-[#1a2744] ${className}`}
      aria-label="Retour"
    >
      <ArrowLeft className="h-4 w-4" /> Retour
    </button>
  )
}
