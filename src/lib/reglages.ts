import { cache } from "react"
import { createServerClient } from "@/lib/supabase-server"

/**
 * Les interrupteurs de la plateforme, lus depuis le code qui les applique.
 *
 * `reglage_actif()` est une fonction SECURITY DEFINER accessible à tous les
 * rôles : elle ne rend qu'un booléen, jamais le contenu de admin_settings. Un
 * visiteur anonyme peut donc savoir si les inscriptions sont ouvertes, sans rien
 * apprendre du reste.
 *
 * Un réglage absent vaut « actif » : la plateforme ne doit pas s'éteindre parce
 * qu'une ligne manque en base.
 */

export type CleReglage =
  | "maintenance_mode"
  | "signups_open"
  | "listings_public"
  | "whatsapp_reminders"
  | "psp_enabled"

/** Mémoïsé par requête : plusieurs appels dans un même rendu ne font qu'un aller-retour. */
export const reglageActif = cache(async (cle: CleReglage): Promise<boolean> => {
  try {
    const supabase = await createServerClient()
    const { data, error } = await supabase.rpc("reglage_actif", { p_key: cle })
    if (error) {
      // En cas de panne de lecture, on laisse passer : couper l'application
      // parce qu'on n'a pas pu lire un interrupteur serait la pire réponse.
      console.error("[reglages] lecture impossible:", cle, error.message)
      return true
    }
    return data !== false
  } catch {
    return true
  }
})
