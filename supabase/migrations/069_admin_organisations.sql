-- Migration 069 — Espace admin, étape 3 : les organisations et leurs abonnements.
--
-- Deux lectures (liste filtrable, fiche détaillée) et deux écritures (changer de
-- plan, prolonger un essai), sur le même modèle qu'à l'étape 2 : tout est gardé
-- par is_admin() dans la base, et toute écriture se journalise.
--
-- Un mot sur l'argent. Trois montants coexistent, et les confondre serait grave :
--   * les loyers encaissés par le propriétaire — ce ne sont PAS nos revenus,
--     Locawave ne détient jamais ces fonds ;
--   * l'abonnement payé à Locawave (subscription_payments) ;
--   * les commissions sur services et chantiers (commissions).
-- La fiche les présente séparément, chacun sous son nom.

-- ============================================================
-- admin_organizations — la liste
-- ============================================================
CREATE OR REPLACE FUNCTION public.admin_organizations(
  p_search TEXT DEFAULT NULL,
  p_plan   TEXT DEFAULT NULL,   -- trial|solo|pro|agence|expire|bientot
  p_limit  INT  DEFAULT 50,
  p_offset INT  DEFAULT 0
)
RETURNS TABLE (
  id              UUID,
  nom             TEXT,
  plan            TEXT,
  expire_le       TIMESTAMPTZ,
  expire          BOOLEAN,
  proprietaire    TEXT,
  proprietaire_id UUID,
  email           TEXT,
  membres         BIGINT,
  biens           BIGINT,
  baux_actifs     BIGINT,
  loyers_encaisses BIGINT,
  impayes         BIGINT,
  paye_a_locawave BIGINT,
  creee_le        TIMESTAMPTZ,
  total           BIGINT
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
      o.id,
      o.name AS nom,
      o.plan,
      o.plan_expires_at AS expire_le,
      (o.plan_expires_at IS NOT NULL AND o.plan_expires_at < NOW()) AS expire,
      p.full_name AS proprietaire,
      o.owner_id  AS proprietaire_id,
      au.email::TEXT AS email,
      (SELECT COUNT(*) FROM users u WHERE u.org_id = o.id)                       AS membres,
      (SELECT COUNT(*) FROM properties pr WHERE pr.org_id = o.id)                AS biens,
      (SELECT COUNT(*) FROM leases l WHERE l.org_id = o.id AND l.status = 'active') AS baux_actifs,
      (SELECT COALESCE(SUM(pay.amount_fcfa),0) FROM payments pay WHERE pay.org_id = o.id) AS loyers_encaisses,
      (SELECT COALESCE(SUM(rs.amount_fcfa),0) FROM rent_schedules rs
        WHERE rs.org_id = o.id AND rs.status <> 'paid' AND rs.due_date < CURRENT_DATE) AS impayes,
      (SELECT COALESCE(SUM(sp.amount_fcfa),0) FROM subscription_payments sp
        WHERE sp.org_id = o.id AND sp.status = 'paid')
      + (SELECT COALESCE(SUM(c.amount_fcfa),0) FROM commissions c WHERE c.org_id = o.id) AS paye_a_locawave,
      o.created_at AS creee_le
    FROM organizations o
    LEFT JOIN profiles p   ON p.id = o.owner_id
    LEFT JOIN auth.users au ON au.id = o.owner_id
  ),
  filtre AS (
    SELECT * FROM base b
    WHERE (
      p_search IS NULL OR p_search = ''
      OR b.nom          ILIKE '%' || p_search || '%'
      OR b.proprietaire ILIKE '%' || p_search || '%'
      OR b.email        ILIKE '%' || p_search || '%'
    )
    AND (
      p_plan IS NULL OR p_plan = ''
      OR (p_plan = 'expire'  AND b.expire)
      OR (p_plan = 'bientot' AND b.expire_le BETWEEN NOW() AND NOW() + INTERVAL '7 days')
      OR (p_plan NOT IN ('expire','bientot') AND b.plan = p_plan)
    )
  )
  SELECT f.*, COUNT(*) OVER () AS total
  FROM filtre f
  ORDER BY f.creee_le DESC
  LIMIT GREATEST(1, LEAST(p_limit, 200))
  OFFSET GREATEST(0, p_offset);
END;
$fn$;
REVOKE EXECUTE ON FUNCTION public.admin_organizations(TEXT, TEXT, INT, INT) FROM anon, PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_organizations(TEXT, TEXT, INT, INT) TO authenticated;

