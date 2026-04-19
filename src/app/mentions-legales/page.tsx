import Link from "next/link"
import { Building2 } from "lucide-react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Mentions légales",
  description: "Mentions légales de Locawave — Conformité loi sénégalaise 2008-12 sur la protection des données personnelles.",
}

export default function MentionsLegalesPage() {
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
        <h1 className="text-3xl font-bold text-[#1a2744] mb-2">Mentions légales</h1>
        <p className="text-gray-500 text-sm mb-10">
          Conformément à la loi sénégalaise n° 2008-12 du 25 janvier 2008 sur la protection des données à caractère personnel.
        </p>

        <div className="space-y-10 text-sm text-gray-700 leading-relaxed">

          {/* Éditeur */}
          <section>
            <h2 className="text-lg font-bold text-[#1a2744] mb-3 pb-2 border-b">1. Éditeur du site</h2>
            <div className="space-y-1.5">
              <p><span className="font-medium">Raison sociale :</span> Locawave</p>
              <p><span className="font-medium">Activité :</span> Éditeur de logiciel SaaS — gestion locative</p>
              <p><span className="font-medium">Siège social :</span> Dakar, Sénégal</p>
              <p><span className="font-medium">Email :</span> support@locawave.sn</p>
              <p><span className="font-medium">Site :</span> https://locawave.sn</p>
            </div>
          </section>

          {/* Hébergement */}
          <section>
            <h2 className="text-lg font-bold text-[#1a2744] mb-3 pb-2 border-b">2. Hébergement</h2>
            <div className="space-y-1.5">
              <p><span className="font-medium">Hébergeur frontend :</span> Vercel Inc., 340 Pine Street, Suite 900, San Francisco, CA 94104, USA</p>
              <p><span className="font-medium">Hébergeur base de données :</span> Supabase Inc. — serveurs situés dans l'Union Européenne (Frankfurt, Allemagne)</p>
              <p><span className="font-medium">Certification sécurité :</span> Données chiffrées en transit (TLS 1.3) et au repos (AES-256)</p>
            </div>
          </section>

          {/* Données personnelles */}
          <section>
            <h2 className="text-lg font-bold text-[#1a2744] mb-3 pb-2 border-b">3. Protection des données personnelles</h2>
            <p className="mb-3">
              Locawave respecte la loi sénégalaise n° 2008-12 du 25 janvier 2008 portant sur la protection des données à caractère personnel, ainsi que le Règlement Général sur la Protection des Données (RGPD) de l'Union Européenne.
            </p>
            <h3 className="font-semibold text-[#1a2744] mt-4 mb-2">Données collectées</h3>
            <ul className="list-disc list-inside space-y-1 text-gray-600">
              <li>Informations de compte : nom, adresse email, mot de passe (haché)</li>
              <li>Données de gestion locative : informations biens, locataires, baux, paiements</li>
              <li>Données de connexion : adresse IP, navigateur, horodatage</li>
            </ul>
            <h3 className="font-semibold text-[#1a2744] mt-4 mb-2">Finalité du traitement</h3>
            <ul className="list-disc list-inside space-y-1 text-gray-600">
              <li>Fourniture du service de gestion locative</li>
              <li>Envoi de notifications et rappels WhatsApp</li>
              <li>Génération de documents (quittances, rapports)</li>
              <li>Amélioration du service et support client</li>
            </ul>
            <h3 className="font-semibold text-[#1a2744] mt-4 mb-2">Durée de conservation</h3>
            <p className="text-gray-600">
              Les données sont conservées pendant la durée d'abonnement actif + 3 ans après résiliation, conformément aux obligations légales comptables sénégalaises.
            </p>
          </section>

          {/* Droits utilisateurs */}
          <section>
            <h2 className="text-lg font-bold text-[#1a2744] mb-3 pb-2 border-b">4. Vos droits</h2>
            <p className="mb-3">Conformément à la loi 2008-12, vous disposez des droits suivants :</p>
            <ul className="list-disc list-inside space-y-1.5 text-gray-600">
              <li><span className="font-medium text-gray-700">Droit d'accès</span> — consulter les données vous concernant</li>
              <li><span className="font-medium text-gray-700">Droit de rectification</span> — corriger les données inexactes</li>
              <li><span className="font-medium text-gray-700">Droit à l'effacement</span> — demander la suppression de vos données</li>
              <li><span className="font-medium text-gray-700">Droit à la portabilité</span> — recevoir vos données dans un format structuré</li>
              <li><span className="font-medium text-gray-700">Droit d'opposition</span> — vous opposer au traitement de vos données</li>
            </ul>
            <p className="mt-3">
              Pour exercer ces droits, contactez-nous à{" "}
              <a href="mailto:support@locawave.sn" className="text-[#f97316] hover:underline">support@locawave.sn</a>.
              Nous répondons dans un délai de 30 jours ouvrables.
            </p>
          </section>

          {/* Cookies */}
          <section>
            <h2 className="text-lg font-bold text-[#1a2744] mb-3 pb-2 border-b">5. Cookies</h2>
            <p className="mb-2">Locawave utilise uniquement des cookies strictement nécessaires au fonctionnement du service :</p>
            <ul className="list-disc list-inside space-y-1 text-gray-600">
              <li>Cookie de session d'authentification (Supabase Auth)</li>
              <li>Cookie de préférences interface</li>
            </ul>
            <p className="mt-2 text-gray-600">
              Aucun cookie publicitaire ou de tracking tiers n'est utilisé.
            </p>
          </section>

          {/* Responsabilité */}
          <section>
            <h2 className="text-lg font-bold text-[#1a2744] mb-3 pb-2 border-b">6. Limitation de responsabilité</h2>
            <p className="text-gray-600">
              Locawave s'engage à maintenir la disponibilité du service avec un objectif de 99,5% de temps de disponibilité mensuel. En cas d'interruption de service, Locawave ne pourra être tenu responsable des préjudices directs ou indirects subis par les utilisateurs.
            </p>
          </section>

          {/* Contact DCP */}
          <section>
            <h2 className="text-lg font-bold text-[#1a2744] mb-3 pb-2 border-b">7. Autorité de contrôle</h2>
            <p className="text-gray-600">
              Le traitement des données de Locawave est déclaré auprès de la{" "}
              <span className="font-medium text-gray-700">Commission de Protection des Données Personnelles (CDP) du Sénégal</span>,
              conformément à l'article 19 de la loi 2008-12.
            </p>
            <p className="mt-2 text-gray-600">
              CDP Sénégal — Immeuble Serigne Abdoul Aziz Sy Al Amine, Rue Carnot × Avenue Georges Pompidou, Dakar.
            </p>
          </section>

          {/* Mise à jour */}
          <section className="bg-gray-50 rounded-xl p-4 text-gray-500 text-xs">
            <p>Dernière mise à jour : Avril 2026. Ces mentions légales peuvent être modifiées à tout moment. La version en vigueur est celle disponible sur cette page.</p>
          </section>
        </div>

        <div className="mt-12 flex gap-4">
          <Link href="/" className="text-sm text-[#f97316] hover:underline">← Retour à l'accueil</Link>
          <Link href="/register" className="text-sm text-[#f97316] hover:underline">S'inscrire gratuitement →</Link>
        </div>
      </main>
    </div>
  )
}
