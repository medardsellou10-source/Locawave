-- Phase 5a — Module Confiance : reports (preuves datées géoloc), KYC, audit_log.
-- Briques RÉUTILISABLES par les phases 6→9 (incidents, prestataires, marketplace).

-- ===== reports : rapport daté géolocalisé (photos/vidéos + geo + taken_at) =====
CREATE TABLE IF NOT EXISTS reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  property_id UUID REFERENCES properties(id) ON DELETE SET NULL,
  lease_id UUID REFERENCES leases(id) ON DELETE SET NULL,
  author_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  type TEXT NOT NULL DEFAULT 'report',         -- report|incident|before|after|inspection
  note TEXT,
  media_urls TEXT[] DEFAULT '{}',
  geo GEOGRAPHY(Point, 4326),
  taken_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_reports_org ON reports(org_id);
CREATE INDEX IF NOT EXISTS idx_reports_property ON reports(property_id);
CREATE INDEX IF NOT EXISTS idx_reports_geo ON reports USING GIST (geo);

-- Owner/staff : tout sur leur organisation
CREATE POLICY "reports_org_all" ON reports
  FOR ALL USING (org_id = (SELECT org_id FROM users WHERE id = auth.uid()))
  WITH CHECK (org_id = (SELECT org_id FROM users WHERE id = auth.uid()));
-- Auteur (ex. locataire) : lit ses propres rapports
CREATE POLICY "reports_author_select" ON reports
  FOR SELECT USING (author_id = auth.uid());
-- Locataire : crée un rapport sur un bien de SON bail (réutilise tenant_property_ids)
CREATE POLICY "reports_tenant_insert" ON reports
  FOR INSERT WITH CHECK (
    author_id = auth.uid() AND property_id IN (SELECT public.tenant_property_ids())
  );

-- ===== kyc_documents : vérification d'identité =====
CREATE TABLE IF NOT EXISTS kyc_documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  doc_type TEXT NOT NULL CHECK (doc_type IN ('cni','passeport','carte_consulaire','autre')),
  doc_url TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','verified','rejected')),
  note TEXT,
  reviewed_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE kyc_documents ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_kyc_profile ON kyc_documents(profile_id);
CREATE INDEX IF NOT EXISTS idx_kyc_status ON kyc_documents(status);

CREATE POLICY "kyc_select_self_or_admin" ON kyc_documents
  FOR SELECT USING (profile_id = auth.uid() OR public.is_admin());
CREATE POLICY "kyc_insert_self" ON kyc_documents
  FOR INSERT WITH CHECK (profile_id = auth.uid());
CREATE POLICY "kyc_update_admin" ON kyc_documents
  FOR UPDATE USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Synchronise profiles.kyc_status quand un document KYC change de statut
CREATE OR REPLACE FUNCTION public.sync_kyc_status()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  UPDATE public.profiles SET kyc_status = NEW.status, updated_at = NOW()
  WHERE id = NEW.profile_id;
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS on_kyc_status_change ON kyc_documents;
CREATE TRIGGER on_kyc_status_change
  AFTER INSERT OR UPDATE OF status ON kyc_documents
  FOR EACH ROW EXECUTE FUNCTION public.sync_kyc_status();
REVOKE EXECUTE ON FUNCTION public.sync_kyc_status() FROM anon, authenticated, PUBLIC;

-- ===== audit_log : journal append-only des transitions sensibles =====
CREATE TABLE IF NOT EXISTS audit_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  entity TEXT NOT NULL,
  entity_id UUID,
  action TEXT NOT NULL,
  actor_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  payload JSONB,
  at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_audit_entity ON audit_log(entity, entity_id);
-- Append-only : insertion par tout compte authentifié, lecture réservée admin,
-- aucune policy UPDATE/DELETE (donc interdits).
CREATE POLICY "audit_insert_authenticated" ON audit_log
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "audit_select_admin" ON audit_log
  FOR SELECT USING (public.is_admin());

-- ===== Storage : bucket privé KYC (pièces d'identité) =====
INSERT INTO storage.buckets (id, name, public)
VALUES ('kyc', 'kyc', false)
ON CONFLICT (id) DO NOTHING;

-- Chaque utilisateur dépose/lit dans son dossier <uid>/… ; l'admin lit tout.
CREATE POLICY "kyc_storage_insert_own" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'kyc' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "kyc_storage_select_own_or_admin" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'kyc' AND ((storage.foldername(name))[1] = auth.uid()::text OR public.is_admin()));
