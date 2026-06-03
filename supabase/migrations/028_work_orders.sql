-- Phase 7b — Interventions (work_orders), carnet d'artisans, durcissement des avis.

-- ===== work_orders =====
CREATE TABLE IF NOT EXISTS work_orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID REFERENCES organizations(id) ON DELETE SET NULL,   -- NULL pour services à la personne (phase 8)
  incident_id UUID REFERENCES incidents(id) ON DELETE SET NULL,
  property_id UUID REFERENCES properties(id) ON DELETE SET NULL,
  client_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  provider_id UUID REFERENCES provider_profiles(id) ON DELETE SET NULL,
  type TEXT NOT NULL DEFAULT 'incident_repair',   -- incident_repair|home_service
  description TEXT,
  amount_fcfa INTEGER,
  status TEXT NOT NULL DEFAULT 'assigned'
    CHECK (status IN ('pending','assigned','in_progress','completed','cancelled')),
  escrow_status TEXT NOT NULL DEFAULT 'none'
    CHECK (escrow_status IN ('none','held','released','refunded')),
  before_report_id UUID REFERENCES reports(id) ON DELETE SET NULL,
  after_report_id UUID REFERENCES reports(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE work_orders ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_wo_org ON work_orders(org_id);
CREATE INDEX IF NOT EXISTS idx_wo_provider ON work_orders(provider_id);
CREATE INDEX IF NOT EXISTS idx_wo_client ON work_orders(client_id);
CREATE INDEX IF NOT EXISTS idx_wo_incident ON work_orders(incident_id);
CREATE TRIGGER set_updated_at BEFORE UPDATE ON work_orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE POLICY "wo_org_all" ON work_orders
  FOR ALL TO authenticated
  USING (org_id = (SELECT org_id FROM users WHERE id = auth.uid()))
  WITH CHECK (org_id = (SELECT org_id FROM users WHERE id = auth.uid()));
CREATE POLICY "wo_client_select" ON work_orders
  FOR SELECT TO authenticated USING (client_id = auth.uid());
CREATE POLICY "wo_client_insert" ON work_orders
  FOR INSERT TO authenticated WITH CHECK (client_id = auth.uid());
CREATE POLICY "wo_provider_select" ON work_orders
  FOR SELECT TO authenticated USING (provider_id = auth.uid());
CREATE POLICY "wo_provider_update" ON work_orders
  FOR UPDATE TO authenticated USING (provider_id = auth.uid()) WITH CHECK (provider_id = auth.uid());

-- ===== trusted_providers : carnet d'artisans du propriétaire =====
CREATE TABLE IF NOT EXISTS trusted_providers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  provider_id UUID NOT NULL REFERENCES provider_profiles(id) ON DELETE CASCADE,
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (owner_id, provider_id)
);
ALTER TABLE trusted_providers ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_trusted_owner ON trusted_providers(owner_id);
CREATE POLICY "trusted_self_all" ON trusted_providers
  FOR ALL TO authenticated USING (owner_id = auth.uid()) WITH CHECK (owner_id = auth.uid());

-- ===== Avis : clients réels uniquement (mission terminée) =====
ALTER TABLE reviews
  ADD CONSTRAINT reviews_work_order_fkey FOREIGN KEY (work_order_id)
  REFERENCES work_orders(id) ON DELETE SET NULL;

DROP POLICY IF EXISTS "reviews_client_insert" ON reviews;
CREATE POLICY "reviews_client_insert" ON reviews
  FOR INSERT TO authenticated WITH CHECK (
    client_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM work_orders w
      WHERE w.id = work_order_id
        AND w.client_id = auth.uid()
        AND w.provider_id = reviews.provider_id
        AND w.status = 'completed'
    )
  );
