import type { SupabaseClient } from "@supabase/supabase-js"

/**
 * Accès aux médias stockés dans des buckets privés.
 *
 * Historique : les buckets `chantier` et `reports` étaient publics et l'URL
 * publique complète était enregistrée dans `media_urls`. Ces buckets sont
 * désormais privés — l'URL publique ne résout plus. On enregistre maintenant le
 * CHEMIN dans le bucket, et on signe à l'affichage.
 *
 * Les deux formes coexistent donc en base. `storagePath()` les ramène toutes
 * les deux à un chemin, ce qui permet de signer l'ancien comme le nouveau sans
 * migration de données.
 */

/** Ramène une valeur de `media_urls` à un chemin dans le bucket. */
export function storagePath(bucket: string, value: string): string {
  if (!value) return value
  // Ancienne forme : https://<projet>.supabase.co/storage/v1/object/public/<bucket>/<chemin>
  const marqueur = `/storage/v1/object/public/${bucket}/`
  const i = value.indexOf(marqueur)
  if (i !== -1) return value.slice(i + marqueur.length)
  // Forme signée déjà résolue (ne devrait pas être stockée, mais on sait la lire)
  const marqueurSigne = `/storage/v1/object/sign/${bucket}/`
  const j = value.indexOf(marqueurSigne)
  if (j !== -1) return value.slice(j + marqueurSigne.length).split("?")[0]
  // Nouvelle forme : déjà un chemin
  return value
}

/**
 * Signe une liste de médias pour affichage. Renvoie un tableau de la même
 * longueur et dans le même ordre que l'entrée ; une entrée non signable vaut
 * `null` plutôt que de décaler les suivantes.
 */
export async function signMedia(
  supabase: SupabaseClient,
  bucket: string,
  values: (string | null | undefined)[],
  expiresIn = 3600
): Promise<(string | null)[]> {
  const chemins = values.map((v) => (v ? storagePath(bucket, v) : null))
  const aSigner = chemins.filter((c): c is string => !!c)
  if (aSigner.length === 0) return chemins.map(() => null)

  const { data, error } = await supabase.storage.from(bucket).createSignedUrls(aSigner, expiresIn)
  if (error || !data) return chemins.map(() => null)

  // createSignedUrls renvoie un résultat par chemin demandé, dans l'ordre.
  const parChemin = new Map<string, string | null>()
  data.forEach((d, i) => parChemin.set(aSigner[i], d.signedUrl ?? null))
  return chemins.map((c) => (c ? parChemin.get(c) ?? null : null))
}

/**
 * Signe les `media_urls` d'une liste d'enregistrements, en une seule requête
 * pour l'ensemble des médias plutôt qu'une par ligne. Renvoie une nouvelle
 * liste ; les médias non signables sont retirés du tableau.
 */
export async function signRecordsMedia<T extends { media_urls: string[] | null }>(
  supabase: SupabaseClient,
  bucket: string,
  records: T[],
  expiresIn = 3600
): Promise<T[]> {
  if (records.length === 0) return records

  const plat: string[] = []
  const bornes: [number, number][] = []
  for (const r of records) {
    const debut = plat.length
    plat.push(...(r.media_urls ?? []))
    bornes.push([debut, plat.length])
  }
  if (plat.length === 0) return records

  const signes = await signMedia(supabase, bucket, plat, expiresIn)
  return records.map((r, i) => {
    const [d, f] = bornes[i]
    return { ...r, media_urls: signes.slice(d, f).filter((u): u is string => !!u) }
  })
}

/** Signe un média unique. `null` si le chemin est absent ou non signable. */
export async function signOne(
  supabase: SupabaseClient,
  bucket: string,
  value: string | null | undefined,
  expiresIn = 3600
): Promise<string | null> {
  const [url] = await signMedia(supabase, bucket, [value], expiresIn)
  return url ?? null
}
