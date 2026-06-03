import { Badge } from "@/components/ui/badge"
import { ShieldCheck } from "lucide-react"

/** Affiche le Trust Score d'un prestataire (0..100) avec un palier de couleur. */
export function TrustBadge({ score, jobs }: { score: number | null | undefined; jobs?: number | null }) {
  const s = Math.round(Number(score ?? 0))
  const cls =
    s >= 80 ? "bg-green-100 text-green-700"
    : s >= 50 ? "bg-amber-100 text-amber-700"
    : s > 0 ? "bg-orange-100 text-orange-700"
    : "bg-gray-100 text-gray-500"
  const label = s >= 80 ? "Excellent" : s >= 50 ? "Fiable" : s > 0 ? "Débutant" : "Nouveau"
  return (
    <Badge className={`gap-1 ${cls}`} title="Trust Score Locawave">
      <ShieldCheck className="w-3.5 h-3.5" /> {s}/100 · {label}
      {jobs != null && jobs > 0 && <span className="opacity-70">· {jobs} mission{jobs > 1 ? "s" : ""}</span>}
    </Badge>
  )
}
