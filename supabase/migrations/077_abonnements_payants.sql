-- Migration 077 — L'abonnement se paie, et s'active tout seul.
--
-- Le parcours : le propriétaire clique sur un plan → une ligne
-- subscription_payments est créée en attente → il paie chez le PSP → le webhook
-- appelle abonnement_regle(), qui encaisse et prolonge l'organisation.
--
-- Toute la décision vit ici, pas dans la fonction Edge : celle-ci ne fait que
-- transmettre une référence et un statut. Si demain le PSP change, la règle
-- métier ne bouge pas.
--
-- Rappel : Locawave ne détient pas les fonds. C'est le PSP qui encaisse et
-- reverse ; cette fonction ne fait que constater le règlement et ouvrir le
-- droit d'usage correspondant.

-- Une même livraison de webhook peut arriver deux fois. La référence du PSP est
-- donc unique : la seconde tentative échouera proprement plutôt que de
-- prolonger l'abonnement une fois de trop.
CREATE UNIQUE INDEX IF NOT EXISTS idx_subscription_psp_ref_unique
  ON subscription_payments (psp_reference)
  WHERE psp_reference IS NOT NULL;

CREATE OR REPLACE FUNCTION public.abonnement_regle(
  p_reference     TEXT,
  p_psp_reference TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $fn$
DECLARE
  v_sub    subscription_payments%ROWTYPE;
  v_org    organizations%ROWTYPE;
  v_debut  TIMESTAMPTZ;
  v_fin    TIMESTAMPTZ;
BEGIN
  SELECT * INTO v_sub FROM subscription_payments WHERE reference = p_reference;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Abonnement inconnu pour la référence %', p_reference;
  END IF;

  -- Rejouer une livraison déjà traitée ne doit rien prolonger.
  IF v_sub.status = 'paid' THEN
    RETURN jsonb_build_object('deja_traite', TRUE, 'org_id', v_sub.org_id);
  END IF;

  SELECT * INTO v_org FROM organizations WHERE id = v_sub.org_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Organisation introuvable pour cet abonnement';
  END IF;

  -- On repart de la plus tardive entre aujourd'hui et l'échéance en cours : un
  -- client qui renouvelle avant terme ne perd pas les jours qu'il a déjà payés.
  v_debut := GREATEST(NOW(), COALESCE(v_org.plan_expires_at, NOW()));
  v_fin   := v_debut + (COALESCE(v_sub.months, 1) || ' months')::INTERVAL;

  UPDATE subscription_payments
  SET status = 'paid',
      paid_at = NOW(),
      psp_reference = COALESCE(p_psp_reference, psp_reference),
      period_start = v_debut::DATE,
      period_end = v_fin::DATE,
      updated_at = NOW()
  WHERE id = v_sub.id;

  UPDATE organizations
  SET plan = v_sub.plan, plan_expires_at = v_fin, updated_at = NOW()
  WHERE id = v_sub.org_id;

  INSERT INTO activity_logs (org_id, user_id, action, entity_type, entity_id, metadata)
  VALUES (v_sub.org_id, v_sub.created_by, 'abonnement_regle', 'subscription_payment', v_sub.id,
          jsonb_build_object('plan', v_sub.plan, 'mois', v_sub.months,
                             'montant', v_sub.amount_fcfa, 'jusquau', v_fin));

  RETURN jsonb_build_object(
    'org_id', v_sub.org_id,
    'plan', v_sub.plan,
    'mois', v_sub.months,
    'montant', v_sub.amount_fcfa,
    'jusquau', v_fin
  );
END;
$fn$;
-- Appelée par le webhook (service_role) uniquement : un client ne doit jamais
-- pouvoir déclarer son propre abonnement réglé.
REVOKE EXECUTE ON FUNCTION public.abonnement_regle(TEXT, TEXT) FROM anon, authenticated, PUBLIC;

-- ============================================================
-- Ce qu'un propriétaire peut voir de ses propres abonnements
-- ============================================================
-- La table n'avait aucune policy : personne ne lisait ses propres paiements.
DROP POLICY IF EXISTS "subscription_payments_org_read" ON subscription_payments;
CREATE POLICY "subscription_payments_org_read" ON subscription_payments
  FOR SELECT USING (
    org_id = (SELECT org_id FROM users WHERE id = auth.uid())
    OR public.is_admin()
  );

-- ============================================================
-- Le plan ne se donne pas soi-même
-- ============================================================
-- La page Facturation mettait à jour organizations.plan directement depuis le
-- navigateur : un clic suffisait à s'offrir l'Agence sans rien payer. Comme pour
-- profiles.role, la RLS ne sait pas distinguer les colonnes — on retire donc le
-- droit au niveau colonne. Le client garde ce qui le regarde (nom, numéros de
-- paiement, adresse, logo, onboarding) ; plan et échéance ne bougent plus que
-- par service_role, c'est-à-dire par le webhook après règlement, ou par la
-- console d'administration.
REVOKE UPDATE ON public.organizations FROM anon, authenticated;
GRANT UPDATE (name, wave_number, om_number, address, logo_url, onboarding_completed, updated_at)
  ON public.organizations TO authenticated;
