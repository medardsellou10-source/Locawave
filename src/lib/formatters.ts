/**
 * Formate un montant en FCFA avec séparateur de milliers français
 * Exemple : 150000 → "150 000 FCFA"
 */
export function formatFCFA(amount: number): string {
  return new Intl.NumberFormat("fr-FR").format(amount) + " FCFA"
}

/**
 * Formate une date en format français
 * Exemple : "2026-04-11" → "11 avril 2026"
 */
export function formatDateFR(date: string | Date): string {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(date))
}

/**
 * Formate un numéro WhatsApp sénégalais
 * Exemple : "771234567" → "+221771234567"
 */
export function formatWhatsApp(phone: string): string {
  const cleaned = phone.replace(/\D/g, "")
  if (cleaned.startsWith("221")) return `+${cleaned}`
  if (cleaned.startsWith("+221")) return cleaned
  return `+221${cleaned}`
}

/**
 * Génère un lien wa.me pour ouvrir WhatsApp
 */
export function whatsappLink(phone: string, message?: string): string {
  const number = formatWhatsApp(phone).replace("+", "")
  const base = `https://wa.me/${number}`
  return message ? `${base}?text=${encodeURIComponent(message)}` : base
}

/**
 * Génère un numéro de quittance séquentiel
 * Format : LW-2026-0001
 */
export function generateReceiptNumber(sequence: number): string {
  const year = new Date().getFullYear()
  return `LW-${year}-${String(sequence).padStart(4, "0")}`
}