-- ============================================================
-- admin_organization_detail — la fiche
-- ============================================================
CREATE OR REPLACE FUNCTION public.admin_organization_detail(p_id UUID)
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
    'organisation', (
      SELECT jsonb_build_object(
        'id', o.id, 'nom', o.name, 'plan', o.plan,
        'expire_le', o.plan_expires_at,
        'expire', (o.plan_expires_at IS NOT NULL AND o.plan_expires_at < NOW()),
        'creee_le', o.created_at,
        'onboarding_fait', o.onboarding_completed,
        'code_parrainage', o.referral_code,
        'wave', o.wave_number, 'om', o.om_number,
        'adresse', o.address,
        'proprietaire', jsonb_build_object(
          'id', o.owner_id,
          'nom', p.full_name,
          'email', au.email
        )
      )
      FROM organizations o
      LEFT JOIN profiles p ON p.id = o.owner_id
      LEFT JOIN auth.users au ON au.id = o.owner_id
      WHERE o.id = p_id
    ),
    'membres', COALESCE((
      SELECT jsonb_agg(jsonb_build_object(
        'id', u.id, 'nom', pr.full_name, 'email', auu.email, 'role', u.role
      ) ORDER BY u.role)
      FROM users u
      LEFT JOIN profiles pr ON pr.id = u.id
      LEFT JOIN auth.users auu ON auu.id = u.id
      WHERE u.org_id = p_id
    ), '[]'::jsonb),
    'parc', jsonb_build_object(
      'biens',       (SELECT COUNT(*) FROM properties WHERE org_id = p_id),
      'lots',        (SELECT COUNT(*) FROM units un WHERE un.property_id IN
                       (SELECT id FROM properties WHERE org_id = p_id)),
      'baux_actifs', (SELECT COUNT(*) FROM leases WHERE org_id = p_id AND status = 'active'),
      'baux_total',  (SELECT COUNT(*) FROM leases WHERE org_id = p_id),
      'locataires',  (SELECT COUNT(*) FROM tenants WHERE org_id = p_id),
      'annonces',    (SELECT COUNT(*) FROM listings WHERE org_id = p_id AND status = 'published')
    ),
    -- Argent du propriétaire : ce n'est pas notre trésorerie.
    'loyers', jsonb_build_object(
      'encaisse_total', (SELECT COALESCE(SUM(amount_fcfa),0) FROM payments WHERE org_id = p_id),
      'encaisse_12m',   (SELECT COALESCE(SUM(amount_fcfa),0) FROM payments
                          WHERE org_id = p_id AND paid_at > NOW() - INTERVAL '12 months'),
      'impayes',        (SELECT COALESCE(SUM(amount_fcfa),0) FROM rent_schedules
                          WHERE org_id = p_id AND status <> 'paid' AND due_date < CURRENT_DATE),
      'impayes_nb',     (SELECT COUNT(*) FROM rent_schedules
                          WHERE org_id = p_id AND status <> 'paid' AND due_date < CURRENT_DATE),
      'charges',        (SELECT COALESCE(SUM(amount_fcfa),0) FROM expenses WHERE org_id = p_id)
    ),
    -- Argent de Locawave : abonnement + commissions.
    'revenus_locawave', jsonb_build_object(
      'abonnements', (SELECT COALESCE(SUM(amount_fcfa),0) FROM subscription_payments
                       WHERE org_id = p_id AND status = 'paid'),
      'commissions', (SELECT COALESCE(SUM(amount_fcfa),0) FROM commissions WHERE org_id = p_id)
    ),
    'abonnements', COALESCE((
      SELECT jsonb_agg(jsonb_build_object(
        'id', s.id, 'plan', s.plan, 'montant', s.amount_fcfa, 'mois', s.months,
        'statut', s.status, 'paye_le', s.paid_at,
        'debut', s.period_start, 'fin', s.period_end,
        'fournisseur', s.psp_provider
      ) ORDER BY s.created_at DESC)
      FROM (SELECT * FROM subscription_payments WHERE org_id = p_id
            ORDER BY created_at DESC LIMIT 20) s
    ), '[]'::jsonb),
    'activite', COALESCE((
      SELECT jsonb_agg(jsonb_build_object(
        'action', a.action, 'entite', a.entity_type, 'le', a.created_at
      ) ORDER BY a.created_at DESC)
      FROM (SELECT * FROM activity_logs WHERE org_id = p_id
            ORDER BY created_at DESC LIMIT 20) a
    ), '[]'::jsonb),
    'actions_admin', COALESCE((
      SELECT jsonb_agg(jsonb_build_object(
        'action', ad.action, 'resume', ad.summary, 'par', ad.admin_email, 'le', ad.at
      ) ORDER BY ad.at DESC)
      FROM (SELECT * FROM admin_actions
            WHERE target_type = 'organization' AND target_id = p_id::TEXT
            ORDER BY at DESC LIMIT 20) ad
    ), '[]'::jsonb)
  ) INTO v;

  IF v->'organisation' IS NULL OR v->'organisation' = 'null'::jsonb THEN
    RAISE EXCEPTION 'Organisation introuvable';
  END IF;

  RETURN v;
