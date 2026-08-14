-- Migration 076 — Ce qui se passe, au moment où ça se passe.
--
-- Objectif : qu'aucun signalement, litige, avis ou inscription n'attende que
-- quelqu'un pense à aller regarder.
--
-- Pourquoi une table dédiée plutôt qu'un abonnement direct aux tables métier :
-- Realtime respecte la RLS, et l'administrateur n'a pas de policy de lecture sur
-- incidents, applications ou reviews — il les lit par des fonctions
-- SECURITY DEFINER. S'abonner aux tables d'origine ne livrerait donc rien. Un
-- flux unique, alimenté par des triggers et lisible des seuls administrateurs,
-- règle la question et donne en prime une seule chose à écouter.

CREATE TABLE IF NOT EXISTS admin_events (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  at         TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
  type       TEXT NOT NULL,
  severite   TEXT NOT NULL DEFAULT 'info' CHECK (severite IN ('info','attention','urgent')),
  titre      TEXT NOT NULL,
  detail     TEXT,
  org_id     UUID,
  org_nom    TEXT,
  acteur_id  UUID,
  acteur_nom TEXT,
  cible_type TEXT,
  cible_id   TEXT,
  lu_at      TIMESTAMPTZ
);
ALTER TABLE admin_events ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_admin_events_at ON admin_events(at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_events_non_lus ON admin_events(at DESC) WHERE lu_at IS NULL;

-- Lecture réservée aux administrateurs. Aucune policy d'écriture : seuls les
-- triggers (SECURITY DEFINER) alimentent le flux.
DROP POLICY IF EXISTS "admin_events_select" ON admin_events;
CREATE POLICY "admin_events_select" ON admin_events
  FOR SELECT USING (public.is_admin());

-- Realtime : c'est cette table, et elle seule, que la console écoute.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'admin_events'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.admin_events;
  END IF;
END $$;

-- ============================================================
-- Poser un événement
-- ============================================================
CREATE OR REPLACE FUNCTION public.admin_event(
  p_type TEXT, p_severite TEXT, p_titre TEXT, p_detail TEXT DEFAULT NULL,
  p_org UUID DEFAULT NULL, p_acteur UUID DEFAULT NULL,
  p_cible_type TEXT DEFAULT NULL, p_cible_id TEXT DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $fn$
BEGIN
  INSERT INTO admin_events (type, severite, titre, detail, org_id, org_nom,
                            acteur_id, acteur_nom, cible_type, cible_id)
  VALUES (
    p_type, p_severite, p_titre, p_detail, p_org,
    (SELECT name FROM organizations WHERE id = p_org),
    p_acteur,
    (SELECT full_name FROM profiles WHERE id = p_acteur),
    p_cible_type, p_cible_id
  );
END;
$fn$;
REVOKE EXECUTE ON FUNCTION public.admin_event(TEXT,TEXT,TEXT,TEXT,UUID,UUID,TEXT,TEXT)
  FROM anon, authenticated, PUBLIC;

-- ============================================================
-- Les déclencheurs
-- ============================================================
-- Chaque trigger reste minuscule et ne fait qu'un INSERT : il ne doit jamais
-- être la raison pour laquelle un locataire n'arrive pas à signaler sa fuite.

CREATE OR REPLACE FUNCTION public.trg_event_incident()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $fn$
BEGIN
  PERFORM public.admin_event(
    'incident.nouveau',
    CASE WHEN NEW.urgency = 'haute' THEN 'urgent' ELSE 'attention' END,
    format('Incident %s signalé', COALESCE(NEW.category, '')),
    NEW.description, NEW.org_id, NEW.reporter_id, 'incident', NEW.id::TEXT);
  RETURN NEW;
END; $fn$;
DROP TRIGGER IF EXISTS on_incident_event ON incidents;
CREATE TRIGGER on_incident_event AFTER INSERT ON incidents
  FOR EACH ROW EXECUTE FUNCTION public.trg_event_incident();

CREATE OR REPLACE FUNCTION public.trg_event_dispute()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $fn$
BEGIN
  PERFORM public.admin_event(
    'litige.ouvert', 'urgent',
    format('Litige ouvert : %s', NEW.reason),
    NEW.description, NEW.org_id, NEW.opened_by, 'dispute', NEW.id::TEXT);
  RETURN NEW;
END; $fn$;
DROP TRIGGER IF EXISTS on_dispute_event ON disputes;
CREATE TRIGGER on_dispute_event AFTER INSERT ON disputes
  FOR EACH ROW EXECUTE FUNCTION public.trg_event_dispute();

CREATE OR REPLACE FUNCTION public.trg_event_review()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $fn$
BEGIN
  PERFORM public.admin_event(
    'avis.depose',
    -- Un avis à 1 ou 2 étoiles est un client mécontent : il ne doit pas se
    -- perdre au milieu des autres.
    CASE WHEN NEW.rating <= 2 THEN 'attention' ELSE 'info' END,
    format('Avis %s/5 déposé', NEW.rating),
    NEW.comment, NULL, NEW.client_id, 'review', NEW.id::TEXT);
  RETURN NEW;
END; $fn$;
DROP TRIGGER IF EXISTS on_review_event ON reviews;
CREATE TRIGGER on_review_event AFTER INSERT ON reviews
  FOR EACH ROW EXECUTE FUNCTION public.trg_event_review();

CREATE OR REPLACE FUNCTION public.trg_event_profile()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $fn$
BEGIN
  PERFORM public.admin_event(
    'compte.nouveau', 'info',
    format('Nouveau compte : %s', NEW.full_name),
    format('Rôle : %s', NEW.role), NULL, NEW.id, 'profile', NEW.id::TEXT);
  RETURN NEW;
END; $fn$;
DROP TRIGGER IF EXISTS on_profile_event ON profiles;
CREATE TRIGGER on_profile_event AFTER INSERT ON profiles
  FOR EACH ROW EXECUTE FUNCTION public.trg_event_profile();

CREATE OR REPLACE FUNCTION public.trg_event_kyc()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $fn$
BEGIN
  IF NEW.status = 'pending' THEN
    PERFORM public.admin_event(
      'kyc.depose', 'attention',
      'Pièce d''identité à vérifier',
      format('Type : %s', NEW.doc_type), NULL, NEW.profile_id, 'profile', NEW.profile_id::TEXT);
  END IF;
  RETURN NEW;
END; $fn$;
DROP TRIGGER IF EXISTS on_kyc_event ON kyc_documents;
CREATE TRIGGER on_kyc_event AFTER INSERT ON kyc_documents
  FOR EACH ROW EXECUTE FUNCTION public.trg_event_kyc();

CREATE OR REPLACE FUNCTION public.trg_event_application()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $fn$
BEGIN
  PERFORM public.admin_event(
    'candidature.recue', 'info',
    'Candidature déposée sur une annonce',
    NEW.message, NULL, NEW.applicant_id, 'listing', NEW.listing_id::TEXT);
  RETURN NEW;
END; $fn$;
DROP TRIGGER IF EXISTS on_application_event ON applications;
CREATE TRIGGER on_application_event AFTER INSERT ON applications
  FOR EACH ROW EXECUTE FUNCTION public.trg_event_application();

CREATE OR REPLACE FUNCTION public.trg_event_payment()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $fn$
BEGIN
  PERFORM public.admin_event(
    'paiement.recu', 'info',
    format('Loyer réglé : %s FCFA', NEW.amount_fcfa),
    format('Méthode : %s', COALESCE(NEW.method, 'inconnue')),
    NEW.org_id, NULL, 'payment', NEW.id::TEXT);
  RETURN NEW;
END; $fn$;
DROP TRIGGER IF EXISTS on_payment_event ON payments;
CREATE TRIGGER on_payment_event AFTER INSERT ON payments
  FOR EACH ROW EXECUTE FUNCTION public.trg_event_payment();

CREATE OR REPLACE FUNCTION public.trg_event_abonnement()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $fn$
BEGIN
  IF NEW.status = 'paid' AND (TG_OP = 'INSERT' OR OLD.status IS DISTINCT FROM 'paid') THEN
    PERFORM public.admin_event(
      'abonnement.paye', 'info',
      format('Abonnement %s réglé : %s FCFA', NEW.plan, NEW.amount_fcfa),
      format('%s mois', NEW.months), NEW.org_id, NEW.created_by,
      'organization', NEW.org_id::TEXT);
  END IF;
  RETURN NEW;
END; $fn$;
DROP TRIGGER IF EXISTS on_abonnement_event ON subscription_payments;
CREATE TRIGGER on_abonnement_event AFTER INSERT OR UPDATE ON subscription_payments
  FOR EACH ROW EXECUTE FUNCTION public.trg_event_abonnement();

-- ============================================================
-- Lire le flux, et le marquer comme lu
-- ============================================================
CREATE OR REPLACE FUNCTION public.admin_events_list(
  p_limit INT DEFAULT 50,
  p_non_lus_seulement BOOLEAN DEFAULT FALSE
)
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
    'evenements', COALESCE((
      SELECT jsonb_agg(to_jsonb(e) ORDER BY e.at DESC)
      FROM (
        SELECT id, at, type, severite, titre, detail, org_id, org_nom,
               acteur_id, acteur_nom, cible_type, cible_id, lu_at
        FROM admin_events
        WHERE NOT p_non_lus_seulement OR lu_at IS NULL
        ORDER BY at DESC
        LIMIT GREATEST(1, LEAST(p_limit, 200))
      ) e
    ), '[]'::jsonb),
    'non_lus', (SELECT COUNT(*) FROM admin_events WHERE lu_at IS NULL),
    'urgents_non_lus', (SELECT COUNT(*) FROM admin_events WHERE lu_at IS NULL AND severite = 'urgent')
  ) INTO v;

  RETURN v;
END;
$fn$;
REVOKE EXECUTE ON FUNCTION public.admin_events_list(INT, BOOLEAN) FROM anon, PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_events_list(INT, BOOLEAN) TO authenticated;

CREATE OR REPLACE FUNCTION public.admin_events_mark_read(p_id UUID DEFAULT NULL)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $fn$
DECLARE
  v_n INT;
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Accès refusé';
  END IF;

  -- Sans identifiant : tout le flux passe en lu.
  UPDATE admin_events SET lu_at = NOW()
  WHERE lu_at IS NULL AND (p_id IS NULL OR id = p_id);
  GET DIAGNOSTICS v_n = ROW_COUNT;

  RETURN jsonb_build_object('marques', v_n);
END;
$fn$;
REVOKE EXECUTE ON FUNCTION public.admin_events_mark_read(UUID) FROM anon, PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_events_mark_read(UUID) TO authenticated;
