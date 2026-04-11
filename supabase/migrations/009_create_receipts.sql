CREATE TABLE receipts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  payment_id UUID NOT NULL REFERENCES payments(id) ON DELETE CASCADE,
  receipt_number TEXT NOT NULL UNIQUE,
  pdf_url TEXT,
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE receipts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "org_isolation" ON receipts
  FOR ALL USING (org_id = (SELECT org_id FROM users WHERE id = auth.uid()));
