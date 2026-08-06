import type { MetadataRoute } from "next"
import { createClient } from "@supabase/supabase-js"

/**
 * Plan du site.
 *
 * Deux parties : les pages fixes, et les pages issues de la base — annonces
 * publiées et fiches prestataires vérifiées. Ce sont elles qui portent le
 * référencement local ; les lister une par une vaut mieux que d'espérer que le
 * moteur les découvre depuis la carte, qui est rendue côté client.
 *
 * On n'expose QUE ce qui est déjà public : annonces au statut `published`,
 * prestataires `is_verified`. Une annonce dépubliée doit disparaître du plan,
 * sinon on envoie les visiteurs sur des biens déjà loués.
 */
export const revalidate = 3600

type Entree = MetadataRoute.Sitemap[number]

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "https://locawave.vercel.app"

  const fixes: Entree[] = [
    { url: `${base}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/annonces`, changeFrequency: "hourly", priority: 0.9 },
    { url: `${base}/services`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${base}/avantages`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/litiges`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${base}/contact`, changeFrequency: "yearly", priority: 0.4 },
    { url: `${base}/cgu`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${base}/mentions-legales`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${base}/politique-confidentialite`, changeFrequency: "yearly", priority: 0.2 },
  ]

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const cle = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !cle) return fixes

  try {
    // Clé anonyme volontairement : le plan du site ne doit contenir que ce qu'un
    // visiteur non connecté peut voir. La RLS fait donc office de garde-fou.
    const supabase = createClient(url, cle)

    const [annonces, prestataires] = await Promise.all([
      supabase.from("listings")
        .select("id, updated_at").eq("status", "published")
        .order("updated_at", { ascending: false }).limit(2000),
      supabase.from("provider_profiles")
        .select("id, updated_at").eq("is_verified", true)
        .order("updated_at", { ascending: false }).limit(1000),
    ])

    const dynamiques: Entree[] = [
      ...(annonces.data ?? []).map((a) => ({
        url: `${base}/annonces/${a.id}`,
        lastModified: a.updated_at ? new Date(a.updated_at) : undefined,
        changeFrequency: "daily" as const,
        priority: 0.8,
      })),
      ...(prestataires.data ?? []).map((p) => ({
        url: `${base}/prestataires/${p.id}`,
        lastModified: p.updated_at ? new Date(p.updated_at) : undefined,
        changeFrequency: "weekly" as const,
        priority: 0.6,
      })),
    ]

    return [...fixes, ...dynamiques]
  } catch {
    // Une base injoignable ne doit pas faire échouer le plan : mieux vaut un
    // plan partiel qu'une erreur 500 servie au robot d'exploration.
    return fixes
  }
}
