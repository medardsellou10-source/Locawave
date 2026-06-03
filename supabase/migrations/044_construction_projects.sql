-- Phase 12 — Suivi de chantier : projets, jalons (paiement par phase), fil média temps réel.

CREATE TABLE IF NOT EXISTS construction_projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
  property_id UUID REFERENCES properties(id) ON DELETE SET NULL,
  owner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  provider_id UUID REFERENCES profiles(id) ON DELETE SET NULL,   -- chef de chantier (prestataire vérifié)
  title TEXT NOT NULL,
  description TEXT,
  total_budget_fcfa INTEGER DEFAULT 0,
  geo GEOGRAPHY(Point, 4326),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('draft','active','paused','completed','cancelled')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE construction_projects ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_cp_owner ON construction_projects(owner_id);
CREATE INDEX IF NOT EXISTS idx_cp_provider ON construction_projects(provider_id);
CREATE INDEX IF NOT EXISTS idx_cp_org ON construction_projects(org_id);
CREATE TRIGGER set_updated_at BEFORE UPDATE ON construction_projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE POLICY cp_owner_all ON construction_projects FOR ALL TO authenticated
  USING (owner_id = auth.uid()) WITH CHECK (owner_id = auth.uid());
CREATE POLICY cp_org_all ON construction_projects FOR ALL TO authenticated
  USING (org_id = (SELECT org_id FROM users WHERE id = auth.uid()))
  WITH CHECK (org_id = (SELECT org_id FROM users WHERE id = auth.uid()));
CREATE POLICY cp_provider_read ON construction_projects FOR SELECT TO authenticated
  USING (provider_id = auth.uid());
CREATE POLICY cp_admin_all ON construction_projects FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE TABLE IF NOT EXISTS project_milestones (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES construction_projects(id) ON DELETE CASCADE,
  order_index INTEGER NOT NULL DEFAULT 0,
  title TEXT NOT NULL,
  description TEXT,
  amount_fcfa INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'planned'
    CHECK (status IN ('planned','funded','in_progress','submitted','approved','rejected')),
  escrow_status TEXT NOT NULL DEFAULT 'none'
    CHECK (escrow_status IN ('none','held','released','refunded')),
  psp_reference TEXT,
  submitted_at TIMESTAMPTZ,
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE project_milestones ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_pm_project ON project_milestones(project_id);
CREATE TRIGGER set_updated_at BEFORE UPDATE ON project_milestones
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE POLICY pm_party_read ON project_milestones FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM construction_projects p WHERE p.id = project_milestones.project_id
    AND (p.owner_id = auth.uid() OR p.provider_id = auth.uid()
         OR p.org_id = (SELECT org_id FROM users WHERE id = auth.uid()) OR public.is_admin()))
);
CREATE POLICY pm_provider_write ON project_milestones FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM construction_projects p WHERE p.id = project_milestones.project_id AND p.provider_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM construction_projects p WHERE p.id = project_milestones.project_id AND p.provider_id = auth.uid()));
CREATE POLICY pm_owner_write ON project_milestones FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM construction_projects p WHERE p.id = project_milestones.project_id
    AND (p.owner_id = auth.uid() OR p.org_id = (SELECT org_id FROM users WHERE id = auth.uid()) OR public.is_admin())))
  WITH CHECK (EXISTS (SELECT 1 FROM construction_projects p WHERE p.id = project_milestones.project_id
    AND (p.owner_id = auth.uid() OR p.org_id = (SELECT org_id FROM users WHERE id = auth.uid()) OR public.is_admin())));

-- Garde-fou : seul le propriétaire (ou admin) peut financer/valider (escrow + approved/funded)
CREATE OR REPLACE FUNCTION public.guard_milestone() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_is_owner boolean;
BEGIN
  SELECT (p.owner_id = auth.uid()
          OR p.org_id = (SELECT org_id FROM users WHERE id = auth.uid())
          OR public.is_admin())
    INTO v_is_owner
    FROM construction_projects p WHERE p.id = NEW.project_id;

  IF NOT COALESCE(v_is_owner, false) THEN
    NEW.escrow_status := OLD.escrow_status;
    IF NEW.status IN ('funded','approved') AND OLD.status NOT IN ('funded','approved') THEN
      NEW.status := OLD.status;
    END IF;
    NEW.approved_at := OLD.approved_at;
  END IF;
  RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS on_milestone_guard ON project_milestones;
CREATE TRIGGER on_milestone_guard BEFORE UPDATE ON project_milestones
  FOR EACH ROW EXECUTE FUNCTION public.guard_milestone();
REVOKE ALL ON FUNCTION public.guard_milestone() FROM anon, authenticated, public;

CREATE TABLE IF NOT EXISTS milestone_updates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  milestone_id UUID NOT NULL REFERENCES project_milestones(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES construction_projects(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  kind TEXT NOT NULL DEFAULT 'photo' CHECK (kind IN ('photo','video','note')),
  media_urls TEXT[] DEFAULT '{}',
  note TEXT,
  taken_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE milestone_updates ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_mu_milestone ON milestone_updates(milestone_id);
CREATE INDEX IF NOT EXISTS idx_mu_project ON milestone_updates(project_id);

CREATE POLICY mu_party_read ON milestone_updates FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM construction_projects p WHERE p.id = milestone_updates.project_id
    AND (p.owner_id = auth.uid() OR p.provider_id = auth.uid()
         OR p.org_id = (SELECT org_id FROM users WHERE id = auth.uid()) OR public.is_admin()))
);
CREATE POLICY mu_party_insert ON milestone_updates FOR INSERT TO authenticated WITH CHECK (
  author_id = auth.uid() AND
  EXISTS (SELECT 1 FROM construction_projects p WHERE p.id = milestone_updates.project_id
    AND (p.owner_id = auth.uid() OR p.provider_id = auth.uid()
         OR p.org_id = (SELECT org_id FROM users WHERE id = auth.uid())))
);

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname='supabase_realtime' AND schemaname='public' AND tablename='milestone_updates') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE milestone_updates;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname='supabase_realtime' AND schemaname='public' AND tablename='project_milestones') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE project_milestones;
  END IF;
END $$;

INSERT INTO storage.buckets (id, name, public)
VALUES ('chantier', 'chantier', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "chantier_storage_insert_auth" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'chantier');
CREATE POLICY "chantier_storage_select_all" ON storage.objects
  FOR SELECT USING (bucket_id = 'chantier');
