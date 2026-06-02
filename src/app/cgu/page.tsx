import Link from "next/link"
import { Building2 } from "lucide-react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Conditions Générales d'Utilisation",
  description:
    "Conditions Générales d'Utilisation de Locawave — logiciel de gestion locative au Sénégal. Abonnement, paiements Wave/Orange Money, obligations et résiliation.",
}

export default function CguPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header minimal */}
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

      <main className="max-w-3xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-[#1a2744] mb-2">
          Conditions Générales d'Utilisation
        </h1>
        <p className="text-gray-500 text-sm mb-10">
          Les présentes conditions régissent l'accès et l'utilisation du service Locawave.
          En créant un compte, vous les acceptez sans réserve.
        </p>

        <div className="space-y-10 text-sm text-gray-700 leading-relaxed">

          <section>
            <h2 className="text-lg font-bold text-[#1a2744] mb-3 pb-2 border-b">1. Objet</h2>
            <p>
              Locawave est un logiciel en ligne (SaaS) de gestion locative destiné aux
              propriétaires, gestionnaires et agences immobilières opérant au Sénégal. Il
              permet notamment la gestion des biens, des baux, des loyers, l'envoi de
              rappels WhatsApp et la génération de quittances.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[#1a2744] mb-3 pb-2 border-b">2. Compte utilisateur</h2>
            <ul className="list-disc list-inside space-y-1.5 text-gray-600">
              <li>La création d'un compte requiert un nom, une adresse email et un mot de passe.</li>
              <li>Vous êtes responsable de la confidentialité de vos identifiants et de toute activité réalisée depuis votre compte.</li>
              <li>Les informations fournies doivent être exactes et tenues à jour.</li>
              <li>Un compte est strictement personnel à l'organisation qui le détient.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[#1a2744] mb-3 pb-2 border-b">3. Abonnement et période d'essai</h2>
            <ul className="list-disc list-inside space-y-1.5 text-gray-600">
              <li>Locawave propose une période d'essai gratuite, sans engagement ni carte bancaire.</li>
              <li>À l'issue de l'essai, l'accès aux fonctionnalités est conditionné à un abonnement payant (formules Solo, Pro, Agence).</li>
              <li>Les tarifs sont indiqués en FCFA sur la page Tarifs et peuvent évoluer ; toute modification sera notifiée à l'avance.</li>
              <li>L'abonnement est dû par période et reconductible.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[#1a2744] mb-3 pb-2 border-b">4. Paiements</h2>
            <p className="mb-2">
              Les paiements liés à l'abonnement et, le cas échéant, à l'encaissement des
              loyers, s'effectuent via les moyens de paiement mobiles locaux (Wave, Orange
              Money) ou tout prestataire de services de paiement agréé.
            </p>
            <p className="text-gray-600">
              Locawave ne détient jamais les fonds des loyers : les flux financiers sont
              orchestrés via des prestataires de paiement agréés. Aucune donnée bancaire
              sensible n'est stockée par Locawave.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[#1a2744] mb-3 pb-2 border-b">5. Obligations de l'utilisateur</h2>
            <ul className="list-disc list-inside space-y-1.5 text-gray-600">
              <li>Utiliser le service conformément à la loi et aux présentes conditions.</li>
              <li>Ne pas tenter de compromettre la sécurité ou l'intégrité du service.</li>
              <li>Disposer du droit de traiter les données des locataires et tiers saisies dans l'application.</li>
              <li>Respecter les droits des personnes concernées (cf. notre Politique de confidentialité).</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[#1a2744] mb-3 pb-2 border-b">6. Disponibilité du service</h2>
            <p className="text-gray-600">
              Locawave vise un taux de disponibilité élevé mais ne peut garantir un service
              ininterrompu. Des interruptions peuvent survenir pour maintenance ou pour des
              causes indépendantes de sa volonté.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[#1a2744] mb-3 pb-2 border-b">7. Résiliation</h2>
            <ul className="list-disc list-inside space-y-1.5 text-gray-600">
              <li>Vous pouvez résilier votre abonnement à tout moment depuis votre espace ou en nous contactant.</li>
              <li>Locawave peut suspendre ou résilier un compte en cas de manquement grave aux présentes conditions.</li>
              <li>Après résiliation, vos données sont conservées puis supprimées conformément à la Politique de confidentialité.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[#1a2744] mb-3 pb-2 border-b">8. Limitation de responsabilité</h2>
            <p className="text-gray-600">
              Locawave est un outil d'aide à la gestion. Il ne constitue pas un conseil
              juridique, fiscal ou financier. L'utilisateur reste seul responsable de ses
              décisions de gestion et de leur conformité réglementaire.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[#1a2744] mb-3 pb-2 border-b">9. Droit applicable</h2>
            <p className="text-gray-600">
              Les présentes conditions sont régies par le droit sénégalais. Tout litige
              relève, à défaut de résolution amiable, des juridictions compétentes de Dakar.
            </p>
          </section>

          <section className="bg-gray-50 rounded-xl p-4 text-gray-500 text-xs">
            <p>
              Dernière mise à jour : juin 2026. Ces conditions peuvent être modifiées ; la
              version en vigueur est celle disponible sur cette page.
            </p>
          </section>
        </div>

        <div className="mt-12 flex flex-wrap gap-4">
          <Link href="/" className="text-sm text-[#f97316] hover:underline">← Retour à l'accueil</Link>
          <Link href="/mentions-legales" className="text-sm text-[#f97316] hover:underline">Mentions légales</Link>
          <Link href="/politique-confidentialite" className="text-sm text-[#f97316] hover:underline">Politique de confidentialité</Link>
        </div>
      </main>
    </div>
  )
}
