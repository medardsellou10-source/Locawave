CREATE TABLE tenants (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  whatsapp TEXT NOT NULL,
  email TEXT,
  id_document_type TEXT,
  id_document_number TEXT,
  employer TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
CREATE POLICY "org_isolation" ON tenants
  FOR ALL USING (org_id = (SELECT org_id FROM users WHERE id = auth.uid()));
