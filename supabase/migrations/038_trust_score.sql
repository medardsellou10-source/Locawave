-- Phase 10a — Trust Score prestataire (recalcul auto sur avis & missions)
-- Score 0..100 = note moyenne (50) + missions réussies (25) + KYC vérifié (15) + certifications (10)

CREATE OR REPLACE FUNCTION public.recompute_provider_trust_score(p_provider UUID)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_avg numeric; v_reviews int; v_jobs int; v_certs int;
  v_verified boolean; v_score numeric;
BEGIN
  SELECT COALESCE(AVG(rating),0), COUNT(*) INTO v_avg, v_reviews FROM reviews WHERE provider_id = p_provider;
  SELECT COUNT(*) INTO v_jobs FROM work_orders WHERE provider_id = p_provider AND status = 'completed';
  SELECT COUNT(*) INTO v_certs FROM certifications WHERE provider_id = p_provider;
  SELECT is_verified INTO v_verified FROM provider_profiles WHERE id = p_provider;

  v_score :=
      (CASE WHEN v_reviews > 0 THEN (v_avg / 5.0) * 50 ELSE 0 END)   -- note moyenne : 50 pts
    + LEAST(v_jobs, 20) / 20.0 * 25                                  -- missions réussies : 25 pts
    + (CASE WHEN COALESCE(v_verified,false) THEN 15 ELSE 0 END)      -- KYC vérifié : 15 pts
    + LEAST(v_certs, 2) * 5;                                         -- certifications : 10 pts

  UPDATE provider_profiles
     SET trust_score = ROUND(v_score, 1), jobs_done = v_jobs, updated_at = NOW()
   WHERE id = p_provider;
END $$;
REVOKE ALL ON FUNCTION public.recompute_provider_trust_score(UUID) FROM anon;

CREATE OR REPLACE FUNCTION public.trg_review_trust() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  PERFORM recompute_provider_trust_score(COALESCE(NEW.provider_id, OLD.provider_id));
  RETURN COALESCE(NEW, OLD);
END $$;
DROP TRIGGER IF EXISTS reviews_trust ON reviews;
CREATE TRIGGER reviews_trust AFTER INSERT OR UPDATE OR DELETE ON reviews
  FOR EACH ROW EXECUTE FUNCTION trg_review_trust();

CREATE OR REPLACE FUNCTION public.trg_wo_trust() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.provider_id IS NOT NULL THEN PERFORM recompute_provider_trust_score(NEW.provider_id); END IF;
  RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS wo_trust ON work_orders;
CREATE TRIGGER wo_trust AFTER INSERT OR UPDATE OF status ON work_orders
  FOR EACH ROW EXECUTE FUNCTION trg_wo_trust();

DO $$ DECLARE r RECORD; BEGIN
  FOR r IN SELECT id FROM provider_profiles LOOP
    PERFORM recompute_provider_trust_score(r.id);
  END LOOP;
END $$;
