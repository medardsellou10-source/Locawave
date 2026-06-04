-- Phase 15 — Commission Locawave sur les transactions services/chantiers.
-- Tracée à la LIBÉRATION du séquestre (released). On ne détient jamais les fonds :
-- la commission est une ligne enregistrée (à prélever via PSP), affichée dans Finances.

CREATE TABLE IF NOT EXISTS commissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
  source_type TEXT NOT NULL CHECK (source_type IN ('work_order','milestone')),
  source_id UUID NOT NULL,
  base_fcfa INTEGER NOT NULL,
  rate NUMERIC NOT NULL,
  amount_fcfa INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (source_type, source_id)
);
ALTER TABLE commissions ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_commissions_org ON commissions(org_id);

CREATE POLICY commissions_org_read ON commissions FOR SELECT TO authenticated
  USING (org_id = (SELECT org_id FROM users WHERE id = auth.uid()) OR public.is_admin());

CREATE OR REPLACE FUNCTION public.locawave_commission_rate() RETURNS numeric
LANGUAGE sql IMMUTABLE SET search_path = public AS $$ SELECT 0.05::numeric $$;

CREATE OR REPLACE FUNCTION public.trg_wo_commission() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE r numeric;
BEGIN
  IF TG_OP = 'UPDATE' AND NEW.escrow_status = 'released' AND OLD.escrow_status <> 'released'
     AND COALESCE(NEW.amount_fcfa,0) > 0 THEN
    r := public.locawave_commission_rate();
    INSERT INTO commissions(org_id, source_type, source_id, base_fcfa, rate, amount_fcfa)
    VALUES (NEW.org_id, 'work_order', NEW.id, NEW.amount_fcfa, r, ROUND(NEW.amount_fcfa * r))
    ON CONFLICT (source_type, source_id) DO NOTHING;
  END IF;
  RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS on_wo_commission ON work_orders;
CREATE TRIGGER on_wo_commission AFTER UPDATE ON work_orders
  FOR EACH ROW EXECUTE FUNCTION public.trg_wo_commission();
REVOKE ALL ON FUNCTION public.trg_wo_commission() FROM anon, authenticated, public;

CREATE OR REPLACE FUNCTION public.trg_milestone_commission() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE r numeric; v_org uuid;
BEGIN
  IF TG_OP = 'UPDATE' AND NEW.escrow_status = 'released' AND OLD.escrow_status <> 'released'
     AND COALESCE(NEW.amount_fcfa,0) > 0 THEN
    SELECT org_id INTO v_org FROM construction_projects WHERE id = NEW.project_id;
    r := public.locawave_commission_rate();
    INSERT INTO commissions(org_id, source_type, source_id, base_fcfa, rate, amount_fcfa)
    VALUES (v_org, 'milestone', NEW.id, NEW.amount_fcfa, r, ROUND(NEW.amount_fcfa * r))
    ON CONFLICT (source_type, source_id) DO NOTHING;
  END IF;
  RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS on_milestone_commission ON project_milestones;
CREATE TRIGGER on_milestone_commission AFTER UPDATE ON project_milestones
  FOR EACH ROW EXECUTE FUNCTION public.trg_milestone_commission();
REVOKE ALL ON FUNCTION public.trg_milestone_commission() FROM anon, authenticated, public;
