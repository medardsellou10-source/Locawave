-- Phase 10 (fix) — le mouvement du séquestre lors de la résolution doit passer par le
-- trigger (SECURITY DEFINER) : la RLS de work_orders n'autorise ni l'admin médiateur ni
-- l'ouvreur à modifier escrow_status directement. On pilote via disputes.escrow_outcome.

ALTER TABLE disputes ADD COLUMN IF NOT EXISTS escrow_outcome TEXT
  CHECK (escrow_outcome IN ('refund','release'));

CREATE OR REPLACE FUNCTION public.trg_dispute() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.work_order_id IS NOT NULL THEN
      UPDATE work_orders SET escrow_status = 'disputed', updated_at = NOW()
       WHERE id = NEW.work_order_id AND escrow_status = 'held';
    END IF;
    INSERT INTO audit_log(entity, entity_id, action, actor_id, payload)
      VALUES ('dispute', NEW.id, 'opened', NEW.opened_by,
              jsonb_build_object('reason', NEW.reason, 'work_order_id', NEW.work_order_id));

  ELSIF TG_OP = 'UPDATE' AND NEW.status <> OLD.status THEN
    IF NEW.status = 'resolved' AND NEW.work_order_id IS NOT NULL AND NEW.escrow_outcome IS NOT NULL THEN
      UPDATE work_orders
         SET escrow_status = CASE WHEN NEW.escrow_outcome = 'refund' THEN 'refunded' ELSE 'released' END,
             updated_at = NOW()
       WHERE id = NEW.work_order_id;
    ELSIF NEW.status IN ('cancelled','rejected') AND NEW.work_order_id IS NOT NULL THEN
      UPDATE work_orders SET escrow_status = 'held', updated_at = NOW()
       WHERE id = NEW.work_order_id AND escrow_status = 'disputed';
    END IF;

    IF NEW.status IN ('resolved','rejected','cancelled') THEN
      INSERT INTO audit_log(entity, entity_id, action, actor_id, payload)
        VALUES ('dispute', NEW.id, NEW.status, COALESCE(NEW.resolved_by, auth.uid()),
                jsonb_build_object('resolution', NEW.resolution, 'escrow_outcome', NEW.escrow_outcome));
    END IF;
  END IF;
  RETURN NEW;
END $$;
REVOKE ALL ON FUNCTION public.trg_dispute() FROM anon, authenticated, public;
