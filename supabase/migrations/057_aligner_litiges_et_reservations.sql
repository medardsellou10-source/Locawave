-- 057 — Aligne les fonctions restantes sur payment_state.
--
-- La migration 056 a renommé escrow_status en payment_state ; deux fonctions
-- référençaient encore l'ancienne colonne et auraient échoué à l'exécution :
--   trg_dispute            (ouverture et résolution des litiges)
--   generate_due_bookings  (création des missions récurrentes)
--
-- Ajout de l'état `disputed` : pendant une médiation, le paiement n'est ni dû
-- ni réglé — il est contesté. C'est un état de la CRÉANCE, pas d'un dépôt de
-- fonds : Locawave ne détient toujours rien.
ALTER TABLE public.work_orders DROP CONSTRAINT IF EXISTS work_orders_payment_state_check;
ALTER TABLE public.work_orders
  ADD CONSTRAINT work_orders_payment_state_check
  CHECK (payment_state IN ('not_due', 'due', 'disputed', 'settled', 'cancelled'));

CREATE OR REPLACE FUNCTION public.trg_dispute()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Un litige suspend l'exigibilité : ce qui était dû devient contesté.
    IF NEW.work_order_id IS NOT NULL THEN
      UPDATE work_orders SET payment_state = 'disputed', updated_at = NOW()
       WHERE id = NEW.work_order_id AND payment_state = 'due';
    END IF;
    INSERT INTO audit_log(entity, entity_id, action, actor_id, payload)
      VALUES ('dispute', NEW.id, 'opened', NEW.opened_by,
              jsonb_build_object('reason', NEW.reason, 'work_order_id', NEW.work_order_id));

  ELSIF TG_OP = 'UPDATE' AND NEW.status <> OLD.status THEN
    -- Résolution : le médiateur tranche si la somme reste due ou non.
    IF NEW.status = 'resolved' AND NEW.work_order_id IS NOT NULL AND NEW.escrow_outcome IS NOT NULL THEN
      UPDATE work_orders
         SET payment_state = CASE WHEN NEW.escrow_outcome = 'refund' THEN 'cancelled' ELSE 'due' END,
             updated_at = NOW()
       WHERE id = NEW.work_order_id;
    -- Litige abandonné : la somme redevient exigible.
    ELSIF NEW.status IN ('cancelled','rejected') AND NEW.work_order_id IS NOT NULL THEN
      UPDATE work_orders SET payment_state = 'due', updated_at = NOW()
       WHERE id = NEW.work_order_id AND payment_state = 'disputed';
    END IF;

    IF NEW.status IN ('resolved','rejected','cancelled') THEN
      INSERT INTO audit_log(entity, entity_id, action, actor_id, payload)
        VALUES ('dispute', NEW.id, NEW.status, COALESCE(NEW.resolved_by, auth.uid()),
                jsonb_build_object('resolution', NEW.resolution, 'outcome', NEW.escrow_outcome));
    END IF;
  END IF;
  RETURN NEW;
END $$;

-- Missions récurrentes : une mission créée n'est pas encore exigible.
CREATE OR REPLACE FUNCTION public.generate_due_bookings()
RETURNS integer LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE r RECORD; v_count int := 0;
BEGIN
  FOR r IN SELECT * FROM recurring_bookings
           WHERE active AND (next_run IS NULL OR next_run <= CURRENT_DATE) LOOP
    INSERT INTO work_orders (incident_id, property_id, client_id, provider_id, type,
                             description, amount_fcfa, status, payment_state)
    VALUES (NULL, NULL, r.client_id, r.provider_id, 'home_service',
            COALESCE(r.title, 'Service récurrent'), r.amount_fcfa, 'assigned', 'not_due');

    UPDATE recurring_bookings
       SET next_run = CURRENT_DATE + (COALESCE(r.interval_days, 30) || ' days')::interval,
           last_run = CURRENT_DATE
     WHERE id = r.id;
    v_count := v_count + 1;
  END LOOP;
  RETURN v_count;
END $$;
REVOKE ALL ON FUNCTION public.generate_due_bookings() FROM PUBLIC, anon, authenticated;
