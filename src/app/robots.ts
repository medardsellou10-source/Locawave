import type { MetadataRoute } from "next"

/**
 * Directives d'exploration.
 *
 * Le projet n'avait ni robots.ts ni sitemap.ts : les moteurs exploraient au
 * hasard, y compris les espaces privés, et n'avaient aucune carte du site.
 *
 * On interdit explicitement tout ce qui est derrière authentification. Ces
 * pages redirigent déjà vers /login, mais les laisser explorables gaspille le
 * budget d'exploration et fait remonter des redirections dans l'index.
 */
export default function robots(): MetadataRoute.Robots {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "https://locawave.vercel.app"

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",           // routes techniques
          "/dashboard/",     // espace propriétaire
          "/locataire",      // espace locataire
          "/prestataire/",   // espace prestataire (l'annuaire public reste /prestataires/)
          "/pay/",           // pages de retour de paiement, sans valeur pour l'index
          "/auth/",
          "/reset-password",
        ],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
    host: base,
  }
}
