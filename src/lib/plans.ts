// Source unique de la tarification Locawave.
// Modèle : abonnement par NOMBRE DE BIENS GÉRÉS (plus basé sur le loyer)
// + commission sur les transactions de services/chantiers passées dans l'app (séquestre libéré).

export type PlanId = "solo" | "pro" | "agence"

/** Commission prélevée sur les transactions services/chantiers à la libération du séquestre. */
export const COMMISSION_RATE = 0.05 // 5%
export const COMMISSION_LABEL = "5% sur les transactions services & chantiers (séquestre)"

export type Plan = {
  id: PlanId
  name: string
  priceFcfa: number
  price: string // formaté pour affichage
  description: string
  maxProperties: number | null // null = illimité
  features: string[]
}

export const PLANS: Plan[] = [
  {
    id: "solo",
    name: "Solo",
    priceFcfa: 10000,
    price: "10 000",
    description: "Jusqu'à 5 biens gérés",
    maxProperties: 5,
    features: [
      "Jusqu'à 5 biens",
      "Espace locataire & paiement en ligne",
      "Rappels WhatsApp & quittances PDF",
      "Incidents en temps réel",
      "1 utilisateur",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    priceFcfa: 20000,
    price: "20 000",
    description: "Jusqu'à 25 biens gérés",
    maxProperties: 25,
    features: [
      "Jusqu'à 25 biens",
      "Suivi de chantier & prestataires vérifiés",
      "Séquestre & médiation des litiges",
      "Finances & rapports mensuels",
      "3 utilisateurs",
      "Support prioritaire",
    ],
  },
  {
    id: "agence",
    name: "Agence",
    priceFcfa: 45000,
    price: "45 000",
    description: "Biens illimités",
    maxProperties: null,
    features: [
      "Biens illimités",
      "Tout dans Pro",
      "Marketplace & annonces vérifiées",
      "Utilisateurs illimités",
      "API & intégrations",
      "Support dédié",
    ],
  },
]

export function getPlan(id: string): Plan | undefined {
  return PLANS.find((p) => p.id === id)
}
