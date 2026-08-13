-- Migration 070 — Espace admin, étape 4 : les finances de la plateforme.
--
-- Deux lectures, toujours gardées par is_admin() : la synthèse sur une période,
-- et la liste des règlements ligne à ligne.
--
-- Aucune écriture ici, volontairement. Un règlement constaté ne se corrige pas
-- d'un clic depuis une console : il se corrige là où il a été saisi, par celui
-- qui l'a saisi, sinon la comptabilité du propriétaire cesse d'être la sienne.

-- ============================================================
-- admin_finances — la synthèse sur une période
-- ============================================================
CREATE OR REPLACE FUNCTION public.admin_finances(
  p_du DATE DEFAULT NULL,
  p_au DATE DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
STABLE
AS $fn$
DECLARE
  v      JSONB;
  v_du   DATE := COALESCE(p_du, (CURRENT_DATE - INTERVAL '12 months')::DATE);
  v_au   DATE := COALESCE(p_au, CURRENT_DATE);
  v_fin  TIMESTAMPTZ;
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Accès refusé';
  END IF;
  IF v_du > v_au THEN
    RAISE EXCEPTION 'La date de début est postérieure à la date de fin.';
  END IF;
  v_fin := (v_au + 1)::TIMESTAMPTZ;   -- borne haute exclusive : le dernier jour compte en entier

  SELECT jsonb_build_object(
    'periode', jsonb_build_object('du', v_du, 'au', v_au),

    -- Loyers réellement encaissés par les propriétaires sur la période.
    'encaisse', jsonb_build_object(
      'total', (SELECT COALESCE(SUM(amount_fcfa),0) FROM payments
                 WHERE paid_at >= v_du AND paid_at < v_fin),
      'nombre',(SELECT COUNT(*) FROM payments WHERE paid_at >= v_du AND paid_at < v_fin),
      'par_methode', (SELECT COALESCE(jsonb_object_agg(m, t), '{}'::jsonb) FROM (
        SELECT COALESCE(method,'inconnu') AS m, SUM(amount_fcfa) AS t
        FROM payments WHERE paid_at >= v_du AND paid_at < v_fin
        GROUP BY 1) x),
      'par_mois', COALESCE((SELECT jsonb_agg(jsonb_build_object(
          'mois', mois, 'montant', montant, 'nombre', nombre) ORDER BY mois)
        FROM (
          SELECT to_char(date_trunc('month', paid_at), 'YYYY-MM') AS mois,
                 SUM(amount_fcfa) AS montant, COUNT(*) AS nombre
          FROM payments WHERE paid_at >= v_du AND paid_at < v_fin
          GROUP BY 1) y), '[]'::jsonb),
      -- Part passée par un lien de paiement, par opposition à la saisie manuelle
      -- ou à l'OCR d'une capture Wave / Orange Money.
      'via_psp', (SELECT COUNT(*) FROM payments
                   WHERE paid_at >= v_du AND paid_at < v_fin AND psp_provider IS NOT NULL)
    ),

    -- Ce qui était dû sur la période, et ce qui manque encore.
    'attendu', jsonb_build_object(
      'total',  (SELECT COALESCE(SUM(amount_fcfa),0) FROM rent_schedules
                  WHERE due_date BETWEEN v_du AND v_au),
      'regle',  (SELECT COALESCE(SUM(amount_fcfa),0) FROM rent_schedules
                  WHERE due_date BETWEEN v_du AND v_au AND status = 'paid'),
      'nombre', (SELECT COUNT(*) FROM rent_schedules WHERE due_date BETWEEN v_du AND v_au)
    ),

    -- Les impayés se comptent à aujourd'hui, pas sur la période : un loyer de
    -- mars encore dû aujourd'hui reste un impayé, quelle que soit la fenêtre.
    'impayes', jsonb_build_object(
      'total',  (SELECT COALESCE(SUM(amount_fcfa),0) FROM rent_schedules
                  WHERE status <> 'paid' AND due_date < CURRENT_DATE),
      'nombre', (SELECT COUNT(*) FROM rent_schedules
                  WHERE status <> 'paid' AND due_date < CURRENT_DATE),
      'par_anciennete', (SELECT COALESCE(jsonb_object_agg(tranche, montant), '{}'::jsonb) FROM (
        SELECT CASE
                 WHEN CURRENT_DATE - due_date <= 30  THEN '1_moins_30j'
                 WHEN CURRENT_DATE - due_date <= 60  THEN '2_31_60j'
                 WHEN CURRENT_DATE - due_date <= 90  THEN '3_61_90j'
                 ELSE '4_plus_90j'
               END AS tranche,
               SUM(amount_fcfa) AS montant
        FROM rent_schedules
        WHERE status <> 'paid' AND due_date < CURRENT_DATE
        GROUP BY 1) z)
    ),

    'quittances', jsonb_build_object(
      'emises', (SELECT COUNT(*) FROM receipts WHERE created_at >= v_du AND created_at < v_fin),
      'avec_pdf', (SELECT COUNT(*) FROM receipts
                    WHERE created_at >= v_du AND created_at < v_fin AND pdf_url IS NOT NULL),
      'envoyees', (SELECT COUNT(*) FROM receipts
                    WHERE created_at >= v_du AND created_at < v_fin AND sent_at IS NOT NULL)
    ),

    -- Nos revenus à nous : commissions et abonnements.
    'revenus_locawave', jsonb_build_object(
      'commissions', (SELECT COALESCE(SUM(amount_fcfa),0) FROM commissions
                       WHERE created_at >= v_du AND created_at < v_fin),
      'commissions_nb', (SELECT COUNT(*) FROM commissions
                          WHERE created_at >= v_du AND created_at < v_fin),
      'commissions_par_source', (SELECT COALESCE(jsonb_object_agg(s, t), '{}'::jsonb) FROM (
        SELECT source_type AS s, SUM(amount_fcfa) AS t FROM commissions
        WHERE created_at >= v_du AND created_at < v_fin GROUP BY 1) c),
      'abonnements', (SELECT COALESCE(SUM(amount_fcfa),0) FROM subscription_payments
                       WHERE status = 'paid' AND paid_at >= v_du AND paid_at < v_fin),
      'abonnements_attente', (SELECT COUNT(*) FROM subscription_payments WHERE status <> 'paid')
    ),

    'par_organisation', COALESCE((SELECT jsonb_agg(jsonb_build_object(
        'id', id, 'nom', nom, 'encaisse', encaisse, 'impayes', impayes) ORDER BY encaisse DESC)
      FROM (
        SELECT o.id, o.name AS nom,
          (SELECT COALESCE(SUM(p.amount_fcfa),0) FROM payments p
            WHERE p.org_id = o.id AND p.paid_at >= v_du AND p.paid_at < v_fin) AS encaisse,
          (SELECT COALESCE(SUM(rs.amount_fcfa),0) FROM rent_schedules rs
            WHERE rs.org_id = o.id AND rs.status <> 'paid' AND rs.due_date < CURRENT_DATE) AS impayes
        FROM organizations o) t
      WHERE encaisse > 0 OR impayes > 0), '[]'::jsonb)
  ) INTO v;

  RETURN v;
END;
$fn$;
REVOKE EXECUTE ON FUNCTION public.admin_finances(DATE, DATE) FROM anon, PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_finances(DATE, DATE) TO authenticated;

-- ============================================================
-- admin_payments — les règlements, ligne à ligne
-- ============================================================
CREATE OR REPLACE FUNCTION public.admin_payments(
  p_search  TEXT DEFAULT NULL,
  p_methode TEXT DEFAULT NULL,
  p_du      DATE DEFAULT NULL,
  p_au      DATE DEFAULT NULL,
  p_limit   INT  DEFAULT 50,
  p_offset  INT  DEFAULT 0
)
RETURNS TABLE (
  id           UUID,
  paye_le      TIMESTAMPTZ,
  montant      INT,
  methode      TEXT,
  reference    TEXT,
  psp          TEXT,
  org_id       UUID,
  org_nom      TEXT,
  locataire    TEXT,
  bien         TEXT,
  quittance    TEXT,
  echeance_le  DATE,
  total        BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
STABLE
AS $fn$
DECLARE
  v_du DATE := COALESCE(p_du, '1970-01-01'::DATE);
  v_au DATE := COALESCE(p_au, CURRENT_DATE);
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Accès refusé';
  END IF;

  RETURN QUERY
  WITH base AS (
    SELECT
      pay.id,
      pay.paid_at   AS paye_le,
      pay.amount_fcfa AS montant,
      pay.method    AS methode,
      pay.reference,
      pay.psp_provider AS psp,
      o.id   AS org_id,
      o.name AS org_nom,
      (t.first_name || ' ' || t.last_name) AS locataire,
      pr.name AS bien,
      r.receipt_number AS quittance,
      rs.due_date AS echeance_le
    FROM payments pay
    LEFT JOIN organizations o ON o.id = pay.org_id
    LEFT JOIN rent_schedules rs ON rs.id = pay.rent_schedule_id
    LEFT JOIN leases l   ON l.id = rs.lease_id
    LEFT JOIN tenants t  ON t.id = l.tenant_id
    LEFT JOIN units u    ON u.id = l.unit_id
    LEFT JOIN properties pr ON pr.id = u.property_id
    LEFT JOIN receipts r ON r.payment_id = pay.id
    WHERE pay.paid_at >= v_du AND pay.paid_at < (v_au + 1)::TIMESTAMPTZ
  ),
  filtre AS (
    SELECT * FROM base b
    WHERE (
      p_search IS NULL OR p_search = ''
      OR b.org_nom   ILIKE '%' || p_search || '%'
      OR b.locataire ILIKE '%' || p_search || '%'
      OR b.bien      ILIKE '%' || p_search || '%'
      OR b.reference ILIKE '%' || p_search || '%'
      OR b.quittance ILIKE '%' || p_search || '%'
    )
    AND (p_methode IS NULL OR p_methode = '' OR b.methode = p_methode)
  )
  SELECT f.*, COUNT(*) OVER () AS total
  FROM filtre f
  ORDER BY f.paye_le DESC NULLS LAST
  LIMIT GREATEST(1, LEAST(p_limit, 500))
  OFFSET GREATEST(0, p_offset);
END;
$fn$;
REVOKE EXECUTE ON FUNCTION public.admin_payments(TEXT, TEXT, DATE, DATE, INT, INT) FROM anon, PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_payments(TEXT, TEXT, DATE, DATE, INT, INT) TO authenticated;
