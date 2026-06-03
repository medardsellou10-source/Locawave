"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Loader2, CreditCard } from "lucide-react"
import { toast } from "sonner"

export function PayNowButton({
  scheduleId,
  className,
}: {
  scheduleId: string
  className?: string
}) {
  const [loading, setLoading] = useState(false)

  async function pay() {
    setLoading(true)
    try {
      const res = await fetch("/api/psp/create-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rent_schedule_id: scheduleId }),
      })
      const data = await res.json()
      if (res.ok && data.payment_link) {
        window.location.href = data.payment_link
      } else {
        toast.error(data.error ?? "Paiement indisponible pour le moment")
        setLoading(false)
      }
    } catch {
      toast.error("Erreur réseau")
      setLoading(false)
    }
  }

  return (
    <Button
      onClick={pay}
      disabled={loading}
      className={className ?? "bg-[#f97316] hover:bg-[#ea580c] text-white"}
    >
      {loading ? (
        <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Redirection...</>
      ) : (
        <><CreditCard className="w-4 h-4 mr-2" /> Payer maintenant</>
      )}
    </Button>
  )
}
