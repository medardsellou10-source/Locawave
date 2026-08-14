import { notFound } from "next/navigation"
import { headers } from "next/headers"
import { createServerClient, createAdminClient } from "@/lib/supabase-server"

/**
 * Espace admin — contrôle d'accès et traçabilité.
 *
 * L'autorité, c'est la table `platform_admins` (et elle seule) : `profiles.role`
 * n'ouvre plus aucune porte. Trois verrous se superposent :
 *   1. le middleware renvoie 404 sur /admin pour tout compte non administrateur ;
 *   2. le layout serveur rappelle requireAdmin() — un layout n'est pas contournable ;
 *   3. la base refuse de toute façon les lectures (policies + RPC gardées par is_admin()).
 *
 * Toute écriture faite depuis l'espace admin passe par le service_role ET par
 * logAdminAction() : rien ne se fait sans laisser de trace.
 */

export type AdminContext = {
  userId: string
  email: string
  fullName: string
  isSuper: boolean
}

/**
 * Renvoie le contexte admin du visiteur, ou null s'il n'en est pas un.
 * Aucune exception : à utiliser dans les route handlers, qui répondent 404
 * eux-mêmes pour ne rien révéler.
 */
export async function getAdminContext(): Promise<AdminContext | null> {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const { data: admin } = await supabase
    .from("platform_admins")
    .select("profile_id, is_super, revoked_at")
    .eq("profile_id", user.id)
    .is("revoked_at", null)
    .maybeSingle()

  if (!admin) return null

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user.id)
    .maybeSingle()

  return {
    userId: user.id,
    email: user.email ?? "",
    fullName: profile?.full_name ?? "Administrateur",
    isSuper: Boolean(admin.is_super),
  }
}

/**
 * Pour les pages : soit le visiteur est administrateur, soit la page n'existe
 * pas. On renvoie un vrai 404, jamais un 403 — l'espace ne doit pas se deviner.
 */
export async function requireAdmin(): Promise<AdminContext> {
  const ctx = await getAdminContext()
  if (!ctx) notFound()
  return ctx
}

/** Réservé aux actions les plus lourdes (nommer un admin, mode maintenance…). */
export async function requireSuperAdmin(): Promise<AdminContext> {
  const ctx = await requireAdmin()
  if (!ctx.isSuper) notFound()
  return ctx
}

/** Réponse standard des routes admin quand l'appelant n'a rien à faire là. */
export function adminNotFound(): Response {
  return new Response("Not Found", { status: 404 })
}

/** Client service_role : lecture inter-organisations et écritures admin. */
export function adminDb() {
  return createAdminClient()
}

type LogInput = {
  action: string
  targetType?: string
  targetId?: string
  summary?: string
  before?: unknown
  after?: unknown
}

/**
 * Journalise une action de l'espace admin, via la fonction admin_log_action()
 * gardée par is_admin() : la session de l'admin suffit, aucune clé service_role
 * n'est requise. Le journal est en ajout seul — admin_actions n'a ni policy
 * UPDATE ni policy DELETE.
 */
export async function logAdminAction({
  action,
  targetType,
  targetId,
  summary,
  before,
  after,
}: LogInput): Promise<void> {
  let ip: string | null = null
  let userAgent: string | null = null
  try {
    const h = await headers()
    ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null
    userAgent = h.get("user-agent")
  } catch {
    // Hors contexte de requête — on journalise quand même l'essentiel.
  }

  const supabase = await createServerClient()
  const { error } = await supabase.rpc("admin_log_action", {
    p_action: action,
    p_target_type: targetType ?? null,
    p_target_id: targetId ?? null,
    p_summary: summary ?? null,
    p_before: (before ?? null) as never,
    p_after: (after ?? null) as never,
    p_ip: ip,
    p_user_agent: userAgent,
  })

  if (error) {
    // Une action non traçable est une action qu'on ne veut pas avoir faite :
    // on la signale bruyamment côté serveur.
    console.error("[admin] échec de journalisation:", action, error.message)
  }
}
