CREATE TABLE units (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  unit_number TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('studio', 'f1', 'f2', 'f3', 'f4', 'commerce')),
  floor INTEGER,
  surface_m2 NUMERIC(8,2),
  rent_fcfa INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'vacant' CHECK (status IN ('vacant', 'rented', 'maintenance')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE units ENABLE ROW LEVEL SECURITY;
CREATE POLICY "org_isolation" ON units
  FOR ALL USING (org_id = (SELECT org_id FROM users WHERE id = auth.uid()));
