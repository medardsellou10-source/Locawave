-- Migration 072 — Espace admin, étape 6 : confiance et litiges.
--
-- Le médiateur de la plateforme, c'est toi. Cette étape lui donne la vue et le
-- geste : les litiges ouverts, les sommes contestées, les cautions, et le
-- journal métier.
--
-- Rappel qui gouverne tout ce qui suit : Locawave ne détient JAMAIS de fonds.
-- `payment_state` est l'état d'une CRÉANCE entre deux personnes — due,
-- contestée, réglée, annulée — pas celui d'un dépôt qu'on garderait. Trancher
-- un litige, c'est dire si la somme reste due ; ce n'est pas rendre de l'argent.

-- ============================================================
-- admin_trust — litiges, créances contestées, cautions, journal
-- ============================================================
CREATE OR REPLACE FUNCTION public.admin_trust()
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
    'litiges', COALESCE((
      SELECT jsonb_agg(jsonb_build_object(
        'id', d.id,
        'statut', d.status,
        'motif', d.reason,
        'description', d.description,
        'montant_gele', d.amount_frozen_fcfa,
        'ouvert_par', op.full_name,
        'ouvert_par_id', d.opened_by,
        'contre', ag.full_name,
        'contre_id', d.against_id,
        'org', o.name,
        'org_id', d.org_id,
        'mission_id', d.work_order_id,
        'mission_montant', w.amount_fcfa,
        'mission_etat_paiement', w.payment_state,
        'issue', d.escrow_outcome,
        'resolution', d.resolution,
        'resolu_par', rp.full_name,
        'ouvert_le', d.created_at,
        'resolu_le', d.resolved_at,
        'echeance_contestation', d.contest_deadline
      ) ORDER BY
        CASE d.status WHEN 'open' THEN 0 WHEN 'under_review' THEN 1 ELSE 2 END,
        d.created_at DESC)
      FROM disputes d
      LEFT JOIN profiles op ON op.id = d.opened_by
      LEFT JOIN profiles ag ON ag.id = d.against_id
      LEFT JOIN profiles rp ON rp.id = d.resolved_by
      LEFT JOIN organizations o ON o.id = d.org_id
      LEFT JOIN work_orders w ON w.id = d.work_order_id
    ), '[]'::jsonb),

    -- Sommes contestées : des créances suspendues, pas des fonds détenus.
    'creances_contestees', COALESCE((
      SELECT jsonb_agg(jsonb_build_object(
        'id', w.id, 'montant', w.amount_fcfa, 'etat', w.payment_state,
        'type', w.type, 'description', w.description,
        'client', cp.full_name, 'prestataire', COALESCE(pp.display_name, prp.full_name),
        'cree_le', w.created_at
      ) ORDER BY w.created_at DESC)
      FROM work_orders w
      LEFT JOIN profiles cp ON cp.id = w.client_id
      LEFT JOIN provider_profiles pp ON pp.id = w.provider_id
      LEFT JOIN profiles prp ON prp.id = w.provider_id
      WHERE w.payment_state = 'disputed'
    ), '[]'::jsonb),

    'cautions', COALESCE((
      SELECT jsonb_agg(jsonb_build_object(
        'id', dp.id, 'montant', dp.amount_fcfa, 'libere', dp.released_amount_fcfa,
        'statut', dp.status, 'note', dp.note, 'maj_le', dp.updated_at,
        'org', o.name, 'org_id', dp.org_id,
        'locataire', t.first_name || ' ' || t.last_name,
        'bail_statut', l.status, 'bail_fin', l.end_date,
        -- Une caution encore retenue sur un bail terminé demande une explication.
        'a_regarder', (dp.status = 'held' AND l.status <> 'active')
      ) ORDER BY dp.updated_at DESC)
      FROM deposits dp
      LEFT JOIN organizations o ON o.id = dp.org_id
      LEFT JOIN leases l ON l.id = dp.lease_id
      LEFT JOIN tenants t ON t.id = l.tenant_id
    ), '[]'::jsonb),

    'journal', COALESCE((
      SELECT jsonb_agg(jsonb_build_object(
        'entite', a.entity, 'entite_id', a.entity_id, 'action', a.action,
        'acteur', p.full_name, 'le', a.at, 'details', a.payload
      ) ORDER BY a.at DESC)
      FROM (SELECT * FROM audit_log ORDER BY at DESC LIMIT 60) a
      LEFT JOIN profiles p ON p.id = a.actor_id
    ), '[]'::jsonb),

    'compteurs', jsonb_build_object(
      'litiges_ouverts',   (SELECT COUNT(*) FROM disputes WHERE status IN ('open','under_review')),
      'litiges_total',     (SELECT COUNT(*) FROM disputes),
      'montant_conteste',  (SELECT COALESCE(SUM(amount_fcfa),0) FROM work_orders WHERE payment_state = 'disputed'),
      'cautions_retenues', (SELECT COALESCE(SUM(amount_fcfa),0) FROM deposits WHERE status = 'held'),
      'cautions_a_regarder', (SELECT COUNT(*) FROM deposits dp JOIN leases l ON l.id = dp.lease_id
                               WHERE dp.status = 'held' AND l.status <> 'active'),
      'incidents_ouverts', (SELECT COUNT(*) FROM incidents WHERE status <> 'resolved')
    )
  ) INTO v;

  RETURN v;
