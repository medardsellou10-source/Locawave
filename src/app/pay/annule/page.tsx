import Link from "next/link"
import { XCircle } from "lucide-react"

export default function PaiementAnnulePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4 text-center">
      <XCircle className="w-16 h-16 text-gray-400 mb-4" />
      <h1 className="text-2xl font-bold text-[#1a2744] mb-2">Paiement annulé</h1>
      <p className="text-gray-500 max-w-sm">
        Le paiement n'a pas été finalisé. Vous pouvez réessayer à partir du lien
        reçu par WhatsApp.
      </p>
      <Link href="/" className="mt-6 text-sm text-[#f97316] hover:underline">
        Retour à l'accueil
      </Link>
    </div>
  )
}
