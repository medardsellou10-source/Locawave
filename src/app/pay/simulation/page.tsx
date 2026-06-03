"use client"

export const dynamic = "force-dynamic"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, ShieldCheck, Smartphone } from "lucide-react"

/**
 * Page de paiement de SIMULATION (mode sans PSP réel).
 * Reproduit l'écran qu'afficherait le PSP : montant + confirmation.
 * « Confirmer » déclenche le webhook signé via /api/psp/simulate-pay.
 */
export default function SimulationPayPage() {
  const [ref, setRef] = useState("")
  const [amount, setAmount] = useState(0)
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle")
  const [msg, setMsg] = useState("")

  useEffect(() => {
    const p = new URLSearchParams(window.location.search)
    setRef(p.get("ref") ?? "")
    setAmount(Number(p.get("amount") ?? 0))
  }, [])

  async function confirm() {
    setState("loading")
    try {
      const res = await fetch("/api/psp/simulate-pay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ref, amount }),
      })
      const data = await res.json()
      if (res.ok && data.ok) {
        setState("done")
        setMsg(data.receipt ? `Quittance ${data.receipt}` : "Paiement confirmé")
      } else {
        setState("error")
        setMsg(data.error ?? "Échec du paiement")
      }
    } catch {
      setState("error")
      setMsg("Erreur réseau")
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <div className="flex items-center gap-2 text-[#f97316]">
            <Smartphone className="w-5 h-5" />
            <span className="text-xs font-semibold uppercase tracking-wide">
              Paiement mobile (simulation)
            </span>
          </div>
          <CardTitle className="text-[#1a2744]">Régler mon loyer</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg bg-gray-50 p-4 text-center">
            <p className="text-sm text-gray-500">Montant à payer</p>
            <p className="text-3xl font-bold text-[#1a2744]">
              {new Intl.NumberFormat("fr-FR").format(amount)} FCFA
            </p>
            <p className="mt-1 text-xs text-gray-400 break-all">Réf : {ref || "—"}</p>
          </div>

          {state === "done" ? (
            <div className="rounded-lg bg-green-50 p-3 text-center text-sm text-green-700">
              ✅ {msg}
            </div>
          ) : state === "error" ? (
            <div className="rounded-lg bg-red-50 p-3 text-center text-sm text-red-700">
              {msg}
            </div>
          ) : (
            <Button
              onClick={confirm}
              disabled={state === "loading" || !ref}
              className="w-full bg-[#f97316] hover:bg-[#ea580c] text-white"
            >
              {state === "loading" ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Traitement...
                </>
              ) : (
                <>Payer avec Wave / Orange Money</>
              )}
            </Button>
          )}

          <p className="flex items-center justify-center gap-1 text-xs text-gray-400">
            <ShieldCheck className="w-3.5 h-3.5" /> Paiement sécurisé — Locawave ne stocke
            aucune donnée bancaire
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
