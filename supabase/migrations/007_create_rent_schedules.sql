CREATE TABLE rent_schedules (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  lease_id UUID NOT NULL REFERENCES leases(id) ON DELETE CASCADE,
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  due_date DATE NOT NULL,
  amount_fcfa INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'late')),
  reminder_count INTEGER DEFAULT 0,
  reminder_sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE rent_schedules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "org_isolation" ON rent_schedules
  FOR ALL USING (org_id = (SELECT org_id FROM users WHERE id = auth.uid()));
