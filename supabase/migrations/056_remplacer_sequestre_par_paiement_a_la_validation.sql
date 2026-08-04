-- 056 — Suppression du séquestre fictif, remplacé par « paiement à la validation ».
--
-- CONSTAT
-- `escrow_status` n'a jamais bloqué le moindre franc : c'était une colonne texte.
-- Vérifié auprès de GeniusPay : POST /cashouts et POST /payouts ne sont pas
-- exposés (redirection 302), aucun versement programmable n'existe. Et un vrai
-- séquestre supposerait que Locawave détienne les fonds d'un tiers — ce que la
-- règle du projet interdit (« On ne détient JAMAIS de fonds ») et qui relève de
-- l'agrément d'établissement de paiement auprès de la BCEAO.
--
-- MODÈLE RETENU
-- Locawave n'encaisse PAS les travaux. Il verrouille la PREUVE et la VALIDATION ;
-- le propriétaire règle le prestataire directement, puis confirme le règlement
-- dans l'application, justificatif à l'appui. La promesse publicitaire devient
-- exacte : « vous ne payez qu'après avoir vu et validé ».
--
-- CYCLE DE VIE DU PAIEMENT
--   not_due   phase non validée, rien n'est dû
--   due       le propriétaire a validé : le paiement est dû au prestataire
--   settled   le propriétaire a réglé et l'a confirmé
--   cancelled phase annulée ou rejetée définitivement

-- ─── 1. Colonnes (le renommage doit précéder la réécriture des triggers) ───
ALTER TABLE public.project_milestones DROP CONSTRAINT IF EXISTS project_milestones_escrow_status_check;
ALTER TABLE public.project_milestones RENAME COLUMN escrow_status TO payment_state;
ALTER TABLE public.project_milestones
  ADD COLUMN IF NOT EXISTS settled_at timestamptz,
  ADD COLUMN IF NOT EXISTS settlement_proof_url text,
  ADD COLUMN IF NOT EXISTS settlement_note text;

ALTER TABLE public.work_orders DROP CONSTRAINT IF EXISTS work_orders_escrow_status_check;
ALTER TABLE public.work_orders RENAME COLUMN escrow_status TO payment_state;
ALTER TABLE public.work_orders
  ADD COLUMN IF NOT EXISTS settled_at timestamptz,
  ADD COLUMN IF NOT EXISTS settlement_proof_url text;

-- ─── 2. Triggers : ils référencent l'ancienne colonne. On les réécrit AVANT
--      toute écriture de données, sinon la migration échoue dès la 1re UPDATE
--      (« record "new" has no field "escrow_status" »). ───

-- Garde-fou : seul le propriétaire (son organisation, ou un admin) valide une
-- phase et déclare le règlement. Le prestataire ne peut ni s'auto-valider ni se
-- déclarer payé.
CREATE OR REPLACE FUNCTION public.guard_milestone()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_is_owner boolean;
BEGIN
  SELECT (p.owner_id = auth.uid()
          OR p.org_id = (SELECT org_id FROM users WHERE id = auth.uid())
          OR public.is_admin())
    INTO v_is_owner
    FROM construction_projects p WHERE p.id = NEW.project_id;

  IF NOT COALESCE(v_is_owner, false) THEN
    NEW.payment_state        := OLD.payment_state;
    NEW.settled_at           := OLD.settled_at;
    NEW.settlement_proof_url := OLD.settlement_proof_url;
    NEW.settlement_note      := OLD.settlement_note;
    NEW.approved_at          := OLD.approved_at;
    IF NEW.status = 'approved' AND OLD.status <> 'approved' THEN
      NEW.status := OLD.status;
    END IF;
  END IF;

  -- Cohérence : un paiement ne peut être dû que sur une phase validée.
  IF NEW.payment_state = 'due' AND NEW.status <> 'approved' THEN
    NEW.payment_state := OLD.payment_state;
  END IF;
  IF NEW.payment_state = 'settled' AND OLD.payment_state = 'settled' THEN
    NEW.settled_at := OLD.settled_at;   -- on ne réécrit pas une date de règlement
  ELSIF NEW.payment_state = 'settled' AND NEW.settled_at IS NULL THEN
    NEW.settled_at := now();
  END IF;

  RETURN NEW;
