-- Phase 5b — États des lieux (inspections) + séquestre de caution (deposits).

-- ===== inspections : EDL d'entrée / sortie =====
CREATE TABLE IF NOT EXISTS inspections (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  lease_id UUID NOT NULL REFERENCES leases(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('entry','exit')),
  rooms JSONB DEFAULT '[]',            -- [{ room, state, note }]
  meter_readings JSONB DEFAULT '{}',   -- { eau, electricite, gaz }
  photos TEXT[] DEFAULT '{}',
  tenant_signature TEXT,
  owner_signature TEXT,
  notes TEXT,
  done_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE inspections ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_inspections_lease ON inspections(lease_id);
CREATE INDEX IF NOT EXISTS idx_inspections_org ON inspections(org_id);

CREATE POLICY "inspections_org_all" ON inspections
  FOR ALL USING (org_id = (SELECT org_id FROM users WHERE id = auth.uid()))
  WITH CHECK (org_id = (SELECT org_id FROM users WHERE id = auth.uid()));
CREATE POLICY "inspections_tenant_select" ON inspections
  FOR SELECT USING (lease_id IN (SELECT public.tenant_lease_ids()));

-- ===== deposits : séquestre de la caution (fonds chez le PSP) =====
CREATE TABLE IF NOT EXISTS deposits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  lease_id UUID NOT NULL REFERENCES leases(id) ON DELETE CASCADE,
  amount_fcfa INTEGER NOT NULL,
  released_amount_fcfa INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'held'
    CHECK (status IN ('held','partially_released','released','refunded')),
  psp_reference TEXT,
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE deposits ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_deposits_lease ON deposits(lease_id);
CREATE INDEX IF NOT EXISTS idx_deposits_org ON deposits(org_id);
CREATE UNIQUE INDEX IF NOT EXISTS uniq_deposits_lease ON deposits(lease_id);

CREATE TRIGGER set_updated_at BEFORE UPDATE ON deposits
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE POLICY "deposits_org_all" ON deposits
  FOR ALL USING (org_id = (SELECT org_id FROM users WHERE id = auth.uid()))
  WITH CHECK (org_id = (SELECT org_id FROM users WHERE id = auth.uid()));
CREATE POLICY "deposits_tenant_select" ON deposits
  FOR SELECT USING (lease_id IN (SELECT public.tenant_lease_ids()));
