import type { LucideIcon } from "lucide-react"

/** État vide premium : pastille + titre + description + action optionnelle. */
export function EmptyState({
  icon: Icon, title, description, children,
}: {
  icon: LucideIcon
  title: string
  description?: string
  children?: React.ReactNode
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white/50 px-6 py-14 text-center">
      <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-50 text-[#f97316]">
        <Icon className="h-7 w-7" />
      </span>
      <h3 className="text-base font-semibold text-[#1a2744]">{title}</h3>
      {description && <p className="mt-1 max-w-sm text-sm text-gray-500">{description}</p>}
      {children && <div className="mt-4">{children}</div>}
    </div>
  )
}