END $$;

CREATE OR REPLACE FUNCTION public.trg_milestone_audit()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.payment_state IS DISTINCT FROM OLD.payment_state THEN
    INSERT INTO audit_log (entity_type, entity_id, action, actor_id, metadata)
    VALUES ('milestone', NEW.id, 'payment_' || NEW.payment_state, auth.uid(),
            jsonb_build_object('amount_fcfa', NEW.amount_fcfa, 'status', NEW.status));
  END IF;
  RETURN NEW;
END $$;

-- La commission est due quand le propriétaire confirme avoir réglé le
-- prestataire — c'est le moment où la prestation est effectivement payée.
CREATE OR REPLACE FUNCTION public.trg_milestone_commission()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_org uuid; r numeric;
BEGIN
  IF TG_OP = 'UPDATE' AND NEW.payment_state = 'settled' AND OLD.payment_state <> 'settled' THEN
    SELECT cp.org_id INTO v_org FROM construction_projects cp WHERE cp.id = NEW.project_id;
    r := public.locawave_commission_rate();
    INSERT INTO commissions (org_id, source_type, source_id, base_amount_fcfa, rate, amount_fcfa)
    VALUES (v_org, 'milestone', NEW.id, NEW.amount_fcfa, r, ROUND(NEW.amount_fcfa * r));
  END IF;
  RETURN NEW;
END $$;

CREATE OR REPLACE FUNCTION public.trg_wo_commission()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE r numeric;
BEGIN
  IF TG_OP = 'UPDATE' AND NEW.payment_state = 'settled' AND OLD.payment_state <> 'settled' THEN
    r := public.locawave_commission_rate();
    INSERT INTO commissions (org_id, source_type, source_id, base_amount_fcfa, rate, amount_fcfa)
    VALUES (NEW.org_id, 'work_order', NEW.id, NEW.amount_fcfa, r, ROUND(NEW.amount_fcfa * r));
  END IF;
  RETURN NEW;
END $$;

-- ─── 3. Données : remap des anciennes valeurs ───
-- Triggers désactivés le temps du remap : c'est une correction de libellé, pas
-- des évènements métier à journaliser ni à facturer.
ALTER TABLE public.project_milestones DISABLE TRIGGER USER;
ALTER TABLE public.work_orders DISABLE TRIGGER USER;

UPDATE public.project_milestones SET payment_state = CASE payment_state
  WHEN 'released' THEN 'settled'
  WHEN 'refunded' THEN 'cancelled'
  ELSE 'not_due'          -- 'none' et 'held' : aucun fonds n'a jamais été bloqué
END;
UPDATE public.project_milestones SET settled_at = approved_at
  WHERE payment_state = 'settled' AND settled_at IS NULL;
-- L'étape « funded » n'a plus de sens : il n'y a pas de financement préalable.
UPDATE public.project_milestones SET status = 'in_progress' WHERE status = 'funded';

UPDATE public.work_orders SET payment_state = CASE payment_state
  WHEN 'released' THEN 'settled'
  WHEN 'refunded' THEN 'cancelled'
  ELSE 'not_due'
END;

ALTER TABLE public.project_milestones ENABLE TRIGGER USER;
ALTER TABLE public.work_orders ENABLE TRIGGER USER;

-- ─── 4. Contraintes, posées après le remap ───
ALTER TABLE public.project_milestones DROP CONSTRAINT IF EXISTS project_milestones_status_check;
ALTER TABLE public.project_milestones
  ADD CONSTRAINT project_milestones_status_check
  CHECK (status IN ('planned', 'in_progress', 'submitted', 'approved', 'rejected'));
ALTER TABLE public.project_milestones
  ADD CONSTRAINT project_milestones_payment_state_check
  CHECK (payment_state IN ('not_due', 'due', 'settled', 'cancelled'));
ALTER TABLE public.work_orders
  ADD CONSTRAINT work_orders_payment_state_check
  CHECK (payment_state IN ('not_due', 'due', 'settled', 'cancelled'));
