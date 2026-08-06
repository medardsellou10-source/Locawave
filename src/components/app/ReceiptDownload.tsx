"use client"

import { useState } from "react"
import { Download, Loader2 } from "lucide-react"
import { toast } from "sonner"

/**
 * Télécharge la quittance en PDF.
 *
 * L'écran affichait auparavant « Disponible » sans rien à télécharger : le lien
 * était conditionné à `receipts.pdf_url`, qui n'a jamais été renseigné faute de
 * générateur. Le PDF est maintenant produit à la demande côté serveur, archivé,
 * puis servi par une URL signée à durée limitée.
 */
export function ReceiptDownload({ receiptId }: { receiptId: string }) {
  const [busy, setBusy] = useState(false)

  async function telecharger() {
    setBusy(true)
    try {
      const res = await fetch("/api/receipts/pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ receipt_id: receiptId }),
      })
      const data = await res.json()
      if (!res.ok || !data.url) {
        toast.error(data.error ?? "Quittance indisponible")
        return
      }
      window.open(data.url, "_blank", "noopener,noreferrer")
    } catch {
      toast.error("Réseau indisponible")
    } finally {
      setBusy(false)
    }
  }

  return (
    <button
      onClick={telecharger}
      disabled={busy}
      className="inline-flex items-center gap-1 text-[#f97316] hover:underline disabled:opacity-50"
    >
      {busy
        ? <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Préparation…</>
        : <><Download className="h-3.5 w-3.5" /> Télécharger</>}
    </button>
  )
}
