CREATE TABLE properties (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('appartement', 'villa', 'bureau', 'local')),
  address TEXT,
  neighborhood TEXT,
  city TEXT NOT NULL DEFAULT 'Dakar',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
CREATE POLICY "org_isolation" ON properties
  FOR ALL USING (org_id = (SELECT org_id FROM users WHERE id = auth.uid()));
