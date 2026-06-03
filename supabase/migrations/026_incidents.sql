-- Phase 6 — Alerte incident. Nouvelle table incidents (maintenance_requests legacy conservé).

CREATE TABLE IF NOT EXISTS incidents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  property_id UUID REFERENCES properties(id) ON DELETE SET NULL,
  lease_id UUID REFERENCES leases(id) ON DELETE SET NULL,
  reporter_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  category TEXT NOT NULL DEFAULT 'autre',          -- plomberie|electricite|serrurerie|...
  urgency TEXT NOT NULL DEFAULT 'medium' CHECK (urgency IN ('low','medium','high')),
  description TEXT,
  media_urls TEXT[] DEFAULT '{}',
  geo GEOGRAPHY(Point, 4326),
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open','assigned','in_progress','resolved')),
  charge_to TEXT CHECK (charge_to IN ('owner','tenant')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE incidents ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_incidents_org ON incidents(org_id);
CREATE INDEX IF NOT EXISTS idx_incidents_lease ON incidents(lease_id);
CREATE INDEX IF NOT EXISTS idx_incidents_status ON incidents(status);

CREATE TRIGGER set_updated_at BEFORE UPDATE ON incidents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Owner/staff : tout sur leur organisation
CREATE POLICY "incidents_org_all" ON incidents
  FOR ALL USING (org_id = (SELECT org_id FROM users WHERE id = auth.uid()))
  WITH CHECK (org_id = (SELECT org_id FROM users WHERE id = auth.uid()));
-- Locataire : lit les incidents de son bail (ou qu'il a signalés)
CREATE POLICY "incidents_tenant_select" ON incidents
  FOR SELECT USING (lease_id IN (SELECT public.tenant_lease_ids()) OR reporter_id = auth.uid());
-- Locataire : signale un incident sur son bail
CREATE POLICY "incidents_tenant_insert" ON incidents
  FOR INSERT WITH CHECK (reporter_id = auth.uid() AND lease_id IN (SELECT public.tenant_lease_ids()));

-- Temps réel (les abonnements respectent la RLS ci-dessus)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'incidents'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE incidents;
  END IF;
END $$;

-- Bucket photos (incidents / preuves). Public en lecture (photos de désordres, peu sensibles).
INSERT INTO storage.buckets (id, name, public)
VALUES ('reports', 'reports', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "reports_storage_insert_auth" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'reports');
CREATE POLICY "reports_storage_select_all" ON storage.objects
  FOR SELECT USING (bucket_id = 'reports');
