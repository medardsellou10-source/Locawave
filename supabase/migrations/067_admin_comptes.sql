-- Migration 067 — Espace admin, étape 2 : les comptes.
--
-- Deux fonctions de lecture, gardées par is_admin() et appelées avec la session
-- de l'administrateur : la liste filtrable, et la fiche détaillée d'un compte.
-- Elles lisent auth.users (email, dernière connexion, suspension), que le
-- client Supabase ne sait pas interroger directement.

-- ============================================================
-- admin_accounts — la liste, filtrable et paginée
-- ============================================================
CREATE OR REPLACE FUNCTION public.admin_accounts(
  p_search TEXT DEFAULT NULL,
  p_role   TEXT DEFAULT NULL,   -- owner|tenant|provider|seeker|admin|suspendu
  p_limit  INT  DEFAULT 50,
  p_offset INT  DEFAULT 0
)
RETURNS TABLE (
  id            UUID,
  full_name     TEXT,
  email         TEXT,
  role          TEXT,
  kyc_status    TEXT,
  phone         TEXT,
  created_at    TIMESTAMPTZ,
  last_sign_in  TIMESTAMPTZ,
  suspendu      BOOLEAN,
  est_admin     BOOLEAN,
  org_nom       TEXT,
  org_id        UUID,
  total         BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
STABLE
AS $fn$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Accès refusé';
  END IF;

  RETURN QUERY
  WITH base AS (
    SELECT
      p.id,
      p.full_name,
      au.email::TEXT                                        AS email,
      p.role,
      p.kyc_status,
      p.phone,
      p.created_at,
      au.last_sign_in_at                                    AS last_sign_in,
      (au.banned_until IS NOT NULL AND au.banned_until > NOW()) AS suspendu,
      EXISTS (SELECT 1 FROM platform_admins pa
              WHERE pa.profile_id = p.id AND pa.revoked_at IS NULL) AS est_admin,
      o.name                                                AS org_nom,
      o.id                                                  AS org_id
    FROM profiles p
    LEFT JOIN auth.users au ON au.id = p.id
    LEFT JOIN users u       ON u.id = p.id
    LEFT JOIN organizations o ON o.id = u.org_id
  ),
  filtre AS (
    SELECT * FROM base b
    WHERE (
      p_search IS NULL OR p_search = ''
      OR b.full_name ILIKE '%' || p_search || '%'
      OR b.email     ILIKE '%' || p_search || '%'
      OR b.phone     ILIKE '%' || p_search || '%'
      OR b.org_nom   ILIKE '%' || p_search || '%'
    )
    AND (
      p_role IS NULL OR p_role = ''
      OR (p_role = 'admin'    AND b.est_admin)
      OR (p_role = 'suspendu' AND b.suspendu)
      OR (p_role NOT IN ('admin','suspendu') AND b.role = p_role)
    )
  )
  SELECT f.*, COUNT(*) OVER () AS total
  FROM filtre f
  ORDER BY f.created_at DESC
  LIMIT GREATEST(1, LEAST(p_limit, 200))
  OFFSET GREATEST(0, p_offset);
END;
$fn$;
REVOKE EXECUTE ON FUNCTION public.admin_accounts(TEXT, TEXT, INT, INT) FROM anon, PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_accounts(TEXT, TEXT, INT, INT) TO authenticated;

-- ============================================================
-- admin_account_detail — la fiche d'un compte
-- ============================================================
CREATE OR REPLACE FUNCTION public.admin_account_detail(p_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
STABLE
AS $fn$
DECLARE
  v JSONB;
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Accès refusé';
  END IF;

  SELECT jsonb_build_object(
    'compte', (
      SELECT jsonb_build_object(
        'id', p.id,
        'full_name', p.full_name,
        'email', au.email,
        'role', p.role,
        'kyc_status', p.kyc_status,
        'phone', p.phone,
        'country', p.country,
        'created_at', p.created_at,
        'last_sign_in', au.last_sign_in_at,
        'email_confirme', au.email_confirmed_at IS NOT NULL,
        'suspendu', (au.banned_until IS NOT NULL AND au.banned_until > NOW()),
        'suspendu_jusqua', au.banned_until,
        'est_admin', EXISTS (SELECT 1 FROM platform_admins pa
                             WHERE pa.profile_id = p.id AND pa.revoked_at IS NULL),
        'est_super_admin', EXISTS (SELECT 1 FROM platform_admins pa
                                   WHERE pa.profile_id = p.id AND pa.revoked_at IS NULL AND pa.is_super)
      )
      FROM profiles p LEFT JOIN auth.users au ON au.id = p.id
      WHERE p.id = p_id
    ),
    'organisation', (
      SELECT jsonb_build_object(
        'id', o.id, 'nom', o.name, 'plan', o.plan,
        'expire_le', o.plan_expires_at,
        'role_dans_org', u.role,
        'proprietaire', o.owner_id = p_id
      )
      FROM users u JOIN organizations o ON o.id = u.org_id
      WHERE u.id = p_id
    ),
    'parc', (
      SELECT jsonb_build_object(
        'biens', (SELECT COUNT(*) FROM properties pr
                  WHERE pr.org_id = (SELECT org_id FROM users WHERE id = p_id)),
        'baux',  (SELECT COUNT(*) FROM leases l
                  WHERE l.org_id = (SELECT org_id FROM users WHERE id = p_id))
      )
    ),
    'locataire', (
      SELECT jsonb_build_object(
        'fiche_id', t.id,
        'nom', t.first_name || ' ' || t.last_name,
        'baux_actifs', (SELECT COUNT(*) FROM leases l WHERE l.tenant_id = t.id AND l.status = 'active')
      )
      FROM tenants t WHERE t.profile_id = p_id LIMIT 1
    ),
    'prestataire', (
      SELECT jsonb_build_object(
        'verifie', pp.is_verified,
        'metiers', pp.trades,
        'note_confiance', pp.trust_score,
        'missions', pp.jobs_done
      )
      FROM provider_profiles pp WHERE pp.id = p_id
    ),
    'kyc', COALESCE((
      SELECT jsonb_agg(jsonb_build_object(
        'id', k.id, 'type', k.doc_type, 'statut', k.status,
        'depose_le', k.created_at, 'note', k.note
      ) ORDER BY k.created_at DESC)
      FROM kyc_documents k WHERE k.profile_id = p_id
    ), '[]'::jsonb),
    'actions_admin', COALESCE((
      SELECT jsonb_agg(jsonb_build_object(
        'action', a.action, 'resume', a.summary,
        'par', a.admin_email, 'le', a.at
      ) ORDER BY a.at DESC)
      FROM (SELECT * FROM admin_actions
            WHERE target_type = 'profile' AND target_id = p_id::TEXT
            ORDER BY at DESC LIMIT 20) a
    ), '[]'::jsonb),
    'journal_metier', COALESCE((
      SELECT jsonb_agg(jsonb_build_object(
        'entite', l.entity, 'action', l.action, 'le', l.at
      ) ORDER BY l.at DESC)
      FROM (SELECT * FROM audit_log WHERE actor_id = p_id ORDER BY at DESC LIMIT 20) l
    ), '[]'::jsonb)
  ) INTO v;

  IF v->'compte' IS NULL OR v->'compte' = 'null'::jsonb THEN
    RAISE EXCEPTION 'Compte introuvable';
  END IF;

  RETURN v;
END;
$fn$;
REVOKE EXECUTE ON FUNCTION public.admin_account_detail(UUID) FROM anon, PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_account_detail(UUID) TO authenticated;
