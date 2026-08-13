"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2, CalendarPlus, Layers } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

/**
 * Les deux gestes de support sur une organisation : changer de plan, prolonger
 * l'échéance. Le route handler /api/admin/organisations/[id] revérifie tout ;
 * ici on ne fait qu'appeler.
 */

const PLANS = [
  { value: "trial", label: "Essai" },
  { value: "solo", label: "Solo — 10 000 FCFA / mois" },
  { value: "pro", label: "Pro — 20 000 FCFA / mois" },
  { value: "agence", label: "Agence — 45 000 FCFA / mois" },
]

const RACCOURCIS = [7, 15, 30, 90]

export function AdminOrgActions({
  orgId,
  planActuel,
}: {
  orgId: string
  planActuel: string
}) {
  const router = useRouter()
  const [plan, setPlan] = useState(planActuel)
  const [mois, setMois] = useState("0")
  const [jours, setJours] = useState("30")
  const [enCours, setEnCours] = useState<string | null>(null)

  async function agir(action: string, corps: Record<string, unknown>) {
    setEnCours(action)
    try {
      const res = await fetch(`/api/admin/organisations/${orgId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, ...corps }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        toast.error(data.error ?? "L'action a échoué.")
        return
      }
      toast.success(data.message ?? "C'est fait.")
      router.refresh()
    } catch {
      toast.error("Le serveur n'a pas répondu.")
    } finally {
      setEnCours(null)
    }
  }

  return (
    <Card>
      <CardContent className="space-y-6 p-5">
        <div>
          <p className="flex items-center gap-2 font-medium text-slate-800">
            <Layers className="h-4 w-4" />
            Plan
          </p>
          <p className="mt-1 text-sm text-slate-500">
            Une durée de 0 mois change le plan sans toucher à l&apos;échéance. Sinon
            l&apos;échéance repart de la plus tardive entre aujourd&apos;hui et
            l&apos;échéance en cours — le temps déjà payé n&apos;est jamais amputé.
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <select
              value={plan}
              onChange={(e) => setPlan(e.target.value)}
              className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-700"
            >
              {PLANS.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
            </select>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                min={0}
                max={36}
                value={mois}
                onChange={(e) => setMois(e.target.value)}
                className="w-20"
              />
              <span className="text-sm text-slate-500">mois</span>
            </div>
            <Button
              variant="outline"
              disabled={enCours !== null}
              onClick={() => agir("plan", { plan, mois: Number(mois) })}
            >
              {enCours === "plan" && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Appliquer le plan
            </Button>
          </div>
        </div>

        <div className="border-t border-slate-100 pt-5">
          <p className="flex items-center gap-2 font-medium text-slate-800">
            <CalendarPlus className="h-4 w-4" />
            Prolonger l&apos;échéance
          </p>
          <p className="mt-1 text-sm text-slate-500">
            Si l&apos;échéance est déjà passée, la prolongation repart d&apos;aujourd&apos;hui.
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            {RACCOURCIS.map((j) => (
              <Button
                key={j}
                variant="outline"
                size="sm"
                disabled={enCours !== null}
                onClick={() => agir("prolonger", { jours: j })}
              >
                +{j} j
              </Button>
            ))}
            <div className="flex items-center gap-2">
              <Input
                type="number"
                min={1}
                max={365}
                value={jours}
                onChange={(e) => setJours(e.target.value)}
                className="w-20"
              />
              <span className="text-sm text-slate-500">jours</span>
            </div>
            <Button
              variant="outline"
              disabled={enCours !== null}
              onClick={() => agir("prolonger", { jours: Number(jours) })}
            >
              {enCours === "prolonger" && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Prolonger
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
