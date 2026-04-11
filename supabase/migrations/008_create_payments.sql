CREATE TABLE payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  rent_schedule_id UUID NOT NULL REFERENCES rent_schedules(id) ON DELETE CASCADE,
  amount_fcfa INTEGER NOT NULL,
  method TEXT NOT NULL CHECK (method IN ('wave', 'orange_money', 'cash')),
  reference TEXT,
  screenshot_url TEXT,
  paid_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "org_isolation" ON payments
  FOR ALL USING (org_id = (SELECT org_id FROM users WHERE id = auth.uid()));
