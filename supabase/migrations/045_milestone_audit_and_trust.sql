-- Phase 12 — traçabilité des paiements de jalons + crédit Trust Score du chef de chantier.

CREATE OR REPLACE FUNCTION public.trg_milestone_audit() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF TG_OP = 'UPDATE' THEN
    IF NEW.escrow_status IS DISTINCT FROM OLD.escrow_status THEN
      INSERT INTO audit_log(entity, entity_id, action, actor_id, payload)
        VALUES ('milestone', NEW.id, 'escrow_' || NEW.escrow_status, auth.uid(),
                jsonb_build_object('project_id', NEW.project_id, 'amount_fcfa', NEW.amount_fcfa));
    END IF;
    IF NEW.status IS DISTINCT FROM OLD.status AND NEW.status IN ('submitted','approved','rejected','funded') THEN
      INSERT INTO audit_log(entity, entity_id, action, actor_id, payload)
        VALUES ('milestone', NEW.id, NEW.status, auth.uid(),
                jsonb_build_object('project_id', NEW.project_id, 'amount_fcfa', NEW.amount_fcfa));
    END IF;
  END IF;
  RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS on_milestone_audit ON project_milestones;
CREATE TRIGGER on_milestone_audit AFTER UPDATE ON project_milestones
  FOR EACH ROW EXECUTE FUNCTION public.trg_milestone_audit();
REVOKE ALL ON FUNCTION public.trg_milestone_audit() FROM anon, authenticated, public;

CREATE OR REPLACE FUNCTION public.trg_project_complete() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF TG_OP = 'UPDATE' AND NEW.status = 'completed' AND OLD.status <> 'completed' THEN
    INSERT INTO audit_log(entity, entity_id, action, actor_id, payload)
      VALUES ('construction_project', NEW.id, 'completed', auth.uid(),
              jsonb_build_object('provider_id', NEW.provider_id, 'budget', NEW.total_budget_fcfa));
    IF NEW.provider_id IS NOT NULL THEN
      PERFORM public.recompute_provider_trust_score(NEW.provider_id);
    END IF;
  END IF;
  RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS on_project_complete ON construction_projects;
CREATE TRIGGER on_project_complete AFTER UPDATE ON construction_projects
  FOR EACH ROW EXECUTE FUNCTION public.trg_project_complete();
REVOKE ALL ON FUNCTION public.trg_project_complete() FROM anon, authenticated, public;
