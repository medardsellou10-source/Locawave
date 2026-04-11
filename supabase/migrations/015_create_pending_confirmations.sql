CREATE TABLE pending_confirmations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  whatsapp_from TEXT NOT NULL,
  extracted_data JSONB NOT NULL,
  rent_schedule_id UUID REFERENCES rent_schedules(id),
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE pending_confirmations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "org_isolation" ON pending_confirmations
  FOR ALL USING (org_id = (SELECT org_id FROM users WHERE id = auth.uid()));
