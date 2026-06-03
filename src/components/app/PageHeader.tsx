import type { LucideIcon } from "lucide-react"

/** En-tête de page cohérent : icône + titre + sous-titre + actions à droite. */
export function PageHeader({
  icon: Icon, title, subtitle, actions,
}: {
  icon?: LucideIcon
  title: string
  subtitle?: string
  actions?: React.ReactNode
}) {
  return (
    <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-3">
        {Icon && (
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-[#f97316]">
            <Icon className="h-5 w-5" />
          </span>
        )}
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#1a2744]">{title}</h1>
          {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
        </div>
      </div>
      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </div>
  )
}