END;
$fn$;
REVOKE EXECUTE ON FUNCTION public.admin_organization_detail(UUID) FROM anon, PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_organization_detail(UUID) TO authenticated;

-- ============================================================
-- Changer le plan d'une organisation
-- ============================================================
-- p_mois = 0 laisse l'échéance telle quelle (utile pour corriger un plan sans
-- toucher à la date). Sinon l'échéance repart de la plus tardive entre
-- aujourd'hui et l'échéance en cours : on n'ampute jamais du temps déjà payé.
CREATE OR REPLACE FUNCTION public.admin_set_org_plan(
  p_id   UUID,
  p_plan TEXT,
  p_mois INT DEFAULT 0
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $fn$
DECLARE
  v_avant_plan   TEXT;
  v_avant_expire TIMESTAMPTZ;
  v_nom          TEXT;
  v_expire       TIMESTAMPTZ;
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Accès refusé';
  END IF;
  IF p_plan NOT IN ('trial','solo','pro','agence') THEN
    RAISE EXCEPTION 'Plan inconnu : %', p_plan;
  END IF;
  IF p_mois < 0 OR p_mois > 36 THEN
    RAISE EXCEPTION 'Durée hors limites (0 à 36 mois)';
  END IF;

  SELECT plan, plan_expires_at, name INTO v_avant_plan, v_avant_expire, v_nom
  FROM organizations WHERE id = p_id;
  IF v_nom IS NULL THEN
    RAISE EXCEPTION 'Organisation introuvable';
  END IF;

  v_expire := CASE
    WHEN p_mois = 0 THEN v_avant_expire
    ELSE GREATEST(NOW(), COALESCE(v_avant_expire, NOW())) + (p_mois || ' months')::INTERVAL
  END;

  UPDATE organizations
  SET plan = p_plan, plan_expires_at = v_expire, updated_at = NOW()
  WHERE id = p_id;

  PERFORM public.admin_log_action(
    'org.plan_modifie', 'organization', p_id::TEXT,
    format('%s : plan %s → %s%s', v_nom, v_avant_plan, p_plan,
      CASE WHEN p_mois > 0 THEN format(' pour %s mois', p_mois) ELSE '' END),
    jsonb_build_object('plan', v_avant_plan, 'expire_le', v_avant_expire),
    jsonb_build_object('plan', p_plan, 'expire_le', v_expire)
  );

  RETURN jsonb_build_object(
    'message', format('%s est passée au plan « %s »%s.', v_nom, p_plan,
      CASE WHEN v_expire IS NOT NULL
        THEN format(', jusqu''au %s', to_char(v_expire, 'DD/MM/YYYY'))
        ELSE '' END)
  );
END;
$fn$;
REVOKE EXECUTE ON FUNCTION public.admin_set_org_plan(UUID, TEXT, INT) FROM anon, PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_set_org_plan(UUID, TEXT, INT) TO authenticated;

-- ============================================================
-- Prolonger l'échéance (essai ou abonnement)
-- ============================================================
CREATE OR REPLACE FUNCTION public.admin_extend_org(p_id UUID, p_jours INT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $fn$
DECLARE
  v_avant TIMESTAMPTZ;
  v_apres TIMESTAMPTZ;
  v_nom   TEXT;
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Accès refusé';
  END IF;
  IF p_jours < 1 OR p_jours > 365 THEN
    RAISE EXCEPTION 'Prolongation hors limites (1 à 365 jours)';
  END IF;

  SELECT plan_expires_at, name INTO v_avant, v_nom FROM organizations WHERE id = p_id;
  IF v_nom IS NULL THEN
    RAISE EXCEPTION 'Organisation introuvable';
  END IF;

  -- On repart d'aujourd'hui si l'échéance est déjà passée : prolonger un essai
  -- expiré de 15 jours doit donner 15 jours à venir, pas 15 jours dans le passé.
  v_apres := GREATEST(NOW(), COALESCE(v_avant, NOW())) + (p_jours || ' days')::INTERVAL;

  UPDATE organizations SET plan_expires_at = v_apres, updated_at = NOW() WHERE id = p_id;

  PERFORM public.admin_log_action(
    'org.echeance_prolongee', 'organization', p_id::TEXT,
    format('%s : échéance prolongée de %s jours (au %s)', v_nom, p_jours,
           to_char(v_apres, 'DD/MM/YYYY')),
    jsonb_build_object('expire_le', v_avant),
    jsonb_build_object('expire_le', v_apres)
  );

  RETURN jsonb_build_object(
    'message', format('%s a maintenant jusqu''au %s.', v_nom, to_char(v_apres, 'DD/MM/YYYY'))
  );
END;
$fn$;
REVOKE EXECUTE ON FUNCTION public.admin_extend_org(UUID, INT) FROM anon, PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_extend_org(UUID, INT) TO authenticated;
