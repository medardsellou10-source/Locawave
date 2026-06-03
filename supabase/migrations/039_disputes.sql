-- Phase 10b — Litiges (disputes) : gel des fonds en séquestre + médiation + audit

ALTER TABLE work_orders DROP CONSTRAINT IF EXISTS work_orders_escrow_status_check;
ALTER TABLE work_orders ADD CONSTRAINT work_orders_escrow_status_check
  CHECK (escrow_status = ANY (ARRAY['none','held','released','refunded','disputed']));

CREATE TABLE IF NOT EXISTS disputes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
  work_order_id UUID REFERENCES work_orders(id) ON DELETE SET NULL,
  incident_id UUID REFERENCES incidents(id) ON DELETE SET NULL,
  lease_id UUID REFERENCES leases(id) ON DELETE SET NULL,
  opened_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  against_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  reason TEXT NOT NULL,
  description TEXT,
  amount_frozen_fcfa INTEGER DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open','under_review','resolved','rejected','cancelled')),
  resolution TEXT,
  resolved_by UUID REFERENCES profiles(id),
  resolved_at TIMESTAMPTZ,
  contest_deadline TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE disputes ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_disputes_wo ON disputes(work_order_id);
CREATE INDEX IF NOT EXISTS idx_disputes_opener ON disputes(opened_by);
CREATE TRIGGER set_updated_at BEFORE UPDATE ON disputes FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE POLICY disputes_parties_read ON disputes FOR SELECT TO authenticated USING (
  opened_by = auth.uid() OR against_id = auth.uid() OR is_admin()
  OR EXISTS (SELECT 1 FROM work_orders w WHERE w.id = disputes.work_order_id
             AND (w.client_id = auth.uid() OR w.provider_id = auth.uid()))
);
CREATE POLICY disputes_open ON disputes FOR INSERT TO authenticated
  WITH CHECK (opened_by = auth.uid());
CREATE POLICY disputes_update ON disputes FOR UPDATE TO authenticated
  USING (opened_by = auth.uid() OR is_admin())
  WITH CHECK (opened_by = auth.uid() OR is_admin());

-- À l'ouverture : gel du séquestre (held -> disputed) + audit ; à la résolution : audit
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
  ELSIF TG_OP = 'UPDATE' AND NEW.status <> OLD.status
        AND NEW.status IN ('resolved','rejected','cancelled') THEN
    INSERT INTO audit_log(entity, entity_id, action, actor_id, payload)
      VALUES ('dispute', NEW.id, NEW.status, COALESCE(NEW.resolved_by, auth.uid()),
              jsonb_build_object('resolution', NEW.resolution));
  END IF;
  RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS disputes_audit ON disputes;
CREATE TRIGGER disputes_audit AFTER INSERT OR UPDATE ON disputes
  FOR EACH ROW EXECUTE FUNCTION trg_dispute();
