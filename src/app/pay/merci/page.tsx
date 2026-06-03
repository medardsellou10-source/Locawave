import Link from "next/link"
import { CheckCircle2 } from "lucide-react"

export default function PaiementMerciPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4 text-center">
      <CheckCircle2 className="w-16 h-16 text-green-500 mb-4" />
      <h1 className="text-2xl font-bold text-[#1a2744] mb-2">Paiement reçu</h1>
      <p className="text-gray-500 max-w-sm">
        Merci, votre paiement de loyer a bien été pris en compte. Votre quittance
        vous sera transmise automatiquement.
      </p>
      <Link href="/" className="mt-6 text-sm text-[#f97316] hover:underline">
        Retour à l'accueil
      </Link>
    </div>
  )
}
