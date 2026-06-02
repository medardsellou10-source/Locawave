import Link from "next/link"
import { Building2 } from "lucide-react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Politique de confidentialité",
  description:
    "Politique de confidentialité de Locawave — traitement et protection des données personnelles, conformité loi sénégalaise 2008-12 et RGPD.",
}

export default function PolitiqueConfidentialitePage() {
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
        <h1 className="text-3xl font-bold text-[#1a2744] mb-2">Politique de confidentialité</h1>
        <p className="text-gray-500 text-sm mb-10">
          Conformément à la loi sénégalaise n° 2008-12 du 25 janvier 2008 sur la protection
          des données à caractère personnel et au Règlement Général sur la Protection des
          Données (RGPD).
        </p>

        <div className="space-y-10 text-sm text-gray-700 leading-relaxed">

          <section>
            <h2 className="text-lg font-bold text-[#1a2744] mb-3 pb-2 border-b">1. Responsable du traitement</h2>
            <p>
              Le responsable du traitement des données est Locawave (Dakar, Sénégal).
              Pour toute question relative à vos données :{" "}
              <a href="mailto:support@locawave.sn" className="text-[#f97316] hover:underline">support@locawave.sn</a>.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[#1a2744] mb-3 pb-2 border-b">2. Données collectées</h2>
            <ul className="list-disc list-inside space-y-1 text-gray-600">
              <li>Informations de compte : nom, adresse email, mot de passe (haché), téléphone.</li>
              <li>Données de gestion locative : biens, locataires, baux, paiements, charges.</li>
              <li>Documents générés : quittances, rapports, états des lieux.</li>
              <li>Données de connexion : adresse IP, navigateur, horodatage.</li>
              <li>Données de géolocalisation des biens (lorsqu'elles sont renseignées), pour la recherche cartographique.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[#1a2744] mb-3 pb-2 border-b">3. Finalités du traitement</h2>
            <ul className="list-disc list-inside space-y-1 text-gray-600">
              <li>Fourniture et exploitation du service de gestion locative.</li>
              <li>Envoi de notifications et de rappels (WhatsApp, email).</li>
              <li>Génération de documents (quittances, relevés, rapports).</li>
              <li>Sécurité, prévention de la fraude et support client.</li>
              <li>Amélioration du service.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[#1a2744] mb-3 pb-2 border-b">4. Base légale</h2>
            <p className="text-gray-600">
              Les traitements reposent sur l'exécution du contrat (fourniture du service),
              le respect d'obligations légales (comptables, fiscales) et l'intérêt légitime
              de Locawave (sécurité, amélioration du service).
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[#1a2744] mb-3 pb-2 border-b">5. Partage des données</h2>
            <p className="mb-2">
              Vos données ne sont jamais vendues. Elles peuvent être traitées par des
              sous-traitants techniques strictement nécessaires au service :
            </p>
            <ul className="list-disc list-inside space-y-1 text-gray-600">
              <li>Supabase (hébergement base de données, Union Européenne).</li>
              <li>Vercel (hébergement de l'application).</li>
              <li>Twilio (envoi des messages WhatsApp).</li>
              <li>Prestataires de paiement agréés (Wave / Orange Money via PSP).</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[#1a2744] mb-3 pb-2 border-b">6. Durée de conservation</h2>
            <p className="text-gray-600">
              Les données sont conservées pendant la durée d'abonnement actif, puis pendant
              3 ans après la résiliation, conformément aux obligations légales comptables
              sénégalaises, avant suppression ou anonymisation.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[#1a2744] mb-3 pb-2 border-b">7. Vos droits</h2>
            <p className="mb-3">Conformément à la loi 2008-12, vous disposez des droits suivants :</p>
            <ul className="list-disc list-inside space-y-1.5 text-gray-600">
              <li><span className="font-medium text-gray-700">Droit d'accès</span> — consulter les données vous concernant.</li>
              <li><span className="font-medium text-gray-700">Droit de rectification</span> — corriger les données inexactes.</li>
              <li><span className="font-medium text-gray-700">Droit à l'effacement</span> — demander la suppression de vos données.</li>
              <li><span className="font-medium text-gray-700">Droit à la portabilité</span> — recevoir vos données dans un format structuré.</li>
              <li><span className="font-medium text-gray-700">Droit d'opposition</span> — vous opposer au traitement de vos données.</li>
            </ul>
            <p className="mt-3">
              Pour exercer ces droits, écrivez à{" "}
              <a href="mailto:support@locawave.sn" className="text-[#f97316] hover:underline">support@locawave.sn</a>.
              Nous répondons dans un délai de 30 jours.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[#1a2744] mb-3 pb-2 border-b">8. Cookies</h2>
            <p className="mb-2">Locawave utilise uniquement des cookies strictement nécessaires :</p>
            <ul className="list-disc list-inside space-y-1 text-gray-600">
              <li>Cookie de session d'authentification (Supabase Auth).</li>
              <li>Cookie de préférences d'interface.</li>
            </ul>
            <p className="mt-2 text-gray-600">Aucun cookie publicitaire ou de tracking tiers n'est utilisé.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[#1a2744] mb-3 pb-2 border-b">9. Sécurité</h2>
            <p className="text-gray-600">
              Les données sont chiffrées en transit (TLS) et au repos. L'accès aux données
              est cloisonné par organisation (Row Level Security) afin d'éviter toute fuite
              entre comptes clients.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[#1a2744] mb-3 pb-2 border-b">10. Autorité de contrôle</h2>
            <p className="text-gray-600">
              Le traitement est déclaré auprès de la{" "}
              <span className="font-medium text-gray-700">Commission de Protection des Données Personnelles (CDP) du Sénégal</span>,
              conformément à l'article 19 de la loi 2008-12. CDP Sénégal — Immeuble Serigne
              Abdoul Aziz Sy Al Amine, Rue Carnot × Avenue Georges Pompidou, Dakar.
            </p>
          </section>

          <section className="bg-gray-50 rounded-xl p-4 text-gray-500 text-xs">
            <p>
              Dernière mise à jour : juin 2026. Cette politique peut être modifiée ; la
              version en vigueur est celle disponible sur cette page.
            </p>
          </section>
        </div>

        <div className="mt-12 flex flex-wrap gap-4">
          <Link href="/" className="text-sm text-[#f97316] hover:underline">← Retour à l'accueil</Link>
          <Link href="/mentions-legales" className="text-sm text-[#f97316] hover:underline">Mentions légales</Link>
          <Link href="/cgu" className="text-sm text-[#f97316] hover:underline">CGU</Link>
        </div>
      </main>
    </div>
  )
}
