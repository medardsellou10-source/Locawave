import type { LucideIcon } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

type Tone = "green" | "orange" | "red" | "blue" | "indigo" | "navy"

const TONES: Record<Tone, { text: string; soft: string; bar: string }> = {
  green: { text: "text-green-600", soft: "bg-green-50 text-green-600", bar: "bg-green-500" },
  orange: { text: "text-orange-600", soft: "bg-orange-50 text-orange-600", bar: "bg-[#f97316]" },
  red: { text: "text-red-600", soft: "bg-red-50 text-red-600", bar: "bg-red-500" },
  blue: { text: "text-blue-600", soft: "bg-blue-50 text-blue-600", bar: "bg-blue-500" },
  indigo: { text: "text-indigo-600", soft: "bg-indigo-50 text-indigo-600", bar: "bg-indigo-500" },
  navy: { text: "text-[#1a2744]", soft: "bg-slate-100 text-[#1a2744]", bar: "bg-[#1a2744]" },
}

/** Carte KPI premium réutilisable (valeur + icône pastille + progression optionnelle). */
export function StatCard({
  label, value, icon: Icon, tone = "navy", progress, hint,
}: {
  label: string
  value: string
  icon: LucideIcon
  tone?: Tone
  progress?: number
  hint?: string
}) {
  const t = TONES[tone]
  return (
    <Card className="border-slate-200/70 shadow-sm transition-shadow hover:shadow-md">
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-gray-500">{label}</p>
          <span className={`flex h-9 w-9 items-center justify-center rounded-xl ${t.soft}`}>
            <Icon className="h-4.5 w-4.5" />
          </span>
        </div>
        <p className={`mt-3 text-2xl font-bold tracking-tight ${t.text}`}>{value}</p>
        {typeof progress === "number" && (
          <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-gray-100">
            <div className={`h-full rounded-full ${t.bar} transition-all`} style={{ width: `${Math.max(0, Math.min(100, progress))}%` }} />
          </div>
        )}
        {hint && <p className="mt-2 text-xs text-gray-400">{hint}</p>}
      </CardContent>
    </Card>
  )
}
