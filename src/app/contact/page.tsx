import Link from "next/link"
import { Building2, Mail, MessageCircle, Clock } from "lucide-react"
import type { Metadata } from "next"
import { SUPPORT_WHATSAPP, SUPPORT_EMAIL } from "@/lib/contact"

export const metadata: Metadata = {
  title: "Contact",
  description: "Contactez l'équipe Locawave — support, questions commerciales, partenariats.",
}

export default function ContactPage() {
  const waLink = `https://wa.me/${SUPPORT_WHATSAPP}?text=${encodeURIComponent("Bonjour Locawave, j'ai une question concernant votre service.")}`

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b bg-white px-4 py-4">
        <div className="max-w-3xl mx-auto flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#f97316] rounded-lg flex items-center justify-center">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-[#1a2744]">Locawave</span>
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-[#1a2744] mb-3">Contactez-nous</h1>
          <p className="text-gray-500 max-w-md mx-auto">
            Une question, un problème ou une demande de démo ? Notre équipe vous répond rapidement.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {/* WhatsApp */}
          <a href={waLink} target="_blank" rel="noopener noreferrer"
            className="flex flex-col items-center text-center gap-3 p-6 rounded-2xl border-2 border-[#25D366]/30 bg-green-50 hover:border-[#25D366] hover:shadow-md transition-all group">
            <div className="w-12 h-12 rounded-xl bg-[#25D366] flex items-center justify-center group-hover:scale-110 transition-transform">
              <MessageCircle className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="font-semibold text-gray-800">WhatsApp</div>
              <div className="text-sm text-gray-500 mt-1">Réponse en moins d'1h</div>
              <div className="text-xs text-[#25D366] font-medium mt-2">Écrire un message →</div>
            </div>
          </a>

          {/* Email */}
          <a href={`mailto:${SUPPORT_EMAIL}`}
            className="flex flex-col items-center text-center gap-3 p-6 rounded-2xl border-2 border-[#f97316]/20 bg-orange-50 hover:border-[#f97316] hover:shadow-md transition-all group">
            <div className="w-12 h-12 rounded-xl bg-[#f97316] flex items-center justify-center group-hover:scale-110 transition-transform">
              <Mail className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="font-semibold text-gray-800">Email</div>
              <div className="text-sm text-gray-500 mt-1">{SUPPORT_EMAIL}</div>
              <div className="text-xs text-[#f97316] font-medium mt-2">Envoyer un email →</div>
            </div>
          </a>

          {/* Horaires */}
          <div className="flex flex-col items-center text-center gap-3 p-6 rounded-2xl border-2 border-gray-100 bg-gray-50">
            <div className="w-12 h-12 rounded-xl bg-[#1a2744] flex items-center justify-center">
              <Clock className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="font-semibold text-gray-800">Horaires</div>
              <div className="text-sm text-gray-500 mt-1">Lun – Sam</div>
              <div className="text-sm text-gray-500">8h – 20h (GMT)</div>
            </div>
          </div>
        </div>

        {/* CTA essai */}
        <div className="bg-gradient-to-br from-[#1a2744] to-[#1e3a5f] rounded-2xl p-8 text-center text-white">
          <h2 className="text-xl font-bold mb-2">Prêt à essayer Locawave ?</h2>
          <p className="text-gray-300 mb-4 text-sm">14 jours gratuits — Aucune carte bancaire requise</p>
          <Link href="/register"
            className="inline-flex items-center gap-2 bg-[#f97316] hover:bg-[#ea580c] text-white px-6 py-2.5 rounded-lg font-semibold text-sm transition-colors">
            Commencer gratuitement
          </Link>
        </div>

        <div className="mt-8 text-center">
          <Link href="/" className="text-sm text-[#f97316] hover:underline">← Retour à l'accueil</Link>
        </div>
      </main>
    </div>
  )
}