END;
$fn$;
REVOKE EXECUTE ON FUNCTION public.admin_trust() FROM anon, PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_trust() TO authenticated;

-- ============================================================
-- Trancher un litige
-- ============================================================
-- Quatre décisions, et une seule question de fond : la somme reste-t-elle due ?
--   examiner      → mise en examen, rien ne bouge côté créance
--   somme_due     → litige tranché, la somme redevient exigible
--   somme_annulee → litige tranché, la somme n'est plus due
--   rejeter       → litige non fondé, la somme redevient exigible
-- Le mouvement de la créance est fait par le trigger trg_dispute, seul habilité.
CREATE OR REPLACE FUNCTION public.admin_resolve_dispute(
  p_id         UUID,
  p_decision   TEXT,
  p_resolution TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $fn$
DECLARE
  v_avant   TEXT;
  v_motif   TEXT;
  v_mission UUID;
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Accès refusé';
  END IF;
  IF p_decision NOT IN ('examiner','somme_due','somme_annulee','rejeter') THEN
    RAISE EXCEPTION 'Décision inconnue : %', p_decision;
  END IF;

  -- Trancher sans motiver, c'est arbitrer dans le noir : les deux parties
  -- doivent pouvoir lire ce qui a été décidé, et pourquoi.
  IF p_decision <> 'examiner' AND (p_resolution IS NULL OR btrim(p_resolution) = '') THEN
    RAISE EXCEPTION 'Une décision demande une motivation écrite.';
  END IF;

  SELECT status, reason, work_order_id INTO v_avant, v_motif, v_mission
  FROM disputes WHERE id = p_id;
  IF v_avant IS NULL THEN
    RAISE EXCEPTION 'Litige introuvable';
  END IF;
  IF v_avant NOT IN ('open','under_review') THEN
    RAISE EXCEPTION 'Ce litige est déjà clos (%).', v_avant;
  END IF;

  IF p_decision = 'examiner' THEN
    UPDATE disputes SET status = 'under_review', updated_at = NOW() WHERE id = p_id;
  ELSIF p_decision = 'rejeter' THEN
    UPDATE disputes
    SET status = 'rejected', resolution = p_resolution,
        resolved_by = auth.uid(), resolved_at = NOW(), updated_at = NOW()
    WHERE id = p_id;
  ELSE
    UPDATE disputes
    SET status = 'resolved',
        escrow_outcome = CASE WHEN p_decision = 'somme_due' THEN 'release' ELSE 'refund' END,
        resolution = p_resolution,
        resolved_by = auth.uid(), resolved_at = NOW(), updated_at = NOW()
    WHERE id = p_id;
  END IF;

  PERFORM public.admin_log_action(
    'litige.' || p_decision, 'dispute', p_id::TEXT,
    format('Litige « %s » : %s%s', v_motif,
      CASE p_decision
        WHEN 'examiner'      THEN 'mis en examen'
        WHEN 'somme_due'     THEN 'tranché, la somme reste due'
        WHEN 'somme_annulee' THEN 'tranché, la somme n''est plus due'
        ELSE 'rejeté comme non fondé'
      END,
      COALESCE(' — ' || p_resolution, '')),
    jsonb_build_object('statut', v_avant),
    jsonb_build_object('statut', p_decision, 'mission', v_mission)
  );

  RETURN jsonb_build_object('message',
    CASE p_decision
      WHEN 'examiner'      THEN 'Litige mis en examen. La créance reste suspendue.'
      WHEN 'somme_due'     THEN 'Litige tranché : la somme redevient exigible entre les parties.'
      WHEN 'somme_annulee' THEN 'Litige tranché : la somme n''est plus due.'
      ELSE 'Litige rejeté : la somme redevient exigible.'
    END);
END;
$fn$;
REVOKE EXECUTE ON FUNCTION public.admin_resolve_dispute(UUID, TEXT, TEXT) FROM anon, PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_resolve_dispute(UUID, TEXT, TEXT) TO authenticated;
